import { FC } from 'react';

import {
  ListItem,
  ListItemIcon,
  Avatar,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import logo from '../../../../assets/shrimp.png';
import { TopbarTitleProps } from './TopbarTitle.model';

/**
 * Render function for the top bar title. This function returns a Material-UI ListItem component with an icon and a title.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The title to display in the top bar.
 * @returns {JSX.Element} A Material-UI ListItem element with an icon and a title.
 *
 * @example
 * <TopBarTitle title="My Title" />
 */
export const TopBarTitle: FC<TopbarTitleProps> = ({ title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ListItem disablePadding key="topbar-title" sx={{ position: 'relative' }}>
      {!isMobile && (
        <>
          <ListItemIcon
            sx={{
              justifyContent: 'center',
              paddingTop: 2,
              paddingBottom: 2,
            }}
          >
            <Avatar
              src={logo}
              variant="square"
              sx={{
                objectFit: 'cover',
                // ensure all the logo fits
                '& img': {
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                },
              }}
            />
          </ListItemIcon>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: theme => theme.palette.common.white,
              margin: '1rem',
            }}
          />
        </>
      )}
      <Typography
        sx={{
          font: { fontSize: 20 },
        }}
        variant="h1"
      >
        {title}
      </Typography>
    </ListItem>
  );
};
