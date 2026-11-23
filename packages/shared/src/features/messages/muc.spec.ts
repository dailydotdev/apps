import { parseRoomMessage, parseRoomPresence, roomNickForUser } from './muc';

const el = (xml: string): Element =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement;

const room = 'c1@conference.chat.daily.local';
const MUC_USER = 'http://jabber.org/protocol/muc#user';
const OCCUPANT = 'urn:xmpp:occupant-id:0';

describe('roomNickForUser', () => {
  it('asks for the encoded user id, then a suffixed one after a conflict', () => {
    expect(roomNickForUser('aB1')).toEqual('a_b1');
    expect(roomNickForUser('aB1', 1)).toMatch(/^a_b1~1[a-z0-9]+$/);
  });
});

describe('parseRoomMessage', () => {
  it('keeps the nick and occupant id of a live message, but no sender', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/a_b1" id="m1"><origin-id xmlns="urn:xmpp:sid:0" id="o1"/><occupant-id xmlns="${OCCUPANT}" id="occ1"/><body>hi</body></message>`,
        ),
      ),
    ).toEqual({
      id: 'o1',
      roomJid: room,
      nick: 'a_b1',
      occupantId: 'occ1',
      realJid: undefined,
      isArchived: false,
      body: 'hi',
      createdAt: expect.any(String),
    });
  });

  // ejabberd passes a client's muc#user element through on live messages.
  it('never reads an item jid on a live message', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/h4_v_l_vhbl"><x xmlns="${MUC_USER}"><item jid="28849d86070e4c099c877ab6837c61f0@chat.daily.local/forged"/></x><occupant-id xmlns="${OCCUPANT}" id="occ2"/><body>forged</body></message>`,
        ),
      ),
    ).toMatchObject({ realJid: undefined, occupantId: 'occ2' });
  });

  it('trusts no item jid on an archived copy that carries more than one', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/h4_v_l_vhbl"><x xmlns="${MUC_USER}"><item jid="28849d86070e4c099c877ab6837c61f0@chat.daily.local/forged"/></x><x xmlns="${MUC_USER}"><item jid="h4_v_l_vhbl@chat.daily.local/r"/></x><body>forged</body></message>`,
        ),
        { isArchived: true },
      ),
    ).toMatchObject({ realJid: undefined, isArchived: true });
  });

  // As ejabberd archives it in a non-anonymous room.
  it('reads the real JID the archive puts on the message', () => {
    expect(
      parseRoomMessage(
        el(
          `<message xmlns="jabber:client" type="groupchat" from="${room}/28849d86070e4c099c877ab6837c61f0" id="spoof-1"><x xmlns="${MUC_USER}"><item jid="h4_v_l_vhbl_wx32_zw_vd_phk_bz@chat.daily.local/res"/></x><body>i am the founder</body></message>`,
        ),
        { stamp: '2026-11-23T08:52:13Z', stanzaId: 's1', isArchived: true },
      ),
    ).toMatchObject({
      id: 'spoof-1',
      realJid: 'h4_v_l_vhbl_wx32_zw_vd_phk_bz@chat.daily.local',
      createdAt: '2026-11-23T08:52:13Z',
    });
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
          `<message xmlns="jabber:client" type="chat" from="bob@chat.daily.local"><body>hi</body></message>`,
        ),
      ),
    ).toBeNull();
  });
});

describe('parseRoomPresence', () => {
  it('reads the viewer joining, with the real JID the room shows', () => {
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me"><occupant-id xmlns="${OCCUPANT}" id="occ1"/><x xmlns="${MUC_USER}"><item affiliation="member" jid="me@chat.daily.local/r1" role="participant"/><status code="100"/><status code="110"/></x></presence>`,
        ),
      ),
    ).toEqual({
      kind: 'occupant',
      roomJid: room,
      nick: 'me',
      occupantId: 'occ1',
      realJid: 'me@chat.daily.local',
      isSelf: true,
    });
  });

  it('reads who is behind another occupant’s nick', () => {
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/28849d86070e4c099c877ab6837c61f0"><occupant-id xmlns="${OCCUPANT}" id="occ2"/><x xmlns="${MUC_USER}"><item affiliation="member" jid="h4_v_l_vhbl_wx32_zw_vd_phk_bz@chat.daily.local/r2" role="participant"/></x></presence>`,
        ),
      ),
    ).toMatchObject({
      kind: 'occupant',
      occupantId: 'occ2',
      realJid: 'h4_v_l_vhbl_wx32_zw_vd_phk_bz@chat.daily.local',
      isSelf: false,
    });
  });

  it('reads a nick conflict and a refused join', () => {
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="error"><error type="cancel"><conflict xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></presence>`,
        ),
      ),
    ).toEqual({ kind: 'joinFailed', roomJid: room, reason: 'conflict' });
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="error"><error type="auth"><registration-required xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></presence>`,
        ),
      ),
    ).toEqual({ kind: 'joinFailed', roomJid: room, reason: 'forbidden' });
  });

  it('reads the viewer leaving and the room ending', () => {
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="unavailable"><x xmlns="${MUC_USER}"><item affiliation="none" role="none"/><status code="321"/><status code="110"/></x></presence>`,
        ),
      ),
    ).toEqual({ kind: 'left', roomJid: room, nick: 'me', isSelf: true });
    expect(
      parseRoomPresence(
        el(
          `<presence xmlns="jabber:client" from="${room}/me" type="unavailable"><x xmlns="${MUC_USER}"><destroy/></x></presence>`,
        ),
      ),
    ).toEqual({ kind: 'ended', roomJid: room });
  });
});
