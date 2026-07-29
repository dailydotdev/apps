/**
 * The profile page wraps every section in `p-6`, so a horizontally scrolling
 * strip clips 24px short of the page edge — the content looks abruptly cut off
 * instead of continuing off-screen. Cancel that padding on the scroll container
 * and re-apply it inside, so the strip clips at the card edge while its items
 * stay aligned with the section heading.
 */
export const profileStripBleed = '-mx-6 px-6';

export const profileSecondaryFieldStyles = {
  outerLabel: '!px-0 !typo-callout',
  baseField: '!h-12',
};
