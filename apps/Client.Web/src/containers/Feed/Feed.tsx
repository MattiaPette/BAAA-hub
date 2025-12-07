import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Box, Typography } from '@mui/material';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';

/**
 * Feed page component that serves as the main landing page.
 *
 * @returns {JSX.Element} The feed page.
 *
 * @example
 * <Feed />
 */
export const Feed: FC = () => {
  const { setTitle } = useBreadcrum();
  const { i18n } = useLingui();

  useEffect(() => {
    setTitle(t`Feed`);
  }, [setTitle, i18n.locale]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t`Feed`}
      </Typography>
    </Box>
  );
};
