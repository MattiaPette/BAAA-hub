import { FC, useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import { Typography, Container, Paper } from '@mui/material';

import { useBreadcrum } from '../../providers/BreadcrumProvider/BreadcrumProvider';
import { UserSearch } from '../../components/social/UserSearch/UserSearch';

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* User Search */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          <Trans>Find Users</Trans>
        </Typography>
        <UserSearch />
      </Paper>

      {/* Placeholder for future feed content */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          <Trans>Feed content coming soon...</Trans>
        </Typography>
      </Paper>
    </Container>
  );
};
