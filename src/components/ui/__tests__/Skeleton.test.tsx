import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('bg-surface-container-high');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
