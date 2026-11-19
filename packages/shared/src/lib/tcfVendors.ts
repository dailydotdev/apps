/**
 * The IAB TCF vendors the consent banner asks about, by Global Vendor List
 * id. iubenda has no default here: with nothing selected it declares the
 * entire GVL, well over a thousand vendors, which the TCF policies forbid
 * and no reader can review. So the list is only the partners whose ads can
 * reach the page under our consent string.
 *
 * Mirrored by hand into the marketing sites' embed (recruiter-landing,
 * custom-scripts/head.html): consent is shared across *.daily.dev through
 * `localConsentDomain`, so the two lists must agree.
 */
export const tcfVendors: ReadonlyArray<{ id: number; name: string }> = [
  // the video player on the post page and its programmatic ad breaks
  { id: 444, name: 'EX.CO Technologies Ltd' },
  { id: 42, name: 'Taboola Europe Limited' },
  { id: 263, name: 'Nativo, Inc.' },
];

export const tcfVendorIds: number[] = tcfVendors.map(({ id }) => id);
