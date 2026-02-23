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

    expect(convertedHtml).toBe(
      '<img src="https://cdn.daily.dev/image.png" alt="Preview" />',
    );
  });

  it('should keep standalone image in markdown round-trip', () => {
    const initialMarkdown = '![Preview](https://cdn.daily.dev/image.png)';
    const html = markdownToHtmlBasic(initialMarkdown);

    expect(html).toBe(
      '<img src="https://cdn.daily.dev/image.png" alt="Preview" />',
    );

    const markdown = htmlToMarkdownBasic(html);

    expect(markdown).toBe(initialMarkdown);
  });

  it('should handle image between paragraphs', () => {
    const md = 'hello\n\n![img](https://cdn.daily.dev/a.png)\n\nworld';
    const html = markdownToHtmlBasic(md);

    expect(html).toBe(
      '<p>hello</p><img src="https://cdn.daily.dev/a.png" alt="img" /><p>world</p>',
    );
  });

  it('should keep inline image within paragraph', () => {
    const md = 'text ![img](https://cdn.daily.dev/a.png) more';
    const html = markdownToHtmlBasic(md);

    expect(html).toBe(
      '<p>text <img src="https://cdn.daily.dev/a.png" alt="img" /> more</p>',
    );
  });

  it('should not parse underscore characters inside image url attributes', () => {
    const markdown =
      '![Block words feature](https://media.daily.dev/image/upload/s--A9t0KF3Y--/f_auto/v1741689017/ugc/content_b24c703e-ca99-4feb-b19b-349a502afa66)';
    const html = markdownToHtmlBasic(markdown);

    expect(html).toBe(
      '<img src="https://media.daily.dev/image/upload/s--A9t0KF3Y--/f_auto/v1741689017/ugc/content_b24c703e-ca99-4feb-b19b-349a502afa66" alt="Block words feature" />',
    );
    expect(html).not.toContain('<em>');
  });

  it('should preserve bold text across line breaks', () => {
    const markdown = htmlToMarkdownBasic(
      '<p><strong>line1<br>line2</strong></p>',
    );

    expect(markdown).toBe('**line1**\n**line2**');
  });

  it('should preserve italic text across line breaks', () => {
    const markdown = htmlToMarkdownBasic('<p><em>line1<br>line2</em></p>');

    expect(markdown).toBe('_line1_\n_line2_');
  });

  it('should preserve nested formatting across line breaks', () => {
    const markdown = htmlToMarkdownBasic(
      '<p><strong><em>line1<br>line2</em></strong></p>',
    );

    expect(markdown).toBe('**_line1_**\n**_line2_**');
  });

  it('should keep simple bold in markdown round-trip', () => {
    const initialMarkdown = '**bold**';
    const html = markdownToHtmlBasic(initialMarkdown);
    const markdown = htmlToMarkdownBasic(html);

    expect(markdown).toBe(initialMarkdown);
  });

  it('should keep standard paragraph spacing in markdown round-trip', () => {
    const initialMarkdown = 'first paragraph\n\nsecond paragraph';
    const html = markdownToHtmlBasic(initialMarkdown);
    const markdown = htmlToMarkdownBasic(html);

    expect(markdown).toBe(initialMarkdown);
  });

  it('should preserve extra blank lines in markdown round-trip', () => {
    const initialMarkdown = 'first paragraph\n\n\nsecond paragraph';
    const html = markdownToHtmlBasic(initialMarkdown);
    const markdown = htmlToMarkdownBasic(html);

    expect(markdown).toBe(initialMarkdown);
  });

  it('should convert empty paragraphs into preserved blank lines', () => {
    const markdown = htmlToMarkdownBasic('<p>first</p><p></p><p>second</p>');

    expect(markdown).toBe('first\n\n\nsecond');
  });

  it('should trim leading and trailing whitespace around converted markdown', () => {
    const markdown = htmlToMarkdownBasic('  <p>first</p><p>second</p>  ');

    expect(markdown).toBe('first\n\nsecond');
  });

  it('should keep paragraph text that matches internal marker-like content', () => {
    const markdown = htmlToMarkdownBasic(
      '<p>__EMPTY_PARAGRAPH__</p><p>next</p>',
    );

    expect(markdown).toBe('__EMPTY_PARAGRAPH__\n\nnext');
  });
});
