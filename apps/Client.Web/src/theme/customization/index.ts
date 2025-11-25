import { navigationCustomizations } from './navigation';

/**
 * Combined theme customizations for Material-UI components.
 * Merges navigation-specific and common component customizations.
 *
 * @constant
 * @type {Object}
 */
export const customizations: Record<string, unknown> = {
  ...navigationCustomizations,
};
