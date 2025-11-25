import { FC } from 'react';

import { AppBar, Box, styled, Toolbar } from '@mui/material';

import { TopBarProps } from './TopBar.model';

const StyledToolbar = styled(Toolbar)<Required<Pick<TopBarProps, 'height'>>>(
  ({ height, theme }) => ({
    height,
    minHeight: height,
    paddingLeft: 0,
    paddingRight: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,

    [theme.breakpoints.down('md')]: {
      height,
      minHeight: height,
      paddingLeft: 0,
      paddingRight: theme.spacing(3),
    },

    [theme.breakpoints.between('md', 'lg')]: {
      height,
      minHeight: height,
      paddingLeft: 0,
      paddingRight: theme.spacing(3),
    },

    [theme.breakpoints.up('lg')]: {
      height,
      minHeight: height,
      paddingLeft: 0,
      paddingRight: theme.spacing(3),
    },
  }),
);

/**
 * Functional component that generates a customizable top bar (TopBar).
 *
 * @param {Object} props - The object containing the component's properties.
 * @param {number} [props.height=64] - The height of the top bar. Default is 64.
 * @param {ReactNode} [props.startAdornment] - The React node to display at the start of the top bar.
 * @param {ReactNode} [props.endAdornment] - The React node to display at the end of the top bar.
 * @param {ReactNode} [props.children] - The child nodes to display inside the top bar.
 * @param {...any} props.props - Additional properties to pass to the AppBar component.
 * @returns {JSX.Element} - A JSX element representing the customized top bar.
 *
 * @example
 * <TopBar height={80} startAdornment={<MyStartComponent />} endAdornment={<MyEndComponent />}>
 *   <MyChildrenComponents />
 * </TopBar>
 */
export const TopBar: FC<TopBarProps> = ({
  height = 64,
  startAdornment,
  endAdornment,
  children,
  ...props
}) => (
  <AppBar sx={{ width: '100%' }} position="relative" elevation={0} {...props}>
    <StyledToolbar height={height}>
      {startAdornment}

      <Box sx={{ flexGrow: 1 }}>{children}</Box>

      {endAdornment}
    </StyledToolbar>
  </AppBar>
);
