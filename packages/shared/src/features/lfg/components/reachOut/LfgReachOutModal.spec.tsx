import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LfgReachOutModal } from './LfgReachOutModal';
import { useAuthContext } from '../../../../contexts/AuthContext';
import {
  getLfgPerson,
  getLfgReachOutsLeft,
  getLfgStreak,
  sendLfgReachOut,
} from '../../graphql';
import type { LfgPost } from '../../types';
import {
  LfgAskType,
  LfgCommitment,
  LfgKind,
  LfgPostStatus,
  LfgReachOutStatus,
} from '../../types';
import { Origin } from '../../../../lib/log';

const mockDisplayToast = jest.fn();

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../graphql', () => ({
  ...jest.requireActual('../../graphql'),
  getLfgPerson: jest.fn(),
  getLfgReachOutsLeft: jest.fn(),
  getLfgStreak: jest.fn(),
  sendLfgReachOut: jest.fn(),
}));
jest.mock('../../../messages/hooks/useDmSettings', () => ({
  useDmSettings: () => ({ allowsMessages: true }),
}));
jest.mock('../../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));
// The nudges link out to other flows and have nothing to do with sending.
jest.mock('./LfgStandOut', () => ({ LfgStandOut: () => null }));

const person = {
  id: 'me',
  name: 'Ada Lovelace',
  username: 'ada',
  image: '',
  permalink: '',
  reputation: 120,
  createdAt: '2024-01-01T00:00:00Z',
  verifiedGithub: 'ada',
};

const post: LfgPost = {
  id: 'post-1',
  author: { ...person, id: 'author', name: 'Grace Hopper' },
  kind: LfgKind.Build,
  commitment: LfgCommitment.FewWeeks,
  showCountry: false,
  country: null,
  utcOffset: 2,
  title: 'Teammate for a query-plan visualizer',
  body: 'The parser is done; I need someone who loves charts.',
  tags: ['postgresql'],
  asks: [
    { id: 'shipped', label: 'A project you shipped', type: LfgAskType.Link },
    {
      id: 'hours',
      label: 'Hours per week you can commit',
      type: LfgAskType.Text,
    },
  ],
  status: LfgPostStatus.Open,
  isPaused: false,
  pendingCount: null,
  acceptedCount: null,
  createdAt: '2026-10-14T10:00:00Z',
  updatedAt: '2026-10-14T10:00:00Z',
  expiresAt: '2026-11-13T10:00:00Z',
  myReachOut: null,
};

const renderModal = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <LfgReachOutModal
        isOpen
        onRequestClose={jest.fn()}
        post={post}
        origin={Origin.LfgBoard}
      />
    </QueryClientProvider>,
  );

// The fields' labels float over them without a `for`, so they go by name.
const type = (name: string, value: string) => {
  const field = document.querySelector(`[name="${name}"]`);

  if (!field) {
    throw new Error(`No field named ${name}`);
  }

  fireEvent.input(field, { target: { value } });
};

const findSendButton = async (): Promise<HTMLButtonElement> =>
  (await screen.findByText('Send request')).closest(
    'button',
  ) as HTMLButtonElement;

beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '<div id="__next"></div>';
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as ReturnType<typeof useAuthContext>);
  jest.mocked(getLfgPerson).mockResolvedValue(person);
  jest.mocked(getLfgStreak).mockResolvedValue(null);
  jest.mocked(getLfgReachOutsLeft).mockResolvedValue(3);
  jest.mocked(sendLfgReachOut).mockResolvedValue({
    id: 'reach-out-1',
    status: LfgReachOutStatus.Pending,
    createdAt: '2026-10-15T10:00:00Z',
  });
});

describe('LfgReachOutModal', () => {
  it("sends the pitch with an answer to each of the post's asks", async () => {
    renderModal();
    const send = await findSendButton();

    type('pitch', 'I built the flame graph in a Postgres report UI.');
    expect(send).toBeDisabled();

    type('shipped', 'https://github.com/ada/plans');
    type('hours', 'About 6');

    expect(
      await screen.findByText('Verified: a repo on your connected GitHub'),
    ).toBeInTheDocument();
    await waitFor(() => expect(send).toBeEnabled());

    fireEvent.click(send);

    await waitFor(() =>
      expect(sendLfgReachOut).toHaveBeenCalledWith({
        postId: 'post-1',
        pitch: 'I built the flame graph in a Postgres report UI.',
        answers: [
          { askId: 'shipped', value: 'https://github.com/ada/plans' },
          { askId: 'hours', value: 'About 6' },
        ],
      }),
    );
  });

  it("won't send a link ask that holds something other than a link", async () => {
    renderModal();
    const send = await findSendButton();

    type('pitch', 'Happy to help with the charts.');
    type('shipped', 'my dashboard');
    type('hours', 'About 6');

    expect(send).toBeDisabled();
  });

  it("explains why there's nothing to send once today's reach-outs are used", async () => {
    jest.mocked(getLfgReachOutsLeft).mockResolvedValue(0);
    renderModal();

    expect(
      await screen.findByText(/used today's 5 reach-outs/),
    ).toBeInTheDocument();
    type('pitch', 'Happy to help with the charts.');
    type('shipped', 'https://github.com/ada/plans');
    type('hours', 'About 6');

    expect(await findSendButton()).toBeDisabled();
  });
});
