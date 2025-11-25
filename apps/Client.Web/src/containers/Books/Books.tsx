import { FC, useEffect, useState, useCallback } from 'react';
import { t } from '@lingui/core/macro';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import type { Book, BookInput } from '../../types/book';
import * as bookService from '../../services/bookService';
import { DialogText } from '../../components/commons/dataDisplay/DialogText/DialogText';
import { BookDialog } from '../../components/books/BookDialog/BookDialog';
import { Dialog } from '../../components/commons/feedbacks/Dialog/Dialog';

/**
 * Books page component that displays and manages the book library
 */
export const Books: FC = () => {
  const { setTitle } = useBreadcrum();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    setTitle(t`Books`);
  }, [setTitle]);

  // Fetch books
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['books', page + 1, pageSize],
    queryFn: () => bookService.getBooks({ page: page + 1, limit: pageSize }),
    retry: 1,
  });

  // Show error notification when query fails
  useEffect(() => {
    if (error) {
      enqueueSnackbar(`Error loading books: ${(error as Error).message}`, {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  // Create book mutation
  const createMutation = useMutation({
    mutationFn: bookService.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      enqueueSnackbar('Book created successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(`Error creating book: ${err.message}`, {
        variant: 'error',
      });
    },
  });

  // Update book mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: Readonly<{ id: string; data: Partial<BookInput> }>) =>
      bookService.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      enqueueSnackbar('Book updated successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(`Error updating book: ${err.message}`, {
        variant: 'error',
      });
    },
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      enqueueSnackbar('Book deleted successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(`Error deleting book: ${err.message}`, {
        variant: 'error',
      });
    },
  });

  const handleAddBook = useCallback(() => {
    setSelectedBook(null);
    setDialogOpen(true);
  }, []);

  const handleEditBook = useCallback((book: Readonly<Book>) => {
    setSelectedBook(book);
    setDialogOpen(true);
  }, []);

  const handleDeleteBook = useCallback((book: Readonly<Book>) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  }, []);

  const handleSaveBook = useCallback(
    async (data: Readonly<BookInput>) => {
      if (selectedBook && selectedBook._id) {
        await updateMutation.mutateAsync({ id: selectedBook._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [selectedBook, createMutation, updateMutation],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (bookToDelete && bookToDelete._id) {
      await deleteMutation.mutateAsync(bookToDelete._id);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  }, [bookToDelete, deleteMutation]);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: isMobile ? 0 : 2,
      minWidth: isMobile ? 150 : 200,
      width: isMobile ? 150 : undefined,
    },
    {
      field: 'author',
      headerName: 'Author',
      flex: isMobile ? 0 : 1.5,
      minWidth: isMobile ? 120 : 150,
      width: isMobile ? 120 : undefined,
    },
    {
      field: 'isbn',
      headerName: 'ISBN',
      flex: isMobile ? 0 : 1.5,
      minWidth: 150,
      // Hide ISBN on mobile to save space
      ...(isMobile && { hide: true }),
    },
    {
      field: 'publishedYear',
      headerName: 'Year',
      width: isMobile ? 80 : 100,
    },
    {
      field: 'genre',
      headerName: 'Genre',
      flex: isMobile ? 0 : 1,
      minWidth: 120,
      // Hide genre on mobile to save space
      ...(isMobile && { hide: true }),
    },
    {
      field: 'available',
      headerName: 'Available',
      width: isMobile ? 100 : 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Available' : 'Checked Out'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isMobile ? 80 : 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditBook(params.row as Book)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteBook(params.row as Book)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            gap: 2,
          }}
        >
          <Typography variant="h5" color="error">
            {t`Failed to load books`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(error as Error).message}
          </Typography>
          <Button variant="contained" onClick={() => refetch()}>
            {t`Retry`}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: isMobile ? 1 : 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          mb: 3,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'}>{t`Books`}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBook}
          fullWidth={isMobile}
        >
          Add Book
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          loading={isLoading}
          getRowId={row => row._id}
          pagination
          paginationMode="server"
          rowCount={data?.pagination.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={model => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      <BookDialog
        open={dialogOpen}
        book={selectedBook}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveBook}
      />

      <Dialog
        open={deleteDialogOpen}
        close={() => setDeleteDialogOpen(false)}
        title="Delete Book"
        submit={handleConfirmDelete}
        confirmButtonText="Delete"
        confirmButtonIcon={<DeleteIcon />}
        closeButtonText="Cancel"
      >
        <DialogText
          text={`Are you sure you want to delete "${bookToDelete?.title}"? This action cannot be undone.`}
        />
      </Dialog>
    </Box>
  );
};
