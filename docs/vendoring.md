# Vendoring Routerino

If you prefer to include Routerino directly in your project instead of using it as a dependency, you can vendor the library. This gives you full control over the version and eliminates managing it as an external dependency.

1. Download `routerino.jsx` from the [repository](../routerino.jsx).

2. Place it in a suitable location within your project:

```
your-project/
├── src/
│   ├── vendor/
│   │   └── routerino.jsx
│   └── ...
└── ...
```

3. Update your imports:

```jsx
// Before (importing from the package)
import Routerino from "routerino";

// After (importing from the vendored file)
import Routerino from "./vendor/routerino";
```

4. If using the Routerino Forge plugin for SSG and sitemap generation, copy `routerino-forge.js` as well.

**Note:** When vendoring, you'll need to manually update the vendored files to incorporate future updates or bug fixes from the main repository.
