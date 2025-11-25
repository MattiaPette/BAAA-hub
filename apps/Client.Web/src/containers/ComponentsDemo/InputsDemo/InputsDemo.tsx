import { FC, useState, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Fab,
  Radio,
  RadioGroup,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NavigationIcon from '@mui/icons-material/Navigation';

import { useBreadcrum } from '../../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * InputsDemo page component that showcases MUI input components.
 *
 * @returns {JSX.Element} The inputs demo page.
 *
 * @example
 * <InputsDemo />
 */
export const InputsDemo: FC = () => {
  const { setTitle } = useBreadcrum();
  const [autocompleteValue, setAutocompleteValue] = useState<string | null>(
    null,
  );
  const [checked, setChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');
  const [ratingValue, setRatingValue] = useState<number | null>(2);
  const [selectValue, setSelectValue] = useState('10');
  const [sliderValue, setSliderValue] = useState(30);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [alignment, setAlignment] = useState('left');

  useEffect(() => {
    setTitle(t`Components Demo - Inputs`);
  }, [setTitle]);

  const autocompleteOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Input Components`}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          marginTop: 2,
        }}
      >
        {/* Autocomplete */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Autocomplete`}
            </Typography>
            <Autocomplete
              value={autocompleteValue}
              onChange={(_, newValue) => setAutocompleteValue(newValue)}
              options={autocompleteOptions}
              renderInput={params => (
                <TextField {...params} label={t`Select option`} />
              )}
            />
          </CardContent>
        </Card>

        {/* Button */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Button`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained">{t`Contained`}</Button>
              <Button variant="outlined">{t`Outlined`}</Button>
              <Button variant="text">{t`Text`}</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Button Group */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Button Group`}
            </Typography>
            <ButtonGroup variant="contained">
              <Button>{t`One`}</Button>
              <Button>{t`Two`}</Button>
              <Button>{t`Three`}</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        {/* Checkbox */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Checkbox`}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                />
              }
              label={t`Checkbox Label`}
            />
          </CardContent>
        </Card>

        {/* Floating Action Button */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Floating Action Button`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Fab color="primary" aria-label="add">
                <AddIcon />
              </Fab>
              <Fab color="secondary" aria-label="edit">
                <EditIcon />
              </Fab>
              <Fab variant="extended">
                <NavigationIcon sx={{ mr: 1 }} />
                {t`Navigate`}
              </Fab>
            </Stack>
          </CardContent>
        </Card>

        {/* Radio Group */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Radio Group`}
            </Typography>
            <RadioGroup
              value={radioValue}
              onChange={e => setRadioValue(e.target.value)}
            >
              <FormControlLabel
                value="option1"
                control={<Radio />}
                label={t`Option 1`}
              />
              <FormControlLabel
                value="option2"
                control={<Radio />}
                label={t`Option 2`}
              />
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Rating */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Rating`}
            </Typography>
            <Rating
              name="simple-controlled"
              value={ratingValue}
              onChange={(_, newValue) => setRatingValue(newValue)}
            />
            <Rating
              name="heart-rating"
              value={2}
              icon={<FavoriteIcon fontSize="inherit" />}
              emptyIcon={<FavoriteIcon fontSize="inherit" />}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        {/* Select */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Select`}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="demo-select-label">{t`Age`}</InputLabel>
              <Select
                labelId="demo-select-label"
                value={selectValue}
                label={t`Age`}
                onChange={e => setSelectValue(e.target.value)}
              >
                <MenuItem value={10}>{t`Ten`}</MenuItem>
                <MenuItem value={20}>{t`Twenty`}</MenuItem>
                <MenuItem value={30}>{t`Thirty`}</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Slider */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Slider`}
            </Typography>
            <Slider
              value={sliderValue}
              onChange={(_, newValue) => setSliderValue(newValue as number)}
              aria-label="Default"
              valueLabelDisplay="auto"
            />
          </CardContent>
        </Card>

        {/* Switch */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Switch`}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={switchChecked}
                  onChange={e => setSwitchChecked(e.target.checked)}
                />
              }
              label={t`Switch Label`}
            />
          </CardContent>
        </Card>

        {/* Text Field */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Text Field`}
            </Typography>
            <Stack spacing={2}>
              <TextField label={t`Standard`} variant="standard" />
              <TextField label={t`Filled`} variant="filled" />
              <TextField label={t`Outlined`} variant="outlined" />
            </Stack>
          </CardContent>
        </Card>

        {/* Toggle Button */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t`Toggle Button`}
            </Typography>
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={(_, newAlignment) => {
                if (newAlignment !== null) {
                  setAlignment(newAlignment);
                }
              }}
              aria-label="text alignment"
            >
              <ToggleButton value="left" aria-label="left aligned">
                {t`Left`}
              </ToggleButton>
              <ToggleButton value="center" aria-label="centered">
                {t`Center`}
              </ToggleButton>
              <ToggleButton value="right" aria-label="right aligned">
                {t`Right`}
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
