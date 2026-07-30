import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ActionButtons from './ActionButtons';
import type { ActionButtonsVariant } from './ActionButtons';
import post from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import { useViewSize } from '../../../hooks/useViewSize';

jest.mock('../../../hooks/post/usePostImpressions', () => ({
  usePostImpressions: jest.fn(),
}));

// Awards used to survive on laptop when impressions were enabled, and jsdom
// reports every media query as unmatched, so the viewport has to be forced.
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../hooks/post/usePostImpressionsModal', () => ({
  usePostImpressionsModal: () => jest.fn(),
}));

jest.mock('../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

jest.mock('../../post/PostAwardAction', () => ({
  __esModule: true,
  default: () => <div data-testid="award-action" />,
}));

const mockImpressions = (enabled: boolean) =>
  jest.mocked(usePostImpressions).mockReturnValue({
    enabled,
    showImpressions: enabled,
    impressions: enabled ? 1000 : 0,
  });

const renderComponent = (variant: ActionButtonsVariant) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ActionButtons post={post} variant={variant} />
    </TestBootProvider>,
  );

const variants: ActionButtonsVariant[] = ['grid', 'list', 'signal'];

describe.each([false, true])('ActionButtons (v2: %s)', (isV2) => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEngagementBarV2).mockReturnValue(isV2);
    jest.mocked(useViewSize).mockReturnValue(true);
  });

  it.each(variants)(
    'hides the award action on a %s card when impressions are enabled',
    (variant) => {
      mockImpressions(true);

      renderComponent(variant);

      expect(screen.queryByTestId('award-action')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Impressions' }),
      ).toBeInTheDocument();
    },
  );

  it.each(variants)(
    'keeps the award action on a %s card when impressions are disabled',
    (variant) => {
      mockImpressions(false);

      renderComponent(variant);

      expect(screen.getByTestId('award-action')).toBeInTheDocument();
    },
  );
});
