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
  DesktopAddWork,
  DesktopProfile,
  MenuCardCvFirst,
  ProfileEditMenu,
} from './screens';
import { LaptopFrame, MenuCrop, PhoneFrame } from './embed';

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
    'New',
    'The profile\'s empty Work Experiences and Education sections say "Add your first" and never ask for the CV. The row goes under them.',
  ],
  [
    '"Import from CV" in the profile edit menu',
    'New',
    'Today the edit square is a plain link to settings/profile; it becomes a two-row menu.',
  ],
  [
    'The same row on empty Work Experience and Education settings pages',
    'Change',
    'Both pages fall back to ExperienceEmptyState, which already asks for the CV with the large AutofillProfileBanner. One change turns it into the row on both.',
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
  render: (_, { globals }) => {
    const theme = globals.theme ?? 'dark';

    return (
      <Page>
        <PageHeader
          eyebrow="Ido's proposal: CV upload banner"
          title="Turn the CV banner and both popovers off, and ask for the CV where people already work on their profile. Half of that list is already there in another form."
        >
          <p>
            Customer.io campaign 48 sends the banner and the 30 and 60-day
            popovers. Stopping it turns all three off with no code change. Of
            the six places Ido lists, the empty settings pages already ask for
            the CV with a large banner that becomes one row, the profile menu
            card exists and needs to lead with the CV, and four are new. Every
            Today frame is the production page, loaded at a phone&apos;s or a
            laptop&apos;s width; the proposals sit on the same pages where they
            can, and are drawn where production has nothing to build on. Copy on
            the new ones is a placeholder.
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
              Stopping it is the whole change; nothing in this repository needs
              to move.
            </Callout>
            <Callout
              tone={CalloutTone.Bad}
              title="Not a bug: the onboarding drop"
            >
              The onboarding CV step logs 0 uploads since Oct 12 because the
              Onboarding v12 experiment removed it, and v12 won (+10% funnel
              completion, D1 flat). Putting the step back means arguing against
              a shipped win, so it is a separate call, not a fix.
            </Callout>
          </div>
          <PhoneRow>
            <Cell
              label="Today: the feed banner on a phone"
              verdict={Verdict.Skip}
              note="ProfileUploadBanner at the top of My feed, while campaign 48 sends a feed banner and no CV is uploaded. With the jobs feature on, the copy is the campaign's or the jobs default."
            >
              <PhoneFrame story="feed-banner" theme={theme} />
            </Cell>
            <Cell
              label="Today: the 30-day popover"
              verdict={Verdict.Skip}
              note="The popover variant, so BootPopups opens MarketingCtaModal. The live cv-reminder-popup-30d row, word for word."
            >
              <PhoneFrame story="popover-30-d" theme={theme} />
            </Cell>
            <Cell
              label="Today: the 60-day popover"
              verdict={Verdict.Skip}
              note="The popover_small variant: MarketingCtaPopoverSmall in BootPopups' interactive popup, a sheet on a phone. The live cv-popover-60d row."
            >
              <PhoneFrame story="popover-60-d" theme={theme} />
            </Cell>
          </PhoneRow>
          <Cell
            label="Today: the feed banner on a laptop"
            verdict={Verdict.Skip}
            note="From laptop up the same banner is CvTopHero, in the top hero slot above the feed."
          >
            <LaptopFrame story="feed-banner" theme={theme} />
          </Cell>
          <Cell
            label="Today: the 30-day popover on a laptop"
            verdict={Verdict.Skip}
          >
            <LaptopFrame story="popover-30-d" theme={theme} />
          </Cell>
          <Cell
            label="Today: the 60-day popover on a laptop"
            verdict={Verdict.Skip}
            note="Bottom right, with no overlay."
          >
            <LaptopFrame story="popover-60-d" theme={theme} />
          </Cell>
          <Callout title="Both popovers lead to the jobs page, not an upload">
            The live rows send Upload your CV to /opportunity/welcome. The feed
            banner&apos;s row has every copy field empty, so the banner shows
            the app&apos;s own copy.
          </Callout>
          <PhoneRow>
            <Cell
              label="Stays: the banner on your own profile"
              note="AutofillProfileBanner under the profile header, and the completion card above it below laptop. Neither comes from campaign 48, so stopping it leaves both."
            >
              <PhoneFrame story="profile-top" theme={theme} />
            </Cell>
          </PhoneRow>
        </Section>

        <Section
          title="Next to PR 7492: verify work email"
          description="The verify work email proposal (dailydotdev/apps#7492) works the same way and touches the same places. No files are shared; these are the product overlaps to settle together."
        >
          <div className="grid gap-4 tablet:grid-cols-2">
            <Callout title="One popover slot, two campaigns">
              Boot carries one marketing CTA at a time. Campaign 46&apos;s
              verify popover and the 60-day CV popover are the same component,
              MarketingCtaPopoverSmall, and take turns in that slot. Turning off
              campaigns 46 and 48 together frees it; turning off one hands its
              turns to the other.
            </Callout>
            <Callout tone={CalloutTone.Good} title="CV first, verify second">
              Every CV entry point here ends in the &quot;CV uploaded&quot;
              modal, where 7492 adds &quot;Next: show where you work&quot;. The
              two chain: upload fills the job, the next row verifies it.
            </Callout>
            <Callout title="Work Experience: different states">
              Here the CV row shows on the empty list; 7492&apos;s verify ask
              sits above a list with an unverified current job. They never show
              together, as long as both keep to their state.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Your own profile header">
              7492 adds an Add badge chip under the bio; this page adds Import
              from CV to the edit square and a ring on the avatar, beside the
              completion card and the Autofill banner that stay. Pick which asks
              the owner&apos;s header keeps, and one at a time.
            </Callout>
          </div>
        </Section>

        <Section
          title="The six entry points"
          description="Ido's list against the code. Each one is drawn on the phone first; the desktop views are at the end."
        >
          <Table
            head={['Entry point', 'Status', 'What it takes']}
            rows={entryPoints.map((row) => [
              bold(row[0]),
              bold(row[1]),
              row[2],
            ])}
          />
        </Section>

        <Section
          title="The empty sections: one row instead of the banner"
          description="Today, top: the production pages. The settings pages show ExperienceEmptyState with AutofillProfileBanner under it until the CV is uploaded or the banner is closed; the profile's own empty sections never ask. Proposed, bottom: the same pages with one Fill from CV row."
        >
          <PhoneRow>
            <Cell
              label="Today: profile, empty Work Experiences and Education"
              verdict={Verdict.Skip}
              note="Further down the About segment of your own profile."
            >
              <PhoneFrame story="profile-experience-today" theme={theme} />
            </Cell>
            <Cell
              label="Today: settings, empty Work Experience"
              verdict={Verdict.Skip}
            >
              <PhoneFrame story="settings-work-today" theme={theme} />
            </Cell>
            <Cell
              label="Today: settings, empty Education"
              verdict={Verdict.Skip}
            >
              <PhoneFrame story="settings-education-today" theme={theme} />
            </Cell>
          </PhoneRow>
          <PhoneRow>
            <Cell
              label="Proposed: profile, empty Work Experiences and Education"
              verdict={Verdict.Ship}
            >
              <PhoneFrame story="profile-experience-proposed" theme={theme} />
            </Cell>
            <Cell
              label="Proposed: settings, empty Work Experience"
              verdict={Verdict.Ship}
            >
              <PhoneFrame story="settings-work-proposed" theme={theme} />
            </Cell>
            <Cell
              label="Proposed: settings, empty Education"
              verdict={Verdict.Ship}
            >
              <PhoneFrame story="settings-education-proposed" theme={theme} />
            </Cell>
          </PhoneRow>
        </Section>

        <Section
          title="The profile menu card leads with the CV"
          description="Left is the header's profile menu as production opens it on a laptop: ProfileCompletion on top shows to anyone below 100% who has no intro quests and links to the first missing item. The profile_completion_indicator flag is defined but nothing reads it. On a phone the same card sits on the profile instead (above). Right is the change: when work or education is missing, the upload is the action."
        >
          <PhoneRow>
            <Cell label="Today: the profile menu" verdict={Verdict.Skip}>
              <MenuCrop story="profile-menu" theme={theme} />
            </Cell>
            <Cell
              label="Proposed: CV first"
              verdict={Verdict.Ship}
              note="Drawn: the card that takes ProfileCompletion's place at the top of the same menu."
            >
              <MenuCardCvFirst />
            </Cell>
          </PhoneRow>
        </Section>

        <Section
          title="New entry points"
          description="Drawn with production's pieces: neither the edit square's menu nor the form's shortcut has a page to sit on yet."
        >
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
            Either the ring skips people with LFG on, or the ribbon moves off
            the avatar. The menu card already carries the same progress, so the
            ring is the easiest one to drop.
          </Callout>
        </Section>

        <Section
          title="On desktop"
          description="The same pieces at laptop width. The settings page is production's; the edit menu and the Add work shortcut are drawn, like their phone views. The profile menu above is already the laptop's, and the ring is the same avatar at either size."
        >
          <div className="flex flex-col gap-12">
            <Cell
              label="Profile: Import from CV in the edit menu"
              note="Tap the edit square."
            >
              <DesktopProfile />
            </Cell>
            <Cell
              label="Settings: empty Work Experience, today"
              verdict={Verdict.Skip}
              note="The production page; the settings sidebar is left out."
            >
              <LaptopFrame story="settings-work-today" theme={theme} />
            </Cell>
            <Cell
              label="Settings: empty Work Experience with the row"
              verdict={Verdict.Ship}
            >
              <LaptopFrame story="settings-work-proposed" theme={theme} />
            </Cell>
            <Cell label="Settings: Add work experience with the shortcut">
              <DesktopAddWork />
            </Cell>
          </div>
        </Section>
      </Page>
    );
  },
};
