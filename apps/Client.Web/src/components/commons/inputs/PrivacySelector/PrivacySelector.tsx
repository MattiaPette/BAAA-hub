import { FC, useId } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { t } from '@lingui/core/macro';
import { PrivacyLevel } from '@baaa-hub/shared-types';

interface PrivacySelectorProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export const PrivacySelector: FC<PrivacySelectorProps> = ({
  value,
  onChange,
  label = t`Privacy`,
  helperText,
  disabled = false,
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const selectId = `${id}-select`;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as PrivacyLevel);
  };

  const getIcon = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return <PublicIcon fontSize="small" />;
      case PrivacyLevel.FOLLOWERS:
        return <GroupIcon fontSize="small" />;
      case PrivacyLevel.PRIVATE:
        return <LockIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const getLabel = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return t`Public`;
      case PrivacyLevel.FOLLOWERS:
        return t`Followers Only`;
      case PrivacyLevel.PRIVATE:
        return t`Private`;
      default:
        return level;
    }
  };

  return (
    <FormControl fullWidth disabled={disabled} variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={selectId}
        value={value}
        onChange={handleChange}
        label={label}
        renderValue={selected => (
          <Stack direction="row" spacing={1} alignItems="center">
            {getIcon(selected as PrivacyLevel)}
            <Typography>{getLabel(selected as PrivacyLevel)}</Typography>
          </Stack>
        )}
      >
        {Object.values(PrivacyLevel).map(level => (
          <MenuItem key={level} value={level}>
            <ListItemIcon>{getIcon(level)}</ListItemIcon>
            <ListItemText primary={getLabel(level)} />
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, ml: 1.5 }}
        >
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};
