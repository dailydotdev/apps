import type { Post } from '../../graphql/posts';
import type { AgentBlock, AgentMessage } from './chat';
import {
  messageAsHtml,
  messageAsMarkdown,
  messageAsText,
  messageParagraphs,
} from './replyText';

const post = (title: string, permalink: string): Post =>
  ({ id: title, title, commentsPermalink: permalink } as Post);

const reply = (...blocks: AgentBlock[]): AgentMessage => ({
  id: 'm1',
  role: 'agent',
  at: new Date(0).toISOString(),
  blocks,
});

const zig = post('Zig 0.15', 'https://app.daily.dev/posts/p1');
const ghostty = post(
  'Ghostty is open source',
  'https://app.daily.dev/posts/p2',
);

/**
 * A block's own `textContent` runs its paragraphs together: "…clears your bar."
 * and "First pass over…" arrive as one sentence with no space in the middle.
 * Splitting per block-level element is the whole reason this exists.
 */
describe('messageParagraphs', () => {
  it('gives one entry per paragraph rather than one run-on sentence', () => {
    expect(
      messageParagraphs(
        reply({
          type: 'text',
          html: '<p>Spawned. I only ping you when something clears your bar.</p><p>First pass over daily.dev turned up one thing.</p>',
        }),
      ),
    ).toEqual([
      'Spawned. I only ping you when something clears your bar.',
      'First pass over daily.dev turned up one thing.',
    ]);
  });

  it('keeps a heading as its own entry, not glued to the paragraph under it', () => {
    expect(
      messageParagraphs(
        reply({
          type: 'text',
          html: '<h3>Zig this week</h3><p>The one thing to read.</p>',
        }),
      ),
    ).toEqual(['Zig this week', 'The one thing to read.']);
  });

  it('reads nested markup as the text it renders as', () => {
    expect(
      messageParagraphs(
        reply({
          type: 'text',
          html: '<p>Scanned <strong>128</strong> posts, kept <em>6</em>.</p>',
        }),
      ),
    ).toEqual(['Scanned 128 posts, kept 6.']);
  });

  it('drops the citations: what the agent said, none of what it cited', () => {
    expect(
      messageParagraphs(
        reply(
          { type: 'text', html: '<p>Two survived.</p>' },
          { type: 'picks', posts: [zig, ghostty] },
          { type: 'feedLink', label: 'Open all 9', posts: [zig] },
        ),
      ),
    ).toEqual(['Two survived.']);
  });

  it('has nothing to say about an empty paragraph or a blockless message', () => {
    expect(
      messageParagraphs(
        reply({ type: 'text', html: '<p>Kept 6.</p><p>  </p>' }),
      ),
    ).toEqual(['Kept 6.']);
    expect(messageParagraphs({ id: 'm', role: 'agent', at: '' })).toEqual([]);
  });
});

describe('messageAsText', () => {
  it('keeps the paragraph gap, so the quote reads as prose', () => {
    expect(
      messageAsText(
        reply({ type: 'text', html: '<p>First.</p><p>Second.</p>' }),
      ),
    ).toBe('First.\n\nSecond.');
  });
});

/**
 * What goes on the clipboard. A reply's whole value is the handful of posts it
 * picked out, and stripping to flat text left someone pasting a paragraph about
 * five articles with no way to reach any of them.
 */
