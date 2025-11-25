import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { DialogText } from './DialogText';

describe('DialogText', () => {
  it('should render text when provided', () => {
    render(<DialogText text="This is a dialog text" />);

    expect(screen.getByText('This is a dialog text')).toBeInTheDocument();
  });

  it('should render list when provided', () => {
    const list = ['Item 1', 'Item 2', 'Item 3'];
    render(<DialogText list={list} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render both text and list when both provided', () => {
    const list = ['Item 1', 'Item 2'];
    render(<DialogText text="Main text" list={list} />);

    expect(screen.getByText('Main text')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render nothing when no props provided', () => {
    const { container } = render(<DialogText />);

    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('should render list items in correct order', () => {
    const list = ['First', 'Second', 'Third'];
    const { container } = render(<DialogText list={list} />);

    const listItems = container.querySelectorAll('.MuiListItem-root');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('First');
    expect(listItems[1]).toHaveTextContent('Second');
    expect(listItems[2]).toHaveTextContent('Third');
  });
});
