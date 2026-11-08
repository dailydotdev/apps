import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Center, Col, Lines, ListRows, Row } from '../kit';

/** A main column with a fixed-width aside on laptop, stacked below it. */
const split = (
  bp: Bp,
  {
    max,
    main,
    mainSpec,
    aside,
    asideSpec,
    asideWidth = 340,
    stack = true,
    padding = 0,
  }: {
    max: number;
    main: string;
    mainSpec: string;
    aside: string;
    asideSpec: string;
    asideWidth?: number;
    stack?: boolean;
    padding?: number;
  },
) =>
  bp === 'laptop' ? (
    <Center max={max} style={{ flex: 1, padding }}>
      <Row style={{ flex: 1 }} gap={padding ? 16 : 0}>
        <Box label={main} spec={mainSpec} className="flex-1">
          <Lines count={3} height={22} />
          <span className="h-64 rounded-16 bg-surface-float" />
          <Lines count={8} />
        </Box>
        <Box
          tone="aside"
          label={aside}
          spec={asideSpec}
          style={{ width: asideWidth }}
          className="shrink-0"
        >
          <Cards cols={1} rows={2} height={220} />
        </Box>
      </Row>
    </Center>
  ) : (
    <Col gap={12} style={{ padding: 16, flex: 1 }}>
      <Box label={main} spec="full width" className="flex-1">
        <Lines count={3} height={22} />
        <span className="h-48 rounded-16 bg-surface-float" />
        <Lines count={6} />
      </Box>
      {stack && (
        <Box tone="aside" label={aside} spec="stacked below" className="h-40" />
      )}
    </Col>
  );

export const widgetRail: Category = {
  title: 'Main + widget rail',
  summary:
    'A main column and a fixed aside on laptop, inside a centred max width. The aside stacks under the main column on smaller screens.',
  intro: (
    <p>
      The aside is mostly PageWidgets, laptop:w-[21.25rem] · 340px. Jobs uses a
      320px side column instead. Neither is sticky, apart from the last ad on
      articles.
    </p>
  ),
  variants: [
    {
      name: 'Post page',
      production: { story: 'post', url: '/posts/qojM1enSN' },
      routes: ['/posts/[id]', '/layout-v2/posts/[id]', '/posts/[id]/share'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Source + back' },
      widths: [
        'Outer box max-w-[69.25rem] · 1108px, m-auto laptop:border-x (posts/[id]/index.tsx:314, PostContentContainer.tsx:22)',
        'Main flex-1 laptop:px-8 laptop:border-r (post/common.tsx:133), about 768px at full width',
        'Aside PageWidgets laptop:w-[21.25rem] · 340px, not sticky (utilities/common.tsx:87)',
        'Brief and Digest posts: one !max-w-3xl column, no aside',
      ],
      notes:
        'The same 1108px as the post modal (ModalSize.XLarge). With the post feed under the comments, the widgets are hidden below laptop.',
      render: (bp) =>
        split(bp, {
          max: 1108,
          main: 'Post',
          mainSpec: 'flex-1 laptop:px-8 border-r',
          aside: 'PageWidgets',
          asideSpec: 'w-[21.25rem] · 340px',
        }),
    },
    {
      name: 'Ad post template',
      production: { story: 'article', url: '/articles/qojM1enSN' },
      routes: ['/articles/[id]'],
      chrome: 'no-sidebar',
      bottomBar: true,
      widths: [
        'Outer box max-w-[72rem] · 1152px, m-auto laptop:flex-row laptop:border-x (articles/[id].tsx:128)',
        'Rail 21.25rem · 340px; its last ad is laptop:sticky (ReadPostContent.tsx:385)',
      ],
      notes:
        'The only post route with showSidebar false: no rail, a global header.',
      render: (bp) =>
        split(bp, {
          max: 1152,
          main: 'Article',
          mainSpec: 'flex-1',
          aside: 'Ad rail · last ad sticky',
          asideSpec: 'w-[21.25rem] · 340px',
        }),
    },
    {
      name: 'Wallet',
      production: { story: 'wallet', url: '/wallet' },
      routes: ['/wallet'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Wallet' },
      widths: [
        'Outer box m-auto max-w-screen-laptop · 1020px, laptop:flex-row laptop:border-x',
        'Main flex-1 tablet:border-r, aside PageWidgets 340px',
      ],
      render: (bp) =>
        split(bp, {
          max: 1020,
          main: 'Balance + transactions',
          mainSpec: 'flex-1 border-r',
          aside: 'PageWidgets',
          asideSpec: 'w-[21.25rem] · 340px',
        }),
    },
    {
      name: 'Search results',
      production: { story: 'search', url: '/search/posts?q=react' },
      routes: ['/search/posts'],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'Search bar',
        tablet: 'Search header',
        phone: 'Search',
      },
      widths: [
        'Section mx-auto w-full laptopL:max-w-screen-laptop · 1020px (SearchResultsLayout.tsx:108)',
        'Results flex-1 border-r, aside PageWidgets 340px, not sticky',
        'No query yet: a centred max-w-[32rem] empty state',
        'Below laptop: a feed list under the search bar, no aside',
      ],
      render: (bp) =>
        bp === 'laptop' ? (
          split(bp, {
            max: 1020,
            main: 'Results',
            mainSpec: 'flex-1 border-r',
            aside: 'PageWidgets',
            asideSpec: 'w-[21.25rem] · 340px',
          })
        ) : (
          <Box label="Results list" spec="no aside" className="m-4 flex-1">
            <ListRows count={8} />
          </Box>
        ),
    },
    {
      name: 'Job detail',
      production: { story: 'job', url: '/jobs/[id]' },
      routes: ['/jobs/[id]'],
      chrome: 'app',
      header: { phone: 'Job' },
      widths: [
        'Outer box mx-auto max-w-[69.25rem] · 1108px, laptop:flex-row laptop:justify-center laptop:py-8 (jobs/[id]/index.tsx:547)',
        'Main: a bordered rounded-16 card, flex-1; laptop:max-w-3xl when there is no side panel',
        'Side column laptop:max-w-80 · 320px (:689)',
      ],
      notes: 'No phone bottom bar: the page has its own fixed CTA.',
      render: (bp) =>
        split(bp, {
          max: 1108,
          main: 'Job card',
          mainSpec: 'flex-1 rounded-16 border',
          aside: 'Side column',
          asideSpec: 'max-w-80 · 320px',
          asideWidth: 320,
          padding: 32,
        }),
    },
  ],
};
