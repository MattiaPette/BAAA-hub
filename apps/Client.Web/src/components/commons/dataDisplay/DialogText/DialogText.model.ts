/**
 * Props for the DialogText component.
 * Displays text or a list of items within a dialog.
 *
 * @property {string} [text] - Optional single text string to display
 * @property {string[]} [list] - Optional array of strings to display as a list
 */
export type DialogTextProps = {
  text?: string;
  list?: string[];
};
