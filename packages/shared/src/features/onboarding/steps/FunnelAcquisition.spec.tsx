import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FunnelAcquisition,
  getStoredChannel,
  getStoredOpenAnswer,
} from './FunnelAcquisition';
import type { FunnelStepAcquisition } from '../types/funnel';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import {
  ACQUISITION_CHANNEL_MAX_LENGTH,
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../graphql/users';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: () => false,
}));
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

describe('getStoredChannel', () => {
  it('should keep the key for every channel but a typed Other', () => {
    expect(getStoredChannel(AcquisitionChannel.Reddit, 'ignored')).toBe(
      'reddit',
    );
    expect(getStoredChannel(AcquisitionChannel.Other, '')).toBe('other');
  });

  it('should never go over the API limit', () => {
    const stored = getStoredChannel(AcquisitionChannel.Other, 'x'.repeat(80));

    expect(stored).toHaveLength(ACQUISITION_CHANNEL_MAX_LENGTH);
    expect(stored.startsWith('other:')).toBe(true);
  });
});

describe('getStoredOpenAnswer', () => {
  it('should collapse the answer and never go over the API limit', () => {
    expect(getStoredOpenAnswer('  A meetup   in Berlin ')).toBe(
      'open:A meetup in Berlin',
    );
    expect(getStoredOpenAnswer('x'.repeat(80))).toHaveLength(
      ACQUISITION_CHANNEL_MAX_LENGTH,
    );
  });
});

describe('FunnelAcquisition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep the catch-alls last whatever order they come in', () => {
    renderStep({
      shuffle: false,
      options: [
        AcquisitionChannel.Other,
        AcquisitionChannel.DontRemember,
        AcquisitionChannel.Reddit,
        AcquisitionChannel.SearchEngine,
      ],
    });

    expect(optionLabels()).toEqual([
      'Reddit',
      'Search engine',
      "I don't remember",
      'Other',
    ]);
  });

  it('should keep the catch-alls last when the list is shuffled', () => {
    renderStep({ shuffle: true });

    expect(optionLabels().slice(-2)).toEqual(["I don't remember", 'Other']);
  });

  it('should only offer I do not remember when the config lists it', () => {
    renderStep({
      shuffle: false,
      options: [AcquisitionChannel.Reddit, AcquisitionChannel.Other],
    });

    expect(optionLabels()).toEqual(['Reddit', 'Other']);
  });

  it('should save I do not remember as its own channel', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    renderStep({ shuffle: false });

    fireEvent.click(screen.getByRole('checkbox', { name: "I don't remember" }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenCalledWith(
        AcquisitionChannel.DontRemember,
      ),
    );
  });

  it('should turn Other into a text box and save the answer on the profile', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    renderStep({ shuffle: false });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Other' }));

    expect(
      screen.queryByRole('checkbox', { name: 'Other' }),
    ).not.toBeInTheDocument();
    const field = screen.getByRole('textbox', {
      name: 'Where did you hear about us?',
    });
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute('maxLength', '44');

    fireEvent.change(field, { target: { value: '  A meetup   in Berlin ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: AcquisitionChannel.Other },
      }),
    );
    expect(updateUserAcquisition).toHaveBeenCalledWith(
      'other:A meetup in Berlin',
    );
  });

  it('should save plain other when the text box is left empty', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    renderStep({ shuffle: false });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Other' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenCalledWith(
        AcquisitionChannel.Other,
      ),
    );
  });

  it('should bring Other back when another channel is picked', () => {
    renderStep({ shuffle: false });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Other' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Reddit' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Other' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Reddit' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
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

describe('FunnelAcquisition with an open answer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
  });

  it('should offer a text field instead of the channels', () => {
    renderStep({ answerStyle: 'open' });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'How did you hear about us?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('should keep the button disabled for a blank answer', () => {
    renderStep({ answerStyle: 'open' });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('should save the typed answer and hand it to the funnel', async () => {
    renderStep({ answerStyle: 'open' });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  A meetup   in Berlin ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: 'open:A meetup in Berlin' },
      }),
    );
    expect(updateUserAcquisition).toHaveBeenCalledWith(
      'open:A meetup in Berlin',
    );
  });

  it('should submit on Enter', async () => {
    renderStep({ answerStyle: 'open' });
    const field = screen.getByRole('textbox');

    fireEvent.change(field, { target: { value: 'Hacker News' } });
    fireEvent.keyDown(field, { key: 'Enter' });

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenCalledWith('open:Hacker News'),
    );
  });

  it('should save I do not remember as its own channel', async () => {
    renderStep({ answerStyle: 'open' });

    fireEvent.click(screen.getByRole('button', { name: "I don't remember" }));

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenCalledWith(
        AcquisitionChannel.DontRemember,
      ),
    );
  });

  it('should move on with the answer even when saving it fails', async () => {
    (updateUserAcquisition as jest.Mock).mockRejectedValue(new Error('down'));
    renderStep({ answerStyle: 'open' });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Reddit' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: 'open:Reddit' },
      }),
    );
  });
});
