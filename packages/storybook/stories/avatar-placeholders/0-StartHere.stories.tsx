import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CharacterAvatar,
  Page,
  PageHeader,
  Section,
  Surface,
  Table,
} from './shell';
import { CommentThread } from './surfaces';
import { AvatarMode, characters, Family, placeholderAvatarSrc } from './data';

const meta: Meta = {
  title: 'Avatar Characters/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const castStrip = characters.filter((item) => item.family !== Family.Person);

export const StartHere: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What should a developer look like before they add a photo?"
        title="Nobody on daily.dev should be a gray silhouette."
        goal="Every account has a face from its first minute, and it is the same face on every surface."
        metric="Avatar impressions that render the gray fallback, from today's baseline to zero."
      >
        <p>
          Every account without a photo renders the same gray figure. In a
          thread where three of five people signed up with email, three replies
          wear the same shape and the conversation reads like a list of
          strangers. The silhouette says &ldquo;nobody&rdquo; about people who
          are very much somebody.
        </p>
        <p>
          The proposal: a cast of 3D characters, each assigned from the user id
          so it never changes, that people can keep, swap for another, or
          replace with a photo. Critters and bots are handed out automatically.
          People characters are only ever chosen. Patchy stays daily.dev&apos;s
          own, and organizations, squads and deleted accounts get art of their
          own so they never pass for a person.
        </p>
      </PageHeader>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <img
            src={placeholderAvatarSrc}
            alt="Today's placeholder"
            className="size-14 rounded-16 object-cover opacity-[0.64] grayscale"
          />
          <span className="text-text-quaternary typo-caption2">Today</span>
        </div>
        <span className="shrink-0 px-2 text-text-quaternary typo-title3">
          →
        </span>
        {castStrip.map((item, index) => (
          <div
            key={item.id}
            className="ap-rise flex shrink-0 flex-col items-center gap-2"
            style={{ '--ap-delay': `${index * 40}ms` } as React.CSSProperties}
          >
            <CharacterAvatar character={item} sizePx={56} />
            <span className="text-text-tertiary typo-caption2">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <Section
        title="Same thread, same five people"
        description="Nothing else changed between these two. Today, four different people look identical. With characters, you can follow who replied to whom before reading a single name, and the daily.dev reply is recognizable as ours."
      >
        <div className="grid gap-6 laptop:grid-cols-2">
          <Surface
            label="Today"
            note="The fallback image for every no-photo account."
          >
            <CommentThread mode={AvatarMode.Today} />
          </Surface>
          <Surface
            label="With characters"
            note="Each person's character comes from their user id. Patchy marks the official reply."
          >
            <CommentThread mode={AvatarMode.Characters} />
          </Surface>
        </div>
      </Section>

      <Section title="Six rules the whole system rests on">
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          <Callout title="1. Assigned, never random">
            The character is a hash of the user id. Same face on the feed, in
            comments, in notifications, on every device and for every viewer. A
            username change never changes it.
          </Callout>
          <Callout title="2. Creatures by default, people by choice">
            Auto-assignment only draws from critters and bots. We never guess
            someone&apos;s gender, skin tone, or faith by handing them a human
            face. People characters live in the picker.
          </Callout>
          <Callout title="3. A face you can keep">
            Picking a character is a first-class choice next to uploading a
            photo, not a consolation prize. That is what stops it from becoming
            the egg.
          </Callout>
          <Callout title="4. Reserved characters carry meaning">
            Patchy is daily.dev, so only official accounts wear him.
            Organizations get a workplace object, squads a gathering, deleted
            accounts a ghost. Nobody can pick any of them.
          </Callout>
          <Callout title="5. Built for 24 pixels">
            Most avatars render at 24 to 40 pixels. Below 40 we serve a face
            crop, and the cast standardizes on a clean gradient backdrop so a
            row of avatars reads as faces, not noise.
          </Callout>
          <Callout title="6. Absence gets its own character">
            A deleted account becomes a quiet, desaturated ghost, so a removed
            reply reads as gone, not as a new person joining the thread.
          </Callout>
        </div>
      </Section>

      <Section
        title="Review it in ten minutes"
        description="The shortest path through the folder for someone seeing it for the first time."
      >
        <ol className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-4">
          {[
            {
              step: 'This page',
              note: 'The idea, the six rules, the before and after thread.',
            },
            {
              step: '3. In the product',
              note: 'Flip the Today / With characters toggle across nine real surfaces.',
            },
            {
              step: '5. Reserved roles',
              note: 'The decided art for daily.dev, deleted accounts, organizations and squads.',
            },
            {
              step: '6. Edit profile › 3. Simulator',
              note: 'Change an avatar every possible way, on phone, tablet and laptop.',
            },
          ].map(({ step, note }, index) => (
            <li
              key={step}
              className="flex flex-col gap-1 rounded-16 bg-surface-float p-4"
            >
              <span className="text-text-quaternary typo-caption1">
                Step {index + 1}
              </span>
              <span className="font-bold typo-callout">{step}</span>
              <span className="ap-pretty text-text-tertiary typo-footnote">
                {note}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Every chapter"
        description="Each chapter opens with the question it answers, the goal, and the number that tells us whether it worked."
      >
        <Table
          head={['Chapter', 'The question', 'What to look at']}
          rows={[
            [
              '1. The cast',
              'Which characters, and do they survive 16 pixels?',
              'Family rules, the size ladder, face crops, the art brief for the next batch',
            ],
            [
              '2. Assignment',
              'How does someone get their character?',
              'Live hash playground, distribution over 10,000 signups, why the pool is frozen, duplicate odds in stacks',
            ],
            [
              '3. In the product',
              'Where does it show up?',
              'Nine production surfaces with a Today / With characters toggle, built on the real ProfilePicture',
            ],
            [
              '4. Signup reveal',
              'How does an assigned face become a chosen one?',
              'The once-only “Meet Nocturne” moment on laptop and mobile, opening the same picker as Edit profile',
            ],
            [
              '5. Reserved roles',
              'Which faces are not for anyone?',
              'Patchy, the deleted-account ghost and slot treatments, organization and squad art with contrast ladders',
            ],
            [
              '6. Edit profile',
              'How do people change their avatar later?',
              'Overview and audit, avatar field, picker per breakpoint, live simulator, step-by-step flows, build guide',
            ],
            [
              '7. Rollout',
              'How do we ship it without breaking anything?',
              'Three phases (the first needs no backend), code touch points, risks and guardrails',
            ],
          ]}
        />
      </Section>

      <Section
        title="Decided, and still open"
        description="Calls made during review, so nobody re-litigates them, and the ones that still need an owner."
      >
        <Table
          head={['Topic', 'Status', 'Call']}
          rows={[
            [
              'Official accounts',
              'Decided',
              'Patchy, never assignable or pickable',
            ],
            [
              'Deleted accounts',
              'Decided',
              'Outline ghost inside a dashed slot that traces the avatar edge',
            ],
            ['Organizations and companies', 'Decided', 'HQ building on teal'],
            [
              'Squads without a cover',
              'Decided',
              'Campfire with a purple flame',
            ],
            [
              'Who gets a human face',
              'Proposed',
              'Pick-only, never auto-assigned',
            ],
            [
              'Saving avatar changes',
              'Proposed',
              'Saves on its own with five seconds of Undo, not with the form Save',
            ],
            [
              'Backend',
              'Open',
              'What image: null stores, whitelisting character URLs, keeping the provider photo',
            ],
            [
              'Art',
              'Open',
              'Grow the critters to 64, repaint Idle’s scarf, export characters on transparent layers',
            ],
          ]}
        />
      </Section>

      <Section title="What we would measure">
        <Table
          head={['Kind', 'Metric', 'Why']}
          rows={[
            [
              'Primary',
              'Share of avatar impressions that render the gray fallback',
              'Mechanical and immediate. Phase one drives it to zero, deleted accounts included.',
            ],
            [
              'Adoption',
              'No-photo signups who keep or pick a character in their first week',
              'Tells us whether the face feels owned. Keeping the assigned one counts, it is an active choice in the reveal.',
            ],
            [
              'Guardrail',
              'Photo upload rate for new signups',
              'Must not drop. Real photos still matter for hiring and trust surfaces, so upload stays one tap away.',
            ],
            [
              'Hypothesis',
              'Reply rate on threads with three or more no-photo authors',
              'If people are easier to tell apart, replying to the right person gets easier. Worth an A/B, not a promise.',
            ],
          ]}
        />
      </Section>
    </Page>
  ),
};
