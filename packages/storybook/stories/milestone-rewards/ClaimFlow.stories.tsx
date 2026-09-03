import React, { useCallback, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Callout, CalloutTone, Cell, Page, PageHeader, Section, Stage } from './shell';
import { offers } from './data';
import { ClaimSheet, ClaimStep, FirstPartyFallback } from './ClaimSheet';

const meta: Meta = {
  title: 'Milestone Rewards/4. Claim flow and edge cases',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const REDIRECT_DELAY = 1600;

const Playground = (): React.ReactElement => {
  const [step, setStep] = useState(ClaimStep.Confirm);

  useEffect(() => {
    if (step !== ClaimStep.Redirecting) {
      return undefined;
    }

    const timer = setTimeout(() => setStep(ClaimStep.Active), REDIRECT_DELAY);

    return () => clearTimeout(timer);
  }, [step]);

  const advance = useCallback(() => {
    setStep((current) =>
      current === ClaimStep.Confirm ? ClaimStep.Redirecting : ClaimStep.Confirm,
    );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Stage height={620}>
        <ClaimSheet
          offer={offers.disneyplus}
          step={step}
          onContinue={advance}
          onClose={() => setStep(ClaimStep.Confirm)}
        />
      </Stage>
      <div className="flex items-center gap-3">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          onClick={() => setStep(ClaimStep.Confirm)}
        >
          Start over
        </Button>
        <span className="text-text-quaternary typo-caption1">
          Confirm names the partner, the terms and our commission before anything
          leaves the page.
        </span>
      </div>
    </div>
  );
};

export const ClaimFlow: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="One sheet, every surface"
        title="Nothing surprising happens after the tap"
      >
        <p>
          Whether a gift was claimed from a reveal, a toast or the vault, the
          claim itself is the same sheet. The user is told they are leaving,
          what the partner will ask for, and what daily.dev gets out of it, all
          before the redirect rather than after.
        </p>
        <p>
          The gift is already written to the vault by the time this sheet opens,
          which is why every failure state below can afford to be relaxed:
          nothing here can lose something the user earned.
        </p>
      </PageHeader>

      <Section title="Playground">
        <Playground />
      </Section>

      <Section
        title="The happy path"
        description="Three states. The middle one exists to make the hand-off legible rather than to fill time. It says where the gift already is, so a failed redirect is not a lost gift."
      >
        <div className="grid items-start gap-8 laptop:grid-cols-3">
          <Cell label="1 · Confirm" note="Terms and commission, above the fold">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Confirm} />
          </Cell>
          <Cell label="2 · Redirecting" note="Not dismissible, ~1.5s">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Redirecting} />
          </Cell>
          <Cell label="3 · Active" note="Includes the renewal warning">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Active} />
          </Cell>
        </div>
        <Callout tone={CalloutTone.Good} title="The renewal line is not optional">
          Most of these gifts turn into paid subscriptions when they lapse. Say
          so on the success screen and commit to reminding people two days
          before. A gift that quietly becomes a charge is the fastest way to
          turn this programme into a support queue.
        </Callout>
      </Section>

      <Section
        title="When it goes wrong"
        description="Every one of these apologises plainly, names what happened, and offers the next useful thing. None of them blame the user or ask them to try harder."
      >
        <div className="grid items-start gap-8 laptop:grid-cols-2">
          <Cell label="Expired" note="Sat in the vault too long">
            <ClaimSheet offer={offers.audible} step={ClaimStep.Expired} />
          </Cell>
          <Cell label="Wrong country" note="Should have been filtered before display">
            <ClaimSheet offer={offers.uber} step={ClaimStep.Unavailable} />
          </Cell>
          <Cell label="Partner pulled it" note="Campaign ended while it was owned">
            <ClaimSheet offer={offers.notion} step={ClaimStep.Withdrawn} />
          </Cell>
          <Cell label="Hand-off failed" note="Retry is safe, nothing was consumed">
            <ClaimSheet offer={offers.nordvpn} step={ClaimStep.Failed} />
          </Cell>
        </div>
      </Section>

      <Section
        title="No sponsored gift fits"
        description="Muted categories, an unsupported country, or empty inventory. The milestone still gets answered with something of ours, which costs us a little and says more about the relationship than any partner offer would."
      >
        <div className="flex flex-wrap items-start gap-10">
          <FirstPartyFallback />
          <div className="flex max-w-[32rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="This is the state to over-invest in">
              It is what a user sees after they tell us their preferences, so it
              is proof the preferences worked. Getting a streak freeze because
              you muted lifestyle offers is the programme keeping its word.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Never fall back to a bad match">
              An unwanted lifestyle offer in place of nothing is worse than
              nothing. If the filter leaves us empty-handed, hand out something
              of ours or stay quiet.
            </Callout>
          </div>
        </div>
      </Section>
    </Page>
  ),
};
