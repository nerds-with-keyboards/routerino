# Accessibility & Lighthouse Scores

To maximize your PageSpeed Insights and Lighthouse scores, set up ESLint with accessibility rules.

## Setting up eslint-plugin-jsx-a11y

1. Install the plugin:

```sh
npm install --save-dev eslint-plugin-jsx-a11y
```

2. Add to your ESLint config:

```js
// eslint.config.js (ESLint 9+ flat config)
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
```

3. Add a lint run script:

```json
{
  "scripts": {
    "lint": "eslint --ext .jsx,.js src/"
  }
}
```

## Key Rules

### Images: Include descriptive `alt` text

```jsx
// Bad - Missing alt text
<img src="/logo.png" />

// Good - Descriptive alt text
<img src="/logo.png" alt="Company logo" />

// Good - Decorative images
<img src="/decoration.png" alt="" role="presentation" />
```

### Heading Hierarchy: Use proper heading order

```jsx
// Bad - Skipping heading levels
<h1>Page Title</h1>
<h3>Subsection</h3>  // Should be h2

// Good - Proper hierarchy
<h1>Page Title</h1>
<h2>Main Section</h2>
<h3>Subsection</h3>
```

### Link Text: Avoid generic link text

```jsx
// Bad - Generic text
<a href="/products">Click here</a>

// Good - Descriptive text
<a href="/products">View our products</a>
```

### ARIA Labels: Use for icon-only buttons

```jsx
<button aria-label="Close dialog">
  <svg>...</svg>
</button>
```

See [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) for more info.
