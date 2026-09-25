import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FunnelAcquisition } from './FunnelAcquisition';
import type { FunnelStepAcquisition } from '../types/funnel';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import {
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../graphql/users';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../graphql/users', () => ({
  ...jest.requireActual('../../../graphql/users'),
  updateUserAcquisition: jest.fn(),
}));

const onTransition = jest.fn();
const onRegisterStepToSkip = jest.fn();

const renderStep = (
  parameters: Partial<FunnelStepAcquisition['parameters']> = {},
  user: Record<string, unknown> = {},
) => {
  (useAuthContext as jest.Mock).mockReturnValue({
    user: { id: 'u1', ...user },
  });
  (useLogContext as jest.Mock).mockReturnValue({ logEvent: jest.fn() });

  const step = {
    id: 'acquisition',
    type: FunnelStepType.Acquisition,
    isActive: true,
    parameters,
    transitions: [],
    onTransition,
    onRegisterStepToSkip,
  } as unknown as FunnelStepAcquisition;

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <FunnelAcquisition {...step} />
    </QueryClientProvider>,
  );
};

const optionLabels = () =>
  screen.getAllByRole('checkbox').map((option) => option.textContent);

describe('FunnelAcquisition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep Other last whatever order the channels come in', () => {
    renderStep({
      shuffle: false,
      options: [
        AcquisitionChannel.Other,
        AcquisitionChannel.Reddit,
        AcquisitionChannel.SearchEngine,
      ],
    });

    expect(optionLabels()).toEqual(['Reddit', 'Search engine', 'Other']);
  });

  it('should keep Other last when the list is shuffled', () => {
    renderStep({ shuffle: true });

    expect(optionLabels().at(-1)).toBe('Other');
  });

  it('should move on with the answer even when saving it fails', async () => {
    (updateUserAcquisition as jest.Mock).mockRejectedValue(new Error('down'));
    renderStep({ shuffle: false });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Reddit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: AcquisitionChannel.Reddit },
      }),
    );
  });

  it('should skip itself when the channel is already on file', () => {
    renderStep({}, { acquisitionChannel: AcquisitionChannel.Friend });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(onRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.Acquisition,
      true,
    );
  });
});
