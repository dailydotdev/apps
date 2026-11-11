import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { Page, Section } from '../onboarding-fixes/kit';
import { Frame } from './frame';
import { storyId } from './kit';
import { Providers } from './providers';
import {
  ActivatingScreen,
  CompanyScreen,
  PaddleState,
  PlanScreen,
} from './screens';

const meta: Meta = {
  title: 'Startups Onboarding/4. States and recoveries',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const HandleFailed: Story = {
  name: 'Couldn’t check the name',
  render: () => (
    <CompanyScreen
      initialName="Acme"
      error="We couldn't check that name. Your connection may have dropped, so try again."
    />
  ),
};

export const Creating: Story = {
  name: 'Creating the page',
  render: () => <CompanyScreen initialName="Acme" isBusy />,
};

export const AlreadyOnPlan: Story = {
  name: 'Already on a plan',
  render: () => (
    <CompanyScreen
      existing={[
        {
          name: 'Acme',
          handle: 'acme',
          planTitle: 'Starter',
          image: '/squad-page/acme-logo.svg',
        },
      ]}
    />
  ),
};

export const PaddleFailed: Story = {
  name: 'Payment form didn’t load',
  render: () => <PlanScreen paddleState={PaddleState.Failed} />,
};

export const Slow: Story = {
  name: 'Taking longer than usual',
  render: () => <ActivatingScreen plan={SquadPlan.Starter} isSlow />,
};

const Notice = ({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: string;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <p className="font-bold typo-callout">{title}</p>
    <p className="text-pretty text-text-secondary typo-footnote">{children}</p>
    {action && (
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        className="self-start"
      >
        {action}
      </Button>
    )}
  </div>
);

const flowStates = [
  [
    'Couldn’t check the name',
    'handle-failed',
    'Today the button just resets, with no message.',
  ],
  ['Creating the page', 'creating', 'Today the same, kept.'],
  [
    'Already on a plan',
    'already-on-plan',
    'Today the same message. The new one is plainer.',
  ],
  [
    'Payment form didn’t load',
    'paddle-failed',
    'Today an empty 500px area with no message.',
  ],
  [
    'Taking longer than usual',
    'slow',
    'Today polling stops at 60s. It should keep checking, slower, and say not to pay again.',
  ],
];

export const Overview: Story = {
  name: 'All states',
  render: () => (
    <Page
      eyebrow="Everything that isn't the happy path"
      title="States and recoveries"
      intro="These come from the review of the PR and the API. The flow has them today as dead ends, or as nothing at all."
    >
      {flowStates.map(([title, id, note]) => (
        <Section key={id} title={title} note={note}>
          <Frame
            storyId={storyId('4-states-and-recoveries', id)}
            title={title}
          />
        </Section>
      ))}
      <Section
        title="Coming back mid-flow"
        note="The step and company go in the URL, so refresh and Back work. These guard the money."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Notice title="Refresh while the plan is switching on">
            Return to Setting up, not the company step. Today the page shows no
            plan and offers to pay again. The API rejects the second
            subscription, but the money has already been taken.
          </Notice>
          <Notice title="Closed the tab after paying">
            Same rule when they come back from any entry point: if a payment is
            in flight for this page, show its status and no form. This needs a
            way to know a payment is in flight, so it&apos;s the one item that
            may need the API.
          </Notice>
        </div>
      </Section>
      <Section
        title="After buying: Manage › Subscription"
        note="The API already returns the status. The screen doesn't read it, so all of these look like a page with no plan."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Notice
            title="Your last payment failed"
            action="Update payment method"
          >
            For the owner. Plan features are paused until it goes through. Your
            page and posts stay. Today the owner sees the buy screen with no
            billing button, so they can&apos;t fix the card.
          </Notice>
          <Notice title="Your plan ends on 4 December" action="Manage billing">
            For a plan set to cancel. It stays active until then. Today nothing
            says it&apos;s ending.
          </Notice>
          <Notice title="Your cashback is waiting" action="See plans">
            For a cancelled plan. The balance stays frozen until you
            resubscribe. Today the wallet disappears from the page.
          </Notice>
          <Notice
            title="A former teammate still holds a seat"
            action="Free up seat"
          >
            A demoted teammate keeps their seat and isn&apos;t listed, so it can
            say every seat is taken with nobody to remove. List them here.
          </Notice>
        </div>
      </Section>
    </Page>
  ),
};
