import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Overlay, Tabs } from '../kit';

const columns: Record<Bp, number> = { laptop: 4, tablet: 1, phone: 1 };

const feed = (bp: Bp) =>
  bp === 'laptop' ? (
    <div style={{ padding: 24 }} className="flex min-h-0 flex-1 flex-col">
      <Box
        label="Feed grid"
        spec="laptop:px-6 py-6 · 3–4 columns at laptopL"
        className="flex-1"
      >
        <Cards cols={columns[bp]} rows={3} />
      </Box>
    </div>
  ) : (
    <Box
      label="Feed list"
      spec="FeedPageLayoutMobile · full width"
      className="m-4 flex-1"
    >
      <Cards cols={1} rows={3} height={260} />
    </Box>
  );

export const feedGrid: Category = {
  title: 'Feed grid',
  summary:
    'A grid of post cards fills the whole card on laptop, and becomes one list below it.',
  intro: (
    <p>
      Every route here goes getMainFeedLayout → FeedLayout → MainLayout, so the
      grid is the page: no centred column and no aside. The column count comes
      from FeedContext and the spacing setting, not from a max width, so a wider
      window gets more columns rather than wider cards.
    </p>
  ),
  variants: [
    {
      name: 'Home feeds',
      production: { story: 'home', url: '/' },
      routes: [
        '/',
        '/my-feed',
        '/popular',
        '/upvoted',
        '/following',
        '/feeds/[slugOrId]',
        '/feed-by-ids',
      ],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader · feed title',
        tablet: 'FeedNav tabs · sticky',
        phone: 'Shell block',
      },
      widths: [
        'Grid inset laptop:px-6 py-6 inside the card (feeds/FeedContainer.tsx:58)',
        'Columns from FeedContext.tsx:45: laptop 2–3, laptopL 3–4, laptopXL 3–5, desktop 4–6',
        'Grid capped at 21.25rem × columns from desktopL (Feed.module.css:4)',
        'List mode (spacing setting): laptop:!max-w-[42.5rem] · 680px, pushed right with !ml-auto',
        'Below laptop: FeedPageLayoutMobile, one full-width list',
      ],
      notes:
        '/ adds the feed hero or widget rail above the grid. /feed-by-ids renders Feed directly with laptop:px-10 and no FeedPage wrapper.',
      render: feed,
    },
    {
      name: 'Explore feeds',
      production: { story: 'posts', url: '/posts' },
      routes: ['/posts', '/posts/latest', '/posts/discussed', '/posts/upvoted'],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader · Explore sort tabs',
        tablet: 'Search header',
        phone: 'Sort menu + spotlight',
      },
      widths: [
        'Same grid as the home feeds',
        'Tablet: a sticky tab bar, tablet:sticky top-[4.5rem] (MainFeedLayout.tsx:880)',
      ],
      render: (bp) =>
        bp === 'tablet' ? (
          <>
            <div className="border-b border-border-subtlest-tertiary p-4">
              <Tabs count={5} />
            </div>
            {feed(bp)}
          </>
        ) : (
          feed(bp)
        ),
    },
    {
      name: 'Feed behind a settings modal',
      production: { story: 'new-feed', url: '/feeds/new' },
      routes: ['/feeds/new', '/feeds/[slugOrId]/edit'],
      chrome: 'app',
      header: { laptop: 'PageHeader · feed title', phone: 'Shell block' },
      widths: [
        'Edit: XLarge FlexibleCenter modal, tablet:w-[69.25rem] · 1108px (FeedSettingsEdit.tsx:219)',
        'New: Small FixedCenter modal, tablet:w-[26.25rem] · 420px',
        'Below tablet the modal is full screen',
      ],
      notes: 'The phone bottom bar is hidden on both (shellNav.ts:103).',
      render: (bp) => (
        <>
          {feed(bp)}
          <Overlay
            label="Feed settings · XLarge modal"
            spec={bp === 'phone' ? 'full screen' : 'tablet:w-[69.25rem]'}
            width={bp === 'phone' ? '100%' : 1108}
            height={bp === 'phone' ? '100%' : 640}
          />
        </>
      ),
    },
  ],
};
