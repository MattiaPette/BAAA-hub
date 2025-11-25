import { FC, useRef, useEffect } from 'react';
import { styled, Typography, TextareaAutosize } from '@mui/material';
import Grid from '@mui/material/Grid';

import { TextAreaProps } from './TextArea.model';

const Textarea = styled(TextareaAutosize)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderColor: theme.palette.grey.A400,
  borderRadius: '8px',
  width: '100%',
  maxWidth: '100%',
  padding: '6px',
  resize: 'none',
  border: '1px solid',
  fontSize: '16px',
  overflow: ' auto',
}));

/**
 * Render function for a TextArea component. This function returns a Grid component containing an optional title and a disabled Textarea.
 * The Textarea displays the provided dataSource array as a string, with each value separated by a newline character ('\n').
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} [props.dataSource=[]] - The array of data to display in the Textarea. Defaults to an empty array.
 * @param {string} [props.title] - The title to display above the Textarea.
 *
 * @returns {JSX.Element} A Grid component containing a title (if provided) and a disabled Textarea.
 *
 * @example
 * <TextArea dataSource={['line1', 'line2', 'line3']} title="My Title" />
 */
export const TextArea: FC<TextAreaProps> = ({
  dataSource = [],
  title,
  value,
  ...textAreaProps
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // eslint-disable-next-line functional/immutable-data
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [value, dataSource]);

  return (
    <Grid direction="column" flexGrow={1}>
      {title && (
        <Typography variant="h3">
          <strong>{title}</strong>
        </Typography>
      )}
      <Textarea
        ref={textareaRef}
        disabled
        value={dataSource.join('\n')}
        {...textAreaProps}
      />
    </Grid>
  );
};
