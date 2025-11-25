import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Stack,
  AvatarGroup,
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useBreadcrum } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * DataDisplayDemo page component that showcases MUI data display components.
 *
 * @returns {JSX.Element} The data display demo page.
 *
 * @example
 * <DataDisplayDemo />
 */
export const DataDisplayDemo: FC = () => {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle(t`Components Demo - Data Display`);
  }, [setTitle]);

  const tableData = [
    {
      name: 'Frozen yoghurt',
      calories: 159,
      fat: 6.0,
      carbs: 24,
      protein: 4.0,
    },
    {
      name: 'Ice cream sandwich',
      calories: 237,
      fat: 9.0,
      carbs: 37,
      protein: 4.3,
    },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Data Display Components`}
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
        {/* Avatar */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Avatar
            </Typography>
            <Stack direction="row" spacing={2}>
              <Avatar>H</Avatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>N</Avatar>
              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
              <AvatarGroup max={3}>
                <Avatar>A</Avatar>
                <Avatar>B</Avatar>
                <Avatar>C</Avatar>
                <Avatar>D</Avatar>
              </AvatarGroup>
            </Stack>
          </CardContent>
        </Card>

        {/* Badge */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Badge
            </Typography>
            <Stack direction="row" spacing={2}>
              <Badge badgeContent={4} color="primary">
                <MailIcon />
              </Badge>
              <Badge badgeContent={100} color="secondary">
                <MailIcon />
              </Badge>
              <Badge color="error" variant="dot">
                <MailIcon />
              </Badge>
            </Stack>
          </CardContent>
        </Card>

        {/* Chip */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chip
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={t`Basic Chip`} />
              <Chip label={t`Clickable`} onClick={() => {}} />
              <Chip label={t`Deletable`} onDelete={() => {}} />
              <Chip label={t`Primary`} color="primary" />
              <Chip label={t`Success`} color="success" />
              <Chip icon={<FavoriteIcon />} label={t`With Icon`} />
            </Stack>
          </CardContent>
        </Card>

        {/* Divider */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Divider
            </Typography>
            <Box>
              <Typography>{t`Above Divider`}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>{t`Below Divider`}</Typography>
              <Divider sx={{ my: 2 }}>{t`CENTER`}</Divider>
              <Typography>{t`With Text`}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Icons */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Material Icons
            </Typography>
            <Stack direction="row" spacing={2}>
              <HomeIcon />
              <SettingsIcon color="primary" />
              <DeleteIcon color="error" />
              <FavoriteIcon color="secondary" />
              <MailIcon color="action" />
            </Stack>
          </CardContent>
        </Card>

        {/* List */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              List
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={t`Photos`} secondary="Jan 9, 2024" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={t`Work`} secondary="Jan 7, 2024" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Table - Full width */}
      <Card sx={{ marginTop: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Table
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dessert (100g serving)</TableCell>
                  <TableCell align="right">Calories</TableCell>
                  <TableCell align="right">Fat&nbsp;(g)</TableCell>
                  <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                  <TableCell align="right">Protein&nbsp;(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map(row => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Rest of components in grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          marginTop: 3,
        }}
      >
        {/* Tooltip */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tooltip
            </Typography>
            <Stack direction="row" spacing={2}>
              <Tooltip title={t`Delete`}>
                <DeleteIcon />
              </Tooltip>
              <Tooltip title={t`Add`} placement="top">
                <MailIcon />
              </Tooltip>
              <Tooltip title={t`Settings`} placement="right">
                <SettingsIcon />
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>

        {/* Typography */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Typography
            </Typography>
            <Stack spacing={1}>
              <Typography variant="h1" sx={{ fontSize: '2rem' }}>
                h1. Heading
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                h2. Heading
              </Typography>
              <Typography variant="body1">body1. Lorem ipsum</Typography>
              <Typography variant="body2">body2. Lorem ipsum</Typography>
              <Typography variant="caption">caption text</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
