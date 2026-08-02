import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WatercoolerPostButton } from './WatercoolerPostButton';
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
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

const squadId = 'wc';
const openModal = jest.fn();
const showLogin = jest.fn();
const joinSquad = jest.fn();

const createSquad = (props: Partial<Squad> = {}): Squad =>
  ({
    id: squadId,
    handle: 'watercooler',
    name: 'Watercooler',
    type: SourceType.Squad,
    memberPostingRole: SourceMemberRole.Member,
    ...props,
  } as Squad);

const asMember = (permissions: SourcePermissions[]) =>
  ({
    role: SourceMemberRole.Member,
    permissions,
  } as Squad['currentMember']);

const renderButton = (squad: Squad) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <WatercoolerPostButton squad={squad} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  joinSquad.mockResolvedValue(createSquad());
  (useJoinSquad as jest.Mock).mockReturnValue(joinSquad);
  (useLazyModal as jest.Mock).mockReturnValue({ openModal });
  (useAuthContext as jest.Mock).mockReturnValue({
    user: { id: 'u1', reputation: 300 },
    showLogin,
  });
});

describe('WatercoolerPostButton', () => {
  it('joins the squad silently before opening the composer', async () => {
    renderButton(createSquad({ postingMinReputation: 250 }));

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(openModal).toHaveBeenCalled());
    expect(joinSquad).toHaveBeenCalled();
    expect(gqlClient.request).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: squadId,
        status: ContentPreferenceStatus.Follow,
      }),
    );
    expect(hideSourceFeedPosts).toHaveBeenCalledWith(squadId);
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.SmartComposer,
      props: { initialSquadId: squadId },
    });
  });

  it('does not join again for an existing member', async () => {
    renderButton(
      createSquad({ currentMember: asMember([SourcePermissions.Post]) }),
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(openModal).toHaveBeenCalled());
    expect(joinSquad).not.toHaveBeenCalled();
    expect(hideSourceFeedPosts).not.toHaveBeenCalled();
  });

  it('blocks posting below the reputation threshold', async () => {
    renderButton(createSquad({ postingMinReputation: 500 }));

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(button);

    expect(joinSquad).not.toHaveBeenCalled();
    expect(openModal).not.toHaveBeenCalled();
  });

  it('blocks posting when the squad only lets moderators post', async () => {
    renderButton(
      createSquad({ memberPostingRole: SourceMemberRole.Moderator }),
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(button);

    expect(joinSquad).not.toHaveBeenCalled();
    expect(openModal).not.toHaveBeenCalled();
  });

  it('opens auth for a logged-out visitor', async () => {
    (useAuthContext as jest.Mock).mockReturnValue({ user: null, showLogin });
    renderButton(createSquad({ postingMinReputation: 500 }));

    await userEvent.click(screen.getByRole('button'));

    expect(showLogin).toHaveBeenCalled();
    expect(joinSquad).not.toHaveBeenCalled();
  });
});
