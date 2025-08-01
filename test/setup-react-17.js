// Setup file for React 17 compatibility
// React Testing Library v13+ requires React 18+, so we need to polyfill for React 17

if (!globalThis.IS_REACT_ACT_ENVIRONMENT) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}
