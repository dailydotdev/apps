import { QueryClient } from '@tanstack/react-query';
import {
  dmConversationsQueryKey,
  dmUnreadCountQueryKey,
  dmUnreadCountQueryOptions,
  markDmConversationRead,
  mergeWithLocalMessages,
  upsertConversationMessage,
} from './queries';
import type { DmConversation, DmMessage } from './types';
import { DmMessageStatus } from './types';
import { getDmTransport } from './transport';
import { getDirectMessageUnreadCount } from './graphql';

jest.mock('./transport', () => ({
  ...jest.requireActual('./transport'),
  getDmTransport: jest.fn(),
}));

jest.mock('./graphql', () => ({
  ...jest.requireActual('./graphql'),
  getDirectMessageUnreadCount: jest.fn(),
}));

const message = (id: string, status = DmMessageStatus.Sent): DmMessage => ({
  id,
  peerId: 'peer',
  senderId: 'me',
  body: id,
  createdAt: '2026-10-06T10:00:00Z',
  status,
});

describe('mergeWithLocalMessages', () => {
  it('keeps messages the server never saw after a refetch', () => {
    const merged = mergeWithLocalMessages(
      [message('a'), message('b')],
      [
        message('a'),
        message('pending', DmMessageStatus.Sending),
        message('bounced', DmMessageStatus.Failed),
      ],
    );

    expect(merged.map(({ id }) => id)).toEqual([
      'a',
      'b',
      'pending',
      'bounced',
    ]);
  });

  it('prefers the server copy once it has the message', () => {
    const merged = mergeWithLocalMessages(
      [message('a')],
      [message('a', DmMessageStatus.Sending)],
    );

    expect(merged).toEqual([message('a')]);
  });

  it('drops sent messages the server no longer returns', () => {
    expect(mergeWithLocalMessages([], [message('old')])).toEqual([]);
  });

  it('shows a retried message once when both copies reached the archive', () => {
    expect(
      mergeWithLocalMessages([message('a'), message('a'), message('b')]).map(
        ({ id }) => id,
      ),
    ).toEqual(['a', 'b']);
  });
});

describe('unread bookkeeping', () => {
  const user = { id: 'me' };
  const markRead = jest.fn().mockResolvedValue(undefined);
  let client: QueryClient;

  const conversation = (
    peerId: string,
    unreadCount: number,
  ): DmConversation => ({
    peer: { id: peerId } as DmConversation['peer'],
    lastMessage: { ...message(`last-${peerId}`), peerId },
    unreadCount,
  });
  const incoming = (peerId: string): DmMessage => ({
    ...message(`new-${peerId}`),
    peerId,
    senderId: peerId,
  });
  const unreadCount = () => client.getQueryData(dmUnreadCountQueryKey(user));

  beforeEach(() => {
    markRead.mockClear();
    jest.mocked(getDmTransport).mockReturnValue({
      markRead,
    } as unknown as ReturnType<typeof getDmTransport>);
    client = new QueryClient();
    client.setQueryData(dmConversationsQueryKey(user), [
      conversation('a', 0),
      conversation('b', 2),
    ]);
    client.setQueryData(dmUnreadCountQueryKey(user), 1);
  });

  it('counts a conversation once however many messages arrive', () => {
    upsertConversationMessage(client, user, incoming('a'), {
      isIncoming: true,
    });
    upsertConversationMessage(client, user, incoming('a'), {
      isIncoming: true,
    });
    upsertConversationMessage(client, user, incoming('b'), {
      isIncoming: true,
    });

    expect(unreadCount()).toEqual(2);
  });

  it('does not count the viewer own messages', () => {
    upsertConversationMessage(
      client,
      user,
      { ...message('mine'), peerId: 'a' },
      { isIncoming: false },
    );

    expect(unreadCount()).toEqual(1);
  });

  it('clears the conversation and the count when read', async () => {
    await markDmConversationRead(client, user, 'b');
    await markDmConversationRead(client, user, 'b');

    expect(unreadCount()).toEqual(0);
    expect(
      client
        .getQueryData<DmConversation[]>(dmConversationsQueryKey(user))
        ?.map(({ unreadCount: count }) => count),
    ).toEqual([0, 0]);
    expect(markRead).toHaveBeenCalledWith('b');
  });

  it('counts a new peer once and gives it back when read', async () => {
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });

    expect(unreadCount()).toEqual(2);

    // The refetched inbox can list them before the API counts their message.
    client.setQueryData(dmConversationsQueryKey(user), [
      conversation('new', 0),
      conversation('a', 0),
      conversation('b', 2),
    ]);
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });
    await markDmConversationRead(client, user, 'new');

    expect(unreadCount()).toEqual(1);
  });

  it('gives a new peer back however long they stay unread', async () => {
    jest.useFakeTimers();
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });
    jest.advanceTimersByTime(60 * 60 * 1000);
    await markDmConversationRead(client, user, 'new');
    jest.useRealTimers();

    expect(unreadCount()).toEqual(1);
  });

  it('counts a peer again once read elsewhere and refetched', async () => {
    upsertConversationMessage(client, user, incoming('a'), {
      isIncoming: true,
    });
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });
    jest.mocked(getDirectMessageUnreadCount).mockResolvedValue(0);
    await client.fetchQuery({
      ...dmUnreadCountQueryOptions(user),
      staleTime: 0,
    });
    client.setQueryData(dmConversationsQueryKey(user), [
      conversation('new', 0),
      conversation('a', 0),
    ]);

    upsertConversationMessage(client, user, incoming('a'), {
      isIncoming: true,
    });
    upsertConversationMessage(client, user, incoming('new'), {
      isIncoming: true,
    });

    expect(unreadCount()).toEqual(2);
  });
});
