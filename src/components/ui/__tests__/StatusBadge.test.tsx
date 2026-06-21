import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders correctly with "In Progress" status', () => {
    render(<StatusBadge status="In Progress" />);
    const badge = screen.getByText('In Progress');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-secondary-container');
  });

  it('renders correctly with "Funded" status', () => {
    render(<StatusBadge status="Funded" />);
    const badge = screen.getByText('Funded');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary/10');
  });

  it('applies custom className', () => {
    render(<StatusBadge status="Pending" className="custom-class" />);
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass('custom-class');
  });
});
