/**
 * BriefPostContent renders the body as one `<Markdown content={contentHtml} />`
 * blob, with no per-item nodes, so the share controls read its blocks back out
 * of the rendered DOM: what the reader is actually looking at.
 */

/** A bullet, or a paragraph that is not the body of one. */
export const BRIEF_BLOCK_SELECTOR = 'li, :not(li) > p';

export interface BriefSection {
  heading: HTMLElement;
  /** The text of every bullet, or of every block when it has none. */
  blocks: string[];
}

const HEADING_SELECTOR = 'h1, h2, h3';

/* textContent, not innerText: innerText needs layout, which jsdom has none of,
   and the collapsed whitespace is what a card wants anyway. */
const text = (node: Element) =>
  (node.textContent ?? '').replace(/\s+/g, ' ').trim();

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

  const blocks: string[] = [];
  let sibling = heading.nextElementSibling;

  while (sibling && !sibling.matches(HEADING_SELECTOR)) {
    const nested = sibling.querySelectorAll('li');
    const nodes = nested.length ? Array.from(nested) : [sibling];

    nodes.forEach((node) => {
      const value = text(node);

      if (value) {
        blocks.push(value);
      }
    });

    sibling = sibling.nextElementSibling;
  }

  return { heading, blocks };
}

/**
 * Bullets read `<strong>the claim</strong>: the evidence`. Only the claim fits
 * a card line, so the evidence is dropped.
 */
export function splitBriefBullet(value: string): string {
  const separator = value.indexOf(':');

  if (separator < 1 || separator > 120) {
    return value;
  }

  return value.slice(0, separator).trim();
}
