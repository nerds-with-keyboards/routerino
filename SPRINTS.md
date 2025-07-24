# Routerino Sprint Plan

## Core Principles
- **Simplicity First**: Keep implementation as simple as possible
- **Minimal Dependencies**: Only add what's absolutely necessary for build/test
- **Plan Before Code**: Discuss approach before implementing each feature

## Sprint 1: Testing Foundation (2 weeks)

### Goals
- Establish testing infrastructure with minimal dependencies
- Ensure React 18/19 compatibility

### Tasks

#### 1.1 Testing Framework Setup
- **Approach**: Use Vitest (integrates with existing Vite setup)
- **Dependencies**: vitest, @testing-library/react, jsdom
- **Deliverables**:
  - Vitest configuration
  - React Testing Library setup
  - Test helpers for component testing

#### 1.2 Core Routing Tests
- Route matching logic tests
- Parameter extraction tests
- Navigation event handling tests
- Meta tag update tests

#### 1.3 React Version Compatibility Tests ✅
- **Approach**: Test against React 17, 18, 19, and Preact
- **Method**: Created test-react-versions.js script with version-specific testing libraries
- **Coverage**: All tests pass on React 17, 18, and 19 (Preact testing needs additional work)
- **Status**: COMPLETE - Run with `npm run test:react-versions`
- **Result**: Extended peer dependencies to support React 17+

## Deprecation Notice

### titlePrefix and titlePostfix (v1.1.10)
- **Status**: Deprecated, will be removed in v2.0
- **Alternative**: Use `title` and `separator` props instead
- **Implementation**: 
  - Console warnings when used
  - JSDoc @deprecated tags
  - TypeScript deprecation comments
  - Still functional but discouraged

## Sprint 2: Static Site Generation (2 weeks)

### Goals
- Generate static HTML files per route
- Optional prerendering support

### Tasks

#### 2.1 Static Build System
- **Approach**: Extend existing Vite build
- **No new dependencies**: Use Vite's existing capabilities
- **Output**: HTML file per route with proper meta tags

#### 2.2 Prerendering Integration
- **Option 1**: Simple Node.js script using Puppeteer
- **Option 2**: Integrate with existing prerender.io
- **Discussion needed**: Which approach aligns with simplicity goal?

## Sprint 3: Validation & Demo (2 weeks)

### Goals
- Verify SEO/bot functionality
- Create demo website

### Tasks

#### 3.1 Bot Preview Testing
- **Approach**: Simple curl-based tests
- **Tools**: User-agent spoofing, meta tag validation
- **No dependencies**: Shell scripts or Node.js

#### 3.2 Demo Website
- **Hosting**: GitHub Pages (free, simple)
- **Content**: 
  - Live examples
  - Code snippets
  - Performance metrics
  - SEO validation tools

## Sprint 4: Documentation & Tools (1 week)

### Goals
- Comprehensive deployment guides
- Optional deployment packages

### Tasks

#### 4.1 Deployment Documentation
- Step-by-step guides for:
  - Netlify
  - GitHub Pages
  - Cloudflare Pages
  - Vercel
- Configuration examples
- Troubleshooting tips

#### 4.2 Prerender Package (Optional)
- **Discussion needed**: Is this worth the complexity?
- Could be a separate repo/project
- Docker container option

## Future Considerations

### Cloudflare Workers
- Edge rendering exploration
- Performance benefits analysis
- Implementation complexity assessment

### Additional Platform Guides
- AWS (S3 + CloudFront)
- Other platforms as requested

## Sprint Execution Plan

Before starting each sprint:
1. Review goals and approach
2. Discuss implementation details
3. Agree on simplicity trade-offs
4. Begin development

## Success Metrics
- Zero runtime dependencies maintained
- Test coverage > 90%
- Build time < 10 seconds
- Documentation clarity score (user feedback)
- SEO validation passing rate