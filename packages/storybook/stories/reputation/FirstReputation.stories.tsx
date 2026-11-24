import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../hero-cover/parts';
import {
  CustomerIoPopover,
  EarnedChip,
  FirstReputationModal,
  FlowArrow,
  PrivilegesUnlockedModal,
  ProfileStats,
  ReputationBadge,
  State,
  StateGrid,
  Status,
  Table,
  UpvoteNotification,
} from './parts';
import {
  FirstReason,
  firstReputations,
  privilegesThreshold,
  STARTING_REPUTATION,
} from './data';

/*
 * The first reputation moment: Tsahi's proposal to replace Customer.io
 * campaign 16 with a native modal, reconciled with what shipped since
 * (the analytics Reputation tab and the 250 "Privileges unlocked" modal).
 * Tags: Today (Customer.io), Production (unchanged), Proposed (this change),
 * Decide (open for product).
 */

const meta: Meta = {
  title: 'Reputation/First reputation',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const comment = firstReputations[FirstReason.Comment];

export const WhatChanges: StoryObj = {
  name: '1. What changes',
  render: () => (
    <Page
      chapter="Reputation · 1"
      question="How do people learn they earned reputation?"
      title="First reputation moment"
      goal="Tell people what earned them reputation, how many points, and what it unlocks, right after it happens, on every platform, instead of in a Customer.io popover hours later."
      metric="Visits to /analytics/reputation and to the privileges docs from the modal, against campaign 16's 23.5% click rate; second contribution within 7 days."
    >
      <Case
        title="Today: Customer.io campaign 16"
        note="Our best Customer.io CTA (659 people saw it in 90 days, 23.5% clicked). It never says what you did or how many points, waits for the one-a-day popup slot (a median 7 hours after the upvote, and 11% never see it), and “See all privileges” opens the top of a docs page."
      >
        <StateGrid>
          <State title="In-app popover" tag="Today">
            <CustomerIoPopover />
          </State>
        </StateGrid>
      </Case>

      <Case
        title="Proposed: the first reputation modal"
        note={`Opens on the next page load after the first reputation event, outside the daily popup slot (like the streak milestone). It names what earned it and the points, then the road to ${privilegesThreshold}: every account starts at ${STARTING_REPUTATION}, so the road has the 100 milestone on it too, both from the analytics tab's milestone list.`}
      >
        <StateGrid>
          <State
            title="Tablet and up: modal"
            tag="Proposed"
            note="Modal XSmall, like the 250 modal and the streak milestone. Buttons in the 250 modal's order: “See your reputation” leads (the analytics tab, where the sidebar count already links), “See all privileges” second, deep linking to the docs' privileges table."
          >
            <FirstReputationModal moment={comment} />
          </State>
          <State
            title="Phone: drawer"
            tag="Proposed"
            note="isDrawerOnMobile, the same content."
          >
            <FirstReputationModal moment={comment} isPhone />
          </State>
        </StateGrid>
      </Case>

      <Case
        title="At 250: hand off, don't duplicate"
        note="The one-time “Privileges unlocked” modal (AckRep250) stays as is. The new modal only covers the road below 250, and someone whose first reputation already takes them to 250 gets the existing modal instead."
      >
        <div className="flex flex-wrap items-start gap-6">
          <State title="Below 250: first reputation" tag="Proposed">
            <FirstReputationModal moment={comment} />
          </State>
          <FlowArrow />
          <State title="At 250: privileges unlocked" tag="Production">
            <PrivilegesUnlockedModal />
          </State>
        </div>
      </Case>

      <Case
        title="Points where people already look"
        note="The earned amount next to the places people check anyway: the upvote notification, and the reputation count in the profile menu (which links to the analytics tab). Both need the API to send the reputation each event granted, since only upvoters at 250+ grant it: an upvote notification can carry 0."
      >
        <StateGrid>
          <State
            title="Upvote notification"
            tag="Proposed"
            note="comment_upvote_milestone with daily-api's title, plus what that batch earned."
          >
            <UpvoteNotification upvotes={1} earned={50} />
          </State>
          <State
            title="Profile menu"
            tag="Proposed"
            note="SidebarProfileStats: the chip clears once the analytics tab is opened."
          >
            <ProfileStats reputation={60} earned={50} />
          </State>
        </StateGrid>
      </Case>

      <Case
        title="Against the Slack proposal"
        note="Each point of the proposal, what has shipped since, and what this change does."
      >
        <Table
          head={['Proposal', 'Status', 'What this change does']}
          rows={[
            [
              '“Nothing else tells people they earned reputation”',
              <Status key="s" tag="Production" />,
              'No longer true: the Reputation tab at /analytics/reputation (apps#7410) shipped to everyone with the balance, next milestone, its unlocks and an activity log, and the sidebar count links to it. The modal links there.',
            ],
            [
              'Modal on next page load, drawer on phones',
              <Status key="s" tag="Proposed" />,
              'Shown above, with what earned it, the points and the road to 250.',
            ],
            [
              '“See all privileges” main button, docs at the privileges table',
              <Status key="s" tag="Proposed" />,
              'Second: “See your reputation” leads, the same order as the 250 modal. The deep link needs a stable #privileges anchor on the docs page.',
            ],
            [
              '“See your comment” opens the comment',
              <Status key="s" tag="Proposed" />,
              'Third, quiet button, named after what earned it (comment, post, report, quest).',
            ],
            [
              'Once per person, every platform, outside the daily slot',
              <Status key="s" tag="Proposed" />,
              'A new one-time action, opened like StreakMilestonePopup rather than from BootPopups. See the rules on the All states page.',
            ],
            [
              '“+50” chip on upvote notifications and in the profile menu',
              <Status key="s" tag="Proposed" />,
              'Shown above. Needs the earned amount from the API.',
            ],
            [
              '3D reputation badge, streak milestone style',
              <Status key="s" tag="Proposed" />,
              'Shown above: the art campaign 16 already uses, redrawn in the awards style so it sits with the awards people give each other. Design to sign off before it ships.',
            ],
            [
              'Turn off Customer.io campaign 16 (popover and email)',
              <Status key="s" tag="Today" />,
              'Still live and unchanged since June 2024. Turn it off the day the modal ships, not before.',
            ],
          ]}
        />
      </Case>
    </Page>
  ),
};

export const AllStates: StoryObj = {
  name: '2. All states',
  render: () => (
    <Page
      chapter="Reputation · 2"
      question="Every state of the first reputation moment"
      title="First reputation: all states"
      goal="Each way a first reputation can be earned, the badge, the chips, and the rules for when the modal shows, so nothing is left for the build to decide."
      metric="Nothing missing a builder would need to decide."
    >
      <Case
        title="What earned it"
        note="Amounts are daily-api's reputationReasonAmount. Source approvals (+200) can't be a first reputation: suggesting a source needs 250. The quest amount is an example: quest rewards can carry reputation, and bonus quests (apps#7465) multiply it."
      >
        <StateGrid>
          {Object.values(firstReputations).map((moment) => (
            <State
              key={moment.reason}
              title={`${moment.subject}: +${moment.amount}`}
              tag="Proposed"
            >
              <FirstReputationModal moment={moment} />
            </State>
          ))}
        </StateGrid>
      </Case>

      <Case title="Phone" note="The same states in the drawer.">
        <StateGrid>
          {Object.values(firstReputations).map((moment) => (
            <State key={moment.reason} title={moment.subject} tag="Proposed">
              <FirstReputationModal moment={moment} isPhone />
            </State>
          ))}
        </StateGrid>
      </Case>

      <Case
        title="Badge"
        note="The art from campaign 16 and the 250 modal (purple disc, bolt, up-chevrons) as an iridescent coin in the awards style, with the points on it like the streak milestone's number."
      >
        <div className="flex flex-wrap items-end gap-8">
          <State title="Modal" tag="Proposed">
            <ReputationBadge amount={50} />
          </State>
          <State title="Small" tag="Proposed">
            <ReputationBadge amount={10} size="small" />
          </State>
          <State title="Chip" tag="Proposed">
            <EarnedChip amount={50} />
          </State>
        </div>
      </Case>

      <Case
        title="Upvote notifications"
        note="The chip shows what that batch of upvotes granted. Upvotes from people under 250 grant nothing, so the row stays as production draws it."
      >
        <StateGrid>
          <State title="Earned reputation" tag="Proposed">
            <UpvoteNotification upvotes={1} earned={50} />
          </State>
          <State title="Several upvotes, some granted" tag="Proposed">
            <UpvoteNotification upvotes={3} earned={100} />
          </State>
          <State title="Earned nothing" tag="Production">
            <UpvoteNotification upvotes={5} />
          </State>
        </StateGrid>
      </Case>

      <Case title="Profile menu">
        <StateGrid>
          <State title="New reputation since last visit" tag="Proposed">
            <ProfileStats reputation={60} earned={50} />
          </State>
          <State title="Seen" tag="Production">
            <ProfileStats reputation={60} />
          </State>
        </StateGrid>
      </Case>

      <Case
        title="When it shows"
        note="Rules for the build, aligned with what shipped recently."
      >
        <Table
          head={['Rule', 'Status', 'Detail']}
          rows={[
            [
              'Once per account',
              <Status key="s" tag="Proposed" />,
              'A new one-time action, completed when the modal closes, the same way AckRep250 works.',
            ],
            [
              'Outside the daily popup slot',
              <Status key="s" tag="Proposed" />,
              'Its own trigger like StreakMilestonePopup, on the first page load after the first reputation event, not a BootPopups entry.',
            ],
            [
              'Every platform',
              <Status key="s" tag="Proposed" />,
              'Webapp, extension, and the iOS and Android shells, which run the webapp.',
            ],
            [
              'Already at 250',
              <Status key="s" tag="Production" />,
              'Skip it and let the existing “Privileges unlocked” modal show.',
            ],
            [
              'Existing accounts',
              <Status key="s" tag="Decide" />,
              'Half of campaign 16’s audience has accounts over a year old. Show it to anyone whose first reputation event is new, not only new signups.',
            ],
            [
              'Agent company signups (daily-api#4665)',
              <Status key="s" tag="Decide" />,
              'That change opts them out of streaks, levels, quests and achievements, but keeps reputation. Recommended: skip the modal and chips when optOutLevelSystem is set.',
            ],
            [
              'Streak milestone on the same load',
              <Status key="s" tag="Proposed" />,
              'One modal per page load: the streak milestone first, reputation on the next load.',
            ],
            [
              'Streak companion (apps#7420)',
              <Status key="s" tag="Decide" />,
              'Behind patchy_companion. Patchy could react when the chip appears instead of a second moment.',
            ],
            [
              'Customer.io campaign 16',
              <Status key="s" tag="Today" />,
              'Turn off the popover and the email when this ships.',
            ],
          ]}
        />
      </Case>
    </Page>
  ),
};
