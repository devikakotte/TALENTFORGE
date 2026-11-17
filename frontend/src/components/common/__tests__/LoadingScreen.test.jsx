import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('renders the default label', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<LoadingScreen label="Fetching jobs..." />);
    expect(screen.getByText('Fetching jobs...')).toBeInTheDocument();
  });
});
