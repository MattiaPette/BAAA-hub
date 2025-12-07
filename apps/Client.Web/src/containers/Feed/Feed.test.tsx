import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Feed } from './Feed';
import { renderWithProviders as render } from '../../test-utils';

import { BreadcrumProvider } from '../../providers/BreadcrumProvider/BreadcrumProvider';

describe('Feed', () => {
  it('should render Feed component', () => {
    const { getByText } = render(
      <BreadcrumProvider>
        <Feed />
      </BreadcrumProvider>,
    );

    expect(getByText(/feed/i)).toBeInTheDocument();
  });
});
