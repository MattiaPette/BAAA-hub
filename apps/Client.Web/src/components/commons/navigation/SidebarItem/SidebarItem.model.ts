import { SvgIconProps } from '@mui/material';
import { ElementType } from 'react';

/**
 * Props for the SidebarItem component.
 * Represents a single navigation item in the application sidebar.
 *
 * @property {number} [index] - Position index of the item in the sidebar (optional, for backward compatibility)
 * @property {ElementType<SvgIconProps>} [icon] - Optional icon component to display
 * @property {SvgIconProps} [iconProps] - Optional props to pass to the icon component
 * @property {string} text - Display text for the navigation item
 * @property {string} path - Navigation path/route for this item
 * @property {boolean} [open] - Whether the sidebar is currently open
 * @property {boolean} [selected] - Whether this item is currently selected/active (default: false)
 * @property {boolean} [isDivider] - Whether this item should render as a divider
 * @property {boolean} [userRoute] - Whether this is a user-specific route (deprecated, use permission in route)
 * @property {boolean} [isHidden] - Whether this item should be hidden
 * @property {() => void} [onClick] - Optional click handler
 */
export type SidebarItemProps = Readonly<{
  index?: number;
  icon?: ElementType<SvgIconProps>;
  iconProps?: SvgIconProps;
  text: string;
  path: string;
  open?: boolean;
  selected?: boolean;
  isDivider?: boolean;
  userRoute?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
}>;
