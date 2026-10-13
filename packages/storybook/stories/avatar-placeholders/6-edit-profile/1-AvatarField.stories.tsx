import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout, CalloutTone, Page, PageHeader, Section } from '../shell';
import {
  AvatarActionSheet,
  AvatarField,
  AvatarImage,
  avatarMenuItems,
  AvatarMenuPopover,
  DeviceFrame,
  EditMotion,
  OwnProfileMock,
  Scaled,
  SettingsPageMock,
  UploadError,
} from './kit';
import type { AvatarState } from './model';
import {
  AvatarSource,
  Device,
  deviceSpec,
  samplePhoto,
  scenarios,
  SocialProvider,
} from './model';

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/1. Avatar field',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const person = scenarios[0].person;
const noop = (): void => undefined;

const states: {
  label: string;
  note: string;
  state: () => AvatarState;
  isUploading?: boolean;
  isDragOver?: boolean;
  error?: UploadError;
}[] = [
  {
    label: 'Assigned character',
    note: 'Names the character and says where it came from.',
    state: () => ({ source: AvatarSource.Assigned }),
  },
  {
    label: 'Chosen character',
    note: 'Same layout, owned wording.',
    state: () => ({ source: AvatarSource.Character, characterId: 'daemon' }),
  },
  {
    label: 'Uploaded photo',
    note: 'Nothing on the face, the badge does the talking.',
    state: () => ({ source: AvatarSource.Upload, photo: samplePhoto() }),
  },
  {
    label: 'Social photo',
    note: 'Names the provider, so a later swap is understood.',
    state: () => ({
      source: AvatarSource.Social,
      provider: SocialProvider.GitHub,
      photo: samplePhoto('GH', 220),
    }),
  },
  {
    label: 'Dragging a file over',
    note: 'Laptop only. The dashed slot follows the avatar radius.',
    state: () => ({ source: AvatarSource.Assigned }),
    isDragOver: true,
  },
  {
    label: 'Uploading',
    note: 'The old avatar stays underneath until the new one is saved.',
    state: () => ({ source: AvatarSource.Upload, photo: samplePhoto() }),
    isUploading: true,
  },
  {
    label: 'Upload failed',
    note: 'Old avatar kept, reason in the caption.',
    state: () => ({ source: AvatarSource.Assigned }),
    error: UploadError.Network,
  },
  {
    label: 'File too big',
    note: 'Only above 20 MB. Anything smaller is resized on the device.',
    state: () => ({ source: AvatarSource.Character, characterId: 'daemon' }),
    error: UploadError.Size,
  },
];

