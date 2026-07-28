import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { FunnelInviteFriends } from './FunnelInviteFriends';
import type { FunnelStepInviteFriends } from '../types/funnel';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  FunnelStepType,
} from '../types/funnel';
import { FunnelTargetId } from '../types/funnelEvents';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import user from '../../../../__tests__/fixture/loggedUser';
import type { AuthContextData } from '../../../contexts/AuthContext';
import { useReferralCampaign } from '../../../hooks/referral/useReferralCampaign';
import { shouldUseNativeShare } from '../../../lib/func';

jest.mock('../../../hooks/referral/useReferralCampaign', () => {
  const actual = jest.requireActual(
    '../../../hooks/referral/useReferralCampaign',
  );
  return {
    ...actual,
    useReferralCampaign: jest.fn(),
  };
});

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  shouldUseNativeShare: jest.fn(() => false),
}));

const mockDisplayToast = jest.fn();
jest.mock('../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../hooks/useToastNotification'),
  useToastNotification: () => ({
    displayToast: mockDisplayToast,
    dismissToast: jest.fn(),
  }),
}));

const inviteUrl = 'https://dly.to/invite123';
const mockOnTransition = jest.fn();
const mockOnRegisterStepToSkip = jest.fn();

const flagOnGb = () =>
  new GrowthBook({
    features: { onboarding_invite_reward: { defaultValue: true } },
  });

const mockReferralCampaign = (referredUsersCount: number) => {
  (useReferralCampaign as jest.Mock).mockReturnValue({
    url: inviteUrl,
    referredUsersCount,
    referralCountLimit: 5,
    referralToken: 'token123',
    isReady: true,
    isCompleted: false,
    availableCount: 5 - referredUsersCount,
    noKeysAvailable: false,
  });
};

const defaultProps: FunnelStepInviteFriends = {
  id: 'invite-friends',
  type: FunnelStepType.InviteFriends,
  parameters: {},
  transitions: [
    {
      on: FunnelStepTransitionType.Complete,
      destination: COMPLETED_STEP_ID,
    },
    {
      on: FunnelStepTransitionType.Skip,
      destination: COMPLETED_STEP_ID,
    },
  ],
  isActive: true,
  onTransition: mockOnTransition,
  onRegisterStepToSkip: mockOnRegisterStepToSkip,
};

const renderComponent = (
  props: Partial<FunnelStepInviteFriends> = {},
  {
    gb = flagOnGb(),
    auth = { user },
  }: { gb?: GrowthBook; auth?: Partial<AuthContextData> } = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestBootProvider client={client} auth={auth} gb={gb}>
      <FunnelInviteFriends {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

describe('FunnelInviteFriends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReferralCampaign(0);
    (shouldUseNativeShare as jest.Mock).mockReturnValue(false);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('should render the default headline with progress from referredUsersCount', () => {
    renderComponent();

    expect(
      screen.getByText('Invite 3 friends, get 1 month of Plus on us'),
    ).toBeInTheDocument();
    expect(screen.getByText('0/3 friends joined')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByDisplayValue(inviteUrl)).toBeInTheDocument();
  });

  it('should reflect partial progress', () => {
    mockReferralCampaign(1);
    renderComponent();

    expect(screen.getByText('1/3 friends joined')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
  });

  it('should support A/B-able reward copy via the reward parameter', () => {
    renderComponent({ parameters: { reward: '3 months' } });

    expect(
      screen.getByText('Invite 3 friends, get 3 months of Plus on us'),
    ).toBeInTheDocument();
  });

  it('should copy the invite link and toast on the primary CTA (desktop)', async () => {
    renderComponent();

    const ctaButton = screen.getByRole('button', { name: 'Copy invite link' });
    expect(ctaButton).toHaveAttribute(
      'data-funnel-track',
      FunnelTargetId.InviteFriends,
    );
    fireEvent.click(ctaButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(inviteUrl);
    });
    expect(mockDisplayToast).toHaveBeenCalled();
    expect(mockOnTransition).not.toHaveBeenCalled();

    // After inviting, the CTA becomes Continue and completes the step.
    const continueButton = await screen.findByRole('button', {
      name: 'Continue',
    });
    fireEvent.click(continueButton);
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: {
        referredUsersCount: 0,
        targetReached: false,
        invited: true,
      },
    });
  });

  it('should open the native share sheet on mobile', async () => {
    (shouldUseNativeShare as jest.Mock).mockReturnValue(true);
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'share', {
      value: mockShare,
      configurable: true,
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Invite friends' }));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        text: expect.stringContaining(inviteUrl),
      });
    });
    expect(mockOnTransition).not.toHaveBeenCalled();
  });

  it('should skip the step without requiring an invite', () => {
    renderComponent();

    const skipButton = screen.getByRole('button', {
      name: "I'll do this later",
    });
    expect(skipButton).toHaveAttribute(
      'data-funnel-track',
      FunnelTargetId.InviteFriendsSkip,
    );
    expect(skipButton).toHaveAttribute('type', 'button');
    fireEvent.click(skipButton);

    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Skip,
      details: {
        referredUsersCount: 0,
        targetReached: false,
        invited: false,
      },
    });
  });

  it('should use the skip copy from the funnel transition when provided', () => {
    renderComponent({
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
        {
          on: FunnelStepTransitionType.Skip,
          destination: COMPLETED_STEP_ID,
          cta: 'Not now',
        },
      ],
    });

    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument();
  });

  it('should tag copy and share groups with funnel target ids', () => {
    renderComponent();

    expect(
      screen.getByRole('group', { name: 'Copy your invite link' }),
    ).toHaveAttribute('data-funnel-track', FunnelTargetId.InviteFriendsCopy);
    expect(
      screen.getByRole('group', { name: 'Invite via social platforms' }),
    ).toHaveAttribute('data-funnel-track', FunnelTargetId.InviteFriendsShare);
  });

  it('should celebrate at target and complete the step from the celebration CTA', () => {
    mockReferralCampaign(3);
    renderComponent();

    expect(
      screen.getByText('3 friends joined. Plus is on us'),
    ).toBeInTheDocument();
    expect(screen.getByText('3/3 friends joined')).toBeInTheDocument();
    // Invite + skip affordances are gone once the target is reached.
    expect(screen.queryByDisplayValue(inviteUrl)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: "I'll do this later" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: {
        referredUsersCount: 3,
        targetReached: true,
        invited: false,
      },
    });
  });

  it('should register itself to be skipped when the flag is off', () => {
    renderComponent({}, { gb: new GrowthBook() });

    expect(mockOnRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.InviteFriends,
      true,
    );
    expect(
      screen.queryByText('Invite 3 friends, get 1 month of Plus on us'),
    ).not.toBeInTheDocument();
  });

  it('should register itself to be skipped for anonymous users', () => {
    renderComponent({}, { auth: { user: undefined } });

    expect(mockOnRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.InviteFriends,
      true,
    );
    expect(
      screen.queryByText('Invite 3 friends, get 1 month of Plus on us'),
    ).not.toBeInTheDocument();
  });

  it('should register itself as not skipped when the flag is on', () => {
    renderComponent();

    expect(mockOnRegisterStepToSkip).toHaveBeenCalledWith(
      FunnelStepType.InviteFriends,
      false,
    );
  });
});
