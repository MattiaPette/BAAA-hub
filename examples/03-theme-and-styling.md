# Theme and Styling

This example demonstrates how to use the theme system in the Activity Tracker
application, including theme mode switching (light/dark) and Material-UI theme
customization.

## Overview

The application uses Material-UI for styling with support for light and dark
themes. The `ThemeModeProvider` manages theme mode state and persists user
preferences.

## Basic Theme Usage

### Accessing Theme Mode

Use the `useThemeModeContext` hook to get and set the theme mode:

```tsx
import { useThemeModeContext } from '../providers/ThemeProvider/ThemeProvider';

function ThemeToggle() {
  const [mode, setMode] = useThemeModeContext();

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme}>
      Switch to {mode === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

## Theme Toggle Component

Create a Material-UI styled theme switcher:

```tsx
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeModeContext } from '../providers/ThemeProvider/ThemeProvider';

function ThemeSwitcher() {
  const [mode, setMode] = useThemeModeContext();

  const handleToggle = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <IconButton onClick={handleToggle} color="inherit">
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
```

## Using Material-UI Theme

Access the Material-UI theme in your components:

```tsx
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

function ThemedComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Typography variant="h4" color="primary">
        Themed Content
      </Typography>
      <Typography variant="body1">
        This component uses the current theme colors and spacing.
      </Typography>
    </Box>
  );
}
```

## Responsive Styling

Use Material-UI's responsive helpers:

```tsx
import { Box, useMediaQuery, useTheme } from '@mui/material';

function ResponsiveLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box
      sx={{
        padding: isMobile ? 1 : isTablet ? 2 : 3,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      <div>Responsive content</div>
    </Box>
  );
}
```

## Custom Component Styling

Style components using the `sx` prop:

```tsx
import { Button, Card, CardContent } from '@mui/material';

function StyledCard() {
  return (
    <Card
      sx={{
        maxWidth: 400,
        m: 2,
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Custom Styled Button
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Using Emotion for Advanced Styling

Create styled components with Emotion (included with Material-UI):

```tsx
import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor:
    theme.palette.mode === 'dark'
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

function MyComponent() {
  return <StyledPaper elevation={2}>Content with custom styling</StyledPaper>;
}
```

## Theme-Aware Colors

Access theme colors programmatically:

```tsx
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

function ColorShowcase() {
  const theme = useTheme();

  return (
    <Box>
      <Typography sx={{ color: theme.palette.primary.main }}>
        Primary Color
      </Typography>
      <Typography sx={{ color: theme.palette.secondary.main }}>
        Secondary Color
      </Typography>
      <Typography sx={{ color: theme.palette.error.main }}>
        Error Color
      </Typography>
      <Typography sx={{ color: theme.palette.success.main }}>
        Success Color
      </Typography>
    </Box>
  );
}
```

## Persisting Theme Preference

The `ThemeModeProvider` automatically saves the theme preference to
`localStorage`. Users will see their preferred theme when they return to the
app.

```tsx
import { ThemeModeProvider } from '../providers/ThemeProvider/ThemeProvider';

// The theme preference is automatically saved and restored
function App() {
  return (
    <ThemeModeProvider>
      <YourApp />
    </ThemeModeProvider>
  );
}
```

## Setting Initial Theme Mode

You can set a default theme mode when initializing the provider:

```tsx
import { ThemeModeProvider } from '../providers/ThemeProvider/ThemeProvider';

function App() {
  return (
    <ThemeModeProvider mode="dark">
      <YourApp />
    </ThemeModeProvider>
  );
}
```

## Complete Theme Toggle Example

Here's a complete example with a settings panel:

```tsx
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useThemeModeContext } from '../providers/ThemeProvider/ThemeProvider';

function ThemeSettings() {
  const [mode, setMode] = useThemeModeContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as 'light' | 'dark');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Theme Settings
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={mode} onChange={handleChange}>
            <FormControlLabel
              value="light"
              control={<Radio />}
              label="Light Mode"
            />
            <FormControlLabel
              value="dark"
              control={<Radio />}
              label="Dark Mode"
            />
          </RadioGroup>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Your preference is saved automatically
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
```

## Typography Variants

Use Material-UI typography variants for consistent text styling:

```tsx
import { Typography } from '@mui/material';

function TypographyExample() {
  return (
    <div>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="body1">Body text primary</Typography>
      <Typography variant="body2">Body text secondary</Typography>
      <Typography variant="caption">Caption text</Typography>
      <Typography variant="button">Button Text</Typography>
    </div>
  );
}
```

## Spacing System

Use the theme spacing system for consistent layouts:

```tsx
import { Box } from '@mui/material';

function SpacingExample() {
  return (
    <Box
      sx={{
        p: 2, // padding: theme.spacing(2)
        m: 1, // margin: theme.spacing(1)
        mt: 3, // marginTop: theme.spacing(3)
        px: 4, // paddingLeft & paddingRight: theme.spacing(4)
        gap: 2, // gap: theme.spacing(2)
      }}
    >
      Properly spaced content
    </Box>
  );
}
```

## What's Next?

- Learn about [Data Fetching](./04-data-fetching.md)
- Explore [Navigation and Routing](./05-navigation-and-routing.md)

## See Also

- [ThemeProvider implementation](../apps/Client.Web/src/providers/ThemeProvider/ThemeProvider.tsx)
- [Theme configuration](../apps/Client.Web/src/theme/theme.ts)
- [Material-UI Documentation](https://mui.com/material-ui/customization/theming/)
