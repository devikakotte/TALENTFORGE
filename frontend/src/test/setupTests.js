import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia - ThemeContext reads it to pick an
// initial theme. Stub it so components using useTheme don't crash in tests.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
