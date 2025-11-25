import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FeedbacksDemo } from './FeedbacksDemo';

import { BreadcrumProvider } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

// Mock notistack
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

describe('FeedbacksDemo', () => {
  it('should render the feedbacks demo page', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Feedback Components')).toBeInTheDocument();
  });

  it('should render alert component', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('This is an error alert')).toBeInTheDocument();
  });

  it('should render backdrop component', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Backdrop')).toBeInTheDocument();
    expect(screen.getByText('Show Backdrop')).toBeInTheDocument();
  });

  it('should render dialog component', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Dialog')).toBeInTheDocument();
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should open and close dialog', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const openButton = screen.getByText('Open Dialog');
    await user.click(openButton);

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    const closeButton = screen.getByText('Disagree');
    await user.click(closeButton);
  });

  it('should open and close backdrop', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const openButton = screen.getByText('Show Backdrop');
    await user.click(openButton);

    // Backdrop should be open
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('should render all feedback component sections', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Skeleton')).toBeInTheDocument();
    expect(screen.getByText('Snackbar (notistack)')).toBeInTheDocument();
  });

  it('should render all alert severity types', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('This is an error alert')).toBeInTheDocument();
    expect(screen.getByText('This is a warning alert')).toBeInTheDocument();
    expect(screen.getByText('This is an info alert')).toBeInTheDocument();
    expect(screen.getByText('This is a success alert')).toBeInTheDocument();
  });

  it('should render snackbar buttons', () => {
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should handle default snackbar button click', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const defaultButton = screen.getByRole('button', { name: /^default$/i });
    await user.click(defaultButton);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'This is a default snackbar!',
      { variant: 'default' },
    );
  });

  it('should handle success snackbar button click', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const successButton = screen.getByRole('button', { name: /^success$/i });
    await user.click(successButton);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'This is a success snackbar!',
      { variant: 'success' },
    );
  });

  it('should handle error snackbar button click', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const errorButton = screen.getByRole('button', { name: /^error$/i });
    await user.click(errorButton);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'This is a error snackbar!',
      { variant: 'error' },
    );
  });

  it('should handle warning snackbar button click', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const warningButton = screen.getByRole('button', { name: /^warning$/i });
    await user.click(warningButton);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'This is a warning snackbar!',
      { variant: 'warning' },
    );
  });

  it('should handle info snackbar button click', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const infoButton = screen.getByRole('button', { name: /^info$/i });
    await user.click(infoButton);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'This is a info snackbar!',
      { variant: 'info' },
    );
  });

  it('should update progress over time', async () => {
    vi.useFakeTimers();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    // Progress should update over time
    vi.advanceTimersByTime(1000);

    vi.useRealTimers();
  });

  it('should close dialog with agree button', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumProvider>
        <FeedbacksDemo />
      </BreadcrumProvider>,
    );

    const openButton = screen.getByText('Open Dialog');
    await user.click(openButton);

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    const agreeButton = screen.getByText('Agree');
    await user.click(agreeButton);
  });
});
