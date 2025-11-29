import { FC, useEffect, useState, useMemo, useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSnackbar } from 'notistack';

import { User, UserRole } from '@baaa-hub/shared-types';
import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { useUser } from '../../providers/UserProvider/UserProvider';
import {
  listUsers,
  updateUserBlocked,
  updateUserRoles,
  ListUsersParams,
} from '../../services/adminService';
import { getRoleLabels } from '../../helpers/roleLabels';
import { EditRolesDialog } from './EditRolesDialog';

/**
 * Role color mapping for chips
 */
const roleColors: Record<
  UserRole,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [UserRole.MEMBER]: 'default',
  [UserRole.ADMIN]: 'error',
  [UserRole.ORGANIZATION_COMMITTEE]: 'primary',
  [UserRole.COMMUNITY_LEADER]: 'secondary',
  [UserRole.COMMUNITY_STAR]: 'warning',
  [UserRole.GAMER]: 'info',
};

/**
 * Administration page component for user management.
 * Only accessible to users with admin role.
 *
 * @returns {JSX.Element} The administration page.
 */
export const Administration: FC = () => {
  const { setTitle } = useBreadcrum();
  const { i18n } = useLingui();
  const { token } = useAuth();
  const { user: currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  // Get translated role labels (useLingui hook makes this reactive to locale)
  const roleLabels = getRoleLabels();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [blockedFilter, setBlockedFilter] = useState<string>('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('');

  // Edit roles dialog state
  const [editRolesDialogOpen, setEditRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setTitle(t`Administration`);
  }, [setTitle, i18n.locale]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams = useMemo<ListUsersParams>(
    () => ({
      page: page + 1, // API uses 1-based pagination
      perPage: rowsPerPage,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(roleFilter && { role: roleFilter as UserRole }),
      ...(blockedFilter && { blocked: blockedFilter === 'true' }),
      ...(emailVerifiedFilter && {
        emailVerified: emailVerifiedFilter === 'true',
      }),
    }),
    [
      page,
      rowsPerPage,
      debouncedSearch,
      roleFilter,
      blockedFilter,
      emailVerifiedFilter,
    ],
  );

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!token?.idToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await listUsers(token.idToken, queryParams);
      setUsers(response.data);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t`Failed to load users. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [token?.idToken, queryParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleFilterChange = (event: SelectChangeEvent<string>) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleBlockedFilterChange = (event: SelectChangeEvent<string>) => {
    setBlockedFilter(event.target.value);
    setPage(0);
  };

  const handleEmailVerifiedFilterChange = (
    event: SelectChangeEvent<string>,
  ) => {
    setEmailVerifiedFilter(event.target.value);
    setPage(0);
  };

  const handleToggleBlocked = async (user: Readonly<User>) => {
    if (!token?.idToken) return;

    try {
      const updatedUser = await updateUserBlocked(
        token.idToken,
        user.id,
        !user.isBlocked,
      );
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === user.id ? updatedUser : u)),
      );
      enqueueSnackbar(
        user.isBlocked
          ? t`User unblocked successfully`
          : t`User blocked successfully`,
        { variant: 'success' },
      );
    } catch (err) {
      console.error('Failed to update user blocked status:', err);
      enqueueSnackbar(t`Failed to update user status`, { variant: 'error' });
    }
  };

  const handleEditRoles = (user: Readonly<User>) => {
    setSelectedUser(user);
    setEditRolesDialogOpen(true);
  };

  const handleSaveRoles = async (roles: UserRole[]) => {
    if (!token?.idToken || !selectedUser) return;

    try {
      const updatedUser = await updateUserRoles(
        token.idToken,
        selectedUser.id,
        roles,
      );
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === selectedUser.id ? updatedUser : u)),
      );
      enqueueSnackbar(t`User roles updated successfully`, {
        variant: 'success',
      });
      setEditRolesDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user roles:', err);
      enqueueSnackbar(t`Failed to update user roles`, { variant: 'error' });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(i18n.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Administration`}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t`Manage users, roles, and account status.`}
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder={t`Search by name, email, or nickname...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 280 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t`Role`}</InputLabel>
            <Select
              value={roleFilter}
              label={t`Role`}
              onChange={handleRoleFilterChange}
            >
              <MenuItem value="">{t`All Roles`}</MenuItem>
              {Object.values(UserRole).map(role => (
                <MenuItem key={role} value={role}>
                  {roleLabels[role]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t`Status`}</InputLabel>
            <Select
              value={blockedFilter}
              label={t`Status`}
              onChange={handleBlockedFilterChange}
            >
              <MenuItem value="">{t`All`}</MenuItem>
              <MenuItem value="false">{t`Active`}</MenuItem>
              <MenuItem value="true">{t`Blocked`}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>{t`Email Verified`}</InputLabel>
            <Select
              value={emailVerifiedFilter}
              label={t`Email Verified`}
              onChange={handleEmailVerifiedFilterChange}
            >
              <MenuItem value="">{t`All`}</MenuItem>
              <MenuItem value="true">{t`Verified`}</MenuItem>
              <MenuItem value="false">{t`Not Verified`}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t`Name`}</TableCell>
                <TableCell>{t`Email`}</TableCell>
                <TableCell>{t`Nickname`}</TableCell>
                <TableCell>{t`Roles`}</TableCell>
                <TableCell align="center">{t`Email Verified`}</TableCell>
                <TableCell align="center">{t`Status`}</TableCell>
                <TableCell>{t`Created`}</TableCell>
                <TableCell align="center">{t`Actions`}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {t`No users found`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                users.length > 0 &&
                users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.name} {user.surname}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>@{user.nickname}</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {user.roles.map(role => (
                          <Chip
                            key={role}
                            label={roleLabels[role]}
                            size="small"
                            color={roleColors[role]}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {user.isEmailVerified ? (
                        <Tooltip title={t`Email Verified`}>
                          <VerifiedUserIcon color="success" />
                        </Tooltip>
                      ) : (
                        <Tooltip title={t`Email Not Verified`}>
                          <ErrorOutlineIcon color="warning" />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {user.isBlocked ? (
                        <Chip
                          label={t`Blocked`}
                          color="error"
                          size="small"
                          icon={<BlockIcon />}
                        />
                      ) : (
                        <Chip
                          label={t`Active`}
                          color="success"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <Tooltip title={t`Manage User Roles`}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRoles(user)}
                          >
                            <ManageAccountsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Hide block button for current admin user */}
                        {currentUser?.id !== user.id && (
                          <Tooltip
                            title={
                              user.isBlocked ? t`Unblock User` : t`Block User`
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleBlocked(user)}
                              color={user.isBlocked ? 'success' : 'error'}
                            >
                              {user.isBlocked ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : (
                                <BlockIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t`Rows per page:`}
        />
      </Paper>

      {/* Edit Roles Dialog */}
      {selectedUser && (
        <EditRolesDialog
          open={editRolesDialogOpen}
          user={selectedUser}
          onClose={() => {
            setEditRolesDialogOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveRoles}
        />
      )}
    </Box>
  );
};
