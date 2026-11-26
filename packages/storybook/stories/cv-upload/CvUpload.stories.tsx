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
            the look of Tsahi&apos;s video: one progress ring, one progress card
            and one CV row, reused everywhere. Every frame is the production
            page, loaded at a phone&apos;s or a laptop&apos;s width, with only
            the new piece added. Copy is from the video.
          </p>
        </PageHeader>

        <Status status={ChapterStatus.Open} round="1">
          Waiting for product to pick which of the six to build. No production
          code in this PR.
        </Status>

        <Section
          title="1. A ring on the avatar that shows profile progress"
          description="The owner's own profile: the ring takes the place of the completion card and the CV banner."
        >
          <PhoneRow>
            <Cell label="Phone">
              <PhoneFrame story="profile" theme={theme} />
            </Cell>
            <Cell
              label="Clash: today's LFG badge"
              note="An open LFG post draws its own green ring and the ribbon on the same avatar."
            >
              <PhoneFrame story="profile-lfg-today" theme={theme} />
            </Cell>
            <Cell
              label="Suggested: LFG next to the Plus icon"
              note="The ribbon moves to the name row as a chip beside the Plus mark, and LFG's ring goes. The avatar keeps one ring and one chip."
            >
              <PhoneFrame story="profile-lfg-name-row" theme={theme} />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <LaptopFrame story="profile" theme={theme} />
            </Cell>
          </Desktop>
          <Callout title="LFG on the avatar">
            Suggested: move LFG to the name row next to the Plus icon, wherever
            the full profile header shows it. Small avatars in comments and
            posts keep today&apos;s corner mark.
          </Callout>
        </Section>

        <Section
          title="2. One “Fill from CV” row in the empty Experience section"
          description="Further down the same profile: one Experience section with the progress and the CV row. Upload fills work and education."
        >
          <PhoneRow>
            <Cell label="Phone">
              <PhoneFrame story="profile" theme={theme} height={900} />
            </Cell>
          </PhoneRow>
        </Section>

        <Section title="3. “Import from CV” in the profile edit menu">
          <PhoneRow>
            <Cell
              label="Phone"
              note="The pencil opens the dropdown instead of going straight to settings; on a phone it is the dropdown's sheet."
            >
              <PhoneFrame story="profile-edit-menu" theme={theme} />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop">
              <LaptopFrame story="profile-edit-menu" theme={theme} />
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
          description="Above the real form, shown only while they have no roles yet."
        >
          <PhoneRow>
            <Cell label="Phone">
              <PhoneFrame story="add-work" theme={theme} />
            </Cell>
          </PhoneRow>
          <Desktop>
            <Cell label="Desktop" note="The settings sidebar is left out.">
              <LaptopFrame story="add-work" theme={theme} />
            </Cell>
          </Desktop>
        </Section>

        <Section
          title="6. The profile menu card leads with the CV"
          description="The header's profile menu, with ProfileCompletion's card leading with Fill from CV while work or education is missing. Once the CV is in, it goes back to the next missing step."
        >
          <PhoneRow>
            <Cell label="Desktop: the header's profile menu">
              <MenuCrop story="profile-menu" theme={theme} />
            </Cell>
          </PhoneRow>
        </Section>
      </Page>
    );
  },
};
