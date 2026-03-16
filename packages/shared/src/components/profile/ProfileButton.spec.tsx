import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { waitFor, render, screen, act } from '@testing-library/react';
import ProfileButton from './ProfileButton';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { CoresRole } from '../../lib/user';
import { QuestRewardType } from '../../graphql/quests';
import { QUEST_REWARD_COUNTER_EVENT } from '../../lib/questRewardAnimation';

jest.mock('next/router', () => ({
  useRouter: () => ({
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
    pathname: '/',
    query: {},
  }),
}));

const logout = jest.fn();

const renderComponent = (user = defaultUser): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider
      client={client}
      auth={{
        user,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout,
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
        closeLogin: jest.fn(),
        trackingId: '21',
        loginState: null,
      }}
    >
      <ProfileButton />
    </TestBootProvider>,
  );
};

it('should show settings option that opens modal', async () => {
  renderComponent();

  const profileBtn = await screen.findByRole('button', {
    name: 'Profile settings',
  });
  await act(async () => {
    profileBtn.click();
  });

  const settingsButton = await screen.findByRole('link', {
    name: 'Settings',
  });
  expect(settingsButton).toBeInTheDocument();
});

it('should click the logout button and logout', async () => {
  renderComponent();

  const profileBtn = await screen.findByRole('button', {
    name: 'Profile settings',
  });
  await act(async () => {
    profileBtn.click();
  });

  const logoutBtn = await screen.findByText('Log out');
  logoutBtn.click();

  await waitFor(async () => expect(logout).toBeCalled());
});

it('should increment reward counters and animate impact on each hit', async () => {
  const user = {
    ...defaultUser,
    reputation: 10,
    coresRole: CoresRole.User,
    balance: {
      amount: 100,
    },
  };
  const animateMock = jest.fn();
  const originalAnimate = HTMLElement.prototype.animate;

  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    writable: true,
    value: animateMock,
  });

  try {
    renderComponent(user);

    const claimId = 'claim-1';
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(QUEST_REWARD_COUNTER_EVENT, {
          detail: {
            phase: 'start',
            rewardType: QuestRewardType.Reputation,
            claimId,
            baseValue: 10,
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(QUEST_REWARD_COUNTER_EVENT, {
          detail: {
            phase: 'start',
            rewardType: QuestRewardType.Cores,
            claimId,
            baseValue: 100,
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(QUEST_REWARD_COUNTER_EVENT, {
          detail: {
            phase: 'hit',
            rewardType: QuestRewardType.Reputation,
            claimId,
            delta: 3,
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(QUEST_REWARD_COUNTER_EVENT, {
          detail: {
            phase: 'hit',
            rewardType: QuestRewardType.Cores,
            claimId,
            delta: 5,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(screen.getByText('105')).toBeInTheDocument();
    });

    expect(animateMock).toHaveBeenCalledTimes(2);
  } finally {
    if (originalAnimate) {
      Object.defineProperty(HTMLElement.prototype, 'animate', {
        configurable: true,
        writable: true,
        value: originalAnimate,
      });
    } else {
      delete (
        HTMLElement.prototype as unknown as {
          animate?: (typeof HTMLElement.prototype)['animate'];
        }
      ).animate;
    }
  }
});
