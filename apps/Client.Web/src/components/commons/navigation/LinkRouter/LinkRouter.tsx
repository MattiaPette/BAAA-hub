import { FC } from 'react';

import { Link } from 'react-router';

import { Link as MuiLink } from '@mui/material';

import { LinkRouterProps } from './LinkRouter.model';

/**
 * Render function that returns a MuiLink component with the Link component as its inner component and underline disabled.
 * This function accepts all LinkRouterProps and passes them to the MuiLink component.
 *
 * @param {LinkRouterProps} props - The properties to pass to the MuiLink component.
 * @returns {JSX.Element} A MuiLink component with the Link component as its inner component and underline disabled.
 *
 * @example
 * <LinkRouter to="/path" color="primary">Link</LinkRouter>
 */
export const LinkRouter: FC<LinkRouterProps> = props => (
  <MuiLink component={Link} underline="none" {...props} />
);
