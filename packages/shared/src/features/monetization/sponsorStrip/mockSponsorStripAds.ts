/**
 * Development stand-in for an `advertiser_bar` fill, in the wire shape
 * `parseSponsors` reads, so a local row exercises the real parse rather than a
 * shortcut around it. `fetchSponsorStripAds` reaches for it only in
 * development and only when the ad server had nothing.
 *
 * Every mark is a generated placeholder for a fictitious company. That is
 * deliberate: the row is labelled "Made possible by" and fires real impression,
 * viewable impression, air time and click events, so a real company's mark here
 * would claim a sponsorship that does not exist. Placeholders exercise the
 * masking and the optical sizing identically.
 */

/**
 * Marks are generated rather than fetched so the fixture pulls nothing from a
 * third party, and so the intrinsic dimensions are exact by construction rather
 * than measured off someone else's file.
 */
const placeholderMark = (label: string, ratio: number, ink: string): string => {
  const height = 40;
  const width = Math.round(height * ratio);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="0" y="8" width="24" height="24" rx="6" fill="${ink}"/>` +
    `<text x="32" y="28" font-family="sans-serif" font-size="20" font-weight="700" fill="${ink}">${label}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const slugOf = (company: string) =>
  company.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Black ink for the wall: it is masked to the row's text colour, so the file's
// own colour never reaches the screen and one asset serves either ground.
const wallAdvertiser = (company: string, ratio: number) => ({
  generation_id: `mock-${slugOf(company)}`,
  company_name: company,
  icon: placeholderMark(company, ratio, '#000000'),
  link: `https://daily.dev/?utm_source=sponsor_strip&sponsor=${slugOf(
    company,
  )}`,
  pixels: [] as string[],
});

const PINNED_COMPANY = 'Relecloud';
const PINNED_RATIO = 123 / 20;

/**
 * The pinned mark is drawn in the file's own inks rather than masked, and the
 * wire carries one asset for both themes, so the placeholder uses a mid tone
 * that survives either ground — which is the constraint a real pinned creative
 * is under too.
 */
const pinnedAdvertiser = {
  generation_id: 'mock-pinned',
  company_name: PINNED_COMPANY,
  icon: placeholderMark(PINNED_COMPANY, PINNED_RATIO, '#8AA0C4'),
  link: `https://daily.dev/?utm_source=sponsor_strip&sponsor=${slugOf(
    PINNED_COMPANY,
  )}`,
  pixels: [] as string[],
};

// Ratios span the range real marks do — a near-square through to a long
// wordmark — so `contain` is exercised across the same spread.
export const MOCK_ADVERTISER_BAR = {
  type: 'ADVERTISER_BAR',
  generation_id: 'mock-bar',
  value: {
    advertiser_bar: {
      pinned: [pinnedAdvertiser],
      top_tier: [
        wallAdvertiser('Contoso', 3.94),
        wallAdvertiser('Fabrikam', 5.69),
        wallAdvertiser('Northwind', 5.67),
        wallAdvertiser('Litware', 5.12),
        wallAdvertiser('Proseware', 1.86),
      ],
      community: [
        wallAdvertiser('Adventure Works', 3.03),
        wallAdvertiser('Woodgrove', 3.01),
        wallAdvertiser('Tailspin', 4.0),
        wallAdvertiser('Wingtip', 6.4),
        wallAdvertiser('Lucerne', 4.1),
        wallAdvertiser('Trey Research', 4.66),
        wallAdvertiser('Blue Yonder', 4.53),
      ],
    },
  },
};
