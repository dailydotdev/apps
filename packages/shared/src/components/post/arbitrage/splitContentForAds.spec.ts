import { splitContentForAds } from './splitContentForAds';

const para = (chars: number, label: string): string =>
  `<p>${label.repeat(Math.ceil(chars / label.length)).slice(0, chars)}</p>`;

describe('splitContentForAds', () => {
  it('returns short content as a single chunk', () => {
    const html = para(100, 'a');
    expect(splitContentForAds(html, 300)).toEqual([html]);
  });

  it('splits only at top-level block boundaries', () => {
    const first = para(300, 'a');
    const second = para(300, 'b');
    const chunks = splitContentForAds(first + second, 250);

    expect(chunks).toEqual([first, second]);
  });

  it('never cuts inside a nested structure', () => {
    const list = `<ul><li>${'x'.repeat(300)}</li><li>${'y'.repeat(
      300,
    )}</li></ul>`;
    const after = para(300, 'z');
    const chunks = splitContentForAds(list + after, 250);

    // The list crosses the threshold internally but closes as one unit.
    expect(chunks).toEqual([list, after]);
  });

  it('treats code blocks as unsplittable units', () => {
    const code = `<pre><code>${'if (x) {\n}\n'.repeat(40)}</code></pre>`;
    const after = para(300, 'a');
    const chunks = splitContentForAds(code + after, 250);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(code);
  });

  it('does not let void elements corrupt the depth count', () => {
    const withImages = `<p>${'a'.repeat(150)}<img src="x.png"><br>${'b'.repeat(
      150,
    )}</p>`;
    const after = para(300, 'c');

    expect(splitContentForAds(withImages + after, 250)).toEqual([
      withImages,
      after,
    ]);
  });

  it('merges a trailing sliver into the previous chunk', () => {
    const first = para(300, 'a');
    const sliver = para(40, 'b');
    const chunks = splitContentForAds(first + sliver, 250);

    // An ad before one stray line reads as the page ending on an ad.
    expect(chunks).toEqual([first + sliver]);
  });

  it('keeps every byte of the input across the chunks', () => {
    const html =
      `${para(400, 'a')}<blockquote>${'q'.repeat(300)}</blockquote>` +
      `<h2>Heading</h2>${para(400, 'b')}`;
    const chunks = splitContentForAds(html, 250);

    expect(chunks.join('')).toBe(html);
    expect(chunks.length).toBeGreaterThan(1);
  });
});
