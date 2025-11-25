import { FC } from 'react';

import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

import { t } from '@lingui/core/macro';
import { InstallAppProps } from './InstallApp.model';

/**
 * Install app button component styled to match sidebar items.
 * Displays a button for installing the PWA application.
 *
 * @param {InstallAppProps} props - Component properties
 * @param {Function} props.handler - Click handler for install action
 * @param {boolean} props.open - Whether the sidebar is open (always true in overlay mode)
 * @returns {JSX.Element} Styled install app button
 */
export const InstallApp: FC<InstallAppProps> = ({ handler, open }) => (
  <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
    <ListItemButton
      onClick={handler}
      sx={{
        minHeight: 48,
        justifyContent: open ? 'initial' : 'center',
        px: 2.5,
        mx: 1,
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme =>
            `linear-gradient(135deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.secondary.main} 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
        },

        '&:hover::before': {
          opacity: 0.1,
        },

        '&:hover': {
          backgroundColor: 'transparent',
          transform: 'translateX(4px)',
        },

        '& > *': {
          position: 'relative',
          zIndex: 1,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: open ? 3 : 'auto',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          '& svg': {
            minWidth: 0,
            width: 22,
            height: 22,
            transition: 'all 0.3s ease',
          },
        }}
      >
        <GetAppIcon />
      </ListItemIcon>
      <ListItemText
        primary={t`Install app`}
        sx={{
          opacity: open ? 1 : 0,
          '& .MuiTypography-root': {
            fontWeight: 400,
            transition: 'font-weight 0.3s ease',
          },
        }}
      />
    </ListItemButton>
  </ListItem>
);
