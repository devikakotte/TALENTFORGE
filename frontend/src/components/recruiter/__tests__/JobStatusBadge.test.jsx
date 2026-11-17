import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JobStatusBadge from '../JobStatusBadge';

describe('JobStatusBadge', () => {
  it.each(['draft', 'open', 'closed'])('renders the %s status label', (status) => {
    render(<JobStatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});
