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
 * Splits rendered article HTML into chunks for in-content ads, cutting only
 * where a top-level block element closes — an ad can never land inside a
 * paragraph, list, blockquote or code block. Like the TLDR splitter, cuts
 * aim at even split points across the whole article (no front-loading) and
 * carry the cadence as a hard floor: never within `minChars` of visible text
 * of the previous cut, never with less than half a cadence after them.
 */
export function splitContentForAds(
  html: string,
  minChars: number,
  maxParts = Infinity,
): string[] {
  // First pass: every depth-0 block boundary with the cumulative visible
  // text before it.
  const candidates: Array<{ index: number; visible: number }> = [];
  let depth = 0;
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
      if (depth === 0) {
        candidates.push({ index: cursor, visible });
      }
    } else if (!VOID_ELEMENTS.has(name) && !token.endsWith('/>')) {
      depth += 1;
    }

    match = TAG_RE.exec(html);
  }
  visible += visibleLength(html.slice(cursor));

  const total = visible;
  const count = Math.min(Math.max(1, Math.round(total / minChars)), maxParts);

  if (count === 1 || !candidates.length) {
    return [html];
  }

  const chunks: string[] = [];
  let fromIndex = 0;
  let fromVisible = 0;
  for (let i = 1; i < count; i += 1) {
    const ideal = (total * i) / count;
    // Per-iteration captures: the closures must not reference the mutable
    // cursors (no-loop-func).
    const afterIndex = fromIndex;
    const floorFrom = fromVisible;
    const cut = candidates
      .filter(
        (candidate) =>
          candidate.index > afterIndex &&
          candidate.visible >= floorFrom + minChars &&
          candidate.visible <= total - minChars / 2,
      )
      .reduce<{ index: number; visible: number } | null>(
        (best, candidate) =>
          !best ||
          Math.abs(candidate.visible - ideal) < Math.abs(best.visible - ideal)
            ? candidate
            : best,
        null,
      );

    if (!cut) {
      break;
    }
    chunks.push(html.slice(fromIndex, cut.index));
    fromIndex = cut.index;
    fromVisible = cut.visible;
  }

  chunks.push(html.slice(fromIndex));
  return chunks;
}

/**
 * The TLDR's cadence: the part count comes from the target size and each
 * break lands on the sentence end nearest to its even split point, with the
 * cadence as a hard minimum between ads — a break can aim at balance but
 * never land within `targetChars` of the previous one. Falls back to word
 * boundaries for text without sentence punctuation.
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
    // Per-iteration capture: the closures below must not reference the
    // mutable `start` (no-loop-func).
    const from = start;
    // Nearest boundary to the even split point, with the cadence as a hard
    // floor on both sides: never within targetChars of the previous ad
    // (nearest-snapping alone pulled a break to ~130 chars) and never so
    // late that less than half a cadence of text would follow it.
    const cut = boundaries
      .filter(
        (position) =>
          position >= from + targetChars && position <= total - targetChars / 2,
      )
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
