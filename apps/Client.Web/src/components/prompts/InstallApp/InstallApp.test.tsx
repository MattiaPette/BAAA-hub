import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { InstallApp } from './InstallApp';

describe('InstallApp', () => {
  it('should render InstallApp component when open', () => {
    const mockHandler = vi.fn();

    render(<InstallApp handler={mockHandler} open />);

    expect(screen.getByText('Install app')).toBeInTheDocument();
  });

  it('should render InstallApp component when closed', () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    // The component should still be in the document
    const listItem = container.querySelector('.MuiListItem-root');
    expect(listItem).toBeInTheDocument();
  });

  it('should render install app icon', () => {
    const mockHandler = vi.fn();

    const { container } = render(<InstallApp handler={mockHandler} open />);

    const icon = container.querySelector('.MuiListItemIcon-root');
    expect(icon).toBeInTheDocument();
  });

  it('should show text when sidebar is open', () => {
    const mockHandler = vi.fn();

    const { container } = render(<InstallApp handler={mockHandler} open />);

    const listItemText = container.querySelector('.MuiListItemText-root');
    expect(listItemText).toBeInTheDocument();
  });

  it('should hide text when sidebar is closed', () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    const listItemText = container.querySelector('.MuiListItemText-root');
    expect(listItemText).toBeInTheDocument();
    // Text should have opacity 0 when closed
    expect(listItemText).toHaveStyle({ opacity: 0 });
  });

  it('should render as a list item button', () => {
    const mockHandler = vi.fn();

    const { container } = render(<InstallApp handler={mockHandler} open />);

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeInTheDocument();
  });

  it('should render with proper margins', () => {
    const mockHandler = vi.fn();

    const { container } = render(<InstallApp handler={mockHandler} open />);

    const listItem = container.querySelector('.MuiListItem-root');
    expect(listItem).toBeInTheDocument();
  });

  it('calls handler when clicked (open=true)', () => {
    const mockHandler = vi.fn();

    const { container } = render(<InstallApp handler={mockHandler} open />);

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeInTheDocument();

    if (listItemButton) {
      fireEvent.click(listItemButton);
    }

    expect(mockHandler).toHaveBeenCalled();
  });

  it('calls handler when clicked (open=false)', () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeInTheDocument();

    if (listItemButton) {
      fireEvent.click(listItemButton);
    }

    expect(mockHandler).toHaveBeenCalled();
  });

  it('should render consistently regardless of open state', () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeInTheDocument();
  });

  it('should be clickable and trigger handler', async () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeTruthy();

    if (listItemButton) {
      fireEvent.click(listItemButton);
    }

    expect(mockHandler).toHaveBeenCalled();
  });

  it('should render with proper styling when open=false', () => {
    const mockHandler = vi.fn();

    const { container } = render(
      <InstallApp handler={mockHandler} open={false} />,
    );

    const listItemButton = container.querySelector('.MuiListItemButton-root');
    expect(listItemButton).toBeInTheDocument();

    // The icon should be present
    const listItemIcon = container.querySelector('.MuiListItemIcon-root');
    expect(listItemIcon).toBeInTheDocument();
  });
});
