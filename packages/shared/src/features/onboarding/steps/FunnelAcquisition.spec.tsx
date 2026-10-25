import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FunnelAcquisition,
  getFollowUpMaxLength,
  getStoredChannel,
} from './FunnelAcquisition';
import type { FunnelStepAcquisition } from '../types/funnel';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { FunnelProgressContext } from '../shared/FunnelStepDots';
import {
  ACQUISITION_CHANNEL_MAX_LENGTH,
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../graphql/users';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../graphql/users', () => ({
  ...jest.requireActual('../../../graphql/users'),
  updateUserAcquisition: jest.fn(),
}));

const mockFollowUp = jest.fn();
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: ({ shouldEvaluate }: { shouldEvaluate?: boolean }) =>
    shouldEvaluate === false
      ? { value: false, isLoading: true }
      : mockFollowUp(),
}));

const onTransition = jest.fn();
const onRegisterStepToSkip = jest.fn();

const renderStep = (
  parameters: Partial<FunnelStepAcquisition['parameters']> = {},
  user: Record<string, unknown> = {},
  isOnboarding = false,
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
      <FunnelProgressContext.Provider
        value={{
          chapters: [{ steps: 1 }],
          position: { chapter: 0, step: 0 },
          isOnboarding,
        }}
      >
        <FunnelAcquisition {...step} />
      </FunnelProgressContext.Provider>
    </QueryClientProvider>,
  );
};

const optionLabels = () =>
  screen.getAllByRole('checkbox').map((option) => option.textContent);

const pick = (label: string) =>
  fireEvent.click(screen.getByRole('checkbox', { name: label }));
const clickContinue = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

describe('getStoredChannel', () => {
  it('should keep the key alone unless Other or a follow-up channel has detail', () => {
    expect(getStoredChannel(AcquisitionChannel.Reddit, 'ignored')).toBe(
      'reddit',
    );
    expect(getStoredChannel(AcquisitionChannel.Other, '')).toBe('other');
    expect(
      getStoredChannel(AcquisitionChannel.SearchEngine, ' dev  news '),
    ).toBe('search_engine:dev news');
  });

  it('should never go over the API limit', () => {
    const stored = getStoredChannel(AcquisitionChannel.Other, 'x'.repeat(80));

    expect(stored).toHaveLength(ACQUISITION_CHANNEL_MAX_LENGTH);
    expect(stored.startsWith('other:')).toBe(true);
  });
});

describe('FunnelAcquisition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFollowUp.mockReturnValue({ value: false, isLoading: false });
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

  it('should ask what they searched for after Search engine in the follow-up arm', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    mockFollowUp.mockReturnValue({ value: true, isLoading: false });
    renderStep({ shuffle: false }, {}, true);

    pick('Search engine');
    clickContinue();

    const field = screen.getByRole('textbox', {
      name: 'What did you search for?',
    });
    expect(updateUserAcquisition).not.toHaveBeenCalled();
    expect(onTransition).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        String(getFollowUpMaxLength(AcquisitionChannel.SearchEngine)),
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    fireEvent.input(field, { target: { value: ' daily dev   news ' } });
    clickContinue();

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: AcquisitionChannel.SearchEngine },
      }),
    );
    expect(updateUserAcquisition).toHaveBeenCalledTimes(1);
    expect(updateUserAcquisition).toHaveBeenCalledWith(
      'search_engine:daily dev news',
    );
  });

  it('should ask what they asked the AI after AI assistant', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    mockFollowUp.mockReturnValue({ value: true, isLoading: false });
    renderStep({ shuffle: false }, {}, true);

    pick('AI assistant like ChatGPT');
    clickContinue();

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.input(
      screen.getByRole('textbox', { name: 'What did you ask the AI?' }),
      { target: { value: 'best app for dev news' } },
    );
    clickContinue();

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenLastCalledWith(
        'ai:best app for dev news',
      ),
    );
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { acquisitionChannel: AcquisitionChannel.AI },
    });
  });

  it('should keep the plain channel when the follow-up is skipped', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    mockFollowUp.mockReturnValue({ value: true, isLoading: false });
    renderStep({ shuffle: false }, {}, true);

    pick('Search engine');
    clickContinue();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));

    await waitFor(() =>
      expect(onTransition).toHaveBeenCalledWith({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: AcquisitionChannel.SearchEngine },
      }),
    );
    expect(updateUserAcquisition).toHaveBeenCalledTimes(1);
    expect(updateUserAcquisition).toHaveBeenCalledWith(
      AcquisitionChannel.SearchEngine,
    );
  });

  it('should complete only once when Skip is pressed while the answer saves', async () => {
    let resolveSave: () => void = () => undefined;
    (updateUserAcquisition as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    mockFollowUp.mockReturnValue({ value: true, isLoading: false });
    renderStep({ shuffle: false }, {}, true);

    pick('Search engine');
    clickContinue();
    fireEvent.input(
      screen.getByRole('textbox', { name: 'What did you search for?' }),
      { target: { value: 'daily dev news' } },
    );
    clickContinue();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    clickContinue();
    resolveSave();

    await waitFor(() => expect(onTransition).toHaveBeenCalled());
    expect(onTransition).toHaveBeenCalledTimes(1);
    expect(updateUserAcquisition).toHaveBeenCalledTimes(1);
  });

  it("should not let the list's Skip complete the step a second time", async () => {
    let resolveSave: () => void = () => undefined;
    (updateUserAcquisition as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    renderStep({ shuffle: false, skip: 'Skip' });

    pick('Reddit');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    resolveSave();

    await waitFor(() => expect(onTransition).toHaveBeenCalled());
    expect(onTransition).toHaveBeenCalledTimes(1);
  });

  it('should leave text typed into Other behind when another channel is picked', async () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    renderStep({ shuffle: false });

    pick('Other');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: "my friend's blog" },
    });
    pick('Search engine');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(updateUserAcquisition).toHaveBeenCalledWith(
        AcquisitionChannel.SearchEngine,
      ),
    );
  });

  it('should go back to the list with the pick kept', () => {
    (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
    mockFollowUp.mockReturnValue({ value: true, isLoading: false });
    renderStep({ shuffle: false }, {}, true);

    pick('AI assistant like ChatGPT');
    clickContinue();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'AI assistant like ChatGPT' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it.each([
    ['in the control arm', false, true, 'Search engine'],
    ['in the paid funnel', true, false, 'Search engine'],
    ['for channels without a follow-up', true, true, 'Reddit'],
  ])(
    'should finish at the list %s',
    async (_, isFollowUpArm, isOnboarding, label) => {
      (updateUserAcquisition as jest.Mock).mockResolvedValue(undefined);
      mockFollowUp.mockReturnValue({ value: isFollowUpArm, isLoading: false });
      renderStep({ shuffle: false }, {}, isOnboarding);

      pick(label);
      fireEvent.click(
        screen.getByRole('button', {
          name: isOnboarding ? 'Continue' : 'Next',
        }),
      );

      await waitFor(() => expect(onTransition).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(updateUserAcquisition).toHaveBeenCalledTimes(1);
    },
  );

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
