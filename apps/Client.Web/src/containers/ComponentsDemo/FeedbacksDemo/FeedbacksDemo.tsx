import { FC, useState, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useBreadcrum } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * FeedbacksDemo page component that showcases MUI feedback components.
 *
 * @returns {JSX.Element} The feedbacks demo page.
 *
 * @example
 * <FeedbacksDemo />
 */
export const FeedbacksDemo: FC = () => {
  const { setTitle } = useBreadcrum();
  const { enqueueSnackbar } = useSnackbar();
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTitle(t`Components Demo - Feedbacks`);
  }, [setTitle]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleShowSnackbar = (
    variant: 'default' | 'success' | 'error' | 'warning' | 'info',
  ) => {
    enqueueSnackbar(`This is a ${variant} snackbar!`, { variant });
  };

  const handleBackdropClose = () => {
    setOpenBackdrop(false);
  };

  const handleBackdropOpen = () => {
    setOpenBackdrop(true);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Feedback Components`}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          marginTop: 2,
        }}
      >
        {/* Alert */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alert
            </Typography>
            <Stack spacing={2}>
              <Alert severity="error">{t`This is an error alert`}</Alert>
              <Alert severity="warning">This is a warning alert</Alert>
              <Alert severity="info">{t`This is an info alert`}</Alert>
              <Alert severity="success">{t`This is a success alert`}</Alert>
              <Alert variant="outlined" severity="error">
                This is an outlined error alert
              </Alert>
              <Alert variant="filled" severity="success">
                This is a filled success alert
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Backdrop */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backdrop
            </Typography>
            <Button variant="contained" onClick={handleBackdropOpen}>
              Show Backdrop
            </Button>
            <Backdrop
              sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
              open={openBackdrop}
              onClick={handleBackdropClose}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </CardContent>
        </Card>

        {/* Dialog */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dialog
            </Typography>
            <Button variant="outlined" onClick={handleDialogOpen}>
              Open Dialog
            </Button>
            <Dialog
              open={openDialog}
              onClose={handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{t`Dialog Title`}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {t`This is a sample dialog content. You can put any content here.`}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose}>{t`Disagree`}</Button>
                <Button onClick={handleDialogClose} autoFocus>
                  Agree
                </Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>

        {/* Progress */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Stack spacing={2}>
              <CircularProgress />
              <CircularProgress color="secondary" />
              <LinearProgress />
              <LinearProgress variant="determinate" value={progress} />
            </Stack>
          </CardContent>
        </Card>

        {/* Skeleton */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skeleton
            </Typography>
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          </CardContent>
        </Card>

        {/* Snackbar (using notistack) */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Snackbar (notistack)
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                onClick={() => handleShowSnackbar('default')}
              >
                Default
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleShowSnackbar('success')}
              >
                Success
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleShowSnackbar('error')}
              >
                Error
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleShowSnackbar('warning')}
              >
                Warning
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleShowSnackbar('info')}
              >
                Info
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
