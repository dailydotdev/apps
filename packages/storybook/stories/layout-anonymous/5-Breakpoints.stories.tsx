import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Page, Section } from './kit';

// What a visitor gets below laptop, as production serves it: screenshots of
// app.daily.dev/posts taken logged out on 25 Oct 2026 in a 375×812 phone
// viewport (mobile user agent, touch) and a 768×1024 tablet viewport, plus
// the 1440×900 laptop for the record. Neither width depends on login for
// its chrome, neither changed on 23 October, and the fix leaves both alone.
// Real screenshots rather than drawings: the earlier drawings of these two
// had chrome production does not show (an auth strip on the tablet, a
// second tab row on the phone), which is exactly the kind of thing a review
// must not invent.

const SHOTS_BASE = '/layout-anonymous';

const Shot = ({
  src,
  alt,
  width,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  caption: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2" style={{ maxWidth: width }}>
    <img
      src={`${SHOTS_BASE}/${src}`}
      alt={alt}
      className="w-full rounded-16 border border-border-subtlest-tertiary"
    />
    <figcaption className="text-text-tertiary typo-caption1">
      {caption}
    </figcaption>
  </figure>
);

const Breakpoints = (): ReactElement => (
  <Page
    title="Tablet and phone, as production serves them"
    lead={
      <>
        Logged out, on{' '}
        <a
          className="text-text-primary underline underline-offset-4"
          href="https://app.daily.dev/posts"
          target="_blank"
          rel="noreferrer"
        >
          app.daily.dev/posts
        </a>
        , 25 October 2026. Open the link in a private window at these widths to
        see the live page; the screenshots are here so the review stands on its
        own.
      </>
    }
  >
    <Section
      title="Phone · 375"
      lead="ShellBlock: the Explore title with the logged-out Log in and Open app squares, the Posts / Tags / Sources / Leaderboard segments, then the “Popular ⌄” sort menu (ExploreSortMenu) — one row of segments and a dropdown, not a second row of sort tabs. The feed is the list card. At the bottom, the logged-out “See all posts · Open daily.dev app” footer (the mobile_app_footer variant that won its test) sits over the shell’s bar."
    >
      <Shot
        src="phone-375.jpg"
        alt="daily.dev Explore on a 375px phone, logged out"
        width={375}
        caption="375 × 812, mobile user agent. The sort is a dropdown; the segments are the only tab row."
      />
    </Section>
    <Section
      title="Tablet · 768"
      lead="SidebarTablet (64px: logo, Home, Explore, Headlines, Activity, Squads — no Profile and no New post for a visitor), the page’s sticky search panel in place of a header, FeedExploreHeader’s underlined sort tabs, list cards, and the sponsor dock (“Made possible by”) pinned at the bottom. There is no auth strip on this page: CustomAuthBanner belongs to the post, source, profile and featured-squads pages, not to Explore."
    >
      <Shot
        src="tablet-768.jpg"
        alt="daily.dev Explore on a 768px tablet, logged out"
        width={768}
        caption="768 × 1024. No purple strip, no header, no rail; the sort tabs are the page’s own."
      />
    </Section>
    <Section
      title="Laptop · 1440, for the record"
      lead="The state story 1 calls “production today”: the global header over the v2 rail, whose own logo and toggle sit under it, the page strip’s sort pills, the grid, and the bottom signup banner beside the rail."
    >
      <Shot
        src="laptop-1440.jpg"
        alt="daily.dev Explore on a 1440px laptop, logged out"
        width={1440}
        caption="1440 × 900. Compare with story 1’s second frame."
      />
    </Section>
    <Section title="Why tablet and phone are out of scope">
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card title="Tablet">
          <p>
            MainLayout renders SidebarTablet below laptop whatever the login
            state, and on explore pages the global header gives way to the
            page’s own search panel. There is no rail to duplicate it.
          </p>
        </Card>
        <Card title="Phone">
          <p>
            The phone shell (ShellBlock, ShellCluster) shipped in its own
            project and already handles visitors: account squares hide, the
            logged-out header carries Log in and Open app, and tabs that need a
            login open the login sheet.
          </p>
        </Card>
      </div>
    </Section>
  </Page>
);

const meta: Meta<typeof Breakpoints> = {
  title: 'Layout v2 anonymous/5. Tablet and phone',
  component: Breakpoints,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof Breakpoints>;

export const All: Story = { name: 'Tablet and phone' };
