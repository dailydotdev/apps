import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Fields, Lines, ListRows, Overlay } from '../kit';

/** One centred column, `max` wide on laptop and full width below. */
const column = (
  bp: Bp,
  {
    max,
    label,
    spec,
    content = 'list',
    borderX = false,
    banner = false,
    left = false,
  }: {
    max: number;
    label: string;
    spec: string;
    content?: 'list' | 'text' | 'form' | 'cards';
    borderX?: boolean;
    banner?: boolean;
    left?: boolean;
  },
) => (
  <>
    {banner && (
      <Box
        tone="media"
        label="Hero banner"
        spec="full bleed · h-48 tablet:h-56"
        className="shrink-0 rounded-0"
        style={{ height: bp === 'phone' ? 192 : 224 }}
      />
    )}
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ padding: bp === 'phone' ? 16 : 24 }}
    >
      <div
        className="flex min-h-0 w-full flex-1 flex-col"
        style={{ maxWidth: max, margin: left ? undefined : '0 auto' }}
      >
        <Box
          label={label}
          spec={bp === 'laptop' ? spec : 'full width'}
          className={borderX ? 'flex-1 rounded-0 border-y-0' : 'flex-1'}
        >
          {content === 'list' && <ListRows count={9} />}
          {content === 'text' && (
            <>
              <Lines count={3} height={22} />
              <Lines count={10} />
            </>
          )}
          {content === 'form' && <Fields count={6} />}
          {content === 'cards' && <Cards cols={1} rows={3} height={200} />}
        </Box>
      </div>
    </div>
  </>
);

