import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, PageHeader, Section, Surface } from './shell';
import {
  CommentThread,
  FeedCardHeader,
  Leaderboard,
  LoggedOutComposer,
  MentionPopover,
  NotificationList,
  ProfileHeaderMock,
  SearchPeople,
  SquadMembers,
} from './surfaces';
import { people } from './data';

const meta: Meta = {
  title: 'Avatar Characters/3. In the product',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const InTheProduct: StoryObj = {
  render: () => (
    <Page withModeToggle>
      <PageHeader
        eyebrow="Where does it show up?"
        title="Every surface that shows a person, before and after. Flip the toggle."
        goal="Lists and threads where people are told apart at a glance, with no new UI anywhere."
        metric="Reply rate on threads with three or more no-photo authors (A/B, hypothesis)."
      >
        <p>
          Every avatar on this page is the production{' '}
          <code className="rounded-6 bg-surface-float px-1">
            ProfilePicture
          </code>{' '}
          atom at its production size, fed whatever URL the resolver returns.
          That is the point: the integration is a different image, not a
          different component. No badges, no &ldquo;this is a placeholder&rdquo;
          labels, no new layout. Use the toggle at the top right to compare.
        </p>
      </PageHeader>

      <Section
        title="Conversations"
        description="Where it matters most. Comments render at 40 and 32 pixels, so they get the face crop."
      >
        <div className="grid gap-6 laptop:grid-cols-[3fr_2fr]">
          <Surface
            label="Comment thread"
            note="Who replied to whom reads from the faces alone. The official reply wears Patchy."
          >
            <CommentThread />
          </Surface>
          <div className="flex flex-col gap-6">
            <Surface
              label="Mention autocomplete"
              note="24 pixels, where the gray figure made every suggestion look like the same person."
            >
              <MentionPopover />
            </Surface>
            <Surface
              label="Logged-out composer"
              note="Today it shows the silhouette as you. Hover it: the cast cycles, a quiet preview of signup."
            >
              <LoggedOutComposer />
            </Surface>
          </div>
        </div>
      </Section>

      <Section title="Feed and discovery">
        <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          <Surface
            label="Feed card"
            note="The 20 pixel sharer badge and the upvoter row. Small, but on every card."
          >
            <FeedCardHeader />
          </Surface>
          <Surface
            label="Search, people"
            note="Results stop looking like duplicates."
          >
            <SearchPeople />
          </Surface>
          <Surface
            label="Leaderboard"
            note="A ranking of faces reads like a podium. A ranking of silhouettes reads like a spreadsheet."
          >
            <Leaderboard />
          </Surface>
        </div>
      </Section>

      <Section title="Community and you">
        <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          <Surface
            label="Squad members"
            note="Stacks are where duplicate odds show up (chapter 2), and where a varied backdrop hue would help most."
          >
            <SquadMembers />
          </Surface>
          <Surface
            label="Notifications"
            note="System notifications come from Patchy, people from their own characters."
          >
            <NotificationList />
          </Surface>
          <Surface
            label="Someone else's profile"
            note="The full render at 96. Visitors see a character, never a hint that it is a fallback."
          >
            <ProfileHeaderMock person={people[3]} />
          </Surface>
        </div>
      </Section>
    </Page>
  ),
};
