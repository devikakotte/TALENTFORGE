import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SkillsEditor from '../SkillsEditor';

// SkillsEditor links to the skill verification page, so it needs a
// Router context - a lightweight MemoryRouter wrapper is enough here,
// no need for the full renderWithProviders provider stack.
function renderSkillsEditor(props) {
  return render(<SkillsEditor {...props} />, { wrapper: MemoryRouter });
}

describe('SkillsEditor', () => {
  it('shows existing skills as removable tags', () => {
    renderSkillsEditor({ skills: ['React', 'Node.js'], onChange: vi.fn() });
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('shows a placeholder when there are no skills', () => {
    renderSkillsEditor({ skills: [], onChange: vi.fn() });
    expect(screen.getByText('No skills added yet.')).toBeInTheDocument();
  });

  it('calls onChange with the new skill appended when Add is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderSkillsEditor({ skills: ['React'], onChange: handleChange });

    await user.type(screen.getByPlaceholderText(/add a skill/i), 'TypeScript');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleChange).toHaveBeenCalledWith(['React', 'TypeScript']);
  });

  it('calls onChange with the skill removed when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderSkillsEditor({ skills: ['React', 'Node.js'], onChange: handleChange });

    await user.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(handleChange).toHaveBeenCalledWith(['Node.js']);
  });

  it('does not add a duplicate skill (case-insensitive)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderSkillsEditor({ skills: ['React'], onChange: handleChange });

    await user.type(screen.getByPlaceholderText(/add a skill/i), 'react');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows a verified badge for skills in verifiedSkills', () => {
    renderSkillsEditor({ skills: ['React', 'Node.js'], verifiedSkills: ['React'], onChange: vi.fn() });
    expect(screen.getByLabelText('Verified')).toBeInTheDocument();
  });

  it('shows the verify-skill link once at least one skill exists', () => {
    renderSkillsEditor({ skills: ['React'], onChange: vi.fn() });
    expect(screen.getByText(/verify a skill with an ai quiz/i)).toBeInTheDocument();
  });
});
