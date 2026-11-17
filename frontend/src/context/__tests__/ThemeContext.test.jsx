import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';

function wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light when no preference is stored and the OS prefers light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('toggles between light and dark', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => expect(result.current.theme).toBe('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('tf_theme')).toBe('dark');
  });

  it('throws when used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
  });
});
