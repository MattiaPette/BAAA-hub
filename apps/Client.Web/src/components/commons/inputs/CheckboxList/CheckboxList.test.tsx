import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../../test-utils';
import { CheckboxList } from './CheckboxList';

describe('CheckboxList', () => {
  const mockDataSource = [
    { id: '1', label: 'Item 1', isChecked: false },
    { id: '2', label: 'Item 2', isChecked: true },
    { id: '3', label: 'Item 3', isChecked: false },
  ];

  it('should render title', () => {
    render(<CheckboxList title="Test List" dataSource={mockDataSource} />);

    expect(screen.getByText('Test List')).toBeInTheDocument();
  });

  it('should render all items from dataSource', () => {
    render(<CheckboxList title="Test List" dataSource={mockDataSource} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render checkboxes with correct checked state', () => {
    const { container } = render(
      <CheckboxList title="Test List" dataSource={mockDataSource} />,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('should call onSelectionChange when item is clicked', () => {
    const mockOnSelectionChange = vi.fn();
    render(
      <CheckboxList
        title="Test List"
        dataSource={mockDataSource}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    const firstItem = screen.getByText('Item 1');
    fireEvent.click(firstItem);

    expect(mockOnSelectionChange).toHaveBeenCalledWith('1');
  });

  it('should call onCheckBoxListItemChange when checkbox is clicked', () => {
    const mockOnCheckBoxListItemChange = vi.fn();
    const { container } = render(
      <CheckboxList
        title="Test List"
        dataSource={mockDataSource}
        onCheckBoxListItemChange={mockOnCheckBoxListItemChange}
      />,
    );

    const firstCheckbox = container.querySelectorAll(
      'input[type="checkbox"]',
    )[0];
    fireEvent.click(firstCheckbox);

    expect(mockOnCheckBoxListItemChange).toHaveBeenCalledWith('1');
  });

  it('should call clearError when ListItemIcon is clicked', () => {
    const mockClearError = vi.fn();
    const { container } = render(
      <CheckboxList
        title="Test List"
        dataSource={mockDataSource}
        clearError={mockClearError}
      />,
    );

    const firstIcon = container.querySelector('.MuiListItemIcon-root');
    if (firstIcon) {
      fireEvent.click(firstIcon);
      expect(mockClearError).toHaveBeenCalled();
    }
  });

  it('should render empty list when dataSource is empty', () => {
    const { container } = render(
      <CheckboxList title="Empty List" dataSource={[]} />,
    );

    const listItems = container.querySelectorAll('.MuiListItem-root');
    expect(listItems).toHaveLength(0);
  });
});
