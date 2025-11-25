import { FC } from 'react';

import { Card as MuiCard, styled } from '@mui/material';

import { CardProps } from './Card.model';

const Card = styled(MuiCard)(() => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%',
  height: 'fit-content',

  padding: 8,
  borderRadius: 10,
  gap: 2,

  overflow: 'auto',
}));

/**
 * CardComponent is a React functional component that renders its children inside a styled Card container.
 * This component is used as a background for various form fields and sections throughout the project,
 * providing consistent padding, border radius, and background color.
 *
 * @param {CardProps} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to display inside the card.
 *
 * @returns {JSX.Element} A styled Card component containing the provided children.
 *
 * @example
 * <CardComponent>
 *   <TextField label="Name" />
 * </CardComponent>
 */
export const CardComponent: FC<CardProps> = ({ children }) => (
  <Card>{children}</Card>
);
