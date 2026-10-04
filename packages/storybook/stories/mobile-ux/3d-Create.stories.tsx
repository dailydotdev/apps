import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Status,
  Table,
  Verdict,
} from './kit';
import {
  ComposerEmptyPhone,
  ComposerLinkPhone,
  ComposerPollPhone,
  ComposerTextPhone,
  CreateEntry,
  KindMenuPhone,
  PostedPhone,
} from './create';

const meta: Meta = {
  title: 'Mobile UX/3d. Create',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const steps = [
  ['1', 'Tap Create (the filled square beside the tab bar)', 'The composer opens full screen, straight away, on Free form with the title focused and the keyboard up. Logged out, the same tap opens the login sheet instead.'],
  ['2', 'Change the kind if you want', 'The kind chip in the toolbar (Free form · Share a link · Poll, the production KindModePicker) switches the form in place. Paste a URL into a Free form post and it offers to switch to Share a link.'],
  ['3', 'Pick where it goes', 'The audience chip next to your avatar (production AudienceChip: Everyone or your squads, multi-select) opens its picker. Opening Create from inside a squad preselects that squad.'],
  ['4', 'Write', 'Title and body for Free form (Markdown toggle top right); Paste a link, preview card, optional comment for a link; Ask a question, options, duration for a poll. Post enables when the form is valid.'],
  ['5', 'Post', 'The modal closes, you are back where you were, the new post is first in that feed, and a toast confirms it with a View link. Schedule (top right) sends it to Scheduled posts instead.'],
  ['6', 'Close instead', 'The X top right, or drag the modal down. With content typed, a confirm sheet asks Discard or Keep editing; a kept draft returns next time.'],
];

const parts = [
  ['Header, left', 'ProfilePicture + AudienceChip', 'Your avatar and a chip with the audience avatars, "Everyone" or the squad name, a chevron. Opens the Post to picker.'],
  ['Header, right', 'ScheduledPostsNavButton · SchedulePostButton · Markdown toggle (Free form) · CloseButton', 'Scheduled posts, schedule this post, rich text or Markdown, close. Exactly production’s order on phones.'],
  ['Body', 'TextForm / LinkForm / PollForm', '"Post title…" and the editor; "Paste a link…", the preview, "Add a comment (optional)"; "Ask a question…", "Option 1", "Option 2", Add option, duration.'],
  ['Toolbar', 'KindModePicker + primary actions', 'The cabbage-outlined kind chip on the left, Post on the right. On Free form the image, link and mention buttons sit above it.'],
  ['Container', 'Drawer isFullScreen, appendOnRoot (below laptop)', 'Full-screen bottom drawer today, starting right under the status bar with 20px of top padding and no bar of its own; becomes the sheet primitive at a full detent with drag to dismiss.'],
];

export const Create: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What happens when someone taps the plus?"
        title="Straight into the composer. The kind (Free form, Share a link, Poll) and the audience are switched inside it, exactly as production already does, so the three-row drawer is no longer needed."
      >
        <p>
          Round four&apos;s first draft invented a &quot;Post to&quot; bar and
          kept today&apos;s three-row drawer in front of the composer. A
          look at the production SmartComposerModal shows both are
          unnecessary: the composer already carries an audience chip next to
          your avatar and a kind picker in its toolbar. So the Create button
          opens it directly, the mocks below copy production&apos;s
          structure and copy, and the drawer and a bar-morph idea are kept as
          alternatives.
        </p>
        <ChapterNav current="3d" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="4">
        Create opens the production composer directly; kind and audience are chosen
        inside it; posting returns you to where you were with the post in view.
      </Status>
      <p className="text-text-tertiary typo-footnote">
        Alternatives and research kept for the record are in the Archive: Tab
        bar, chrome, search and create.
      </p>

      <Goal
        goal="One tap from any root to a focused composer, no menu in between, and proof of success in the feed rather than a detour to the post page."
        metric="Composer opens per active member, the share that end in a post, and time from tap to first keystroke."
      />

      <Section title="The flow" description="Six steps from the tap to the toast.">
        <Table
          head={['#', 'You', 'The app']}
          rows={steps.map((row) => [
            <span key={row[0]} className="font-bold tabular-nums text-text-primary">
              {row[0]}
            </span>,
            <span key={row[1]} className="font-bold text-text-primary">
              {row[1]}
            </span>,
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Tap, and you are writing"
        description="The Create button on every root opens the composer full screen on Free form. Everything else happens inside."
      >
        <PhoneRow>
          <Cell label="Entry" note="Create beside the tab bar, same on Home, Explore, Squads and Activity.">
            <CreateEntry />
          </Cell>
          <Cell label="Composer, empty" verdict={Verdict.Ship} note="Production structure, flush under the status bar: avatar + audience chip, scheduled posts, schedule, Markdown and close on the right, title focused, kind chip and Post in the toolbar.">
            <ComposerEmptyPhone />
          </Cell>
          <Cell label="Kind picker open" note="The production dropdown: Free form, Share a link, Poll. It switches the form in place, no navigation.">
            <KindMenuPhone />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The three kinds"
        description="Production's forms and placeholders. The audience chip shows React Israel because Create was opened from that squad."
      >
        <PhoneRow>
          <Cell label="Free form" verdict={Verdict.Ship} note="Post title…, Share your thoughts…, image / link / mention above the kind chip and Post.">
            <ComposerTextPhone />
          </Cell>
          <Cell label="Share a link" verdict={Verdict.Ship} note="Paste a link…, the preview card, Add a comment (optional); kind chip and Post below.">
            <ComposerLinkPhone />
          </Cell>
          <Cell label="Poll" verdict={Verdict.Ship} note="Ask a question…, Option 1 and 2, Add option, Duration. Post enables at two options.">
            <ComposerPollPhone />
          </Cell>
        </PhoneRow>
        <Table
          head={['Part', 'Production component', 'What it shows']}
          rows={parts.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <code key={row[1]} className="typo-caption1">{row[1]}</code>,
            row[2],
          ])}
        />
      </Section>

      <Section
        title="After posting"
        description="No detour to the post page. You land where you were, the new post first in the feed, a toast that links to it."
      >
        <PhoneRow>
          <Cell label="Posted" verdict={Verdict.Ship} note="Back on Home, Following segment (which includes your squads), the new post first, a toast with View. The cluster is back at rest.">
            <PostedPhone />
          </Cell>
        </PhoneRow>
      </Section>

      <Section title="Why straight to the composer">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why straight to the composer">
            X, Threads and Reddit all open the composer on the first tap and
            let you change the kind inside (Reddit with type tabs, X and
            Threads with attachments). Ours already has the kind chip, so a
            menu in front of it is a second question before the first
            keystroke. Removing it also deletes a whole surface from the
            system.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Where the drawer's three targets go">
            New post, Share a link and Poll stay reachable: Spotlight&apos;s
            Create group keeps them, a pasted URL offers the link kind, and
            the poll button sits in the Free form toolbar. The Create button
            remembers the last kind you used (production already persists a
            default write tab).
          </Callout>
          <Callout title="Logged out">
            The Create button opens the login sheet from chapter 4b (Sign up
            / Log in), not the onboarding page today&apos;s floating
            &quot;+&quot; links to.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No invented &quot;Post to&quot; bar: the audience chip is the
            production control. No route to squads/create before the
            composer. No post-page detour after posting. No full-screen
            modal for anything but the composer.
          </Callout>
        </div>
        <Quote>Tap, write, post, land. The only choice worth asking first is where it goes, and that is a chip, not a menu.</Quote>
        <DigIn title="Implementation notes">
          <p>
            FooterPlusButton stops linking to squads/create and opens
            SmartComposerModal directly with initialKind from the persisted
            default write tab and initialSquadHandle when opened from a squad
            page. The modal&apos;s full-screen Drawer becomes the shared
            sheet primitive at a full detent with drag to dismiss. On success
            onPosted refetches the origin feed and shows the toast; its View
            link opens the post as a leaf. Draft keeping reuses the
            composer&apos;s existing local draft.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="3d" />
      </Section>
    </Page>
  ),
};
