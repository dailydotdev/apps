import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { useCampaignMutation } from './useCampaignMutation';
import { CampaignType, stopCampaign } from '../../graphql/campaigns';
import { useToastNotification } from '../../hooks/useToastNotification';

jest.mock('../../graphql/campaigns', () => ({
  ...jest.requireActual('../../graphql/campaigns'),
  stopCampaign: jest.fn(),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: jest.fn(),
}));

const displayToast = jest.fn();
const mockStopCampaign = stopCampaign as jest.MockedFunction<
  typeof stopCampaign
>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider
    client={
      new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    }
    auth={{ user: loggedUser }}
  >
    {children}
  </TestBootProvider>
);

describe('useCampaignMutation cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToastNotification as jest.Mock).mockReturnValue({ displayToast });
  });

  it.each([
    [CampaignType.Post, 'Post boost canceled!'],
    [CampaignType.Squad, 'Squad boost canceled!'],
  ])('should name the %s boost it canceled', async (type, toast) => {
    mockStopCampaign.mockResolvedValue({
      transactionId: 't1',
      referenceId: 'c1',
      balance: { amount: 100 },
    });
    const onCancelSuccess = jest.fn();
    const { result } = renderHook(
      () => useCampaignMutation({ onCancelSuccess }),
      { wrapper },
    );

    await act(() => result.current.onCancelBoost({ id: 'c1', type }));

    expect(mockStopCampaign).toHaveBeenCalledWith('c1');
    expect(displayToast).toHaveBeenCalledWith(toast);
    expect(onCancelSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 't1' }),
      'c1',
    );
  });

  it('should tell the user when stopping the boost failed', async () => {
    mockStopCampaign.mockRejectedValue(new Error('Campaign is not active'));
    const { result } = renderHook(() => useCampaignMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.onCancelBoost({ id: 'c1', type: CampaignType.Post }),
      ).rejects.toThrow();
    });

    expect(displayToast).toHaveBeenCalledWith(
      "We couldn't stop the boost. Please try again.",
    );
  });
});
