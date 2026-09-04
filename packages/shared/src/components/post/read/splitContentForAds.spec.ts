import { splitContentForAds, splitTextForAds } from './splitContentForAds';

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
  it('ignores tags inside HTML comments when balancing depth', () => {
    const html = `<!-- <div> -->${para(300, 'a')}${para(300, 'b')}`;
    const chunks = splitContentForAds(html, 250);

    expect(chunks.join('')).toBe(html);
    expect(chunks.length).toBe(2);
  });
});

describe('splitTextForAds', () => {
  it('keeps a short TLDR whole', () => {
    expect(splitTextForAds('short summary.', 250)).toEqual(['short summary.']);
  });

  it('breaks a long TLDR at a sentence end past the threshold', () => {
    const first = `${'a'.repeat(260)}.`;
    const second = 'b'.repeat(300);
    const parts = splitTextForAds(`${first} ${second}`, 250);

    expect(parts).toEqual([first, second]);
  });

  it('breaks at the sentence end nearest the midpoint, not the first past a threshold', () => {
    const sentences = [
      `${'a'.repeat(100)}.`,
      `${'b'.repeat(100)}.`,
      `${'c'.repeat(100)}.`,
      `${'d'.repeat(100)}.`,
    ].join(' ');
    const parts = splitTextForAds(sentences, 200);

    // Two parts of two sentences each — a greedy threshold would cut 3/1.
    expect(parts).toHaveLength(2);
    expect(parts[0].endsWith(`${'b'.repeat(100)}.`)).toBe(true);
  });

  it('never places an ad within the cadence of the previous one', () => {
    // Sentence ends at ~130 and ~380: nearest-to-midpoint alone would pick
    // 130, putting an ad after half a cadence of text.
    const text = `${'a'.repeat(130)}. ${'b'.repeat(250)}. ${'c'.repeat(300)}`;
    const parts = splitTextForAds(text, 250);

    parts.slice(0, -1).forEach((part) => {
      expect(part.length).toBeGreaterThanOrEqual(250);
    });
  });

  it('never ends on a sliver', () => {
    // 720 chars rounds to a 3-part target; the only boundary near the last
    // even point would leave a 20-char tail, which the floor rejects.
    const text = `${'a'.repeat(300)}. ${'b'.repeat(400)}. ${'c'.repeat(20)}`;
    const parts = splitTextForAds(text, 250);

    expect(parts.length).toBeGreaterThan(1);
    expect(parts[parts.length - 1].length).toBeGreaterThanOrEqual(125);
  });

  it('caps the part count at maxParts', () => {
    const text = Array.from({ length: 10 }, () => `${'a'.repeat(250)}.`).join(
      ' ',
    );
    expect(splitTextForAds(text, 250, 3)).toHaveLength(3);
  });

  it('falls back to word boundaries without sentence punctuation', () => {
    const text = Array.from({ length: 120 }, () => 'word').join(' ');
    const parts = splitTextForAds(text, 250);

    expect(parts.length).toBeGreaterThan(1);
    parts.forEach((part) => {
      expect(part.startsWith('word')).toBe(true);
      expect(part.endsWith('word')).toBe(true);
    });
  });
});
