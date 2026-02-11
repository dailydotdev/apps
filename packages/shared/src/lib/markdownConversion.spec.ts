import { htmlToMarkdownBasic, markdownToHtmlBasic } from './markdownConversion';

describe('markdownConversion', () => {
  it('should convert markdown heading and inline styles to html', () => {
    const html = markdownToHtmlBasic('# Hello `world` **bold**');

    expect(html).toContain(
      '<h1>Hello <code>world</code> <strong>bold</strong></h1>',
    );
  });

  it('should convert fenced code blocks to html', () => {
    const html = markdownToHtmlBasic('```js\nconst a = 1;\n```');

    expect(html).toContain('<pre><code>const a = 1;</code></pre>');
  });

  it('should convert html heading and list to markdown', () => {
    const markdown = htmlToMarkdownBasic(
      '<h2>Title</h2><ul><li>One</li><li>Two</li></ul>',
    );

    expect(markdown).toBe('## Title\n\n- One\n- Two');
  });

  it('should convert html code block to fenced markdown', () => {
    const markdown = htmlToMarkdownBasic(
      '<pre><code>const a = 1;</code></pre>',
    );

    expect(markdown).toBe('```\nconst a = 1;\n```');
  });

  it('should preserve images while converting html and markdown', () => {
    const html = '<img src="https://cdn.daily.dev/image.png" alt="Preview" />';

    const markdown = htmlToMarkdownBasic(html);

    expect(markdown).toBe('![Preview](https://cdn.daily.dev/image.png)');

    const convertedHtml = markdownToHtmlBasic(markdown);

    expect(convertedHtml).toContain(
      '<img src="https://cdn.daily.dev/image.png" alt="Preview" />',
    );
  });
});
