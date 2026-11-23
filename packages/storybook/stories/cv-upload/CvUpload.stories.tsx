import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
  Table,
  Verdict,
} from '../open-links-in/kit';
import { CvProviders } from './providers';
import {
  AddWorkExperience,
  AvatarRing,
  CampaignPopover,
  ExperienceEmpty,
  MenuCardCvFirst,
  MenuCardToday,
  ProfileEditMenu,
} from './screens';

const meta: Meta = {
  title: 'Growth/CV upload/1. Review',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <CvProviders>
        <Story />
      </CvProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const bold = (text: string): React.ReactElement => (
  <span className="font-bold text-text-primary">{text}</span>
);

const numbers = [
  [
    'CV banner (90 days)',
    '6.6% of the people it targeted saw it',
    'About 5 uploads a week',
  ],
  ['30 and 60-day CV popovers', '537k impressions', '1.3% uploaded'],
  [
    'Onboarding CV step',
    'Removed by Onboarding v12 on Oct 12',
    '0 uploads since, on purpose',
  ],
  ['All CV uploads', 'About 650 a week before Oct 12', 'About 90 a week now'],
];

const entryPoints = [
  [
    'Ring on the avatar showing profile progress',
    'New',
    'Clashes with the LFG ribbon, which sits on the same avatar edge.',
  ],
  [
    '"Fill from CV" row in the empty Experience section',
    'In production',
    'ExperienceEmptyState renders AutofillProfileBanner until the CV is uploaded or the banner is closed.',
  ],
  [
    '"Import from CV" in the profile edit menu',
    'New',
    'Today the edit square is a plain link to settings/profile; it becomes a two-row menu.',
  ],
  [
    'The same row on empty Work Experience and Education settings pages',
    'In production',
    'Both pages render ExperienceSettings, which falls back to the same ExperienceEmptyState.',
  ],
  [
    'A shortcut inside Add work experience',
    'New',
    'One row above the form fields on settings/profile/experience/edit.',
  ],
  [
    'The profile menu card leads with the CV',
    'Change',
    'ProfileCompletion is in the menu today and links to the first missing item. It leads with an upload when work or education is missing.',
  ],
];

export const Review: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Ido's proposal: CV upload banner"
        title="Turn the CV banner and both popovers off, and ask for the CV where people already work on their profile. Half of that list already ships."
      >
        <p>
          Customer.io campaign 48 sends the banner and the 30 and 60-day
          popovers. Stopping it turns all three off with no code change. Of the
          six places Ido lists, two are in production, one exists and needs to
          lead with the CV, and three are new. This page draws each one, the
          production ones with their own components. Copy on the new ones is a
          placeholder.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Open} round="1">
        Waiting for product: turn off campaign 48, then pick which of the new
        entry points to build. No production code in this PR.
      </Status>

      <Goal
        goal="People who are already editing their profile can fill it from a CV without a banner or popover asking them to."
        metric="Weekly CV uploads by target id, compared with the 5 a week the banner brings and the popovers' 1.3%."
      />

      <Section title="Where it stands today">
        <Table
          head={['Surface', 'Reach', 'Result']}
          rows={numbers.map((row) => [bold(row[0]), row[1], row[2]])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Turn off: campaign 48">
            The banner and both popovers come from one Customer.io campaign.
            Stopping it is the whole change; nothing in this repository needs to
            move.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Not a bug: the onboarding drop"
          >
            The onboarding CV step logs 0 uploads since Oct 12 because the
            Onboarding v12 experiment removed it, and v12 won (+10% funnel
            completion, D1 flat). Putting the step back means arguing against a
            shipped win, so it is a separate call, not a fix.
          </Callout>
        </div>
        <PhoneRow>
          <Cell
            label="Today: the 30 and 60-day popover"
            verdict={Verdict.Skip}
            note="Sent by campaign 48. Goes away with the banner when the campaign stops."
          >
            <CampaignPopover />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The six entry points"
        description="Ido's list against the code. Same on desktop and phone: the menu card is the desktop popover's own width, the rest are the phone layout the tablet and laptop pages widen."
      >
        <Table
          head={['Entry point', 'Status', 'What it takes']}
          rows={entryPoints.map((row) => [bold(row[0]), bold(row[1]), row[2]])}
        />
      </Section>

      <Section
        title="Already in production"
        description="Rendered with ExperienceEmptyState's own pieces: CharmEmptyState and AutofillProfileBanner."
      >
        <PhoneRow>
          <Cell
            label="Profile, empty Experience"
            note="Shows until the CV is uploaded or the banner is closed."
          >
            <ExperienceEmpty title="Experience" />
          </Cell>
          <Cell label="Settings, empty Work Experience">
            <ExperienceEmpty title="Work Experience" />
          </Cell>
          <Cell label="Settings, empty Education">
            <ExperienceEmpty title="Education" />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The profile menu card leads with the CV"
        description="Left is production's ProfileCompletion in the menu: it shows to anyone below 100% who has no intro quests and links to the first missing item. The profile_completion_indicator flag is defined but nothing reads it. Right is the change: when work or education is missing, the upload is the action."
      >
        <PhoneRow>
          <Cell label="Today" verdict={Verdict.Skip}>
            <MenuCardToday />
          </Cell>
          <Cell label="Proposed: CV first" verdict={Verdict.Ship}>
            <MenuCardCvFirst />
          </Cell>
        </PhoneRow>
      </Section>

      <Section title="New entry points">
        <PhoneRow>
          <Cell
            label="Import from CV in the edit menu"
            note="The edit square opens two rows instead of going straight to settings. Tap it."
          >
            <ProfileEditMenu />
          </Cell>
          <Cell
            label="Shortcut inside Add work experience"
            note="One row above the fields. Upload fills every role, not just this one."
          >
            <AddWorkExperience />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell
            label="Ring on the avatar"
            note="Progress around the profile avatar."
          >
            <AvatarRing />
          </Cell>
          <Cell
            label="Ring with the LFG ribbon"
            note="The clash: both claim the avatar's bottom edge."
          >
            <AvatarRing lfg />
          </Cell>
        </PhoneRow>
        <Callout title="Open question on the ring">
          Either the ring skips people with LFG on, or the ribbon moves off the
          avatar. The menu card already carries the same progress, so the ring
          is the easiest one to drop.
        </Callout>
      </Section>
    </Page>
  ),
};
