import { FC, useState, useEffect } from 'react';
import { Navigate, useRoutes, useNavigate, useLocation } from 'react-router';
import { Box, Tabs, Tab } from '@mui/material';
import { t } from '@lingui/core/macro';

import { InputsDemo } from './InputsDemo/InputsDemo';
import { DataDisplayDemo } from './DataDisplayDemo/DataDisplayDemo';
import { FeedbacksDemo } from './FeedbacksDemo/FeedbacksDemo';

/**
 * ComponentsDemo container that manages routes for different MUI component demos.
 *
 * @returns {JSX.Element} The components demo with sub-routes.
 *
 * @example
 * <ComponentsDemo />
 */
export const ComponentsDemo: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const path = pathParts[pathParts.length - 1];
    switch (path) {
      case 'inputs':
        setCurrentTab(0);
        break;
      case 'data-display':
        setCurrentTab(1);
        break;
      case 'feedbacks':
        setCurrentTab(2);
        break;
      default:
        setCurrentTab(0);
    }
  }, [location.pathname]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const paths = ['inputs', 'data-display', 'feedbacks'];
    navigate(`/components-demo/${paths[newValue]}`);
  };

  const routes = useRoutes([
    {
      path: 'inputs',
      element: <InputsDemo />,
    },
    {
      path: 'data-display',
      element: <DataDisplayDemo />,
    },
    {
      path: 'feedbacks',
      element: <FeedbacksDemo />,
    },
    {
      path: '*',
      element: <Navigate to="inputs" />,
    },
  ]);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="component demo tabs"
        >
          <Tab label={t`Inputs`} />
          <Tab label={t`Data Display`} />
          <Tab label={t`Feedbacks`} />
        </Tabs>
      </Box>
      {routes}
    </Box>
  );
};
