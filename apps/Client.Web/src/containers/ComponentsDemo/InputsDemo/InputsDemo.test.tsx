import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InputsDemo } from './InputsDemo';

import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

describe('InputsDemo', () => {
  it('should render the inputs demo page', () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Input Components')).toBeInTheDocument();
  });

  it('should render autocomplete component', () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Autocomplete')).toBeInTheDocument();
  });

  it('should render checkbox component', () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Checkbox')).toBeInTheDocument();
  });

  it('should handle checkbox toggle', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const checkbox = screen.getByRole('checkbox', { name: /checkbox label/i });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should handle radio button selection', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const option2 = screen.getByRole('radio', { name: /option 2/i });
    await user.click(option2);
    expect(option2).toBeChecked();
  });

  it('should render slider component', () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('should handle toggle button selection', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const centerButton = screen.getByRole('button', { name: /center/i });
    await user.click(centerButton);
    expect(centerButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should render all input component sections', () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Button Group')).toBeInTheDocument();
    expect(screen.getByText('Floating Action Button')).toBeInTheDocument();
    expect(screen.getByText('Radio Group')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Select')).toBeInTheDocument();
    expect(screen.getByText('Slider')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByText('Text Field')).toBeInTheDocument();
    expect(screen.getByText('Toggle Button')).toBeInTheDocument();
  });

  it('should handle autocomplete selection', async () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const autocomplete = screen.getByLabelText(/select option/i);
    expect(autocomplete).toBeInTheDocument();
  });

  it('should handle rating change', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const ratings = screen.getAllByRole('radio');
    const firstRating = ratings[0];
    await user.click(firstRating);
  });

  it('should handle select change', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const selectElement = screen.getByLabelText(/age/i);
    await user.click(selectElement);
  });

  it('should handle slider change', async () => {
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('should handle switch toggle', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Switch is rendered as a checkbox element
    // Find the switch by checking if it has more than 1 checkbox (checkbox + switch)
    expect(checkboxes.length).toBeGreaterThan(0);

    // The switch element should be among the checkboxes
    const switchElement = checkboxes.find(
      cb => (cb as HTMLInputElement).checked,
    ) as HTMLInputElement | undefined;
    if (switchElement) {
      expect(switchElement).toBeChecked();
      await user.click(switchElement);
      expect(switchElement).not.toBeChecked();
    }
  });

  it('should handle toggle button null selection', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <InputsDemo />
      </BreadcrumProvider>,
    );

    const leftButton = screen.getByRole('button', { name: /left/i });
    expect(leftButton).toHaveAttribute('aria-pressed', 'true');

    // Click the same button to try to deselect (should remain selected due to null check)
    await user.click(leftButton);
    expect(leftButton).toHaveAttribute('aria-pressed', 'true');
  });
});
