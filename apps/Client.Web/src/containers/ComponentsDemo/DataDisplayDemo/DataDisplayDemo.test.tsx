import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataDisplayDemo } from './DataDisplayDemo';

import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

describe('DataDisplayDemo', () => {
  it('should render the data display demo page', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Data Display Components')).toBeInTheDocument();
  });

  it('should render avatar component', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Avatar')).toBeInTheDocument();
  });

  it('should render badge component', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('should render chip component', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Chip')).toBeInTheDocument();
  });

  it('should render all data display component sections', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Divider')).toBeInTheDocument();
    expect(screen.getByText('Material Icons')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Tooltip')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
  });

  it('should render table data', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(screen.getByText('Ice cream sandwich')).toBeInTheDocument();
    expect(screen.getByText('Eclair')).toBeInTheDocument();
  });

  it('should handle chip click interaction', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    const clickableChip = screen.getByText('Clickable');
    await user.click(clickableChip);
    expect(clickableChip).toBeInTheDocument();
  });

  it('should render chip with delete functionality', () => {
    render(
      <BreadcrumProvider>
        <DataDisplayDemo />
      </BreadcrumProvider>,
    );

    const deletableChip = screen.getByText('Deletable');
    expect(deletableChip).toBeInTheDocument();
  });
});
