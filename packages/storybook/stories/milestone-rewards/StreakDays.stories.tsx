import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout, CalloutTone, Page, PageHeader, Section, Table } from './shell';
import { sponsoredGiftArt, streakLadder, tierArt } from './data';

const meta: Meta = {
  title: 'Milestone Rewards/1. Streak days and rewards',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const StreakDays: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="The ladder"
        title="Which streak days pay out, and which of them are allowed to be sponsored"
      >
        <p>
          The tier ladder and the flame artwork come from the streak progression
          PR (#5613). This exploration keeps that ladder intact and asks a
          narrower question: on which of these days do we hand over a sponsored
          gift instead of Cores, and what does that popup look like.
        </p>
        <p>
          Four days carry a partner gift: 7, 30, 90 and 365. Everything else
          stays first-party. That spacing is the whole safety model. A sponsored
          gift every fortnight turns the streak into an ad schedule, and the
          first one landing on day 7 means a user has already been here a week
          before a brand appears at all.
        </p>
      </PageHeader>

      <Section
        title="The flames"
        description="Real artwork from the progression PR, at the size the popups use it. The tier is the badge of honour; the gift is a bonus attached to a few of them."
      >
        <div className="grid gap-6 tablet:grid-cols-3 laptop:grid-cols-5">
          {streakLadder.map((milestone) => (
            <div
              key={milestone.day}
              className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
            >
              <img
                src={tierArt(milestone.tier)}
                alt={milestone.label}
                className="h-20 w-20 object-contain"
                style={{
                  filter: 'drop-shadow(0 6px 18px rgba(236, 82, 122, 0.4))',
                }}
              />
              <span className="font-bold typo-callout">{milestone.label}</span>
              <span className="text-text-quaternary typo-caption1">
                Day {milestone.day}
              </span>
              <span
                className={
                  milestone.sponsored
                    ? 'text-accent-bacon-default typo-caption1'
                    : 'text-text-tertiary typo-caption1'
                }
              >
                {milestone.reward}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The sponsored days"
        description="Four days a year at most for a user who never breaks their streak, and realistically two."
      >
        <Table
          head={['Day', 'Tier', 'Reward', 'Who sees it', 'Popup']}
          rows={streakLadder.map((milestone) => [
            <strong key={`${milestone.day}-day`}>Day {milestone.day}</strong>,
            milestone.label,
            milestone.sponsored ? (
              <span
                key={`${milestone.day}-reward`}
                className="flex items-center gap-2 text-accent-bacon-default"
              >
                <img
                  src={sponsoredGiftArt}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                Sponsored gift
              </span>
            ) : (
              milestone.reward
            ),
            milestone.rarity,
            milestone.sponsored
              ? 'Full popup, one of the four variants'
              : 'Existing streak celebration, untouched',
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Never two in a row">
            Day 7 then day 30 then day 90. Wide enough apart that each one feels
            like the streak paying out rather than a subscription to being sold
            to.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Nothing before day 7">
            A gift in the first week reads as the product being a funnel. Let
            people earn the relationship first, then hand them something.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Never on a broken streak">
            Streak lost and streak restore stay clean. A gift next to a failure
            state is a consolation-prize sales pitch.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Never replace a Cores day">
            Sponsored days are their own days. Swapping a promised first-party
            reward for a partner offer is how you turn a reward system into a
            bait and switch.
          </Callout>
        </div>
      </Section>

      <Section
        title="Guardrails"
        description="Config, not code. These are the switches to pull when claim-rate pressure arrives."
      >
        <Table
          head={['Guardrail', 'Value', 'Why']}
          rows={[
            [
              'First sponsored day',
              'Day 7, and never before account age 14 days',
              'Whichever is later. A brand should not be the first thing a new developer meets.',
            ],
            [
              'Sponsored days',
              '7, 30, 90, 365',
              'Four a year at most. Everything else on the ladder stays ours.',
            ],
            [
              'Consecutive ignores before we go quiet',
              '2',
              'Two passes in a row drops the user to the toast for 60 days. Not interested is an answer.',
            ],
            [
              '"Not my thing"',
              'Mutes that category for 90 days',
              'One tap has to visibly change what they get, or the control is decoration.',
            ],
            [
              'Opt-out',
              'Turns gifts off, keeps streak celebrations on',
              'Mirrors the existing DisableReadingStreakMilestone action, but must not silence the streak itself.',
            ],
            [
              'Plus members',
              'Off by default',
              'They already paid to remove noise. Breaking that is worth more than the commission.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Where it attaches"
        description="What exists today in the streak code, and what a sponsored day needs on top of it."
      >
        <Table
          head={['Piece', 'Today', 'What it needs']}
          rows={[
            [
              'Trigger',
              <code key="a" className="typo-caption1">
                StreakMilestonePopup → alerts.showStreakMilestone
              </code>,
              'Already fires outside the boot popup queue. A sponsored day swaps the modal it opens, nothing else changes.',
            ],
            [
              'Streak data',
              <code key="b" className="typo-caption1">
                useReadingStreak → streak.current, streak.max
              </code>,
              'The day number is all the popup needs. The tier comes from the ladder in #5613.',
            ],
            [
              'Artwork',
              <code key="c" className="typo-caption1">
                streak/popup/icons/*.png (PR #5613)
              </code>,
              'Land the icon set with the progression work rather than duplicating it here.',
            ],
            [
              'Opt-out',
              <code key="d" className="typo-caption1">
                ActionType.DisableReadingStreakMilestone
              </code>,
              'A sibling action for gifts specifically, so turning gifts off keeps the celebration.',
            ],
            [
              'Logging',
              <code key="e" className="typo-caption1">
                TargetType.StreaksMilestone
              </code>,
              'Gift impression, claim, dismiss and opt-out events, split by streak day.',
            ],
            [
              'Vault storage',
              'Nothing',
              'Needed so "keep it for later" is real. Client-side persistence loses gifts on a device switch.',
            ],
          ]}
        />
      </Section>
    </Page>
  ),
};
