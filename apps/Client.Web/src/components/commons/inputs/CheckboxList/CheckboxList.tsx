import { FC } from 'react';
import {
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { CheckboxListProps } from './CheckboxList.model';

/**
 * Render function for a CheckboxList component. This function returns a Grid component containing a list of ListItem elements.
 * Each ListItem contains a Checkbox and a ListItemText. When a Checkbox is clicked, the onSelectionChange function is called with the item's ID.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The title to display above the list.
 * @param {Array<{id: string, label: string, checked: boolean}>} props.dataSource - The array of data used to generate the list. Each object must contain an id, a label, and a boolean checked value.
 * @param {function(string): void} props.onSelectionChange - The function to call when a Checkbox is clicked. Receives the item's ID as an argument.
 * @returns {JSX.Element} A Grid component containing a list of ListItem elements.
 * @example
 * <CheckboxList
 *   title="My List"
 *   dataSource={[{ id: '1', label: 'Item 1', checked: false }, { id: '2', label: 'Item 2', checked: true }]}
 *   onSelectionChange={(id) => console.log(`Checkbox with id ${id} was clicked`)}
 * />
 */
export const CheckboxList: FC<CheckboxListProps> = ({
  title,
  dataSource,
  onSelectionChange,
  clearError,
  onCheckBoxListItemChange,
}) => (
  <Grid container direction="column" alignItems="left" minWidth={300}>
    <Typography variant="h6" padding="2px">
      {title}
    </Typography>

    <List disablePadding>
      {dataSource?.map(({ id, label, isChecked }) => (
        <ListItem key={`checkbox-list-${id}`} disablePadding>
          <ListItemButton
            onClick={() => onSelectionChange?.(id)}
            dense
            disableRipple
            sx={{
              paddingY: 0,
              paddingRight: 0,
              paddingLeft: 4,
            }}
          >
            <ListItemIcon
              onClick={() => clearError?.()}
              sx={{ justifyContent: 'space-evenly' }}
            >
              <Checkbox
                edge="start"
                checked={isChecked}
                onChange={() => onCheckBoxListItemChange?.(id)}
                disableRipple
              />
            </ListItemIcon>

            <Typography fontSize="14px">{label}</Typography>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Grid>
);
