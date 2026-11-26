import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CameraIcon } from '@dailydotdev/shared/src/components/icons/Camera';
import { ClearIcon } from '@dailydotdev/shared/src/components/icons/Clear';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Callout,
  CalloutTone,
  Page,
  PageHeader,
  Section,
  Table,
} from '../shell';
import { placeholderAvatarSrc } from '../data';
import { AvatarImage, EditMotion } from './kit';
import type { AvatarState } from './model';
import {
  AvatarSource,
  samplePhoto,
  scenarios,
  SocialProvider,
  sourceLabel,
  storedImageValue,
} from './model';

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/0. Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const person = scenarios[0].person;

const sources: { state: () => AvatarState; how: string }[] = [
  {
    state: () => ({ source: AvatarSource.Assigned }),
    how: 'Signed up with email, or removed a photo. Derived from the user id, nothing stored.',
  },
  {
    state: () => ({ source: AvatarSource.Character, characterId: 'daemon' }),
    how: 'Picked in the signup reveal or the picker. Stored, so every surface agrees.',
  },
  {
    state: () => ({ source: AvatarSource.Upload, photo: samplePhoto() }),
    how: 'Uploaded in Edit profile or from their own profile. Cropped on the device first.',
  },
  {
    state: () => ({
      source: AvatarSource.Social,
      provider: SocialProvider.GitHub,
      photo: samplePhoto('GH', 220),
    }),
    how: 'Came from Google, GitHub or Apple at signup. Behaves like an upload.',
  },
];

