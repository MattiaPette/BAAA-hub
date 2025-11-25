import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { Box, Typography } from '@mui/material';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * Dashboard page component that serves as the main landing page.
 *
 * @returns {JSX.Element} The dashboard page.
 *
 * @example
 * <Dashboard />
 */
export const Dashboard: FC = () => {
  const { setTitle } = useBreadcrum();

  useEffect(() => {
    setTitle(t`Dashboard`);
  }, [setTitle]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Dashboard`}
      </Typography>
    </Box>
  );
};
