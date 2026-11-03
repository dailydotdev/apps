import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Center, Col, Fields, Lines, Row } from '../kit';

const pad = (bp: Bp) => (bp === 'phone' ? 16 : 32);

const centred = (
  bp: Bp,
  {
    max,
    spec,
    content = 'cards',
    cols = 3,
  }: {
    max: number;
    spec: string;
    content?: 'cards' | 'form' | 'text';
    cols?: number;
  },
) => (
  <Center max={max} style={{ flex: 1, padding: pad(bp) }}>
    <Box
      label="Column"
      spec={bp === 'laptop' ? spec : 'full width'}
      className="flex-1"
    >
      {content === 'cards' && (
        <Cards cols={bp === 'laptop' ? cols : 1} rows={2} height={200} />
      )}
      {content === 'form' && <Fields count={5} />}
      {content === 'text' && <Lines count={10} />}
    </Box>
  </Center>
);

/** Two columns on laptop, one below. */
const pair = (
  bp: Bp,
  {
    max,
    left,
    leftSpec,
    leftWidth,
    right,
    rightSpec,
    gap = 16,
  }: {
    max: number;
    left: string;
    leftSpec: string;
    leftWidth?: number;
    right: string;
    rightSpec: string;
    gap?: number;
  },
) =>
  bp === 'laptop' ? (
    <Center max={max} style={{ flex: 1, padding: pad(bp) }}>
      <Row gap={gap} style={{ flex: 1 }}>
        <Box
          label={left}
          spec={leftSpec}
          style={leftWidth ? { width: leftWidth } : undefined}
          className={leftWidth ? 'shrink-0' : 'flex-1'}
        >
          <Lines count={8} />
        </Box>
        <Box tone="aside" label={right} spec={rightSpec} className="flex-1">
          <Fields count={4} />
        </Box>
      </Row>
    </Center>
  ) : (
    <Col style={{ flex: 1, padding: pad(bp) }}>
      <Box label="Single column" spec="full width · p-6" className="flex-1">
        <Lines count={6} />
        <Fields count={3} />
      </Box>
    </Col>
  );

