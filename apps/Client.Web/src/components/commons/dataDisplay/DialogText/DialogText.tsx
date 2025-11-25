import { FC } from 'react';

import { Box, List, ListItem, Typography } from '@mui/material';

import { DialogTextProps } from './DialogText.model';

export const DialogText: FC<DialogTextProps> = ({ text, list }) => (
  <Box sx={{ marginBottom: '6px' }}>
    {list && (
      <List sx={{ justifyContent: 'center' }}>
        {list.map((instruction, index) => (
          <ListItem disablePadding key={index}>
            {instruction}
          </ListItem>
        ))}
      </List>
    )}
    {text && <Typography fontSize="16px">{text}</Typography>}
  </Box>
);
