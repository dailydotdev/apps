import { chatMarkdownToHtml } from './chatMarkdown';

describe('chatMarkdownToHtml', () => {
  it('supports the allowed inline markdown subset', () => {
    const html = chatMarkdownToHtml(
      '**bold** *italic* `code` [daily](https://daily.dev) ![gif](https://cdn.daily.dev/a.gif)',
    );

    expect(html).toBe(
      '<p><strong>bold</strong> <em>italic</em> <code>code</code> <a href="https://daily.dev">daily</a> <img src="https://cdn.daily.dev/a.gif" alt="gif" /></p>',
    );
  });

  it('renders headings and lists as plain text instead of block markdown', () => {
    const html = chatMarkdownToHtml('# Heading\n- one\n- two');

    expect(html).toBe('<p># Heading<br>- one<br>- two</p>');
    expect(html).not.toContain('<h1>');
    expect(html).not.toContain('<ul>');
  });

  it('keeps fenced code blocks as plain text', () => {
    const html = chatMarkdownToHtml('```ts\nconst a = 1;\n```');

    expect(html).toBe('<p>```ts<br>const a = 1;<br>```</p>');
    expect(html).not.toContain('<pre>');
  });

  it('converts known mentions into mention anchors', () => {
    const html = chatMarkdownToHtml('hey @alice and @unknown', {
      mentions: [
        {
          id: 'user-1',
          username: 'alice',
          permalink: 'https://daily.dev/alice',
        },
      ],
    });

    expect(html).toContain(
      '<a href="https://daily.dev/alice" data-mention-id="user-1" data-mention-username="alice" translate="no">@alice</a>',
    );
    expect(html).toContain('@unknown');
  });

  it('does not turn mentions inside inline code into anchors', () => {
    const html = chatMarkdownToHtml('`@alice`', {
      mentions: [
        {
          id: 'user-1',
          username: 'alice',
          permalink: 'https://daily.dev/alice',
        },
      ],
    });

    expect(html).toBe('<p><code>@alice</code></p>');
  });

  it('does not nest mention anchors inside markdown links', () => {
    const html = chatMarkdownToHtml('[@alice](https://daily.dev/alice)', {
      mentions: [
        {
          id: 'user-1',
          username: 'alice',
          permalink: 'https://daily.dev/alice',
        },
      ],
    });

    expect(html).toBe('<p><a href="https://daily.dev/alice">@alice</a></p>');
  });
});
