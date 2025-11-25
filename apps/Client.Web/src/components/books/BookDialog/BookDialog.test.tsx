import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render } from '../../../test-utils';
import { BookDialog } from './BookDialog';
import type { Book } from '../../../types/book';

describe('BookDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  const mockBook: Book = {
    _id: '123',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '978-0-123456-78-9',
    publishedYear: 2020,
    genre: 'Fiction',
    description: 'A test book description',
    available: true,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open is true', () => {
    render(<BookDialog {...defaultProps} />);

    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    render(<BookDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Add New Book')).not.toBeInTheDocument();
  });

  it('should render "Edit Book" title when book is provided', () => {
    render(<BookDialog {...defaultProps} book={mockBook} />);

    expect(screen.getByText('Edit Book')).toBeInTheDocument();
  });

  it('should render "Add New Book" title when book is not provided', () => {
    render(<BookDialog {...defaultProps} book={null} />);

    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });

  it('should populate form fields with book data when editing', async () => {
    render(<BookDialog {...defaultProps} book={mockBook} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue(mockBook.title);
      expect(screen.getByLabelText('Author')).toHaveValue(mockBook.author);
      expect(screen.getByLabelText('ISBN')).toHaveValue(mockBook.isbn);
      expect(screen.getByLabelText('Published Year')).toHaveValue(
        mockBook.publishedYear,
      );
      expect(screen.getByLabelText('Genre')).toHaveValue(mockBook.genre);
      expect(screen.getByLabelText('Description')).toHaveValue(
        mockBook.description,
      );
    });
  });

  it('should have empty form fields when creating new book', async () => {
    render(<BookDialog {...defaultProps} book={null} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('');
      expect(screen.getByLabelText('Author')).toHaveValue('');
      expect(screen.getByLabelText('ISBN')).toHaveValue('');
      expect(screen.getByLabelText('Genre')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });
  });

  it('should update form fields when book prop changes', async () => {
    const { rerender } = render(<BookDialog {...defaultProps} book={null} />);

    // Initially empty
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('');
    });

    // Rerender with book data
    rerender(<BookDialog {...defaultProps} book={mockBook} />);

    // Should be populated with book data
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue(mockBook.title);
      expect(screen.getByLabelText('Author')).toHaveValue(mockBook.author);
      expect(screen.getByLabelText('ISBN')).toHaveValue(mockBook.isbn);
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<BookDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with form data when form is submitted', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(<BookDialog {...defaultProps} book={null} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Book' },
    });
    fireEvent.change(screen.getByLabelText('Author'), {
      target: { value: 'New Author' },
    });
    fireEvent.change(screen.getByLabelText('ISBN'), {
      target: { value: '978-0-987654-32-1' },
    });
    fireEvent.change(screen.getByLabelText('Published Year'), {
      target: { value: '2023' },
    });
    fireEvent.change(screen.getByLabelText('Genre'), {
      target: { value: 'Science' },
    });

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Book',
          author: 'New Author',
          isbn: '978-0-987654-32-1',
          publishedYear: 2023,
          genre: 'Science',
        }),
      );
    });
  });

  it('should show validation errors for required fields', async () => {
    render(<BookDialog {...defaultProps} />);

    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Author is required')).toBeInTheDocument();
      expect(screen.getByText('ISBN is required')).toBeInTheDocument();
      expect(screen.getByText('Genre is required')).toBeInTheDocument();
    });
  });

  it('should display Update button text when editing', () => {
    render(<BookDialog {...defaultProps} book={mockBook} />);

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('should display Create button text when creating', () => {
    render(<BookDialog {...defaultProps} book={null} />);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
});
