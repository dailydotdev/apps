import {
  getGroupSender,
  getSupportChatId,
  supportChatToPeer,
  toSupportPeerId,
} from './support';
import { getMessagesUrl } from './urls';

describe('support chat peers', () => {
  it('round-trips the chat id and leaves user ids alone', () => {
    expect(getSupportChatId(toSupportPeerId('c1'))).toEqual('c1');
    expect(getSupportChatId('user1')).toBeUndefined();
  });

  it('links to the support route', () => {
    expect(getMessagesUrl(toSupportPeerId('c1'))).toMatch(
      /\/messages\/support\/c1$/,
    );
    expect(getMessagesUrl('user1')).toMatch(/\/messages\/user1$/);
  });

  it('turns a chat into a group peer named after the page', () => {
    expect(
      supportChatToPeer({
        id: 'c1',
        jid: 'c1@conference.chat.daily.dev',
        unreadCount: 0,
        lastMessageAt: null,
        createdAt: '2026-11-23T10:00:00Z',
        source: {
          id: 's1',
          name: 'Acme',
          handle: 'acme',
          image: 'acme.png',
          permalink: 'https://app.daily.dev/squads/acme',
        },
        members: [
          {
            id: 'u1',
            name: 'Ada',
            username: 'ada',
            image: 'ada.png',
            permalink: 'https://app.daily.dev/ada',
          },
        ],
      }),
    ).toMatchObject({
      id: 'support:c1',
      name: 'Acme',
      username: 'acme',
      group: {
        chatId: 'c1',
        roomJid: 'c1@conference.chat.daily.dev',
        members: [{ id: 'u1', username: 'ada' }],
      },
    });
  });
});

describe('getGroupSender', () => {
  const group = {
    chatId: 'c1',
    roomJid: null,
    lastMessageAt: null,
    members: [
      { id: 'u1', name: 'Ada', username: 'ada', image: '', permalink: '' },
    ],
  };

  it('names members, former members and senders nobody vouched for', () => {
    expect(getGroupSender(group, 'u1')).toMatchObject({ name: 'Ada' });
    expect(getGroupSender(group, 'u2')).toEqual({
      id: 'u2',
      name: 'Former member',
    });
    expect(getGroupSender(group, '')).toEqual({
      id: '',
      name: 'Unknown sender',
    });
  });
});
