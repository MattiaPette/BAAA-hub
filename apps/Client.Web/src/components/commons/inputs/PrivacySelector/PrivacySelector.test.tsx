import { screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PrivacyLevel } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../../../test-utils';
import { PrivacySelector } from './PrivacySelector';

describe('PrivacySelector', () => {
  const mockOnChange = vi.fn();

  const renderSelector = (props = {}) =>
    render(
      <PrivacySelector
        value={PrivacyLevel.PUBLIC}
        onChange={mockOnChange}
        {...props}
      />,
    );

  it('should render with default label', () => {
    renderSelector();
    expect(screen.getByLabelText('Privacy')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    renderSelector({ label: 'Custom Privacy' });
    expect(screen.getByLabelText('Custom Privacy')).toBeInTheDocument();
  });

  it('should render helper text when provided', () => {
    renderSelector({ helperText: 'Helper text' });
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('should display current value', () => {
    renderSelector({ value: PrivacyLevel.PUBLIC });
    // The value is displayed in the select trigger
    // We can look for the text "Public"
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    renderSelector();

    // Open the select dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    // Click on an option
    // There might be multiple "Private" texts (one in trigger if selected, one in list)
    // But initially Public is selected. So "Private" should be only in list.
    const option = screen.getByRole('option', { name: 'Private' });
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(PrivacyLevel.PRIVATE);
  });

  it('should be disabled when disabled prop is true', () => {
    renderSelector({ disabled: true });
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render all privacy levels as options', () => {
    renderSelector();

    // Open the select dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Public')).toBeInTheDocument();
    expect(within(listbox).getByText('Followers Only')).toBeInTheDocument();
    expect(within(listbox).getByText('Private')).toBeInTheDocument();
  });
});
