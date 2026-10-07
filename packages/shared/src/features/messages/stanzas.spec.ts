import type { DmMessage } from './types';
import { DmMessageStatus } from './types';
import {
  applyReaction,
  decodeJidLocal,
  encodeJidLocal,
  jidForUser,
  parseChatMessage,
  parseMamResult,
  parseReaction,
  sanitizeReactionEmojis,
  unwrapCarbon,
  userIdFromJid,
} from './stanzas';

const own = 'me@chat.daily.dev';

const xml = (source: string): Element =>
  new DOMParser().parseFromString(source, 'text/xml').documentElement;

describe('parseChatMessage', () => {
  it('reads an incoming message as coming from the peer', () => {
    const message = parseChatMessage(
      xml(`<message xmlns="jabber:client" type="chat" id="abc"
        from="peer@chat.daily.dev/web" to="${own}/web">
        <body>hey there</body>
        <delay xmlns="urn:xmpp:delay" stamp="2026-10-06T10:00:00Z"/>
      </message>`),
      { ownBareJid: own },
    );

    expect(message).toMatchObject({
      id: 'abc',
      peerId: 'peer',
      senderId: 'peer',
      body: 'hey there',
      createdAt: '2026-10-06T10:00:00Z',
    });
  });

  it('keys our own messages by origin id so the archive copy matches the optimistic one', () => {
    const message = parseChatMessage(
      xml(`<message xmlns="jabber:client" type="chat" to="peer@chat.daily.dev">
        <body>mine</body>
        <origin-id xmlns="urn:xmpp:sid:0" id="dm-1"/>
        <stanza-id xmlns="urn:xmpp:sid:0" by="${own}" id="server-9"/>
      </message>`),
      { ownBareJid: own, stanzaId: 'server-9' },
    );

    expect(message).toMatchObject({
      id: 'dm-1',
      peerId: 'peer',
      senderId: 'me',
    });
  });

  it('carries a comment reference', () => {
    const message = parseChatMessage(
      xml(`<message xmlns="jabber:client" type="chat" from="peer@chat.daily.dev">
        <body>about your comment</body>
        <comment-ref xmlns="urn:daily:chat:comment-ref:0" id="c1" author-id="me"
          url="https://app.daily.dev/posts/p#c-c1">
          <title>Why Rust</title>
          <snippet>Borrow checker all the way</snippet>
        </comment-ref>
      </message>`),
      { ownBareJid: own },
    );

    expect(message?.context).toEqual({
      type: 'comment',
      commentId: 'c1',
      authorId: 'me',
      permalink: 'https://app.daily.dev/posts/p#c-c1',
      postTitle: 'Why Rust',
      snippet: 'Borrow checker all the way',
    });
  });

  it('ignores errors and messages without a body', () => {
    expect(
      parseChatMessage(
        xml(`<message xmlns="jabber:client" type="error" from="peer@chat.daily.dev">
          <body>bounced</body>
        </message>`),
        { ownBareJid: own },
      ),
    ).toBeNull();
    expect(
      parseChatMessage(
        xml(
          `<message xmlns="jabber:client" type="chat" from="peer@chat.daily.dev"/>`,
        ),
        { ownBareJid: own },
      ),
    ).toBeNull();
  });
});

describe('unwrapCarbon', () => {
  const carbon = (from: string) =>
    xml(`<message xmlns="jabber:client" from="${from}" to="${own}/web">
      <sent xmlns="urn:xmpp:carbons:2">
        <forwarded xmlns="urn:xmpp:forward:0">
          <message xmlns="jabber:client" type="chat" to="peer@chat.daily.dev">
            <body>from my other tab</body>
          </message>
        </forwarded>
      </sent>
    </message>`);

  it('unwraps a carbon sent by our own account', () => {
    const inner = unwrapCarbon(carbon(own), own);

    expect(inner && parseChatMessage(inner, { ownBareJid: own })).toMatchObject(
      { peerId: 'peer', senderId: 'me', body: 'from my other tab' },
    );
  });

  it('rejects a carbon forged by someone else', () => {
    expect(unwrapCarbon(carbon('mallory@chat.daily.dev'), own)).toBeNull();
  });

  it('leaves regular messages alone', () => {
    expect(
      unwrapCarbon(
        xml(
          `<message xmlns="jabber:client" from="peer@chat.daily.dev"><body>hi</body></message>`,
        ),
        own,
      ),
    ).toBeUndefined();
  });
});

