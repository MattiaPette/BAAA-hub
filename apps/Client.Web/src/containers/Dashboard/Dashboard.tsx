import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
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
  const { i18n } = useLingui();

  useEffect(() => {
    setTitle(t`Dashboard`);
  }, [setTitle, i18n.locale]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Dashboard`}
      </Typography>
    </Box>
  );
};
