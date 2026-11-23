import { occupantJid, parseOwnRoomPresence, parseRoomMessage } from './muc';
import { DmMessageStatus } from './types';

const el = (xml: string): Element =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement;

const room = 'c1@conference.chat.daily.dev';

describe('occupantJid', () => {
  it('uses the encoded user id as the nick', () => {
    expect(occupantJid(room, 'aB1')).toEqual(`${room}/a_b1`);
  });
});

describe('parseRoomMessage', () => {
  it('reads a groupchat message with its sender from the nick', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/a_b1" id="m1"><body>hi</body><origin-id xmlns="urn:xmpp:sid:0" id="o1"/></message>`,
        ),
      ),
    ).toMatchObject({
      id: 'o1',
      roomJid: room,
      senderId: 'aB1',
      body: 'hi',
      status: DmMessageStatus.Sent,
    });
  });

  it('takes the archive stamp for a message from the room archive', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob"><body>earlier</body></message>`,
        ),
        { stamp: '2026-11-23T10:00:00Z', stanzaId: 's1' },
      ),
    ).toMatchObject({ id: 's1', createdAt: '2026-11-23T10:00:00Z' });
  });

  it('ignores subjects, chat states and direct messages', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob"><subject>Acme</subject><body>Acme</body></message>`,
        ),
      ),
    ).toBeNull();
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>`,
        ),
      ),
    ).toBeNull();
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="chat" from="bob@chat.daily.dev"><body>hi</body></message>`,
        ),
      ),
    ).toBeNull();
  });
});

describe('parseOwnRoomPresence', () => {
  it('reads the viewer joining a room', () => {
    expect(
      parseOwnRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me"><x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="member" role="participant"/><status code="110"/></x></presence>`,
        ),
      ),
    ).toEqual({ roomJid: room, isJoined: true });
  });

  it('reads a refused join', () => {
    expect(
      parseOwnRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="error"><error type="auth"><registration-required xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></presence>`,
        ),
      ),
    ).toEqual({ roomJid: room, isJoined: false });
  });

  it("ignores other members' presence", () => {
    expect(
      parseOwnRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/bob"><x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="member" role="participant"/></x></presence>`,
        ),
      ),
    ).toBeNull();
  });
});
