import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { Card, Grid } from './kit';

const meta: Meta = {
  title: 'Startups Onboarding/3c. Design guidelines',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const groups: { title: string; note?: string; rules: [string, string][] }[] = [
  {
    title: 'What we decided',
    note: 'The final choices from review. Options that lost stay on Design choices and Notes.',
    rules: [
      [
        'Form',
        '440px wide on every step. It starts at one height, centred on the page. Tall steps, Plan and Set up, start right under the stepper.',
      ],
      [
        'Stepper',
        'Answer chips. The current step is flat lilac with no glow, and finished steps get a green check. The first stays Account, and on phones the chips only appear after sign-up.',
      ],
      [
        'Logo label',
        'The soft style from business.daily.dev: the text leads, with a faint fill and border.',
      ],
      [
        'Ways in',
        'GitHub, Google and email are the same white button with a small icon, and no divider. Email and password have their own screen.',
      ],
      [
        'Main button',
        "Every step's main action uses the funnel's double-border button.",
      ],
      [
        'Check your email',
        'As in production: the email icon, then the code, then resend and change email, all above Verify.',
      ],
      [
        'Phones',
        'The logo and label are centred. Back is an arrow icon beside them, and on desktop it stays a text link.',
      ],
      [
        'Copy',
        'Code sits in its box, with a full-width copy button below it, the same on every page.',
      ],
      [
        'Finished means green',
        'Checks on the stepper, the checklist and Setting up are all green. Setting up shows every step from the start.',
      ],
      [
        'Already paid',
        'A page already on a plan says so with a label on its row and a tooltip, and the main button becomes Manage subscription.',
      ],
      [
        'Failures with nothing to show',
        'The charm empty state, centred, with its illustration above the title. Never a box.',
      ],
      [
        'Manage',
        'Plan is now Subscription, with the credit card, in its own Billing group. Seats are a count, never a progress bar. Manage billing is the Subtle button.',
      ],
      [
        'The box',
        'Corners are concentric: 26px outside, 8px padding, 18px inside. Everything in it is clipped to the inner radius.',
      ],
    ],
  },
  {
    title: 'How it behaves',
    note: "From Vercel's Web Interface Guidelines, Rauno Freiberg, Emil Kowalski, Jakub Krehel, NN/g and web.dev. The numbers are one author's taste unless noted. Short interactions, transform and opacity only, reduced motion and visible focus are widely agreed.",
    rules: [
      [
        'Nothing above a click moves',
        'The form starts at one height on every screen, and space for errors is kept. CLS 0.1 is the published limit, and we aim for none.',
      ],
      [
        'Interactions take 200ms or less',
        'Step changes are a 200ms fade and a 4px rise, ease-out. Nothing animates on actions people repeat, like typing.',
      ],
      [
        'Press gives feedback',
        'Buttons go to 97% for 120ms. With reduced motion, they stay still and steps only fade.',
      ],
      [
        'Only transform and opacity move',
        'No transition: all. Colours fade separately, in 150ms.',
      ],
      [
        'Focus is always visible',
        'A 2px lilac outline on keyboard focus, and never a bare outline-none.',
      ],
      [
        'Buttons stay enabled until the request starts',
        'An empty Continue says what is missing instead of doing nothing. Then a spinner, keeping the label.',
      ],
      [
        'Fields help the browser',
        'The right type and autocomplete on every field, so password managers and autofill work. Paste always works.',
      ],
      [
        'Selected states keep their width',
        'No font weight changes between chips or tabs, so neighbours never shift.',
      ],
      [
        'Skeletons mirror what is coming',
        'Only where a real fetch is visible, with the shape of the result. Failures with nothing to show use the charm empty state.',
      ],
    ],
  },
  {
    title: 'Where each look belongs',
    rules: [
      [
        'Checkout',
        'A focused moment right after the landing page. It can carry the double border, gradient and drifting glows.',
      ],
      [
        'Inside the product',
        'Manage and the squad page use normal platform cards: one hairline border, no motion. The premium touch is a faint brand wash from the top, once per screen.',
      ],
      [
        'Colour',
        "Lilac from the landing page belongs to the checkout. Inside the product, use the platform's own accents.",
      ],
    ],
  },
  {
    title: 'The right side',
    note: 'It should always earn its space.',
    rules: [
      [
        'First step',
        'The crew on the full round base, with the line and the agents above. On phones, the art takes the top half and fades into the page, as on our sign-up wall.',
      ],
      [
        'Early steps',
        'The company step is the card stunt: the seats spell the name as it is typed, at any length. Setting up keeps the same art.',
      ],
      [
        'Real forms',
        'Fill the whole box on a flat surface. Never float a real form over glows, because it reads as a picture.',
      ],
      [
        'Last step',
        'The real page, filling the box, filling in as each item gets done.',
      ],
    ],
  },
  {
    title: 'Keep everything the product does',
    rules: [
      [
        'A redesign is not a cut',
        "Every row, description, action and state in today's build must exist in the proposal, unless it is removed on purpose and written down here.",
      ],
      [
        'Removed on purpose',
        'Username on email sign-up (generated, as social sign-ups do) and the marketing opt-out box (social sign-ups already send no consent). Both need a yes from you.',
      ],
      [
        'Log-in',
        'Keeps all four providers. Existing accounts may have used any of them.',
      ],
    ],
  },
  {
    title: 'States',
    rules: [
      [
        'Never a dead end',
        'Every failure says what happened, and what to do next.',
      ],
      [
        'Money',
        'When something fails around payment, say whether they were charged, and never offer to pay twice.',
      ],
      [
        'Loading',
        'Skeletons in the shape of what is coming. Nothing goes blank.',
      ],
      [
        'Done',
        'A finished item has a check and an Edit action. A finished list collapses, so it stops asking for attention.',
      ],
    ],
  },
  {
    title: 'Layout and spacing',
    rules: [
      [
        'Headings stay put',
        "The heading sits at the same height on every step, so the page doesn't jump between them.",
      ],
      [
        'Related things touch',
        'Keep 12px between related items and 24px between sections. The last field sits 32px above the button, leaving room for its message.',
      ],
      [
        'Long text',
        "Fades out where it is cut, so it doesn't look clipped by accident.",
      ],
      [
        'Long names',
        'Wrap, and never truncate a company name the buyer just typed.',
      ],
    ],
  },
  {
    title: 'Words',
    rules: [
      [
        'Names',
        'Always "daily.dev". "Cashback", never "Cores", for founders. "Millions of developers", never a number.',
      ],
      [
        'Proof',
        'Only real numbers and quotes from the live sites. Customers are Ads customers, so never say they use Startups.',
      ],
      [
        'Buttons',
        'Say what happens: "Add product", "Copy prompt", "Subscribe now". Avoid "Submit" and "OK".',
      ],
    ],
  },
];

export const Guidelines: StoryObj = {
  name: 'Guidelines',
  render: (): ReactElement => (
    <Page
      eyebrow="The rules behind this design"
      title="Design guidelines"
      intro="Drawn from your reviews so far, so every new screen starts from them. They're a draft for you to change."
    >
      {groups.map(({ title, note, rules }) => (
        <Section key={title} title={title} note={note}>
          <Grid columns={3}>
            {rules.map(([rule, body]) => (
              <Card key={rule} title={rule}>
                {body}
              </Card>
            ))}
          </Grid>
        </Section>
      ))}
    </Page>
  ),
};
