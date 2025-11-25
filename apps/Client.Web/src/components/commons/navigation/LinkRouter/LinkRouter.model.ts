import { Link } from 'react-router';

import { LinkProps } from '@mui/material';

/**
 * Props for the LinkRouter component.
 * Combines Material-UI Link styling with React Router navigation capabilities.
 *
 * @see {@link https://mui.com/material-ui/api/link/|Material-UI Link API}
 * @see {@link https://reactrouter.com/|React Router}
 */
export type LinkRouterProps = LinkProps<typeof Link>;
