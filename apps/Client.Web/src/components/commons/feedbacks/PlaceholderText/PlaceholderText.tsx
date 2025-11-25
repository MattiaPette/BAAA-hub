import { FC } from 'react';

import { Typography, Box, useTheme } from '@mui/material';

import { PlaceholderTextProps } from './PlaceholderText.model';

/**
 * Function that returns a text component to act as a placeholder for another component.
 * This function displays a placeholder until a certain condition is met.
 * The placeholder occupies the same area as the component it replaces.
 *
 * @param {Object} props - The properties of the component.
 * @param {string} props.text - The text displayed at the center of the placeholder.
 *
 * @returns {JSX.Element} A styled text placeholder component.
 *
 * @example
 * // To use the placeholder with custom text
 * <PlaceholderText text="Hello" />
 *
 */
export const PlaceholderText: FC<PlaceholderTextProps> = ({ text }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.grey[200],
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        flex: 1,
      }}
    >
      <Typography
        sx={{
          font: {
            fontSize: '14px',
            fontStyle: 'Italic',
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};
