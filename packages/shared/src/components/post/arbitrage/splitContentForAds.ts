const TAG_RE = /<\/?([a-zA-Z][\w-]*)(?:[^>'"]|"[^"]*"|'[^']*')*?\/?>/g;

// Elements that never take a closing tag, so an opening token must not
// increase the nesting depth.
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const visibleLength = (text: string): number =>
  text
    .replace(/&[#\w]+;/g, 'x')
    .replace(/\s+/g, ' ')
    .trim().length;

/**
 * Splits rendered article HTML into chunks of at least `minChars` of visible
 * text, cutting only where a top-level block element closes — an ad between
 * chunks can never land inside a paragraph, list, blockquote or code block.
 * A short tail is merged into the chunk before it, so the article never ends
 * on an ad followed by a stray line.
 */
export function splitContentForAds(html: string, minChars: number): string[] {
  const chunks: string[] = [];
  let depth = 0;
  let chunkStart = 0;
  let cursor = 0;
  let visible = 0;

  TAG_RE.lastIndex = 0;
  let match = TAG_RE.exec(html);
  while (match) {
    const [token, rawName] = match;
    visible += visibleLength(html.slice(cursor, match.index));
    cursor = match.index + token.length;

    const name = rawName.toLowerCase();
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && visible >= minChars) {
        chunks.push(html.slice(chunkStart, cursor));
        chunkStart = cursor;
        visible = 0;
      }
    } else if (!VOID_ELEMENTS.has(name) && !token.endsWith('/>')) {
      depth += 1;
    }

    match = TAG_RE.exec(html);
  }

  const tail = html.slice(chunkStart);
  if (tail.trim()) {
    chunks.push(tail);
  }

  // The last chunk earns its preceding ad only when it carries real content.
  if (chunks.length > 1) {
    const last = chunks[chunks.length - 1];
    if (visibleLength(last.replace(TAG_RE, ' ')) < minChars / 2) {
      chunks[chunks.length - 2] += last;
      chunks.pop();
    }
  }

  return chunks;
}
