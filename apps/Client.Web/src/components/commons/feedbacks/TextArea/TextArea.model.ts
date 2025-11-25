import { TextareaAutosizeProps } from '@mui/material';

/**
 * Props for the TextArea component.
 * Extends Material-UI's TextareaAutosize with optional data source and title.
 *
 * @property {ReadonlyArray<string>} [dataSource] - Optional array of strings for populating the textarea
 * @property {string} [title] - Optional title/label for the textarea
 */
export type TextAreaProps = Readonly<{
  dataSource?: ReadonlyArray<string>;
  title?: string;
}> &
  TextareaAutosizeProps;
