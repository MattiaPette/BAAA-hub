import { FC, useState, useCallback, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import type { Book, BookInput } from '../../../types/book';

interface BookDialogProps {
  readonly open: boolean;
  readonly book?: Readonly<Book> | null;
  readonly onClose: () => void;
  readonly onSave: (data: Readonly<BookInput>) => Promise<void>;
}

/**
 * Dialog for creating or editing a book
 */
export const BookDialog: FC<BookDialogProps> = ({
  open,
  book,
  onClose,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(book);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookInput>({
    defaultValues: book || {
      title: '',
      author: '',
      isbn: '',
      publishedYear: new Date().getFullYear(),
      genre: '',
      description: '',
      available: true,
    },
  });

  // Reset form values when book or open state changes
  useEffect(() => {
    if (open) {
      reset(
        book || {
          title: '',
          author: '',
          isbn: '',
          publishedYear: new Date().getFullYear(),
          genre: '',
          description: '',
          available: true,
        },
      );
    }
  }, [book, open, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const onSubmit: SubmitHandler<BookInput> = async data => {
    setSaving(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              {...register('title', { required: 'Title is required' })}
              label="Title"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('author', { required: 'Author is required' })}
                label="Author"
                fullWidth
                error={Boolean(errors.author)}
                helperText={errors.author?.message}
              />
              <TextField
                {...register('isbn', {
                  required: 'ISBN is required',
                  pattern: {
                    value:
                      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
                    message: 'Please enter a valid ISBN',
                  },
                })}
                label="ISBN"
                fullWidth
                error={Boolean(errors.isbn)}
                helperText={errors.isbn?.message}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('publishedYear', {
                  required: 'Published year is required',
                  min: { value: 1000, message: 'Year must be after 1000' },
                  max: {
                    value: new Date().getFullYear(),
                    message: 'Year cannot be in the future',
                  },
                  valueAsNumber: true,
                })}
                label="Published Year"
                type="number"
                fullWidth
                error={Boolean(errors.publishedYear)}
                helperText={errors.publishedYear?.message}
              />
              <TextField
                {...register('genre', { required: 'Genre is required' })}
                label="Genre"
                fullWidth
                error={Boolean(errors.genre)}
                helperText={errors.genre?.message}
              />
            </Stack>
            <TextField
              {...register('description')}
              label="Description"
              fullWidth
              multiline
              rows={4}
            />
            <FormControlLabel
              control={<Checkbox {...register('available')} defaultChecked />}
              label="Available"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : ''}
            {!saving && isEditing ? 'Update' : ''}
            {!saving && !isEditing ? 'Create' : ''}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
