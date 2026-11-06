import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Center, Col, Lines, Row, Tabs } from '../kit';

// At 1440 the frame is laptopL's max-w-6xl.
const frame = 1152;

const twoColumn = (
  bp: Bp,
  {
    main,
    mainSpec,
    mainMax,
    aside,
    asideSpec,
    asideMax,
    cols,
    small,
  }: {
    main: string;
    mainSpec: string;
    mainMax?: number;
    aside: string;
    asideSpec: string;
    asideMax?: number;
    cols: Record<Bp, number>;
    small: 'tabs' | 'stack' | 'hide';
  },
) => {
  const content = <Cards cols={cols[bp]} rows={3} height={240} />;
  if (bp === 'laptop') {
    return (
      <Center max={frame} style={{ flex: 1, padding: 16 }}>
        <Row style={{ flex: 1 }}>
          <Box
            label={main}
            spec={mainSpec}
            className="flex-1"
            style={{ maxWidth: mainMax }}
          >
            <span className="h-32 shrink-0 rounded-16 bg-surface-float" />
            {content}
          </Box>
          <Box
            tone="aside"
            label={aside}
            spec={asideSpec}
            style={asideMax ? { flex: 1, maxWidth: asideMax } : { width: 320 }}
            className="shrink-0"
          >
            <Lines count={10} />
          </Box>
        </Row>
      </Center>
    );
  }
  return (
    <Col gap={12} style={{ padding: 16, flex: 1 }}>
      {small === 'tabs' && <Tabs count={2} />}
      <Box label={main} spec="full width" className="flex-1">
        <span className="h-24 shrink-0 rounded-16 bg-surface-float" />
        {content}
      </Box>
      {small === 'stack' && (
        <Box tone="aside" label={aside} spec="stacked below" className="h-32" />
      )}
    </Col>
  );
};

export const framedColumns: Category = {
  title: 'Framed two-column',
  summary:
    'A bordered main card and a 320px aside, side by side in a max-w-5xl frame (max-w-6xl from laptopL).',
  intro: (
    <p>
      SquadPageLayout set this pattern, and LfgFrame and the profile follow it.
      The frame floats with laptop:gap-4 laptop:p-4, so the card&apos;s edges
      show around it. What the aside does below laptop differs: it becomes a
      tab, stacks under the main card, or disappears.
    </p>
  ),
  variants: [
    {
      name: 'Squad page',
      production: { story: 'squad', url: '/squads/daily_updates' },
      routes: [
        '/squads/[handle]',
        '/squads/[handle]/members',
        '/squads/[handle]/rules',
        '/squads/[handle]/pending',
        '/squads/[handle]/products',
      ],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Squad + back' },
      widths: [
        'Frame mx-auto laptop:max-w-5xl · 1024px laptopL:max-w-6xl · 1152px, laptop:flex-row laptop:gap-4 laptop:p-4 (SquadPageLayout.tsx:72)',
        'Main: bordered rounded-16 cards, flex-1; the feed is capped at 2 columns (SquadHome.tsx:34)',
        'Aside laptop:w-80 · 320px, not sticky (:128)',
        'Below laptop: one column with Posts / About segments; About replaces the posts',
      ],
      render: (bp) =>
        twoColumn(bp, {
          main: 'Squad card',
          mainSpec: 'flex-1 rounded-16 border',
          aside: 'About',
          asideSpec: 'w-80 · 320px',
          cols: { laptop: 2, tablet: 2, phone: 1 },
          small: 'tabs',
        }),
    },
    {
      name: 'Squad directory lists',
      production: {
        story: 'squads-featured',
        url: '/squads/discover/featured',
      },
      routes: [
        '/squads/discover/featured',
        '/squads/discover/[id]',
        '/squads/discover/my',
      ],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader · directory tabs',
        tablet: 'Directory tabs',
        phone: 'Squads + chips',
      },
      widths: [
        'Same frame (SquadDiscoverListPage.tsx:64)',
        'Grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-1 laptopL:grid-cols-2 (:92)',
        'Aside w-80, laptop only; below laptop the widgets drop under the list',
      ],
      render: (bp) =>
        twoColumn(bp, {
          main: 'Squad list',
          mainSpec: 'flex-1 rounded-16 border',
          aside: 'Widgets',
          asideSpec: 'w-80 · 320px',
          cols: { laptop: 2, tablet: 2, phone: 1 },
          small: 'stack',
        }),
    },
    {
      name: 'Looking for group',
      production: { story: 'lfg', url: '/lfg' },
      routes: ['/lfg', '/lfg/[id]', '/lfg/new', '/lfg/[id]/edit'],
      chrome: 'app',
      bottomBar: true,
      header: { tablet: 'Board filters', phone: 'LFG' },
      widths: [
        'LfgFrame copies the squad frame: max-w-5xl / laptopL:max-w-6xl, flex-row gap-4 p-4 (LfgFrame.tsx)',
        'Aside laptop:w-80 · 320px, laptop:sticky laptop:top-4: the only sticky aside in this category',
        'Below laptop the aside stacks under the main card',
      ],
      notes:
        'The board (/lfg) has a tablet:flex filter header. /lfg/new and /lfg/[id]/edit hide the phone bottom bar.',
      render: (bp) =>
        twoColumn(bp, {
          main: 'Board / post',
          mainSpec: 'flex-1 rounded-16 border',
          aside: 'Aside · sticky',
          asideSpec: 'w-80 sticky top-4',
          cols: { laptop: 1, tablet: 1, phone: 1 },
          small: 'stack',
        }),
    },
    {
      name: 'Profile',
      production: { story: 'profile', url: '/dailydotdev' },
      routes: [
        '/[userId]',
        '/[userId]/posts',
        '/[userId]/replies',
        '/[userId]/upvoted',
        '/[userId]/achievements',
        '/[userId]/work',
        '/[userId]/education',
        '/[userId]/project',
        '/[userId]/opensource',
        '/[userId]/volunteering',
        '/[userId]/certification',
      ],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Profile' },
      widths: [
        'Frame m-auto laptop:max-w-5xl laptopL:max-w-6xl laptop:flex-row laptop:gap-4 laptop:p-4 (ProfileLayout/index.tsx:155)',
        'Main laptop:max-w-2xl · 672px, laptopL:max-w-3xl · 768px (:156)',
        'Aside laptop:max-w-80 · 320px, not sticky (:159)',
        'Below laptop: the aside is hidden and tab content sits in a tablet:rounded-16 card',
      ],
      notes:
        'Unlike the squad page, both columns are capped by max widths rather than a fixed aside, so the pair leaves space in the frame. /[userId]/achievements adds a laptop PageHeader.',
      render: (bp) =>
        twoColumn(bp, {
          main: 'Profile',
          mainSpec: 'max-w-3xl · 768px at laptopL',
          mainMax: 768,
          aside: 'Aside',
          asideSpec: 'max-w-80 · 320px',
          asideMax: 320,
          cols: { laptop: 1, tablet: 1, phone: 1 },
          small: 'hide',
        }),
    },
  ],
};
