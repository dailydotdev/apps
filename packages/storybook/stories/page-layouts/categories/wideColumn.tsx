import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Center, Col, Lines, ListRows } from '../kit';

const pad = (bp: Bp) => (bp === 'phone' ? 16 : 24);

/** A hero over a grid, in a column `max` wide (or the full card). */
const stacked = (
  bp: Bp,
  {
    max,
    spec,
    hero,
    heroMax,
    cols,
    strip,
    banner,
  }: {
    max?: number;
    spec: string;
    hero?: string;
    heroMax?: number;
    cols: Record<Bp, number>;
    strip?: string;
    banner?: boolean;
  },
) => (
  <>
    {strip && bp !== 'phone' && (
      <Box
        tone="nav"
        label={strip}
        spec="full bleed"
        className="h-16 shrink-0 rounded-0"
      />
    )}
    {banner && (
      <Box
        tone="media"
        label="Hero banner"
        spec="full bleed · h-48 tablet:h-56"
        className="shrink-0 rounded-0"
        style={{ height: bp === 'phone' ? 192 : 224 }}
      />
    )}
    <Center max={max ?? 99999} style={{ flex: 1, padding: pad(bp) }}>
      <Box
        label="Column"
        spec={bp === 'laptop' ? spec : 'full width'}
        className="flex-1"
      >
        {hero && (
          <div
            className="w-full"
            style={{ maxWidth: heroMax, margin: '0 auto' }}
          >
            <Box
              tone="media"
              label={hero}
              spec={heroMax ? `max-w · ${heroMax}px` : undefined}
              className="h-40"
            />
          </div>
        )}
        <Cards cols={cols[bp]} rows={3} height={170} />
      </Box>
    </Center>
  </>
);

