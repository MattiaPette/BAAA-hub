import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('should render with title when provided', () => {
    render(<TextArea title="My Text Area" dataSource={[]} />);

    expect(screen.getByText('My Text Area')).toBeInTheDocument();
  });

  it('should render without title when not provided', () => {
    const { container } = render(<TextArea dataSource={[]} />);

    const title = container.querySelector('h3');
    expect(title).not.toBeInTheDocument();
  });

  it('should render dataSource as newline-separated text', () => {
    const { container } = render(
      <TextArea dataSource={['line1', 'line2', 'line3']} />,
    );

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveValue('line1\nline2\nline3');
  });

  it('should render empty textarea when dataSource is empty', () => {
    const { container } = render(<TextArea dataSource={[]} />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveValue('');
  });

  it('should render disabled textarea', () => {
    const { container } = render(<TextArea dataSource={['test']} />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeDisabled();
  });

  it('should handle single line dataSource', () => {
    const { container } = render(<TextArea dataSource={['single line']} />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveValue('single line');
  });

  it('should render title in h3 as strong text', () => {
    const { container } = render(
      <TextArea title="Test Title" dataSource={[]} />,
    );

    const strong = container.querySelector('strong');
    expect(strong).toHaveTextContent('Test Title');
  });
});
