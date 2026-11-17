import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/renderWithProviders';
import LoginPage from '../LoginPage';

vi.mock('../../../services/authService', () => ({
  default: {
    refresh: vi.fn().mockRejectedValue(new Error('no active session')),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// eslint-disable-next-line import/first
import authService from '../../../services/authService';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.refresh.mockRejectedValue(new Error('no active session'));
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls authService.login with the entered credentials', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({
      user: { id: '1', fullName: 'Test User', role: 'candidate' },
      accessToken: 'fake-token',
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
    });
  });
});
