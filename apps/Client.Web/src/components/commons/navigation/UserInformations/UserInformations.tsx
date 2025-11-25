import { FC } from 'react';
import Stack from '@mui/material/Stack';

import { Avatar, ListItem, Typography, Box, Tooltip } from '@mui/material';

import { UserInformationsProps } from './UserInformations.model';
import { UserPopover } from '../UserPopover/UserPopover';

/**
 * Function that extracts the first letters of the user's first name, second name if present, and surname.
 * If the name or surname are not provided, the function returns an empty string for that field.
 * The function returns the letters in uppercase.
 *
 * @param {string} [name] - The user's first name. May contain a second name.
 * @param {string} [surname] - The user's surname.
 * @returns {string} The first letters of the first name, second name if present, and surname, in uppercase.
 *
 * @example
 * // Returns "JSD"
 * getFirstChars("John Samuel", "Doe");
 *
 * @example
 * // Returns "J"
 * getFirstChars("John");
 *
 * @example
 * // Returns ""
 * getFirstChars();
 */
const getFirstChars = (name?: string, surname?: string): string => {
  const [first = '', second = ''] = name ? name.split(' ') : [];

  return `${first.charAt(0)}${second.charAt(0)}${
    surname ? surname.charAt(0) : ''
  }`
    .trim()
    .toUpperCase();
};

/**
 * Render function for user information. This function returns a ListItem component that displays user details, including name, surname, email, and profile picture.
 * If the user has routes, a UserPopover component is also displayed.
 *
 * @param {object} props - The properties passed to the component.
 * @param {boolean} props.open - If true, the ListItem is displayed in expanded mode.
 * @param {string} props.name - The user's first name.
 * @param {string} props.surname - The user's surname.
 * @param {string} props.email - The user's email address.
 * @param {string} props.pictureSrc - The path to the user's profile image.
 * @param {Array} props.userRoutes - An array of user routes.
 * @returns {JSX.Element} A ListItem component displaying the user's information.
 * @example
 * <UserInformations open={true} name="John" surname="Doe" email="john.doe@example.com" pictureSrc="/path/to/profile.jpg" userRoutes={["/home", "/settings"]} />
 */
export const UserInformations: FC<UserInformationsProps> = ({
  open,
  name,
  surname,
  email,
  pictureSrc,
  userRoutes,
  onAvatarClick,
}) => {
  const firstChars = getFirstChars(name, surname);

  return (
    <ListItem
      key="user-informations"
      disablePadding
      sx={{
        display: 'flex',
        minHeight: 48,
        justifyContent: open ? 'initial' : 'center',
        paddingLeft: '1rem',
        borderTop: theme => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          width: '100%', // Ensure full width usage
          minWidth: 0, // Allow content to shrink
        }}
      >
        <Avatar
          src={pictureSrc}
          onClick={!open && onAvatarClick ? onAvatarClick : undefined}
          sx={{
            height: 32,
            width: 32,
            minWidth: 0,
            marginRight: open ? '16px' : 'auto',
            justifyContent: 'center',
            backgroundColor: theme => theme.palette.background.paper,
            border: theme => `1px solid ${theme.palette.divider}`,
            cursor: !open && onAvatarClick ? 'pointer' : 'default',
          }}
        >
          <Typography
            color="primary"
            sx={{
              textSizeAdjust: 'auto',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <strong>{firstChars}</strong>
          </Typography>
        </Avatar>

        <Box
          sx={{
            opacity: open ? 1 : 0,
            marginLeft: '1rem',
            flex: 1,
            minWidth: 0, // Allows the box to shrink below its natural width
            marginRight: 1, // Add some space before the popover
          }}
        >
          <Tooltip title={`${name} ${surname}`} arrow placement="right">
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {`${name} ${surname}`}
            </Typography>
          </Tooltip>
          <Tooltip title={email} arrow placement="right">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 12,
              }}
            >
              {email}
            </Typography>
          </Tooltip>
        </Box>
        {userRoutes.length > 0 && (
          <Box>
            <UserPopover open={false} routes={userRoutes} />
          </Box>
        )}
      </Stack>
    </ListItem>
  );
};