const TodayField = (): ReactElement => (
  <div className="relative size-[7.5rem]">
    <img
      src={placeholderAvatarSrc}
      alt=""
      className="size-full rounded-26 object-cover"
    />
    <div className="absolute inset-0 flex items-center justify-center gap-2">
      {[
        { id: 'camera', Icon: CameraIcon },
        { id: 'clear', Icon: ClearIcon },
      ].map(({ id, Icon }) => (
        <span
          key={id}
          className="flex size-8 items-center justify-center rounded-10 bg-overlay-tertiary-black text-white"
        >
          <Icon size={IconSize.Medium} />
        </span>
      ))}
    </div>
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="What can happen to someone's avatar, and where?"
        title="Four kinds of avatar, one editor, every change reversible."
        goal="Anyone can go from any avatar to any other in two taps, on any screen, and nobody ever lands on gray."
        metric="Avatar change completion rate. Undo rate as the regret signal. Photo upload rate must hold."
      >
        <p>
          With characters in the product, an avatar is no longer &ldquo;a photo
          or nothing&rdquo;. It is one of four things, and people move between
          them: a new user swaps the character they were given, someone with a
          photo tries a character, someone who picked a character later adds a
          photo, a GitHub user wants their GitHub photo back.
        </p>
        <p>
          This folder designs the one editor that handles all of it, in Edit
          profile and directly on your own profile, at mobile, tablet and laptop
          sizes. Start with the simulator (6.3) if you want to feel it, or read
          on for the model.
        </p>
      </PageHeader>

      <Section
        title="Four places an avatar comes from"
        description="What the user sees, and what user.image actually holds. The assigned character is the only one never stored: it is derived from the id, so the column keeps noProfile."
      >
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
          {sources.map(({ state, how }) => {
            const value = state();
            return (
              <div
                key={value.source}
                className="flex flex-col gap-3 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-4"
              >
                <AvatarImage
                  state={value}
                  person={person}
                  sizePx={64}
                  animate={false}
                />
                <span className="font-bold typo-callout">
                  {sourceLabel[value.source]}
                </span>
                <span className="ap-pretty text-text-tertiary typo-footnote">
                  {how}
                </span>
                <code className="mt-auto break-all rounded-8 bg-surface-float px-2 py-1.5 font-mono text-text-secondary typo-caption2">
                  {storedImageValue(value)}
                </code>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title="Every way between them"
        description="Each row is a real path someone will take. All of them save immediately and can be undone for five seconds."
      >
        <Table
          head={['From', 'To', 'How', 'Stored as', 'Notes']}
          rows={[
            [
              'Assigned',
              'Another character',
              'Avatar → Choose a character',
              'Character URL',
              'The common first edit. The given one stays pinned at the top of the picker.',
            ],
            [
              'Any character',
              'Back to the given one',
              'Picker → “Given to you”',
              'noProfile',
              'Stored as noProfile so it stays derived, and phase three can backfill it.',
            ],
            [
              'Any character',
              'Photo',
              'Avatar → Upload a photo → crop',
              'Upload URL',
              'Mobile offers library and camera. Big photos are resized on the device.',
            ],
            [
              'Photo',
              'Character',
              'Avatar → Choose a character',
              'Character URL',
              'Replaces the photo. Undo restores it, so the old file must live a little longer on the server.',
            ],
            [
              'Photo',
              'Assigned',
              'Avatar → Remove photo',
              'noProfile',
              'Lands on the assigned character with a toast that names it. Never gray.',
            ],
            [
              'Social photo',
              'Character, then back',
              'Avatar → Use your GitHub photo',
              'Provider URL',
              'Needs the backend to keep the provider photo URL from signup.',
            ],
            [
              'Anything',
              'What it was',
              'Undo in the toast',
              'Previous value',
              'Five seconds, keyboard reachable, one level deep.',
            ],
            [
              'Upload fails',
              'Unchanged',
              'Automatic',
              'Nothing',
              'The old avatar stays, the caption explains, the crop is kept for a retry.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Today's Edit profile, audited"
        description="What the current ControlledAvatarUpload on /settings/profile does, and what has to change before characters can live there."
      >
        <div className="grid gap-6 laptop:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-start gap-3 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
            <TodayField />
            <span className="text-text-tertiary typo-caption1">
              The field today: 120px, camera and clear buttons always on top of
              the face.
            </span>
          </div>
          <div className="grid gap-3 tablet:grid-cols-2">
            <Callout tone={CalloutTone.Bad} title="Buttons sit on the face">
              Camera and clear are always visible in the middle of the avatar,
              covering the photo they are supposed to manage. The X reads as
              &ldquo;close&rdquo;, not &ldquo;remove photo&rdquo;.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Remove means gray">
              Clearing sets image to null and the field shows the silhouette.
              With characters it must land on the assigned one, and say so.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="It waits for Save">
              The avatar rides along with the whole form. Change it, navigate
              away, and the change is gone unless the dirty-form prompt catches
              you. An avatar picker should save on its own.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="No crop, 1 MB limit">
              Whatever the center of the photo is, that is the avatar. Most
              phone photos are 2 to 5 MB, so they simply fail. Resize on the
              device instead, and only refuse truly huge files.
            </Callout>
            <Callout
              tone={CalloutTone.Bad}
              title="Dropping a wrong file crashes"
            >
              useControlledImageUpload calls onError without a default, and the
              avatar field never passes one. Flagged as its own fix.
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Two dead ends">
              Email signups never see an avatar at signup, and on your own
              profile the avatar is not tappable: the pencil sends you to
              settings to change it.
            </Callout>
          </div>
        </div>
      </Section>

      <Section title="Principles">
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Never gray">
            Every path ends on a face: a photo, a chosen character, or the
            assigned one.
          </Callout>
          <Callout tone={CalloutTone.Good} title="One target, one badge">
            The whole avatar is the button. A small camera badge says it is
            editable. Nothing sits on the face.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Character and photo are equals"
          >
            Same menu, same picker, side by side tabs. Neither is the
            consolation prize.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Saves on its own, undo for five seconds"
          >
            No form Save, no confirmation dialogs. A toast names the result and
            offers Undo.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Same editor everywhere">
            Edit profile, your own profile and the signup reveal open the same
            menu and picker.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Shaped by the screen">
            Action sheet and bottom sheet on phones, popover and modal on tablet
            and laptop. Same choices, same order.
          </Callout>
        </div>
      </Section>

      <Section title="Chapters">
        <Table
          head={['Chapter', 'Question', 'What is inside']}
          rows={[
            [
              '1. Avatar field',
              'What does the avatar look like in every state?',
              'Field states, menu variants per state, the owner badge on your profile',
            ],
            [
              '2. Picker',
              'How does choosing feel on each screen?',
              'Bottom sheet, tablet modal and two-pane laptop modal, photo tab, crop, errors',
            ],
            [
              '3. Simulator',
              'Does every path actually work?',
              'All flows live, with stored value and analytics events',
            ],
            [
              '4. Flows',
              'What are the steps, case by case?',
              'Step-by-step storyboards for eight cases',
            ],
            [
              '5. Build',
              'How do we ship it?',
              'Components, API, breakpoints, accessibility, edge cases, tests, open questions',
            ],
          ]}
        />
      </Section>
    </Page>
  ),
};
