import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Dashboard } from './Dashboard';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

describe('Dashboard', () => {
  it('should render Dashboard component', () => {
    const { getByText } = render(
      <BreadcrumProvider>
        <Dashboard />
      </BreadcrumProvider>,
    );

    expect(getByText(/dashboard/i)).toBeInTheDocument();
  });
});
