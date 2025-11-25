import { Dispatch } from 'react';

/**
 * Represents a single item in the language picker checkbox list.
 *
 * @property {string} id - Unique identifier for the list item
 * @property {string} label - Display label for the checkbox
 * @property {boolean} isChecked - Whether the checkbox is currently checked
 */
export type LanguagePickerListItem = Readonly<{
  id: string;
  label: string;
  isChecked: boolean;
}>;

/**
 * Props for the CheckboxList component.
 * A reusable component for displaying a list of checkboxes with optional callbacks.
 *
 * @property {ReadonlyArray<LanguagePickerListItem>} [dataSource] - Array of items to display as checkboxes
 * @property {string} title - Title displayed above the checkbox list
 * @property {function} [clearError] - Optional callback to clear validation errors
 * @property {Dispatch<string>} [onSelectionChange] - Optional callback invoked when selection changes, receives the item ID
 * @property {function} [onCheckBoxListItemChange] - Optional callback invoked when a checkbox is toggled, receives the item ID
 */
export type CheckboxListProps = Readonly<{
  dataSource?: Readonly<LanguagePickerListItem[]>;
  title: string;

  clearError?: (name?: 'mainLanguages' | undefined) => void;

  onSelectionChange?: Dispatch<string>;
  onCheckBoxListItemChange?: (id: string) => void;
}>;
