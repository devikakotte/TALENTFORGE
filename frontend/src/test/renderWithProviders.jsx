import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

/**
 * Renders a component wrapped in the same provider stack as the real
 * app (minus BrowserRouter, swapped for MemoryRouter so tests control
 * the route). A fresh QueryClient per render keeps tests isolated from
 * each other's cached query state.
 */
export function renderWithProviders(ui, { route = '/', queryClient, ...options } = {}) {
  const client =
    queryClient ||
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={client}>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client };
}

export * from '@testing-library/react';
