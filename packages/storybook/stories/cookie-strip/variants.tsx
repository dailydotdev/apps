import type { ReactElement } from 'react';
import React from 'react';
import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth/AuthenticationBanner';
import GeoPersonalizedBanner from '@dailydotdev/shared/src/components/marketing/banners/personalized/GeoPersonalizedBanner';
import type { HeadlineCopy, StageAccent } from './banner';
import { AuthenticationBannerStage, StageHeadline } from './banner';

export interface StripContext {
  /** The cookie card is still on screen (no answer yet). */
  consentOpen: boolean;
  copy: HeadlineCopy;
}

export interface Variant {
  id: string;
  name: string;
  /** One line: what the layout does. */
  idea: string;
  /** What changes against production, beyond the shared layout. */
  changes: string[];
  Strip: (ctx: StripContext) => ReactElement;
}

/** Production, untouched: the real components the webapp renders today. */
const ProductionStrip = ({ copy }: StripContext): ReactElement =>
  copy === 'geo' ? (
    <GeoPersonalizedBanner geo="IL" />
  ) : (
    <AuthenticationBanner />
  );

const stage =
  ({ accent, dock }: { accent?: StageAccent; dock?: boolean }) =>
  ({ copy, consentOpen }: StripContext): ReactElement =>
    (
      <AuthenticationBannerStage
        accent={accent}
        dock={dock}
        consentOpen={consentOpen}
      >
        <StageHeadline copy={copy} />
      </AuthenticationBannerStage>
    );

export const PRODUCTION: Variant = {
  id: 'today',
  name: 'Production today',
  idea: 'Headline and auth buttons as two columns in a centered 1,020px row; the cookie card lands on the buttons below ~1,750px.',
  changes: [],
  Strip: ProductionStrip,
};

const SHARED_CHANGES = [
  'One left-aligned column (headline, then buttons), centered in the space the cookie card leaves free.',
  'Google and GitHub side by side (AuthOptions `inlineProviders`, as PinnedSignupStrip already does).',
  'Same height as production; the headline a step smaller, with a solid title instead of the gradient.',
  'Continue with email and Log in on one row under the providers.',
];

export const VARIANTS: Variant[] = [
  {
    id: 'patchy',
    name: 'Patchy',
    idea: 'The shared column layout, with Patchy sitting on the strip’s top edge.',
    changes: [
      ...SHARED_CHANGES,
      'Patchy (`cloudinaryPatchyWaiting`) sits on the strip’s top edge, above the column’s right end.',
    ],
    Strip: stage({ accent: 'patchy' }),
  },
  {
    id: 'handoff',
    name: 'Handoff dock',
    idea: 'The shared column layout, with the cookie card docked as the strip’s right column; once answered the slot confirms and hands its width back.',
    changes: [
      ...SHARED_CHANGES,
      'While the card is open it docks inside the strip: no shadow, translucent fill, centered on the strip, behind a divider.',
      'On answer the slot shows "Privacy choices saved" for two seconds while the column recenters.',
    ],
    Strip: stage({ dock: true }),
  },
  {
    id: 'sources',
    name: 'Every source',
    idea: 'The shared column layout, with a small row of publication logos and "1,300+ sources in one feed" above the headline.',
    changes: [
      ...SHARED_CHANGES,
      'A row of six publication logos plus "1,300+ sources in one feed" above the headline (the only added copy).',
    ],
    Strip: stage({ accent: 'sources' }),
  },
];

export const ALL: Variant[] = [PRODUCTION, ...VARIANTS];

export const variantById = (id: string): Variant =>
  ALL.find((v) => v.id === id) ?? PRODUCTION;