export const wideColumn: Category = {
  title: 'Wide column',
  summary:
    'One wide column of stacked sections (hero, rails, grids), either full width in the card or capped around 1020–1152px.',
  intro: (
    <p>
      These pages show more than one thing at a time, but never side by side as
      columns: everything stacks, and the grids carry the width. The cap is
      usually max-w-screen-laptop · 1020px.
    </p>
  ),
  variants: [
    {
      name: 'Entity page: hero, rails, then the feed',
      production: { story: 'tag', url: '/tags/javascript' },
      routes: ['/tags/[tag]', '/sources/[source]'],
      chrome: 'app',
      bottomBar: true,
      header: { laptop: 'PageHeader (sources)', phone: 'Title fades in' },
      widths: [
        'tags: a full-bleed TagPageNavbar from tablet up (TagTopicPage.tsx:396), px-4 tablet:px-6, centred hero max-w-[48rem] · 768px (:409), then full-width sections and the feed',
        'sources: sections at mx-4: info card, horizontal rails, archive card, feed ([source].tsx:87)',
        'No aside at any size',
      ],
      render: (bp) =>
        stacked(bp, {
          spec: 'full width · px-4 tablet:px-6',
          hero: 'Hero',
          heroMax: 768,
          cols: { laptop: 4, tablet: 2, phone: 1 },
          strip: 'TagPageNavbar',
        }),
    },
    {
      name: 'Directory: strip, hero, grid',
      production: { story: 'tags-directory', url: '/tags' },
      routes: ['/tags', '/tools', '/tools/[slug]'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Shell block' },
      widths: [
        'Column mx-auto max-w-screen-laptop · 1020px px-4 tablet:px-6 (TagsDirectoryPage.tsx:104, tools/index.tsx:219)',
        'Hero: max-w-screen-tablet on /tags, max-w-[48rem] · 768px on tools',
        'Grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3',
        'A full-bleed tab strip: tablet and up on /tags, every size on tools (ToolPageNavbar.tsx:44)',
      ],
      render: (bp) =>
        stacked(bp, {
          max: 1020,
          spec: 'max-w-screen-laptop · 1020px',
          hero: 'Hero',
          heroMax: 768,
          cols: { laptop: 3, tablet: 2, phone: 1 },
          strip: 'Tab strip',
        }),
    },
    {
      name: 'Explore hub grid',
      production: { story: 'sources', url: '/sources' },
      routes: [
        '/sources',
        '/users',
        '/posts/best-of',
        '/tags/[tag]/best-of',
        '/sources/[source]/best-of',
      ],
      chrome: 'app',
      bottomBar: true,
      header: { laptop: 'ExploreHubHeader', phone: 'Shell block' },
      widths: [
        'PageWrapperLayout tablet:p-4 laptop:p-10, full width (PageWrapperLayout.tsx:5)',
        'sources: grid-cols-1 tablet:grid-cols-2 laptopXL:grid-cols-4; users: … laptopXL:grid-cols-3',
        'best-of indexes: month tiles grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-6 (ArchiveIndexPage.tsx:135)',
      ],
      render: (bp) =>
        stacked(bp, {
          spec: 'full width · laptop:p-10',
          cols: { laptop: 2, tablet: 2, phone: 1 },
        }),
    },
    {
      name: 'Squads directory sections',
      production: { story: 'squads-discover', url: '/squads/discover' },
      routes: ['/squads/discover'],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader · directory tabs',
        tablet: 'Directory tabs',
        phone: 'Squads + chips',
      },
      widths: [
        'gap-8 px-4 laptop:px-6, full width',
        'Featured, then popular laptop:grid-cols-3, then topic tiles grid-cols-2 laptop:grid-cols-4 (SquadDiscoverSections.tsx:93)',
      ],
      notes: '/squads redirects here.',
      render: (bp) =>
        stacked(bp, {
          spec: 'full width · px-6',
          hero: 'Featured',
          cols: { laptop: 3, tablet: 2, phone: 1 },
        }),
    },
    {
      name: 'Banner over a full-width grid',
      production: { story: 'marketplace', url: '/marketplace' },
      routes: ['/marketplace', '/marketplace/[id]'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Marketplace' },
      widths: [
        'A full-bleed hero h-48 tablet:h-56 (MarketplacePageLayout.tsx:26), then PageWrapperLayout px-4 py-6',
        'Grid tablet:grid-cols-2 laptopL:grid-cols-3 (marketplace/index.tsx:222)',
      ],
      render: (bp) =>
        stacked(bp, {
          spec: 'full width · px-4 py-6',
          cols: { laptop: 3, tablet: 2, phone: 1 },
          banner: true,
        }),
    },
    {
      name: 'Centred detail',
      production: { story: 'leaderboard', url: '/users/highestLevel' },
      routes: ['/users/[id]'],
      chrome: 'app',
      bottomBar: true,
      header: { laptop: 'PageHeader + back', phone: 'Shell block' },
      widths: [
        'PageWrapperLayout, then mx-auto w-full max-w-screen-laptop · 1020px (users/[id].tsx:104)',
      ],
      render: (bp) =>
        stacked(bp, {
          max: 1020,
          spec: 'max-w-screen-laptop · 1020px',
          hero: 'Profile header',
          cols: { laptop: 3, tablet: 2, phone: 1 },
        }),
    },
    {
      name: 'Wide single column',
      production: { story: 'game-center', url: '/game-center' },
      routes: ['/game-center', '/briefing', '/hackathon'],
      chrome: 'app',
      bottomBar: true,
      header: { laptop: 'PageHeader', phone: 'Shell block' },
      widths: [
        'game-center: mx-auto max-w-[72rem] · 1152px (game-center/index.tsx:531)',
        'briefing: m-auto max-w-[69.25rem] · 1108px, laptop:pt-6 (briefing/index.tsx:186)',
        'hackathon: outer laptop:max-w-[64rem] · 1024px laptop:border-x, inner max-w-xl laptop:max-w-5xl',
      ],
      render: (bp) =>
        stacked(bp, {
          max: 1152,
          spec: 'max-w-[72rem] · 1152px',
          hero: 'Hero',
          cols: { laptop: 3, tablet: 2, phone: 1 },
        }),
    },
    {
      name: 'Full-width menu',
      production: { story: 'you', url: '/you' },
      routes: ['/you'],
      chrome: 'app',
      header: { phone: 'You' },
      widths: [
        'A full-width flex flex-col menu with no max width (YouPage.tsx:315)',
      ],
      notes: 'No phone bottom bar: /you hides it.',
      render: (bp) => (
        <Col style={{ flex: 1, padding: pad(bp) }}>
          <Box tone="nav" label="Menu" spec="full width" className="flex-1">
            <Lines count={2} height={22} />
            <ListRows count={10} thumb={false} />
          </Box>
        </Col>
      ),
    },
  ],
};
