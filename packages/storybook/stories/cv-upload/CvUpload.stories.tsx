import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  Cell,
  ChapterStatus,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
} from '../open-links-in/kit';
import { CvProviders } from './providers';
import {
  AddWorkDesktop,
  AddWorkPhone,
  LfgRing,
  ProfileDesktop,
  ProfileMenuDesktop,
  ProfileMenuPhone,
  ProfilePhone,
} from './screens';
import { LaptopFrame, PhoneFrame } from './embed';

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

const Desktop = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex flex-col gap-12">{children}</div>
);

export const Review: Story = {
  render: (_, { globals }) => {
    const theme = globals.theme ?? 'dark';

    return (
      <Page>
        <PageHeader
          eyebrow="Tsahi's proposal: CV upload"
          title="Ask for the CV where people already work on their profile."
        >
          <p>
            The six places from the proposal, each on a phone and on desktop, in
            the look of Tsahi&apos;s video: one green progress ring, one
            progress card and one CV row, reused everywhere. Where a production
            page exists, they sit on it; the rest is drawn with
            production&apos;s pieces. Copy is from the video.
          </p>
        </PageHeader>

        <Status status={ChapterStatus.Open} round="1">
          Waiting for product to pick which of the six to build. No production
          code in this PR.
        </Status>

        <Section
          title="1. A ring on the avatar that shows profile progress"
          description="On the profile avatar with a 40% chip, and on the app's own avatar in the rail, the phone header and the menu."
        >
          <PhoneRow>
            <Cell label="Phone">
              <ProfilePhone />
            </Cell>
            <Cell label="With the LFG ribbon">
              <LfgRing />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <ProfileDesktop />
            </Cell>
          </Desktop>
          <Callout title="Open question">
            The chip and the LFG ribbon both sit on the avatar&apos;s bottom
            edge. Either the ring skips people with LFG on, or the ribbon moves.
          </Callout>
        </Section>

        <Section title="2. One “Fill from CV” row in the empty Experience section">
          <PhoneRow>
            <Cell
              label="Phone"
              note="Your own profile with no work or education. Upload fills both."
            >
              <PhoneFrame story="profile-experience" theme={theme} />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <LaptopFrame story="profile-experience" theme={theme} />
            </Cell>
          </Desktop>
        </Section>

        <Section title="3. “Import from CV” in the profile edit menu">
          <PhoneRow>
            <Cell
              label="Phone"
              note="The pencil opens two rows instead of going straight to settings. Tap it."
            >
              <ProfilePhone isMenuOpen />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <ProfileDesktop isMenuOpen />
            </Cell>
          </Desktop>
        </Section>

        <Section title="4. The same row on empty Work Experience and Education settings pages">
          <PhoneRow>
            <Cell label="Phone: Work Experience">
              <PhoneFrame story="settings-work" theme={theme} />
            </Cell>
            <Cell label="Phone: Education">
              <PhoneFrame story="settings-education" theme={theme} />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell
              label="Desktop: Work Experience"
              note="The settings sidebar is left out."
            >
              <LaptopFrame story="settings-work" theme={theme} />
            </Cell>
          </Desktop>
        </Section>

        <Section
          title="5. A shortcut inside Add work experience"
          description="Shown only while they have no roles yet."
        >
          <PhoneRow>
            <Cell label="Phone">
              <AddWorkPhone />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <AddWorkDesktop />
            </Cell>
          </Desktop>
        </Section>

        <Section
          title="6. The profile menu card leads with the CV"
          description="While work or education is missing, the completion card's action is Fill from CV. Once the CV is in, it moves on to the next step, like a headline."
        >
          <PhoneRow>
            <Cell label="Phone">
              <ProfileMenuPhone />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <ProfileMenuDesktop />
            </Cell>
          </Desktop>
        </Section>
      </Page>
    );
  },
};
