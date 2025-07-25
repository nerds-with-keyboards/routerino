# Routerino Basic Example

This is the simplest example of using Routerino in a React application. It demonstrates basic routing functionality without any advanced features.

## Features Demonstrated

- Basic routing with multiple pages
- Dynamic routes with parameters
- 404 handling
- SEO-friendly titles and descriptions
- Simple navigation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
example-basic/
├── src/
│   ├── routes.js    # Route definitions with components
│   ├── main.jsx     # App entry point
│   └── style.css    # Basic styles
├── index.html       # HTML template
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies
```

## Key Concepts

1. **Route Definition**: Routes are defined in `src/routes.js` with path, element, title, and description
2. **Simple Components**: Each route has a simple React component
3. **Navigation**: Uses regular `<a>` tags for navigation
4. **Dynamic Routes**: The blog post route demonstrates parameter handling
5. **SEO**: Each route has its own title and description

This example is perfect for understanding the basics of Routerino before moving on to more advanced features like static generation or prerendering.
