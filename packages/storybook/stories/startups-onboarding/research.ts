// Sourced findings behind the recommendations. Tags say what kind of source
// each one is. Checkout research is e-commerce, not SaaS, so it is a guide
// rather than a forecast.

export enum SourceKind {
  Research = 'Research',
  VendorDoc = 'Docs',
  Observed = 'Observed',
}

export interface Finding {
  claim: string;
  source: string;
  url: string;
  kind: SourceKind;
}

export const groups: { title: string; findings: Finding[] }[] = [
  {
    title: 'Steps, fields and progress',
    findings: [
      {
        claim:
          'Field count matters more than step count: the average checkout has 5.1 steps and 11.3 fields, and 8 fields are enough.',
        source: 'Baymard',
        url: 'https://baymard.com/blog/checkout-flow-average-form-fields',
        kind: SourceKind.Research,
      },
      {
        claim:
          'A constant progress indicator did not cut drop-off in 32 randomized survey experiments. Fast-to-slow did, slow-to-fast raised it. These were surveys, not onboarding.',
        source: 'Villar et al., 2013',
        url: 'https://research.google/pubs/pub41653',
        kind: SourceKind.Research,
      },
      {
        claim:
          'Test without a progress indicator first: it often goes unnoticed and is poor on small screens.',
        source: 'GOV.UK Design System',
        url: 'https://design-system.service.gov.uk/patterns/question-pages/',
        kind: SourceKind.VendorDoc,
      },
      {
        claim: 'Step indicators need three or more sections and a fixed count.',
        source: 'USWDS',
        url: 'https://designsystem.digital.gov/components/step-indicator/',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Wizards should show labelled steps, explicit back, save and resume.',
        source: 'NN/g, 2017',
        url: 'https://www.nngroup.com/articles/wizards/',
        kind: SourceKind.Research,
      },
      {
        claim: 'Single-column forms produce fewer errors.',
        source: 'Baymard, 2023',
        url: 'https://baymard.com/blog/avoid-multi-column-forms',
        kind: SourceKind.Research,
      },
      {
        claim:
          'Asking for an account later performed better, with no numbers published. 18% of shoppers name forced accounts as a reason they abandoned.',
        source: 'Baymard',
        url: 'https://baymard.com/blog/delayed-account-creation',
        kind: SourceKind.Research,
      },
    ],
  },
  {
    title: 'Onboarding steppers',
    findings: [
      {
        claim:
          'Deck: thin segments with a glowing current one above a large headline. Riverside: dots with a stretched current one, in a bar with Skip and Continue.',
        source: 'Nicelydone, 5 Nov 2026',
        url: 'https://vzero.nicelydone.club/examples/components/progress-indicator',
        kind: SourceKind.Observed,
      },
      {
        claim:
          'Lightspark: a vertical stepper with numbered steps and sub-steps. Tembo: a checklist card with a percentage. Zaro: Back, "Step 1 of 3" and a bar on one row.',
        source: 'Nicelydone, 5 Nov 2026',
        url: 'https://vzero.nicelydone.club/examples/components/stepper',
        kind: SourceKind.Observed,
      },
      {
        claim:
          'Remote: a vertical stepper with checks beside the setup form. FullEnrich: an unlabelled progress bar with Back and Next.',
        source: 'SaaSFrame',
        url: 'https://www.saasframe.io/patterns/stepper',
        kind: SourceKind.Observed,
      },
      {
        claim:
          'A side summary can sit beside a stepper form, and is not needed on mobile.',
        source: 'Mirakl design system',
        url: 'https://design.mirakl.com/design/patterns/forms/stepper-form',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Fill steps in order, disable later ones until earlier ones succeed, and label every step, visually hidden if needed.',
        source: 'Helsinki Design System',
        url: 'https://hds.hel.fi/components/stepper',
        kind: SourceKind.VendorDoc,
      },
    ],
  },
  {
    title: 'Sign-up screen',
    findings: [
      {
        claim:
          "Google's button must be at least as prominent as other providers. No order is specified.",
        source: 'Google',
        url: 'https://developers.google.com/identity/branding-guidelines',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'GitHub is listed first at Supabase, Clerk and Railway; Google at Linear, Vercel and Resend; email at PostHog, Notion and Stripe.',
        source: 'Sign-up pages, 4 Nov 2026',
        url: 'https://supabase.com/dashboard/sign-up',
        kind: SourceKind.Observed,
      },
      {
        claim:
          'Email codes are a welcome trend, but carry app-switching and spam risk.',
        source: 'NN/g, 2023',
        url: 'https://www.nngroup.com/articles/passwordless-accounts/',
        kind: SourceKind.Research,
      },
      {
        claim:
          'Inline validation raised success 22% and cut time 42%, in a small study (22 people) its authors call indicative.',
        source: 'Wroblewski, 2009',
        url: 'https://alistapart.com/article/inline-validation-in-web-forms/',
        kind: SourceKind.Research,
      },
    ],
  },
  {
    title: 'Payment and activation',
    findings: [
      {
        claim:
          "Paddle's inline frame shows no items or totals. Your page has to show items, renewal terms, tax and total, and keep Paddle's footer visible.",
        source: 'Paddle',
        url: 'https://developer.paddle.com/build/checkout/build-branded-inline-checkout',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Provision on subscription.created. Events can arrive out of order and repeat, so reconcile.',
        source: 'Paddle',
        url: 'https://developer.paddle.com/build/subscriptions/provision-access-webhooks',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Webhooks can be delayed. Also trigger idempotent fulfilment from the return page.',
        source: 'Stripe',
        url: 'https://docs.stripe.com/checkout/fulfillment.md?ui=checkout-form',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Use a looped animation for 2 to 10 seconds, and percent-done from 10 seconds.',
        source: 'NN/g, 2014',
        url: 'https://www.nngroup.com/articles/progress-indicators/',
        kind: SourceKind.Research,
      },
      {
        claim:
          'An artificial head start raises completion and speed. Tested on loyalty cards, not software.',
        source: 'Nunes & Drèze, 2006',
        url: 'https://academic.oup.com/jcr/article-abstract/32/4/504/1787425',
        kind: SourceKind.Research,
      },
      {
        claim:
          'Checklist completion averages 19.2%, median 10.1%, across 188 customers.',
        source: 'Userpilot, 2024',
        url: 'https://userpilot.com/blog/?p=197841',
        kind: SourceKind.VendorDoc,
      },
    ],
  },
  {
    title: 'Focused layout',
    findings: [
      {
        claim: 'Main navigation distracts during checkout, so enclose it.',
        source: 'Baymard #606, July 2026',
        url: 'https://baymard.com/guidelines/606-enclosed-checkout-design',
        kind: SourceKind.Research,
      },
      {
        claim:
          'Split-screen sign-up on 3 of 10 developer tools (Supabase, Clerk, Sentry), all with marketing in the panel. No outcome data either way.',
        source: 'Sign-up pages, 4 Nov 2026',
        url: 'https://dashboard.clerk.com/sign-up',
        kind: SourceKind.Observed,
      },
      {
        claim:
          'Linear runs about seven steps with no progress bars. Vercel docs offer a copyable agent prompt plus MCP.',
        source: 'Appcues, Vercel docs',
        url: 'https://vercel.com/docs/getting-started-with-vercel',
        kind: SourceKind.Observed,
      },
    ],
  },
  {
    title: 'Accessibility',
    findings: [
      {
        claim:
          'Email codes must allow paste and autofill. Never block password managers.',
        source: 'WCAG 2.2, 3.3.8 AA',
        url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html',
        kind: SourceKind.VendorDoc,
      },
      {
        claim: 'Do not ask for the same thing twice in one process.',
        source: 'WCAG 2.2, 3.3.7 A',
        url: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html',
        kind: SourceKind.VendorDoc,
      },
      {
        claim: 'Announce busy and progress states without moving focus.',
        source: 'WCAG 2.2, 4.1.3 AA',
        url: 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
        kind: SourceKind.VendorDoc,
      },
      {
        claim: 'Put "Step 2 of 4" first in the page title and the heading.',
        source: 'W3C WAI',
        url: 'https://www.w3.org/WAI/tutorials/forms/multi-page/',
        kind: SourceKind.VendorDoc,
      },
      {
        claim:
          'Error summary above the heading, takes focus, links to the fields.',
        source: 'GOV.UK Design System',
        url: 'https://design-system.service.gov.uk/components/error-summary/',
        kind: SourceKind.VendorDoc,
      },
    ],
  },
];

export const unsourced = [
  'A/B results for enclosed checkout or split-screen sign-up',
  'Which provider order or provider count converts best',
  'Independent email code vs password conversion data',
  'A stepper vs a bar vs "Step 2 of 4", tested head to head',
  'The current onboarding steppers at Stripe, Ramp and Mercury',
  'How long Paddle webhooks usually take',
  'Outcome data for "one next action" after payment',
  'Checklist A/B tests, or a head start tested in software onboarding',
];
