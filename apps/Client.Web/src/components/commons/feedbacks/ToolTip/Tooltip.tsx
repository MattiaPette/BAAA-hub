import { FC } from 'react';
import { Tooltip as MuiTooltip } from '@mui/material';
import { TooltipProps } from './Tooltip.model';

/**
 * Render function for a Tooltip component. This function returns a MuiTooltip component with some default properties.
 *
 * @param {object} props - The properties of the Tooltip component.
 * @param {string} props.title - The title of the tooltip.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the Tooltip.
 *
 * @returns {JSX.Element} A MuiTooltip component with default properties and the given children.
 *
 * @example
 * <Tooltip title="This is a tooltip">
 *   <button>Click here</button>
 * </Tooltip>
 */
export const Tooltip: FC<TooltipProps> = ({ title, children }) => (
  <MuiTooltip
    title={title}
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -14],
            },
          },
        ],
      },
    }}
  >
    {children}
  </MuiTooltip>
);