describe('parseMamResult', () => {
  const result = xml(`<message xmlns="jabber:client" to="${own}/web">
    <result xmlns="urn:xmpp:mam:2" queryid="q1" id="server-1">
      <forwarded xmlns="urn:xmpp:forward:0">
        <delay xmlns="urn:xmpp:delay" stamp="2026-10-06T09:00:00Z"/>
        <message xmlns="jabber:client" type="chat" from="peer@chat.daily.dev">
          <body>archived</body>
        </message>
      </forwarded>
    </result>
  </message>`);

  it('reads results for its own query', () => {
    expect(parseMamResult(result, 'q1', own)).toMatchObject({
      stanzaId: 'server-1',
      stamp: '2026-10-06T09:00:00Z',
    });
  });

  it('skips results belonging to another query', () => {
    expect(parseMamResult(result, 'q2', own)).toBeNull();
  });

  it('rejects results that do not come from our own archive', () => {
    const forged =
      xml(`<message xmlns="jabber:client" from="mallory@chat.daily.dev" to="${own}/web">
      <result xmlns="urn:xmpp:mam:2" queryid="q1" id="server-1">
        <forwarded xmlns="urn:xmpp:forward:0">
          <message xmlns="jabber:client" type="chat" from="peer@chat.daily.dev">
            <body>forged</body>
          </message>
        </forwarded>
      </result>
    </message>`);

    expect(parseMamResult(forged, 'q1', own)).toBeNull();
  });
});

describe('sender domain', () => {
  it('drops messages from another chat domain', () => {
    expect(
      parseChatMessage(
        xml(`<message xmlns="jabber:client" type="chat" from="1@other.example/web">
          <body>impersonating user 1</body>
        </message>`),
        { ownBareJid: own },
      ),
    ).toBeNull();
  });
});

describe('JID encoding', () => {
  it('round-trips mixed-case user ids through a case-folded local part', () => {
    const jid = jidForUser('aB1cDe', 'chat.daily.dev');

    expect(jid).toBe('a_b1c_de@chat.daily.dev');
    expect(userIdFromJid(`${jid.toUpperCase()}/web`)).toBe('aB1cDe');
  });

  it('keeps ids that differ only by case on separate accounts', () => {
    expect(encodeJidLocal('aB')).not.toBe(encodeJidLocal('ab'));
    expect(decodeJidLocal(encodeJidLocal('ab'))).toBe('ab');
  });

  it('decodes the sender of a mixed-case incoming message', () => {
    const message = parseChatMessage(
      xml(`<message xmlns="jabber:client" type="chat" from="x_yz@chat.daily.dev/web">
        <body>hi</body>
      </message>`),
      { ownBareJid: own },
    );

    expect(message).toMatchObject({ peerId: 'xYz', senderId: 'xYz' });
  });
});

describe('reactions', () => {
  const reactionTo = (messageId: string, emojis: string[], from: string) =>
    xml(`<message xmlns="jabber:client" type="chat" from="${from}">
      <reactions xmlns="urn:xmpp:reactions:0" id="${messageId}">
        ${emojis.map((emoji) => `<reaction>${emoji}</reaction>`).join('')}
      </reactions>
      <store xmlns="urn:xmpp:hints"/>
    </message>`);

  const message: DmMessage = {
    id: 'dm-1',
    peerId: 'peer',
    senderId: 'me',
    body: 'hello',
    createdAt: '2026-10-07T10:00:00Z',
    status: DmMessageStatus.Sent,
  };

  it('reads the full set of emojis a peer reacted with', () => {
    expect(
      parseReaction(
        reactionTo('dm-1', ['👍', '❤️'], 'peer@chat.daily.dev/web'),
        own,
      ),
    ).toEqual({
      peerId: 'peer',
      senderId: 'peer',
      messageId: 'dm-1',
      emojis: ['👍', '❤️'],
    });
  });

  it('is not mistaken for a message', () => {
    expect(
      parseChatMessage(reactionTo('dm-1', ['👍'], 'peer@chat.daily.dev'), {
        ownBareJid: own,
      }),
    ).toBeNull();
  });

  it('drops anything that is not a short emoji', () => {
    expect(
      sanitizeReactionEmojis(['👍', 'lol', '<b>', '1', '👍', '👨‍👩‍👧‍👦', '1️⃣']),
    ).toEqual(['👍', '👨‍👩‍👧‍👦', '1️⃣']);
  });

  it('ignores reactions from another domain', () => {
    expect(
      parseReaction(reactionTo('dm-1', ['👍'], 'peer@evil.example'), own),
    ).toBeNull();
  });

  it('replaces the sender set and leaves the other user alone', () => {
    const reacted = applyReaction([message], {
      peerId: 'peer',
      senderId: 'peer',
      messageId: 'dm-1',
      emojis: ['👍', '🔥'],
    });
    const changed = applyReaction(
      applyReaction(reacted, {
        peerId: 'peer',
        senderId: 'me',
        messageId: 'dm-1',
        emojis: ['👍'],
      }),
      { peerId: 'peer', senderId: 'peer', messageId: 'dm-1', emojis: ['🔥'] },
    );

    expect(changed[0].reactions).toEqual({ '👍': ['me'], '🔥': ['peer'] });
    expect(
      applyReaction(changed, {
        peerId: 'peer',
        senderId: 'me',
        messageId: 'dm-1',
        emojis: [],
      })[0].reactions,
    ).toEqual({ '🔥': ['peer'] });
  });
});
