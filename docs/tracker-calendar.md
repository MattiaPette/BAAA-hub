# Tracker Calendar Feature

## Overview

The Tracker Calendar is a workout planning and visualization feature that
provides a Google Calendar-like monthly view for logging and tracking workouts.

## Components

### Main Container

- **Location**: `src/containers/Tracker/Tracker.tsx`
- **Purpose**: Main container component that orchestrates the calendar view
- **Features**:
  - Monthly calendar view
  - Responsive sidebar (desktop: permanent, mobile: drawer)
  - Calendar selection and filtering
  - Workout dialog management

### Calendar Components

#### CalendarView

- **Location**: `src/components/tracker/CalendarView/`
- **Purpose**: Renders the monthly calendar grid
- **Features**:
  - Week day headers (Mon-Sun)
  - 7-column grid layout using CSS Grid
  - Date calculations using date-fns (MIT licensed)

#### CalendarDay

- **Location**: `src/components/tracker/CalendarDay/`
- **Purpose**: Individual day cell in the calendar
- **Features**:
  - Displays up to 3 workouts per day
  - Shows overflow indicator (+N more)
  - Visual indication for current day
  - Click/tap to add workouts
  - Keyboard accessible (Enter/Space)

#### CalendarHeader

- **Location**: `src/components/tracker/CalendarHeader/`
- **Purpose**: Month navigation controls
- **Features**:
  - Previous/Next month arrows
  - Current month/year display

#### CalendarSidebar

- **Location**: `src/components/tracker/CalendarSidebar/`
- **Purpose**: Calendar/user selection
- **Features**:
  - List of available calendars
  - Color-coded calendar indicators
  - Selection state management

#### AddWorkoutDialog

- **Location**: `src/components/tracker/AddWorkoutDialog/`
- **Purpose**: Modal for adding new workouts
- **Features**:
  - Workout type selection
  - Start/end time inputs (hour and minute)
  - Follows existing dialog patterns

## Data Management

### Types

- **Location**: `src/types/tracker.ts`
- **Definitions**:
  - `WorkoutType`: Enum for workout categories
  - `Workout`: Workout data structure
  - `Calendar`: User calendar data structure

### Mock Data

- **Location**: `src/data/mockTrackerData.ts`
- **Purpose**: Provides sample data for UI prototyping
- **Features**:
  - 3 mock calendars with different colors
  - Sample workouts distributed across the current month
  - Uses relative dates for consistency

## Internationalization

All user-facing strings are wrapped with lingui macros for i18n support:

- `t` macro for JavaScript strings
- `<Trans>` component for JSX content
- Translations available in English and Italian

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Clear focus indicators
- Semantic HTML structure
- Screen reader friendly

## Responsive Design

- **Desktop**: Permanent sidebar, spacious calendar grid
- **Mobile**: Collapsible drawer, compact layout
- **Breakpoint**: `md` (768px)

## Styling

- Uses Material-UI theme system
- Follows existing design patterns
- Custom accent color support
- Responsive spacing and sizing

## Testing

- Unit tests for main Tracker container
- Tests verify rendering and basic functionality
- Located in: `src/containers/Tracker/Tracker.test.tsx`

## Future Enhancements

Suggestions for future development:

- Backend integration for persistent data
- Drag-and-drop workout scheduling
- Week and day views
- Workout details and notes
- Export/import functionality
- Workout templates
- Performance metrics tracking
- Social features (share workouts)

## Dependencies

- **date-fns**: MIT licensed, used for date manipulation
- **@mui/material**: MIT licensed, UI components
- **@lingui**: MIT licensed, internationalization

## License

All code follows the repository's MIT license and uses only MIT-compatible
dependencies.
