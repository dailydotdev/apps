import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import {
  OfficialSpot,
  OfficialSpotContext,
  RulesWidget,
  VerifiedWidget,
} from './home';
import { DirectionShell } from './direction';
import { ViewportFrame } from './use-cases/shared';

const meta: Meta = {
  title: 'Squad Page/4. Official badge',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

/** The chosen badge, Aurora, as it ships at the top of the widget column. */
export const Overview: StoryObj = {
  render: () => (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
        <KitStyles />
        <div className="mx-auto flex w-full max-w-[60rem] flex-col gap-10">
          <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-8">
            <Eyebrow>Squad page · The official badge</Eyebrow>
            <h1 className="max-w-[24ch] font-bold typo-giga3">Aurora</h1>
            <p className="max-w-[64ch] text-text-secondary typo-body">
              Frosted glass with a brand-purple hairline and two soft light
              sources, cabbage and onion, behind the seal and four words. Picked
              from 28 explorations; it is the Official company page card at the
              top of the right column.
            </p>
          </header>
          <div className="flex w-80 flex-col gap-4">
            <VerifiedWidget />
            <RulesWidget />
          </div>
        </div>
      </div>
    </ExtensionProviders>
  ),
};

const spots: { spot: OfficialSpot; title: string; note: string }[] = [
  {
    spot: OfficialSpot.UnderUrl,
    title: '1. Pill under the meta line',
    note: 'The Aurora card shrunk to a chip, on its own line under the website.',
  },
  {
    spot: OfficialSpot.MetaLead,
    title: '2. First item of the meta line',
    note: 'Seal and “Official page” in brand purple, leading the website line. No surface.',
  },
  {
    spot: OfficialSpot.UnderName,
    title: '3. Label under the name',
    note: 'X’s “Verified organization” line: under the name, above the tagline.',
  },
  {
    spot: OfficialSpot.NameChip,
    title: '4. Chip beside the name',
    note: 'The seal becomes an “Official” Aurora chip on phones. Shortest.',
  },
  {
    spot: OfficialSpot.InfoRow,
    title: '5. Tappable row',
    note: 'LinkedIn’s verified page row: opens what verified means and who runs it.',
  },
  {
    spot: OfficialSpot.StripAboveFollow,
    title: '6. Strip above Follow',
    note: 'The Aurora card as a one-line strip, right where the decision is made.',
  },
  {
    spot: OfficialSpot.StripTop,
    title: '7. Strip above the name',
    note: 'The Aurora card as a one-line strip, first thing under the logo.',
  },
  {
    spot: OfficialSpot.CoverPill,
    title: '8. Pill on the cover',
    note: 'An “Official” glass pill in the cover’s top-left corner, clear of the banner’s own text.',
  },
  {
    spot: OfficialSpot.LogoPill,
    title: '9. Pill on the logo',
    note: 'Instagram’s LIVE pill: “Official” hanging off the logo’s bottom edge.',
  },
  {
    spot: OfficialSpot.StatsLead,
    title: '10. First item of the stats row',
    note: 'Seal and words in purple, leading Followers, Posts and Views.',
  },
];

/**
 * On phones the right column, and the Aurora card at its top, sit behind
 * the About chip. Ten places for the badge to stay visible by default.
 * Tablet and desktop are unchanged: the card stays at the top of the
 * right column.
 */
export const MobilePlacement: StoryObj = {
  name: 'Mobile placement',
  render: () => (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
        <KitStyles />
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-10">
          <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-8">
            <Eyebrow>Squad page · Official badge on phones</Eyebrow>
            <h1 className="max-w-[24ch] font-bold typo-giga3">
              Ten places, pick one
            </h1>
            <p className="max-w-[64ch] text-text-secondary typo-body">
              Below 1020px the right column moves behind the About chip, so the
              Official company page card is out of sight on phones. Each frame
              is a real 375px phone with the badge in a different spot, visible
              without a tap.
            </p>
          </header>
          <div className="flex flex-wrap gap-x-6 gap-y-10">
            {spots.map(({ spot, title, note }) => (
              <div key={spot} className="flex w-[23.4375rem] flex-col gap-2">
                <span className="font-bold text-text-primary typo-callout">
                  {title}
                </span>
                <span className="min-h-10 text-text-tertiary typo-footnote">
                  {note}
                </span>
                <ViewportFrame width={375} height={600} label="Phone, 375px">
                  <OfficialSpotContext.Provider value={spot}>
                    <DirectionShell
                      viewer={Viewer.Visitor}
                      initialPage="home"
                      fluid
                    />
                  </OfficialSpotContext.Provider>
                </ViewportFrame>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExtensionProviders>
  ),
};