describe('messageAsMarkdown', () => {
  it('carries every citation as a link under its caption', () => {
    expect(
      messageAsMarkdown(
        reply(
          { type: 'text', html: '<p>Daily run — kept 2.</p>' },
          { type: 'picks', caption: 'Runners-up:', posts: [zig, ghostty] },
        ),
      ),
    ).toBe(
      'Daily run — kept 2.\n\nRunners-up:\n- [Zig 0.15](https://app.daily.dev/posts/p1)\n- [Ghostty is open source](https://app.daily.dev/posts/p2)',
    );
  });

  it('labels a feed link with what the feed is', () => {
    expect(
      messageAsMarkdown(
        reply({ type: 'feedLink', label: 'Open all 9 findings', posts: [zig] }),
      ),
    ).toBe('Open all 9 findings\n- [Zig 0.15](https://app.daily.dev/posts/p1)');
  });

  it('pastes text, not HTML', () => {
    const text = messageAsMarkdown(
      reply({
        type: 'text',
        html: '<p>Scanned <strong>128</strong> posts.</p>',
      }),
    );

    expect(text).toBe('Scanned 128 posts.');
    expect(text).not.toContain('<');
  });

  it('leaves a captionless citation block as just its links', () => {
    expect(messageAsMarkdown(reply({ type: 'posts', posts: [zig] }))).toBe(
      '- [Zig 0.15](https://app.daily.dev/posts/p1)',
    );
  });

  // A block's own `textContent` fuses its paragraphs: "…clears your bar.First
  // pass over…". `mockConversation`'s opening reply has exactly this shape, so
  // every copy of it went out mangled.
  it('separates the paragraphs it flattens', () => {
    expect(
      messageAsMarkdown(
        reply({
          type: 'text',
          html: '<p>Spawned. Only when something clears your bar.</p><p>First pass over daily.dev turned up one thing.</p>',
        }),
      ),
    ).toBe(
      'Spawned. Only when something clears your bar.\n\nFirst pass over daily.dev turned up one thing.',
    );
  });
});

/**
 * The reply as its own small document, for the share sheet's preview and for the
 * picture taken of it.
 */
describe('messageAsHtml', () => {
  it('passes the agent’s prose through as the markup it already is', () => {
    expect(
      messageAsHtml(reply({ type: 'text', html: '<p>Kept <b>6</b>.</p>' })),
    ).toBe('<p>Kept <b>6</b>.</p>');
  });

  it('turns citations into a plain list of links rather than nine cards', () => {
    expect(
      messageAsHtml(
        reply({ type: 'picks', caption: 'The two:', posts: [zig, ghostty] }),
      ),
    ).toBe(
      '<p>The two:</p><ul>' +
        '<li><a href="https://app.daily.dev/posts/p1">Zig 0.15</a></li>' +
        '<li><a href="https://app.daily.dev/posts/p2">Ghostty is open source</a></li>' +
        '</ul>',
    );
  });

  it('uses a feed block’s label where a caption would go', () => {
    expect(
      messageAsHtml(
        reply({ type: 'feedLink', label: 'Open all 9', posts: [zig] }),
      ),
    ).toContain('<p>Open all 9</p>');
  });

  it('writes no empty caption paragraph when there is no caption', () => {
    expect(messageAsHtml(reply({ type: 'posts', posts: [zig] }))).toBe(
      '<ul><li><a href="https://app.daily.dev/posts/p1">Zig 0.15</a></li></ul>',
    );
  });

  // A permalink is interpolated straight into an attribute, so a quote or an
  // ampersand in it would otherwise end the attribute early and take the rest
  // of the card's markup with it.
  it('cannot have its href broken by a quote or an ampersand in the link', () => {
    const html = messageAsHtml(
      reply({
        type: 'posts',
        posts: [post('Tricky', 'https://app.daily.dev/p?a=1&b="x"')],
      }),
    );

    expect(html).toContain(
      'href="https://app.daily.dev/p?a=1&amp;b=&quot;x&quot;"',
    );
    // Parsed back, the link is still the one link it was meant to be.
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const links = body.querySelectorAll('a');

    expect(links).toHaveLength(1);
    // `getAttribute`, because jest-dom refuses an element from a parsed
    // document: it has no window to check the element's type against.
    // eslint-disable-next-line jest-dom/prefer-to-have-attribute
    expect(links[0].getAttribute('href')).toBe(
      'https://app.daily.dev/p?a=1&b="x"',
    );
  });

  // A title carrying markup would otherwise be interpolated raw, so `<` opens a
  // tag and the rest of the card's structure shifts with it. Titles come from
  // the API, not from this file.
  it('cannot have its markup broken by a title carrying angle brackets', () => {
    const html = messageAsHtml(
      reply({
        type: 'posts',
        posts: [post('Why <script> tags are 5 & 6', 'https://a.dev/p')],
      }),
    );
    const { body } = new DOMParser().parseFromString(html, 'text/html');

    expect(body.querySelectorAll('a')).toHaveLength(1);
    expect(body.querySelector('a')?.textContent).toBe(
      'Why <script> tags are 5 & 6',
    );
  });
});
