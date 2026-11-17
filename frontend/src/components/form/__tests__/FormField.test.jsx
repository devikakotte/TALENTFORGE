import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormField from '../FormField';

describe('FormField', () => {
  it('renders the label and children', () => {
    render(
      <FormField label="Email" id="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders an error message when provided', () => {
    render(
      <FormField label="Email" id="email" error={{ message: 'Email is required' }}>
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('renders no error text when there is no error', () => {
    render(
      <FormField label="Email" id="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });
});