export const narrowColumn: Category = {
  title: 'Narrow column',
  summary:
    'One centred column between 640 and 896px wide, with the page around it left empty on laptop.',
  intro: (
    <p>
      This is the most common category, and it has the most widths: 640, 672,
      680, 768 and 896px. 680px (42.5rem) comes from the old pageContainer
      class, which isn&apos;t centred on smaller laptops.
    </p>
  ),
  variants: [
    {
      name: '680px page container',
      production: { story: 'notifications', url: '/notifications' },
      routes: [
        '/notifications',
        '/scheduled',
        '/posts/[id]/edit',
        '/squads/new',
      ],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader',
        tablet: 'LayoutHeader',
        phone: 'Shell block',
      },
      widths: [
        '.pageContainer: max-width 42.5rem · 680px (utilities.module.css)',
        'PageContainer / ResponsivePageContainer add px-4 tablet:px-8 laptop:border-x py-6 (utilities/common.tsx:44)',
        'Write pages: laptop:!max-w-[42.5rem] !max-w-[100vw] with border-x (post/freeform/write/common.tsx:4)',
      ],
      flags: [
        'Between 1020 and 1359px the container is offset by margin-left: calc(50% - 18.25rem), so it sits 3rem right of centre. It only centres from laptopL.',
      ],
      notes:
        '/posts/[id]/edit and /squads/new hide the phone bottom bar; on phone the post author gets a full-screen composer.',
      render: (bp) =>
        column(bp, {
          max: 680,
          label: 'Page container',
          spec: 'max-w 42.5rem · 680px · border-x',
          borderX: true,
        }),
    },
    {
      name: '680px centred column',
      production: { story: 'tips', url: '/tips' },
      routes: ['/daily-quests', '/tips'],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader',
        tablet: 'LayoutHeader',
        phone: 'Shell block',
      },
      widths: ['mx-auto max-w-[42.5rem] · 680px (tips.tsx:224)'],
      notes:
        'The same width as the page container, centred with mx-auto instead.',
      render: (bp) =>
        column(bp, {
          max: 680,
          label: 'Column',
          spec: 'mx-auto max-w-[42.5rem] · 680px',
          content: 'cards',
        }),
    },
    {
      name: '768px column',
      production: { story: 'best-of-year', url: '/posts/best-of/2025' },
      routes: [
        '/analytics',
        '/posts/[id]/analytics',
        '/briefing/generate',
        '/jobs',
        '/jobs/how-it-works',
        '/squads/moderate',
        '/posts/best-of/[year]',
        '/posts/best-of/[year]/[month]',
        '/tags/[tag]/best-of/[year]',
        '/tags/[tag]/best-of/[year]/[month]',
        '/sources/[source]/best-of/[year]',
        '/sources/[source]/best-of/[year]/[month]',
      ],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader',
        tablet: 'LayoutHeader',
        phone: 'Shell block',
      },
      widths: [
        'max-w-[48rem] · 768px: analytics (analytics/index.tsx:149), post analytics (:448)',
        'laptop:max-w-[48rem] laptop:border-x: briefing/generate, jobs, jobs/how-it-works (jobs/index.tsx:96)',
        'max-w-3xl · 768px: best-of ranked lists (ArchiveFeedPage.tsx:107, inside PageWrapperLayout tablet:p-4 laptop:p-10), squads/moderate as a laptop:rounded-16 card',
      ],
      notes:
        '/analytics and /posts/[id]/analytics have no phone bottom bar, and /squads/moderate hides it.',
      render: (bp) =>
        column(bp, {
          max: 768,
          label: 'Column',
          spec: 'max-w-[48rem] / max-w-3xl · 768px',
          content: 'text',
        }),
    },
    {
      name: '768px column under a banner, left-aligned',
      production: { story: 'marketplace-submit', url: '/marketplace/submit' },
      routes: ['/marketplace/submit', '/marketplace/submissions'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Marketplace' },
      widths: [
        'MarketplacePageLayout: a full-bleed hero h-48 tablet:h-56, then PageWrapperLayout px-4 py-6',
        'max-w-3xl · 768px with no mx-auto (submit.tsx:56, submissions.tsx:60)',
      ],
      flags: [
        'The only narrow column that is not centred: without mx-auto it hugs the left edge on laptop.',
      ],
      render: (bp) =>
        column(bp, {
          max: 768,
          label: 'Form',
          spec: 'max-w-3xl · 768px · no mx-auto',
          content: 'form',
          banner: true,
          left: true,
        }),
    },
    {
      name: '672px column',
      production: { story: 'highlights', url: '/highlights' },
      routes: ['/highlights', '/highlights/all', '/highlights/[channel]'],
      chrome: 'app',
      bottomBar: true,
      header: {
        laptop: 'PageHeader · channel tabs',
        tablet: 'Inline title',
        phone: 'Highlights',
      },
      widths: ['mx-auto w-full max-w-2xl · 672px (HighlightsPage.tsx:254)'],
      notes: '/agents, /agents/arena and /agents/[entityId] redirect here.',
      render: (bp) =>
        column(bp, {
          max: 672,
          label: 'Highlights',
          spec: 'max-w-2xl · 672px',
        }),
    },
    {
      name: '640px column',
      production: { story: 'achievement', url: '/achievements/[id]' },
      routes: ['/achievements/[id]'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Achievement' },
      widths: [
        'mx-auto max-w-[40rem] · 640px py-6, in PageWrapperLayout tablet:p-4 laptop:p-10 (achievements/[id].tsx:58)',
      ],
      render: (bp) =>
        column(bp, {
          max: 640,
          label: 'Achievement',
          spec: 'max-w-[40rem] · 640px',
          content: 'text',
        }),
    },
    {
      name: '896px column',
      production: { story: 'agents-ask', url: '/agents/ask' },
      routes: ['/agents/ask', '/quiz/ai-fluency'],
      chrome: 'app',
      bottomBar: true,
      header: { phone: 'Shell block' },
      widths: [
        'agents/ask: mx-auto max-w-xl laptop:max-w-4xl · 896px, centred vertically (agents/ask/index.tsx:129)',
        'quiz: mx-auto max-w-4xl · 896px px-4 py-8 laptop:py-10 with stacked rounded-16 cards (quiz/ai-fluency.tsx:383)',
      ],
      notes:
        '/quiz/ai-fluency uses MainLayout alone, so it has no phone bottom bar.',
      render: (bp) =>
        column(bp, {
          max: 896,
          label: 'Column',
          spec: 'max-w-4xl · 896px',
          content: 'cards',
        }),
    },
    {
      name: 'Composer modal over an empty page',
      production: { story: 'squads-create', url: '/squads/create' },
      routes: ['/squads/create'],
      chrome: 'app',
      header: { phone: 'Hidden shell' },
      widths: [
        'An always-open SmartComposerModal over an empty page, with <ShellPage hidden />',
      ],
      notes: 'No phone bottom bar.',
      render: (bp) => (
        <Overlay
          label="SmartComposerModal"
          spec={bp === 'phone' ? 'full screen' : 'centred modal'}
          width={bp === 'phone' ? '100%' : 760}
          height={bp === 'phone' ? '100%' : 560}
        />
      ),
    },
  ],
};
