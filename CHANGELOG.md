# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-01-25

### Added
- Static site generation via `routerino-build-static` command
- Docker-based prerender server for SEO optimization
- Comprehensive deployment guides for 6 major platforms
- Demo sites showcasing static and prerender deployment strategies
- Support for React 17 (previously 18+ only)
- ErrorBoundary component export for custom error handling
- TypeScript support for route files (.ts, .tsx)
- Automatic robots.txt generation with sitemap command
- Health check endpoints for prerender server
- Differential rendering (JS stripped for search engines, preserved for social media)

### Changed
- Extended React peer dependencies to include v17
- Improved error messages with actionable suggestions
- Enhanced TypeScript definitions
- Better meta tag handling for social media platforms
- Sitemap generation now creates robots.txt automatically

### Deprecated
- `titlePrefix` and `titlePostfix` props (use `title` and `separator` instead)

### Fixed
- Navigation bug where `new URL(target)` should be `new URL(target.href)`
- JavaScript stripping incorrectly applied to social media bots
- Docker networking issues in prerender configuration
- File extension handling for JSX routes

### Security
- Added domain whitelisting to prerender server
- Implemented rate limiting in nginx configuration
- Enhanced security headers in deployment examples

## [1.1.10] - 2025-01-25

### Added
- Test infrastructure with Vitest
- React Testing Library integration
- Comprehensive test coverage

### Changed
- Updated dependencies
- Improved build process

## [1.1.9] - 2024-05-23

### Changed
- Upgraded packages and peer dependencies

## [1.1.8] - 2024-01-23

### Fixed
- Bug fixes for new title prop functionality

## [1.1.7] - 2024-10-13

### Changed
- Minor updates and optimizations

## [1.1.6] - 2024-10-13

### Changed
- Package structure improvements

## [1.1.5] - 2024-10-08

### Changed
- Build process enhancements

## [1.1.4] - 2024-10-08

### Fixed
- Minor bug fixes

## [1.1.3] - 2024-10-08

### Changed
- Code cleanup and optimizations

## [1.1.2] - 2024-10-08

### Changed
- Documentation updates

## [1.1.1] - 2024-10-08

### Changed
- Documentation updates
- README improvements

## [1.1.0] - 2024-10-07

### Added
- TypeScript types and exports
- ESLint configuration
- GitHub Actions for CI/CD
- Site icon support
- Scroll to top on route change
- Debug option and messages
- robots.txt generation with sitemap

### Changed
- Improved click handling and link processing
- Enhanced origin and host checking
- Updated routing logic for same-host navigation
- Better handling of route parameters
- Improved og:title generation
- Removed defaultProps in favor of default arguments

### Fixed
- Various error handling improvements
- Code cleanup and reduced nesting

## [1.0.3] - 2023-10-31

### Changed
- Updated og:title generation to limit max characters

## [1.0.2] - 2023-10-31

### Changed
- Small update to og:title generation

## [1.0.1] - 2023-09-27

### Changed
- Updated Node.js version limit

## [1.0.0] - 2023-09-27

### Added
- Initial release of Routerino
- Core routing functionality
- SEO meta tag management
- Sitemap generation
- Basic documentation

[1.2.0]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.10...v1.2.0
[1.1.10]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.9...v1.1.10
[1.1.9]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.8...v1.1.9
[1.1.8]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.7...v1.1.8
[1.1.7]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.6...v1.1.7
[1.1.6]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/nerds-with-keyboards/routerino/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/nerds-with-keyboards/routerino/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nerds-with-keyboards/routerino/releases/tag/v1.0.0