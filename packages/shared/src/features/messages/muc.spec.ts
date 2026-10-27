import {
  occupantJid,
  parseRoomChatState,
  parseRoomMessage,
  parseRoomOccupant,
  parseRoomPresence,
  parseRoomReaction,
} from './muc';

const el = (xml: string): Element =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement;

const room = 'r1@conference.chat.daily.dev';
const domain = 'chat.daily.dev';

describe('occupantJid', () => {
  it('uses the encoded user id as the nick', () => {
    expect(occupantJid(room, 'aB1')).toEqual(`${room}/a_b1`);
  });
});

describe('parseRoomMessage', () => {
  it('reads a groupchat message by nick, with no sender until presence says', () => {
    const message = parseRoomMessage(
      el(
        `<message xmlns="jabber:client" type="groupchat" from="${room}/a_b1" id="m1"><body>hi</body><origin-id xmlns="urn:xmpp:sid:0" id="o1"/></message>`,
      ),
      domain,
    );
    expect(message).toMatchObject({
      id: 'o1',
      roomJid: room,
      nick: 'a_b1',
      senderId: null,
      body: 'hi',
    });
    expect(message?.isHistory).toBeUndefined();
  });

  it('takes the sender of replayed history from the address the server adds', () => {
    const message = parseRoomMessage(
      el(
        `<message xmlns="jabber:client" type="groupchat" from="${room}/bob" id="m2"><body>earlier</body><delay xmlns="urn:xmpp:delay" stamp="2026-10-26T10:00:00Z"/><addresses xmlns="http://jabber.org/protocol/address"><address type="ofrom" jid="a_b1@${domain}/web"/></addresses></message>`,
      ),
      domain,
    );
    expect(message).toMatchObject({
      nick: 'bob',
      senderId: 'aB1',
      createdAt: '2026-10-26T10:00:00Z',
      isHistory: true,
    });
  });

  it('ignores an address off our own domain', () => {
    const message = parseRoomMessage(
      el(
        `<message xmlns="jabber:client" type="groupchat" from="${room}/bob" id="m3"><body>earlier</body><delay xmlns="urn:xmpp:delay" stamp="2026-10-26T10:00:00Z"/><addresses xmlns="http://jabber.org/protocol/address"><address type="ofrom" jid="admin@evil.example"/></addresses></message>`,
      ),
      domain,
    );
    expect(message?.senderId).toBeNull();
  });

  it('ignores subjects, chat states and direct messages', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}"><subject>Live</subject><body>Live</body></message>`,
        ),
        domain,
      ),
    ).toBeNull();
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>`,
        ),
        domain,
      ),
    ).toBeNull();
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="chat" from="bob@chat.daily.dev"><body>hi</body></message>`,
        ),
        domain,
      ),
    ).toBeNull();
  });
});

describe('parseRoomReaction', () => {
  it("reads a sender's reactions on a room message", () => {
    expect(
      parseRoomReaction(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob" id="r1"><reactions xmlns="urn:xmpp:reactions:0" id="m1"><reaction>👍</reaction><reaction>🔥</reaction></reactions></message>`,
        ),
      ),
    ).toEqual({
      roomJid: room,
      nick: 'bob',
      messageId: 'm1',
      emojis: ['👍', '🔥'],
    });
  });
});

describe('parseRoomChatState', () => {
  it('reads a standalone chat state from an occupant', () => {
    expect(
      parseRoomChatState(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/bob"><composing xmlns="http://jabber.org/protocol/chatstates"/></message>`,
        ),
      ),
    ).toEqual({ roomJid: room, nick: 'bob', state: 'composing' });
  });
});

describe('parseRoomOccupant', () => {
  it('ties a nick to the user behind it, whatever the nick says', () => {
    expect(
      parseRoomOccupant(
        el(
          `<presence xmlns="jabber:client" from="${room}/bob"><x xmlns="http://jabber.org/protocol/muc#user"><item jid="a_b1@${domain}/web" affiliation="none" role="participant"/></x></presence>`,
        ),
        domain,
      ),
    ).toEqual({ roomJid: room, nick: 'bob', userId: 'aB1', isPresent: true });
  });

  it('reports a leave and ignores presence without a real JID', () => {
    expect(
      parseRoomOccupant(
        el(
          `<presence xmlns="jabber:client" from="${room}/bob" type="unavailable"><x xmlns="http://jabber.org/protocol/muc#user"><item jid="bob@${domain}/web" role="none"/></x></presence>`,
        ),
        domain,
      ),
    ).toMatchObject({ nick: 'bob', userId: 'bob', isPresent: false });
    expect(
      parseRoomOccupant(
        el(
          `<presence xmlns="jabber:client" from="${room}/bob"><x xmlns="http://jabber.org/protocol/muc#user"><item role="participant"/></x></presence>`,
        ),
        domain,
      ),
    ).toMatchObject({ nick: 'bob', userId: null });
  });
});

describe('parseRoomPresence', () => {
  const user = (inner: string, attrs = '') =>
    el(
      `<presence xmlns="jabber:client" from="${room}/me" ${attrs}><x xmlns="http://jabber.org/protocol/muc#user">${inner}</x></presence>`,
    );

  it('confirms the join from the self-presence', () => {
    expect(
      parseRoomPresence(
        user(
          '<item affiliation="none" role="participant"/><status code="110"/>',
        ),
      ),
    ).toEqual({ kind: 'joined', roomJid: room });
  });

  it('reports the viewer leaving, kicked or not', () => {
    expect(
      parseRoomPresence(
        user('<status code="110"/><status code="307"/>', 'type="unavailable"'),
      ),
    ).toEqual({ kind: 'left', roomJid: room });
  });

  it('reports the room ending', () => {
    expect(parseRoomPresence(user('<destroy/>', 'type="unavailable"'))).toEqual(
      { kind: 'ended', roomJid: room },
    );
  });

  it('ignores other occupants', () => {
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/bob"><x xmlns="http://jabber.org/protocol/muc#user"><item role="participant"/></x></presence>`,
        ),
      ),
    ).toBeNull();
  });

  it('maps join errors to a reason', () => {
    const error = (child: string) =>
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="error"><error type="auth"><${child} xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></presence>`,
        ),
      );
    expect(error('forbidden')).toEqual({
      kind: 'joinFailed',
      roomJid: room,
      reason: 'banned',
    });
    expect(error('service-unavailable')).toMatchObject({ reason: 'full' });
    expect(error('item-not-found')).toMatchObject({ reason: 'gone' });
  });
});
