import { FC, useState } from 'react';

import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';

import { SidebarItemProps } from './SidebarItem.model';

/**
 * Render function for a sidebar item. This function returns a ListItem component
 * with a ListItemButton, a ListItemIcon, and a ListItemText. The behavior and appearance of these components
 * can be customized through the parameters passed to the function.
 *
 * @param {Object} props - The object containing the properties of the sidebar item.
 * @param {number} props.index - The index of the item in the list.
 * @param {React.ComponentType} props.icon - The icon component to display.
 * @param {Object} props.iconProps - The properties to pass to the icon component.
 * @param {string} props.text - The text to display as the item's label.
 * @param {boolean} props.open - If true, the item is in an "open" state and shows the label text.
 * @param {boolean} [props.selected=false] - If true, the item is in a "selected" state.
 * @param {boolean} props.isDivider - If true, the item is rendered as a divider.
 * @param {Object} props.props - Additional properties to pass to the ListItem component.
 * @returns {JSX.Element} A ListItem element representing a sidebar item.
 * @example
 * <SidebarItem
 *   index={1}
 *   icon={FolderIcon}
 *   iconProps={{ color: 'primary' }}
 *   text="My Folder"
 *   open={true}
 *   selected={false}
 * />
 */
export const SidebarItem: FC<SidebarItemProps> = ({
  index,
  icon: Icon,
  iconProps,
  text,
  open,
  selected = false,
  isDivider,
  userRoute,
  isHidden = false,
  ...route
}) => {
  const [hovered, setHovered] = useState(false);

  if (isDivider && !userRoute && !isHidden) {
    return (
      <ListItem key={index} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          sx={{
            minHeight: 48,
            paddingLeft: '5px',
            paddingBottom: 0,
            borderBottom: '1px solid #000',
          }}
          selected={selected}
          disableRipple
        >
          <ListItemText
            sx={{
              marginTop: 'auto',
              marginRight: 'auto',
              wordSpacing: open ? 'auto' : '35px',
              justifyContent: !open ? 'center' : 'initial',
              fontSize: '10px',
            }}
          >
            <span style={{ fontSize: '12px' }}>{text}</span>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  }
  if (hovered && !userRoute && !open && !isHidden) {
    return (
      <Tooltip
        title={text}
        arrow
        placement="right"
        slotProps={{
          popper: {
            sx: {
              [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]:
                {
                  marginLeft: '0px',
                  padding: '6px',
                },
            },
          },
        }}
      >
        <ListItem key={index} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onMouseLeave={() => setHovered(false)}
            selected={selected}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
            {...route}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                '& svg': {
                  minWidth: 0,
                  width: 20,
                  height: 20,
                },
              }}
            >
              {Icon && <Icon fontSize="small" {...iconProps} />}
            </ListItemIcon>
            <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  }
  if (isHidden) {
    return undefined;
  }
  return (
    <ListItem key={index} disablePadding sx={{ display: 'block', mb: 0.5 }}>
      <ListItemButton
        onMouseEnter={() => setHovered(true)}
        selected={selected}
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

          '&.Mui-selected': {
            backgroundColor: theme => theme.palette.action.selected,
            '&::before': {
              opacity: 0.15,
            },
            '&:hover::before': {
              opacity: 0.2,
            },
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
        {...route}
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
            ...(selected && {
              '& svg': {
                filter: theme =>
                  `drop-shadow(0 0 4px ${theme.palette.primary.main})`,
              },
            }),
          }}
        >
          {Icon && <Icon {...iconProps} />}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            opacity: open ? 1 : 0,
            '& .MuiTypography-root': {
              fontWeight: selected ? 600 : 400,
              transition: 'font-weight 0.3s ease',
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};
