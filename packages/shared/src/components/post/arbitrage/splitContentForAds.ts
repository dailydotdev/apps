// Comments first, so a tag inside `<!-- <div> -->` can never touch the
// depth count; the alternation consumes the whole comment as one token.
const TAG_RE =
  /<!--[\s\S]*?-->|<\/?([a-zA-Z][\w-]*)(?:[^>'"]|"[^"]*"|'[^']*')*?\/?>/g;

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
export function splitContentForAds(
  html: string,
  minChars: number,
  maxParts = Infinity,
): string[] {
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

    if (token.startsWith('<!--')) {
      match = TAG_RE.exec(html);
      // eslint-disable-next-line no-continue
      continue;
    }

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

  // Density cap: everything past the last allowed boundary folds into the
  // final chunk rather than earning more ads.
  while (chunks.length > maxParts) {
    const overflow = chunks.pop() as string;
    chunks[chunks.length - 1] += overflow;
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

/**
 * The TLDR's cadence works by balance, not by greedy threshold: the part
 * count comes from the target size, and each break lands on the sentence end
 * nearest to its even split point — one ad in a two-part summary sits at the
 * middle sentence, not wherever the threshold first ran out. Falls back to
 * word boundaries for text without sentence punctuation.
 */
export function splitTextForAds(
  text: string,
  targetChars: number,
  maxParts = Infinity,
): string[] {
  const total = text.length;
  const count = Math.min(
    Math.max(1, Math.round(total / targetChars)),
    maxParts,
  );

  if (count === 1) {
    return [text];
  }

  const boundaryAfter = (re: RegExp): number[] => {
    const positions: number[] = [];
    let match = re.exec(text);
    while (match) {
      positions.push(match.index + match[0].length);
      match = re.exec(text);
    }
    return positions;
  };

  const sentenceEnds = boundaryAfter(/[.!?]["')\]]?\s+/g);
  const boundaries = sentenceEnds.length ? sentenceEnds : boundaryAfter(/\s+/g);

  const parts: string[] = [];
  let start = 0;
  for (let i = 1; i < count; i += 1) {
    const ideal = Math.round((total * i) / count);
    // Nearest boundary to the even split point, strictly inside the
    // remaining text so a cut can never produce an empty part.
    const cut = boundaries
      .filter((position) => position > start && position < total - 1)
      .reduce(
        (best, position) =>
          Math.abs(position - ideal) < Math.abs(best - ideal) ? position : best,
        -Infinity,
      );

    if (!Number.isFinite(cut)) {
      break;
    }
    parts.push(text.slice(start, cut).trimEnd());
    start = cut;
  }

  parts.push(text.slice(start).trimStart());
  return parts;
}
