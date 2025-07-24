#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key] = value;
  return acc;
}, {});

const {
  routesFile,
  outputDir = './dist',
  template = './index.html',
  baseUrl = ''
} = args;

if (!routesFile) {
  console.error('Usage: node build-static.js routesFile=./src/routes.js outputDir=./dist template=./index.html baseUrl=https://example.com');
  process.exit(1);
}

async function buildStaticSite() {
  try {
    console.log('🏗️  Building static site...\n');
    
    // Import the routes
    const routesModule = await import(path.resolve(routesFile));
    const routes = routesModule.default || routesModule.routes;
    
    if (!Array.isArray(routes)) {
      throw new Error('Routes must be an array');
    }
    
    // Read the HTML template
    const templatePath = path.resolve(template);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    
    // Create output directory
    const outputPath = path.resolve(outputDir);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Process each route
    let generatedCount = 0;
    
    for (const route of routes) {
      // Skip dynamic routes (with parameters)
      if (route.path.includes(':')) {
        console.log(`⏭️  Skipping dynamic route: ${route.path}`);
        continue;
      }
      
      // Generate HTML for this route
      const html = generateHtmlForRoute(route, templateHtml, baseUrl);
      
      // Determine output file path
      const routePath = route.path === '/' ? '/index' : route.path;
      const filePath = path.join(outputPath, `${routePath}.html`);
      
      // Create directory if needed
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      // Write the HTML file
      fs.writeFileSync(filePath, html);
      console.log(`✅ Generated: ${filePath}`);
      generatedCount++;
    }
    
    console.log(`\n🎉 Generated ${generatedCount} static HTML files in ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function generateHtmlForRoute(route, templateHtml, baseUrl) {
  let html = templateHtml;
  
  // Update title
  if (route.title) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  }
  
  // Add/update meta tags
  const metaTags = [];
  
  if (route.description) {
    metaTags.push(`<meta name="description" content="${escapeHtml(route.description)}">`);
    metaTags.push(`<meta property="og:description" content="${escapeHtml(route.description)}">`);
  }
  
  if (route.title) {
    metaTags.push(`<meta property="og:title" content="${escapeHtml(route.title)}">`);
  }
  
  metaTags.push(`<meta property="og:type" content="website">`);
  
  if (baseUrl) {
    metaTags.push(`<meta property="og:url" content="${baseUrl}${route.path}">`);
  }
  
  if (route.imageUrl) {
    metaTags.push(`<meta property="og:image" content="${escapeHtml(route.imageUrl)}">`);
  }
  
  // Add custom tags
  if (route.tags) {
    route.tags.forEach(tag => {
      const attrs = Object.entries(tag)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(' ');
      metaTags.push(`<meta ${attrs}>`);
    });
  }
  
  // Insert meta tags before closing </head>
  const metaTagsHtml = metaTags.join('\n  ');
  html = html.replace('</head>', `  ${metaTagsHtml}\n</head>`);
  
  // Add route info as data attribute for client-side hydration
  html = html.replace(
    '<div id="root">',
    `<div id="root" data-route="${escapeHtml(route.path)}">`
  );
  
  return html;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Run the build
buildStaticSite();