const Card = ({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex flex-col gap-3">
    <div className="flex min-h-[11rem] items-center rounded-20 border border-border-subtlest-tertiary bg-background-default p-5">
      {children}
    </div>
    <figcaption className="flex flex-col px-1">
      <span className="font-bold typo-footnote">{label}</span>
      <span className="ap-pretty text-text-tertiary typo-caption1">{note}</span>
    </figcaption>
  </figure>
);

const menuStates: { label: string; note: string; state: AvatarState }[] = [
  {
    label: 'On a character',
    note: 'Two choices. Nothing to remove.',
    state: { source: AvatarSource.Assigned },
  },
  {
    label: 'On a photo',
    note: 'Remove says where you will land.',
    state: { source: AvatarSource.Upload, photo: samplePhoto() },
  },
  {
    label: 'GitHub user on a character',
    note: 'A way back to the photo they signed up with.',
    state: { source: AvatarSource.Character, characterId: 'daemon' },
  },
];

export const AvatarFieldStory: StoryObj = {
  name: 'Avatar field',
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="What does the avatar look like in every state?"
        title="One tap target, one small badge, and a caption that says what you are looking at."
        goal="The avatar field explains itself in every state, and never hides the face behind controls."
        metric="Share of Edit profile visits that open the avatar menu."
      >
        <p>
          Replaces ControlledAvatarUpload on Edit profile. The whole avatar is a
          button with a camera badge on the corner. Next to it, below the cover,
          a caption names what you have: the character&apos;s name, or
          &ldquo;Your photo&rdquo;. Errors replace the caption, so the page
          never jumps.
        </p>
      </PageHeader>

      <Section
        title="Every state, laptop and tablet size (120px)"
        description="The mobile field is the same at 96px. Hover and focus get a ring on the avatar itself."
      >
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
          {states.map((item) => (
            <Card key={item.label} label={item.label} note={item.note}>
              <AvatarField
                state={item.state()}
                person={person}
                device={Device.Laptop}
                isUploading={item.isUploading}
                isDragOver={item.isDragOver}
                error={item.error}
              />
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="The menu changes with the state"
        description="Popover under the avatar on tablet and laptop, action sheet on mobile. Same items, same order: character first, photo second, remove last and only when there is a photo."
      >
        <div className="grid gap-4 laptop:grid-cols-3">
          {menuStates.map((item) => (
            <Card key={item.label} label={item.label} note={item.note}>
              <div className="relative h-[16rem] w-full">
                <AvatarField
                  state={item.state}
                  person={person}
                  device={Device.Laptop}
                  withCaption={false}
                  isMenuOpen
                  menu={
                    <AvatarMenuPopover
                      items={avatarMenuItems({
                        state: item.state,
                        person,
                        device: Device.Laptop,
                        provider: item.label.startsWith('GitHub')
                          ? SocialProvider.GitHub
                          : undefined,
                        providerPhoto: item.label.startsWith('GitHub')
                          ? samplePhoto('GH', 220)
                          : undefined,
                        onChoose: noop,
                        onUpload: noop,
                        onRemove: noop,
                      })}
                    />
                  }
                />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="On a phone"
        description="Edit profile at 375px with the action sheet open on a photo. The 96px avatar keeps the same badge and caption."
      >
        <div className="flex flex-wrap gap-6">
          <DeviceFrame device={Device.Mobile} height={640}>
            <SettingsPageMock
              device={Device.Mobile}
              person={person}
              avatar={
                <AvatarField
                  state={{ source: AvatarSource.Assigned }}
                  person={person}
                  device={Device.Mobile}
                />
              }
            />
          </DeviceFrame>
          <DeviceFrame device={Device.Mobile} height={640}>
            <SettingsPageMock
              device={Device.Mobile}
              person={person}
              avatar={
                <AvatarField
                  state={{ source: AvatarSource.Upload, photo: samplePhoto() }}
                  person={person}
                  device={Device.Mobile}
                  isMenuOpen
                />
              }
            />
            <AvatarActionSheet
              items={avatarMenuItems({
                state: { source: AvatarSource.Upload, photo: samplePhoto() },
                person,
                device: Device.Mobile,
                onChoose: noop,
                onUpload: noop,
                onRemove: noop,
              })}
              onClose={noop}
            />
          </DeviceFrame>
        </div>
      </Section>

      <Section
        title="Your own profile is editable in place"
        description="Today the avatar on your own profile is a picture and the pencil sends you to settings. The owner now gets the same badge and menu right there. Visitors see no badge at all."
      >
        <div className="flex flex-wrap items-start gap-6">
          <figure className="flex flex-col gap-2">
            <DeviceFrame device={Device.Mobile} height={420}>
              <OwnProfileMock
                device={Device.Mobile}
                person={person}
                state={{
                  source: AvatarSource.Character,
                  characterId: 'daemon',
                }}
              />
            </DeviceFrame>
            <figcaption className="text-text-tertiary typo-caption1">
              Owner on mobile, 80px avatar
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-2">
            <Scaled
              scale={0.6}
              width={deviceSpec[Device.Laptop].width}
              height={460}
            >
              <DeviceFrame device={Device.Laptop} height={460}>
                <OwnProfileMock
                  device={Device.Laptop}
                  person={person}
                  state={{ source: AvatarSource.Upload, photo: samplePhoto() }}
                  menu={
                    <AvatarMenuPopover
                      items={avatarMenuItems({
                        state: {
                          source: AvatarSource.Upload,
                          photo: samplePhoto(),
                        },
                        person,
                        device: Device.Laptop,
                        onChoose: noop,
                        onUpload: noop,
                        onRemove: noop,
                      })}
                    />
                  }
                />
              </DeviceFrame>
            </Scaled>
            <figcaption className="text-text-tertiary typo-caption1">
              Owner on laptop with the menu open, 120px avatar
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-20 border border-border-subtlest-tertiary bg-background-default p-5">
              <AvatarImage
                state={{
                  source: AvatarSource.Character,
                  characterId: 'daemon',
                }}
                person={person}
                sizePx={80}
                radius="1rem"
                animate={false}
              />
              <span className="ap-pretty max-w-[16ch] text-text-tertiary typo-footnote">
                A visitor sees the avatar only: no badge, no hint it is a
                character.
              </span>
            </div>
          </figure>
        </div>
      </Section>

      <Section title="Rules for the field">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="The badge never moves">
            Bottom right corner, 32px, background color with a border, in every
            state. Same badge on your own profile.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Caption, not toast, for errors"
          >
            The reason stays next to the avatar until the next attempt, where
            the eye already is.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Hover-only controls">
            Phones have no hover. Anything only revealed on hover is missing for
            half the users.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="A remove button on the face">
            Removing is rare and lands somewhere specific. It belongs in the
            menu with its consequence spelled out.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
