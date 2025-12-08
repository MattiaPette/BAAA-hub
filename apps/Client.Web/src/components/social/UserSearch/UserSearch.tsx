import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  CircularProgress,
  Typography,
  alpha,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { UserSearchResult } from '@baaa-hub/shared-types';
import { useDebounce } from '../../../hooks/useDebounce';
import { searchUsers } from '../../../services/socialService';
import { getUserImageUrl } from '../../../services/userService';

/**
 * UserSearch component - fuzzy search for users with dropdown results
 */
export const UserSearch: FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchUsers(debouncedQuery);
        setResults(response.users);
        setIsOpen(response.users.length > 0);
      } catch (error) {
        console.error('Failed to search users:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [],
  );

  const handleUserClick = useCallback(
    (userId: string) => {
      setQuery('');
      setResults([]);
      setIsOpen(false);
      navigate(`/user/${userId}`);
    },
    [navigate],
  );

  const handleClickAway = useCallback(() => {
    setIsOpen(false);
  }, []);

  const getInitials = (name: string, surname: string): string => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || '?';
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        sx={{ position: 'relative', width: '100%', maxWidth: 600 }}
        ref={searchRef}
      >
        <TextField
          fullWidth
          placeholder={t`Search for users...`}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
            endAdornment: isLoading ? <CircularProgress size={20} /> : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: theme =>
                alpha(theme.palette.background.paper, 0.8),
              '&:hover': {
                backgroundColor: theme => theme.palette.background.paper,
              },
            },
          }}
        />

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              zIndex: 1300,
              borderRadius: 2,
            }}
          >
            <List sx={{ py: 0 }}>
              {results.map((user, index) => (
                <ListItem
                  component="li"
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  sx={{
                    borderBottom:
                      index < results.length - 1
                        ? theme =>
                            `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        : 'none',
                    '&:hover': {
                      backgroundColor: theme =>
                        alpha(theme.palette.primary.main, 0.08),
                      cursor: 'pointer',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        user.avatarThumbKey
                          ? getUserImageUrl(user.id, 'avatar', false)
                          : user.profilePicture
                      }
                      sx={{
                        bgcolor: theme => theme.palette.primary.main,
                      }}
                    >
                      {!user.avatarThumbKey && !user.profilePicture && (
                        <>{getInitials(user.name, user.surname)}</>
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.name} ${user.surname}`}
                    secondary={`@${user.nickname}`}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* No Results */}
        {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              p: 3,
              zIndex: 1300,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              <Trans>No users found</Trans>
            </Typography>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};
