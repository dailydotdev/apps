/**
 * BriefPostContent renders the body through `<Markdown content={contentHtml} />`
 * — one blob, no per-item nodes — so a control per bullet has nothing to hang
 * off in JSX. These read the blocks back out of the rendered DOM, which is also
 * the most faithful source: what the reader is actually looking at.
 */

export interface BriefBlock {
  node: HTMLElement;
  text: string;
}

export interface BriefSection {
  heading: HTMLElement;
  blocks: BriefBlock[];
}

const BLOCK_SELECTOR = 'li, p';
const HEADING_SELECTOR = 'h1, h2, h3';

/* textContent, not innerText: innerText needs layout, which jsdom has none of,
   and the collapsed whitespace is what a paste wants anyway. */
const text = (node: HTMLElement) =>
  (node.textContent ?? '').replace(/\s+/g, ' ').trim();

/** Every copyable block, skipping paragraphs that only wrap a list item. */
export function getBriefBlocks(container: HTMLElement): BriefBlock[] {
  return Array.from(container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
    .filter((node) => !(node.tagName === 'P' && node.closest('li')))
    .map((node) => ({ node, text: text(node) }))
    .filter((block) => block.text.length > 0);
}

/**
 * The section a heading opens, up to the next heading of any level. Matching is
 * on the heading's own text because the backend sends no ids or classes.
 */
export function getBriefSection(
  container: HTMLElement,
  headingText: string,
): BriefSection | null {
  const heading = Array.from(
    container.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
  ).find(
    (node) => text(node).toLowerCase() === headingText.toLowerCase().trim(),
  );

  if (!heading) {
    return null;
  }

  const blocks: BriefBlock[] = [];
  let sibling = heading.nextElementSibling;

  while (sibling && !sibling.matches(HEADING_SELECTOR)) {
    if (sibling instanceof HTMLElement) {
      const nested = sibling.querySelectorAll<HTMLElement>('li');
      const nodes = nested.length ? Array.from(nested) : [sibling];

      nodes.forEach((node) => {
        const value = text(node);

        if (value) {
          blocks.push({ node, text: value });
        }
      });
    }

    sibling = sibling.nextElementSibling;
  }

  return { heading, blocks };
}

/**
 * Bullets read `<strong>the claim</strong>: the evidence`. The claim alone is
 * what fits a card, so the lead is split off and the rest becomes its subtitle.
 */
export function splitBriefBullet(value: string): {
  lead: string;
  rest?: string;
} {
  const separator = value.indexOf(':');

  if (separator < 1 || separator > 120) {
    return { lead: value };
  }

  return {
    lead: value.slice(0, separator).trim(),
    rest: value.slice(separator + 1).trim() || undefined,
  };
}