export const productChrome: Category = {
  title: 'Own product chrome',
  summary:
    "Pages that leave the app's sidebar for a product header of their own (recruiter, Plus, Cores) or a bare global header.",
  intro: (
    <p>
      None of these pages show the app navigation. Each product draws its own
      header, and the content is a centred column or a pair of columns. The
      phone bottom bar never appears, except on 404.
    </p>
  ),
  variants: [
    {
      name: 'Recruiter app',
      production: { story: 'recruiter-dashboard', url: '/recruiter/dashboard' },
      routes: [
        '/recruiter/dashboard',
        '/recruiter/opportunities/[id]',
        '/recruiter/review',
        '/recruiter/review/[id]',
        '/recruiter/[opportunityId]/plans',
        '/recruiter/billing',
        '/recruiter/organizations/[orgId]',
        '/recruiter/[opportunityId]/matches/intros',
        '/recruiter/[opportunityId]/matches/feedback',
      ],
      chrome: 'product',
      product: 'Recruiter header · sticky h-14 laptop:h-16',
      widths: [
        'RecruiterLayout / RecruiterSelfServeLayout → shared RecruiterLayout, flex-col gap-5 laptop:gap-10 (RecruiterLayout.tsx:33)',
        'dashboard: mx-4 mt-10 max-w-[47.875rem] · 766px tablet:mx-auto',
        'opportunity detail and plans: max-w-[64rem] · 1024px',
        'review, billing, organizations: max-w-4xl · 896px',
        'intros: max-w-2xl · 672px; feedback: max-w-3xl · 768px',
      ],
      notes:
        'Card grids go up to laptop:grid-cols-3/4 and collapse to 1–2 columns.',
      render: (bp) =>
        centred(bp, { max: 1024, spec: 'max-w-[64rem] · 1024px (widest)' }),
    },
    {
      name: 'Recruiter matches',
      production: {
        story: 'recruiter-matches',
        url: '/recruiter/[opportunityId]/matches',
      },
      routes: ['/recruiter/[opportunityId]/matches'],
      chrome: 'product',
      product: 'Recruiter header',
      widths: [
        'A title-and-tabs bar (ConnectHeader) and progress, then a full-width bg-background-subtle work area with a match card or a centred checklist (matches/index.tsx:186)',
      ],
      render: (bp) => (
        <>
          <Box
            tone="nav"
            label="ConnectHeader · title + tabs + progress"
            className="h-28 shrink-0 rounded-0"
          />
          <div className="flex flex-1 flex-col bg-background-subtle">
            {centred(bp, { max: 768, spec: 'match card', content: 'text' })}
          </div>
        </>
      ),
    },
    {
      name: 'Opportunity flow',
      production: { story: 'job-done', url: '/jobs/[id]/done' },
      routes: [
        '/jobs/[id]/approved',
        '/jobs/[id]/decline',
        '/jobs/[id]/done',
        '/jobs/[id]/notify',
        '/jobs/[id]/passive-done',
        '/jobs/[id]/preference',
        '/jobs/[id]/preference-done',
        '/jobs/[id]/questions',
        '/jobs/[id]/questions-setup',
      ],
      chrome: 'product',
      product: 'Recruiter header · logo only',
      widths: [
        'getOpportunityProtectedLayout → RecruiterLayout, NoSidebarLayout with hideBackButton',
        'One column mx-4 tablet:mx-auto tablet:max-w-[35rem] · 560px',
        'questions-setup: max-w-3xl · 768px',
      ],
      notes:
        'The column has laptop:flex-row but only one child, so it never splits.',
      render: (bp) =>
        centred(bp, {
          max: 560,
          spec: 'tablet:max-w-[35rem] · 560px',
          content: 'form',
        }),
    },
    {
      name: 'Plus',
      production: { story: 'plus', url: '/plus' },
      routes: ['/plus', '/plus/gift', '/plus/payment', '/plus/success'],
      chrome: 'product',
      product: 'PlusHeader · h-16 + back',
      widths: [
        'Forced dark theme, a full-bleed background image, min-h-dvh (PlusLayout.tsx:49)',
        '/plus: two columns gap-20, left w-[28.5rem] · 456px + checkout; banner max-w-[62rem] (PlusDesktop.tsx:90)',
        '/plus/payment: centred laptop:w-[34.875rem] · 558px; /plus/success: max-w-[28.5rem] · 456px',
        'Below laptop: PlusMobile, one column with p-6',
      ],
      render: (bp) =>
        pair(bp, {
          max: 992,
          left: 'Plan pitch',
          leftSpec: 'w-[28.5rem] · 456px',
          leftWidth: 456,
          right: 'Checkout',
          rightSpec: 'flex-1',
          gap: 80,
        }),
    },
    {
      name: 'Cores',
      production: { story: 'cores', url: '/cores' },
      routes: ['/cores', '/cores/payment'],
      chrome: 'product',
      product: 'Cores header · h-16 + back',
      widths: [
        'Laptop: max-w-[63.75rem] · 1020px flex gap-4: options flex-1 + checkout flex-1, FAQ below (cores/index.tsx:159)',
        'Below laptop: CorePageMobile, one gradient column; /cores/payment is a single mobile checkout column',
      ],
      render: (bp) =>
        pair(bp, {
          max: 1020,
          left: 'Options',
          leftSpec: 'flex-1',
          right: 'Checkout',
          rightSpec: 'flex-1',
        }),
    },
    {
      name: 'No-sidebar centred',
      production: { story: 'pay', url: '/pay' },
      routes: ['/pay', '/recruiter-spam-to-cores', '/squads/[handle]/[token]'],
      chrome: 'no-sidebar',
      header: { phone: 'Shell block' },
      widths: [
        'pay: a centred m-auto laptop:w-[34.875rem] · 558px checkout card (pay.tsx:38)',
        'recruiter-spam-to-cores: mx-4 mt-10 mb-20 max-w-[47.875rem] · 766px tablet:mx-auto',
        'squad invite: PageContainer (42.5rem · 680px) items-center pt-10 tablet:pt-20',
      ],
      render: (bp) =>
        centred(bp, {
          max: 558,
          spec: 'laptop:w-[34.875rem] · 558px',
          content: 'form',
        }),
    },
    {
      name: '404',
      production: { story: 'not-found', url: '/404' },
      routes: ['/404'],
      chrome: 'none',
      bottomBar: true,
      widths: [
        'FooterNavBarLayout only: the phone bottom bar and nothing else (404.tsx:34)',
        'PageContainer min-h-page, inner max-w-[26.25rem] · 420px (Custom404.tsx:40)',
      ],
      render: () => (
        <div className="flex flex-1 items-center justify-center p-4">
          <Box
            label="Not found"
            spec="max-w-[26.25rem] · 420px"
            style={{ width: 420, maxWidth: '100%' }}
          >
            <Lines count={4} />
          </Box>
        </div>
      ),
    },
  ],
};
