import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Cards, Col, Fields, Lines, Row, Tabs } from '../kit';

const card = (bp: Bp, max: number, spec: string) => (
  <div className="flex flex-1 items-center justify-center p-4">
    <Box
      label="Card"
      spec={bp === 'phone' ? 'full width' : spec}
      style={{ width: max, maxWidth: '100%' }}
    >
      <span className="size-12 rounded-12 bg-surface-float" />
      <Lines count={2} height={20} />
      <Fields count={2} />
    </Box>
  </div>
);

const Stepper = () => (
  <Box
    tone="nav"
    label="Sticky header + stepper"
    className="h-24 shrink-0 rounded-0"
  />
);

export const funnelAuth: Category = {
  title: 'Funnel & auth',
  summary:
    'Full-screen flows with no app chrome: a stepper with one step at a time, a centred card, or a split screen.',
  intro: (
    <p>
      These routes have no getLayout, or one that renders only providers, so
      _app adds nothing around them. Each draws its own top bar if it needs one.
    </p>
  ),
  variants: [
    {
      name: 'Onboarding funnel',
      production: { story: 'onboarding', url: '/onboarding' },
      routes: ['/onboarding', '/helloworld', '/helloworld/[id]', '/activate'],
      chrome: 'none',
      widths: [
        'FunnelStepper, a full-screen flex min-h-dvh (onboarding.tsx:490), with FunnelStepTopBar sticky px-6 pt-6',
        'Each step sets its own width: mostly max-w-96 · 384px, max-w-[30rem] · 480px, max-w-[48rem] · 768px or max-w-[64rem] · 1024px',
        '/activate: OnboardingHeader over an activation primer, min-h-dvh',
      ],
      render: (bp) => (
        <>
          <Box
            tone="nav"
            label="Step top bar"
            className="h-20 shrink-0 rounded-0"
          />
          <div className="flex flex-1 flex-col items-center p-6">
            <Box
              label="Step"
              spec={bp === 'phone' ? 'full width' : 'max-w-[48rem] · 768px'}
              style={{ width: 768, maxWidth: '100%' }}
              className="flex-1"
            >
              <Lines count={2} height={24} />
              <Cards cols={bp === 'phone' ? 2 : 3} rows={2} height={140} />
            </Box>
          </div>
        </>
      ),
    },
    {
      name: 'Auth card',
      production: { story: 'reset-password', url: '/reset-password' },
      routes: [
        '/verification',
        '/reset-password',
        '/callback',
        '/oauth/consent',
        '/oauth/login',
        '/join/organization',
      ],
      chrome: 'none',
      widths: [
        'Centred in min-h-screen, max-w-[30rem] · 480px (verification.tsx:36, reset-password.tsx:28)',
        'callback and oauth: a rounded-16 border p-6 card (callback.tsx:132, oauth/consent.tsx:134)',
        'join/organization: max-w-[40rem] · 640px over squad-background-fade',
      ],
      render: (bp) => card(bp, 480, 'max-w-[30rem] · 480px'),
    },
    {
      name: 'Recruiter wizard',
      production: { story: 'recruiter', url: '/recruiter' },
      routes: [
        '/recruiter',
        '/recruiter/[opportunityId]/analyze',
        '/recruiter/[opportunityId]/questions',
      ],
      chrome: 'none',
      widths: [
        'RecruiterFullscreenLayout: flex min-h-screen flex-col, no header (RecruiterFullscreenLayout.tsx:29)',
        'Each page draws a sticky header (logo, title, CTA) and RecruiterProgress',
        'Centred max-w-3xl · 768px on bg-background-subtle (AnalyzeContent.tsx:27, questions.tsx:260)',
        '/recruiter: a 766px dashboard, or a blurred onboarding backdrop with a modal on top',
      ],
      render: (bp) => (
        <>
          <Stepper />
          <div className="flex flex-1 flex-col items-center bg-background-subtle p-6">
            <Box
              label="Step"
              spec={bp === 'phone' ? 'full width' : 'max-w-3xl · 768px'}
              style={{ width: 768, maxWidth: '100%' }}
              className="flex-1"
            >
              <Fields count={5} />
            </Box>
          </div>
        </>
      ),
    },
    {
      name: 'Split editor',
      production: {
        story: 'recruiter-edit',
        url: '/recruiter/[opportunityId]/edit',
      },
      routes: [
        '/recruiter/[opportunityId]/edit',
        '/recruiter/[opportunityId]/prepare',
      ],
      chrome: 'none',
      widths: [
        'Left panel w-1/3 max-w-md · 448px (prepare adds min-w-80) + a flex-1 preview pane with p-6 (edit.tsx:292, prepare.tsx:149)',
        'Below laptop: one tabbed column (edit.tsx:329)',
      ],
      render: (bp) => (
        <>
          <Stepper />
          {bp === 'laptop' ? (
            <Row gap={0} style={{ flex: 1 }}>
              <Box
                tone="nav"
                label="Editor"
                spec="w-1/3 max-w-md · 448px"
                style={{ width: 448 }}
                className="shrink-0 rounded-0"
              >
                <Fields count={6} />
              </Box>
              <div className="flex flex-1 p-6">
                <Box label="Preview" spec="flex-1 · p-6" className="flex-1">
                  <Lines count={10} />
                </Box>
              </div>
            </Row>
          ) : (
            <Col style={{ flex: 1, padding: 16 }}>
              <Tabs count={2} />
              <Box label="Editor / Preview" spec="tabbed" className="flex-1">
                <Fields count={5} />
              </Box>
            </Col>
          )}
        </>
      ),
    },
    {
      name: 'Split-screen checkout',
      production: {
        story: 'recruiter-payment',
        url: '/recruiter/[opportunityId]/payment',
      },
      routes: [
        '/recruiter/[opportunityId]/payment',
        '/recruiter/pay/[opportunityId]',
      ],
      chrome: 'none',
      widths: [
        'flex min-h-screen flex-col laptop:flex-row: two flex-1 halves at p-10 px-20, each with an inner max-w-[30rem] · 480px (payment.tsx:117)',
        'Below laptop the halves stack',
      ],
      render: (bp) => {
        const half = (label: string, tone: 'main' | 'aside') => (
          <div
            className="flex flex-1 justify-center"
            style={{ padding: bp === 'phone' ? 16 : 40 }}
          >
            <Box
              tone={tone}
              label={label}
              spec="max-w-[30rem] · 480px"
              style={{ width: 480, maxWidth: '100%' }}
            >
              <Fields count={3} />
            </Box>
          </div>
        );
        return bp === 'laptop' ? (
          <Row gap={0} style={{ flex: 1 }}>
            {half('Order summary', 'aside')}
            {half('Payment', 'main')}
          </Row>
        ) : (
          <Col gap={0} style={{ flex: 1 }}>
            {half('Order summary', 'aside')}
            {half('Payment', 'main')}
          </Col>
        );
      },
    },
  ],
};
