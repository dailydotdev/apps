import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WatercoolerComposer } from './WatercoolerComposer';
import type { Squad } from '../../../graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '../../../graphql/sources';
import { LazyModal } from '../../../components/modals/common/types';
import { ContentPreferenceStatus } from '../../../graphql/contentPreference';
import { gqlClient } from '../../../graphql/common';
import { hideSourceFeedPosts } from '../../../graphql/notifications';
import { useJoinSquad } from '../../../hooks/useJoinSquad';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { usePostToSquad } from '../../../hooks/squads/usePostToSquad';
import { useAuthContext } from '../../../contexts/AuthContext';

jest.mock('../../../graphql/common', () => ({
  gqlClient: { request: jest.fn() },
}));
jest.mock('../../../graphql/notifications', () => ({
  hideSourceFeedPosts: jest.fn(),
}));
jest.mock('../../../hooks/useJoinSquad', () => ({
  useJoinSquad: jest.fn(),
}));
jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));
jest.mock('../../../hooks/squads/usePostToSquad', () => ({
  usePostToSquad: jest.fn(),
}));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));
// The rich-text body editor pulls in the whole editor stack; the composer only
// needs the title + cover + toolbar around it.
jest.mock('../../../components/post/composer/TextForm', () => ({
  TextForm: ({
    value,
    onChange,
    toolbarRightActions,
  }: {
    value: { title: string };
    onChange: (next: { title: string }) => void;
    toolbarRightActions: React.ReactNode;
  }) => (
    <div>
      <input
        aria-label="Post title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      {toolbarRightActions}
    </div>
  ),
}));

const squadId = 'wc';
const openModal = jest.fn();
const showLogin = jest.fn();
const joinSquad = jest.fn();
const onSubmitFreeformPost = jest.fn();

const createSquad = (props: Partial<Squad> = {}): Squad =>
  ({
    id: squadId,
    handle: 'watercooler',
    name: 'Watercooler',
    type: SourceType.Squad,
    postingMinReputation: 100,
    ...props,
  } as Squad);

const renderComposer = (squad: Squad) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <WatercoolerComposer squad={squad} />
    </QueryClientProvider>,
  );

const openInlineComposer = async () => {
  await userEvent.click(screen.getByRole('button'));
  return waitFor(() => screen.getByLabelText('Post title'));
};

beforeEach(() => {
  jest.clearAllMocks();
  joinSquad.mockResolvedValue(createSquad());
  (useJoinSquad as jest.Mock).mockReturnValue(joinSquad);
  (useLazyModal as jest.Mock).mockReturnValue({ openModal });
  // Mirrors the real hook: `onComplete` fires on both the direct and the
  // moderated path, and is what collapses the composer.
  (usePostToSquad as jest.Mock).mockImplementation(({ onComplete }) => ({
    onSubmitFreeformPost: async (...args: unknown[]) => {
      onSubmitFreeformPost(...args);
      onComplete?.();
    },
    isPosting: false,
  }));
  (useAuthContext as jest.Mock).mockReturnValue({
    user: { id: 'u1', reputation: 300, image: 'https://daily.dev/a.jpg' },
    showLogin,
  });
});

describe('WatercoolerComposer', () => {
  it('does not join just because the composer was opened', async () => {
    renderComposer(createSquad());

    await openInlineComposer();

    expect(joinSquad).not.toHaveBeenCalled();
    expect(hideSourceFeedPosts).not.toHaveBeenCalled();
  });

  it('joins the squad silently when a non-member actually posts', async () => {
    renderComposer(createSquad());

    await openInlineComposer();
    await userEvent.type(screen.getByLabelText('Post title'), 'Coffee?');
    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(joinSquad).toHaveBeenCalled());
    expect(gqlClient.request).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: squadId,
        status: ContentPreferenceStatus.Follow,
      }),
    );
    expect(hideSourceFeedPosts).toHaveBeenCalledWith(squadId);
    expect(onSubmitFreeformPost).toHaveBeenCalled();
  });

  it('joins once across repeated posts', async () => {
    renderComposer(createSquad());

    await openInlineComposer();
    await userEvent.type(screen.getByLabelText('Post title'), 'One');
    await userEvent.click(screen.getByRole('button', { name: 'Post' }));
    await waitFor(() => expect(joinSquad).toHaveBeenCalledTimes(1));

    await openInlineComposer();
    await userEvent.type(screen.getByLabelText('Post title'), 'Two');
    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSubmitFreeformPost).toHaveBeenCalledTimes(2));
    expect(joinSquad).toHaveBeenCalledTimes(1);
  });

  it('posts the title straight to the squad', async () => {
    renderComposer(
      createSquad({
        currentMember: {
          role: SourceMemberRole.Member,
          permissions: [SourcePermissions.Post],
        } as Squad['currentMember'],
      }),
    );

    await openInlineComposer();
    await userEvent.type(screen.getByLabelText('Post title'), 'Coffee?');
    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSubmitFreeformPost).toHaveBeenCalled());
    expect(onSubmitFreeformPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Coffee?' }),
      expect.objectContaining({ id: squadId }),
    );
    expect(joinSquad).not.toHaveBeenCalled();
  });

  it('hands the draft to the full composer', async () => {
    renderComposer(createSquad());

    await openInlineComposer();
    await userEvent.type(screen.getByLabelText('Post title'), 'Coffee?');
    await userEvent.click(
      screen.getByRole('button', { name: 'Open full composer' }),
    );

    await waitFor(() => expect(openModal).toHaveBeenCalled());
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.SmartComposer,
      props: expect.objectContaining({
        initialSquadId: squadId,
        initialTitle: 'Coffee?',
      }),
    });
  });

  it('blocks below the reputation threshold', async () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      user: { id: 'u1', reputation: 10 },
      showLogin,
    });
    renderComposer(createSquad());

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(trigger);

    expect(joinSquad).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Post title')).not.toBeInTheDocument();
  });

  it('opens auth for a logged-out visitor', async () => {
    (useAuthContext as jest.Mock).mockReturnValue({ user: null, showLogin });
    renderComposer(createSquad());

    await userEvent.click(screen.getByRole('button'));

    expect(showLogin).toHaveBeenCalled();
    expect(screen.queryByLabelText('Post title')).not.toBeInTheDocument();
  });
});
