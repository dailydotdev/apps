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
  AddWorkExperience,
  AvatarRing,
  DesktopAddWork,
  DesktopProfile,
  MenuCardCvFirst,
  ProfileEditMenu,
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
            The six places from the proposal, each on a phone and on desktop.
            Where a production page exists, the idea sits on it; the edit menu,
            the Add work shortcut, the ring and the menu card are drawn with
            production&apos;s pieces. Copy is a placeholder.
          </p>
        </PageHeader>

        <Status status={ChapterStatus.Open} round="1">
          Waiting for product to pick which of the six to build. No production
          code in this PR.
        </Status>

        <Section
          title="1. A ring on the avatar that shows profile progress"
          description="The same avatar at every width."
        >
          <PhoneRow>
            <Cell label="Ring on the avatar">
              <AvatarRing />
            </Cell>
            <Cell label="With the LFG ribbon">
              <AvatarRing lfg />
            </Cell>
          </PhoneRow>
          <Callout title="Open question">
            Either the ring skips people with LFG on, or the ribbon moves off
            the avatar.
          </Callout>
        </Section>

        <Section title="2. One “Fill from CV” row in the empty Experience section">
          <PhoneRow>
            <Cell
              label="Phone"
              note="Your own profile, About segment, with no work or education."
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
              note="The edit square opens two rows instead of going straight to settings. Tap it."
            >
              <ProfileEditMenu />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop" note="Tap the edit square.">
              <DesktopProfile />
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

        <Section title="5. A shortcut inside Add work experience">
          <PhoneRow>
            <Cell
              label="Phone"
              note="One row above the fields. Upload fills every role, not just this one."
            >
              <AddWorkExperience />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <DesktopAddWork />
            </Cell>
          </Desktop>
        </Section>

        <Section
          title="6. The profile menu card leads with the CV"
          description="When work or education is missing, the upload is the card's action. It takes the completion card's place at the top of the profile menu."
        >
          <PhoneRow>
            <Cell label="Profile menu card">
              <MenuCardCvFirst />
            </Cell>
          </PhoneRow>
        </Section>
      </Page>
    );
  },
};
