import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { ActionType } from '../../graphql/actions';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserQuest } from '../../graphql/quests';
import { QuestStatus, QuestType } from '../../graphql/quests';
import { CREATE_PERSONAL_ACCESS_TOKEN_MUTATION } from '../../graphql/personalAccessTokens';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { BriefContextProvider } from '../../components/cards/brief/BriefContext';
import { IntroQuestChecklistProvider } from './IntroQuestChecklistContext';
import { IntroQuestChecklist } from './IntroQuestChecklist';
import { IntroQuestEventType } from './introQuestSteps';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

const push = jest.fn();
const refetch = jest.fn();

const buildQuest = (
  eventType: string,
  overrides: Partial<UserQuest> = {},
): UserQuest => ({
  userQuestId: `uq-${eventType}`,
  rotationId: `rot-${eventType}`,
  progress: 0,
  status: QuestStatus.InProgress,
  locked: false,
  claimable: false,
  quest: {
    id: `q-${eventType}`,
    name: eventType,
    description: eventType,
    type: QuestType.Intro,
    eventType,
    targetCount: 1,
  },
  rewards: [],
  ...overrides,
});

const mockQuests = (quests: UserQuest[]) =>
  jest.mocked(useQuestDashboard).mockReturnValue({
    data: { intro: quests },
    isPending: false,
    isError: false,
    refetch,
  } as unknown as ReturnType<typeof useQuestDashboard>);

const renderChecklist = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{
        user: {
          ...loggedUser,
          profileCompletion: {
            percentage: 20,
            hasProfileImage: true,
            hasHeadline: false,
            hasExperienceLevel: false,
            hasWork: false,
            hasEducation: false,
          },
        },
      }}
    >
      <BriefContextProvider>
        <IntroQuestChecklistProvider onRequestClose={jest.fn()}>
          <IntroQuestChecklist />
        </IntroQuestChecklistProvider>
      </BriefContextProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockGraphQL(completeActionMock({ action: ActionType.ViewedIntroQuests }));
  jest.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>);
});

describe('IntroQuestChecklist', () => {
  it('opens the missing profile field on the webapp, not a protocol-relative URL', async () => {
    mockQuests([buildQuest(IntroQuestEventType.ProfileComplete)]);
    renderChecklist();

    await userEvent.click(screen.getByRole('button', { name: 'Headline' }));

    expect(push).toHaveBeenCalledWith('/settings/profile?field=bio');
  });

  it('keeps the API key step waiting after the key is created', async () => {
    mockQuests([buildQuest(IntroQuestEventType.ApiTokenCreate)]);
    mockGraphQL({
      request: {
        query: CREATE_PERSONAL_ACCESS_TOKEN_MUTATION,
        variables: { input: { name: 'daily.dev setup', expiresInDays: null } },
      },
      result: {
        data: {
          createPersonalAccessToken: {
            id: 'pat-1',
            name: 'daily.dev setup',
            token: 'dda_1234567890abcd',
            tokenPrefix: 'dda_123',
            createdAt: new Date().toISOString(),
            expiresAt: null,
          },
        },
      },
    });
    renderChecklist();

    await userEvent.click(
      screen.getByRole('button', { name: 'Create API key' }),
    );

    await waitFor(() =>
      expect(screen.getByText('dda_1234567890abcd')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: 'Create API key' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Creating your key' }),
    ).toBeDisabled();
  });

  it('asks to claim the rewards once every step is done', () => {
    mockQuests([
      buildQuest(IntroQuestEventType.ExtensionInstall, {
        status: QuestStatus.Completed,
        claimable: true,
      }),
      buildQuest(IntroQuestEventType.BriefGenerate, {
        status: QuestStatus.Completed,
        claimable: true,
      }),
    ]);
    renderChecklist();

    expect(
      screen.getByRole('heading', { name: 'Claim your rewards' }),
    ).toBeInTheDocument();
  });
});
