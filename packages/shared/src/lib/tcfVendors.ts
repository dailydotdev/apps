/**
 * The IAB TCF vendors the consent banner asks about, by Global Vendor List
 * id. iubenda has no default here: with nothing selected it declares the
 * entire GVL, well over a thousand vendors, which the TCF policies forbid
 * and no reader can review. This is Content Ignite's onboarding list: their
 * tag reads consent as missing for any partner not on it and falls back to
 * non-personalized ads.
 *
 * Mirrored by hand into the marketing sites' embed (recruiter-landing,
 * custom-scripts/head.html): consent is shared across *.daily.dev through
 * `localConsentDomain`, so the two lists must agree.
 */
export const tcfVendors: ReadonlyArray<{ id: number; name: string }> = [
  { id: 656, name: 'Content Ignite' },
  { id: 50, name: 'Adform A/S' },
  { id: 10, name: 'Index Exchange Inc.' },
  { id: 13, name: 'Sovrn, Inc.' },
  { id: 241, name: 'OneTag Limited' },
  { id: 69, name: 'OpenX' },
  { id: 76, name: 'PubMatic, Inc' },
  { id: 28, name: 'Triple Lift, Inc.' },
  { id: 755, name: 'Google Advertising Products' },
  { id: 253, name: 'Improve Digital' },
  { id: 82, name: 'Smaato, Inc.' },
  { id: 25, name: 'Yahoo EMEA Limited' },
  { id: 52, name: 'Magnite, Inc.' },
  { id: 45, name: 'Equativ' },
  { id: 259, name: 'ADYOULIKE SA' },
  { id: 109, name: 'LoopMe Limited' },
  { id: 91, name: 'Criteo SA' },
  { id: 686, name: 'The MediaGrid Inc.' },
  { id: 617, name: 'Onfocus (Adagio)' },
  // the onboarding doc listed 33 as Sharethrough; Content Ignite confirmed
  // they want Sharethrough (80) and kept 33, ShareThis in the GVL
  { id: 33, name: 'ShareThis, Inc' },
  { id: 80, name: 'Sharethrough, Inc' },
  { id: 149, name: 'ADman Interactive SLU' },
  { id: 737, name: 'Monet Engine Inc' },
  { id: 81, name: 'PulsePoint, Inc.' },
  { id: 141, name: 'Emodo LLC' },
  { id: 512, name: 'Verve Group Europe GmbH' },
  { id: 32, name: 'Xandr, Inc.' },
  { id: 1126, name: 'Microsoft Advertising' },
  { id: 804, name: 'LinkedIn Ireland Unlimited Company' },
  { id: 203, name: 'Revcontent, LLC' },
  { id: 61, name: 'GumGum, Inc.' },
  { id: 31, name: 'Ogury Ltd' },
  { id: 157, name: 'Seedtag Advertising S.L' },
  { id: 21, name: 'The UK Trade Desk Ltd' },
  { id: 793, name: 'Amazon Ads' },
  { id: 867, name: 'Mintegral International Limited' },
  { id: 639, name: 'Smile Wanted Group' },
  { id: 23, name: 'Nexxen Inc.' },
  { id: 36, name: 'Nexxen Group LLC' },
  { id: 58, name: '33Across' },
  { id: 779, name: 'Adtarget Teknoloji A.S.' },
  { id: 90, name: 'Teroa S.A. (E-Planning)' },
  { id: 14, name: 'Adkernel LLC (Madopi)' },
  { id: 285, name: 'Comcast International France SAS/FreeWheel Media' },
  { id: 1028, name: 'Sparteo' },
];

export const tcfVendorIds: number[] = tcfVendors.map(({ id }) => id);
