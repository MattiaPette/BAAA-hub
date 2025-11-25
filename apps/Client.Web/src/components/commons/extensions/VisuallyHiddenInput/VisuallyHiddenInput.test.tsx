import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { VisuallyHiddenInput } from './VisuallyHiddenInput';

describe('VisuallyHiddenInput', () => {
  it('should render an input element', () => {
    const { container } = render(<VisuallyHiddenInput />);

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('should accept and apply input props', () => {
    const { container } = render(
      <VisuallyHiddenInput type="file" accept="image/*" />,
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<VisuallyHiddenInput ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
