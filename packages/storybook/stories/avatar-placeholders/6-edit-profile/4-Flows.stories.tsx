import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, PageHeader, Section } from '../shell';
import {
  AvatarActionSheet,
  AvatarField,
  avatarMenuItems,
  AvatarPicker,
  DeviceFrame,
  EditMotion,
  OwnProfileMock,
  PickerTab,
  Scaled,
  SettingsPageMock,
  Toast,
  UploadError,
} from './kit';
import type { AvatarState } from './model';
import {
  assignedFor,
  AvatarSource,
  Device,
  deviceSpec,
  samplePhoto,
  scenarios,
  SocialProvider,
} from './model';

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/4. Flows',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const person = scenarios[0].person;
const assigned = assignedFor(person);
const noop = (): void => undefined;
const SCALE = 0.56;
const FRAME_HEIGHT = 700;

const photo = samplePhoto();
const github = samplePhoto('GH', 220);

const assignedState: AvatarState = { source: AvatarSource.Assigned };
const photoState: AvatarState = { source: AvatarSource.Upload, photo };

enum Overlay {
  None,
  Sheet,
  Picker,
}

interface StepSpec {
  caption: string;
  state: AvatarState;
  overlay?: Overlay;
  sheetFor?: AvatarState;
  pickerTab?: PickerTab;
  selectedId?: string;
  crop?: boolean;
  isUploading?: boolean;
  error?: UploadError;
  toast?: string;
  undo?: boolean;
  profile?: boolean;
  provider?: SocialProvider;
}

const Step = ({
  index,
  spec,
}: {
  index: number;
  spec: StepSpec;
}): ReactElement => {
  const device = Device.Mobile;
  const sheetState = spec.sheetFor ?? spec.state;
  const page = spec.profile ? (
    <OwnProfileMock device={device} person={person} state={spec.state} />
  ) : (
    <SettingsPageMock
      device={device}
      person={person}
      avatar={
        <AvatarField
          state={spec.state}
          person={person}
          device={device}
          isUploading={spec.isUploading}
          error={spec.error}
        />
      }
    />
  );

  return (
    <figure className="flex w-[13.125rem] shrink-0 flex-col gap-2">
      <Scaled
        scale={SCALE}
        width={deviceSpec[device].width}
        height={FRAME_HEIGHT}
      >
        <DeviceFrame device={device} height={FRAME_HEIGHT}>
          {page}
          {spec.overlay === Overlay.Sheet && (
            <AvatarActionSheet
              items={avatarMenuItems({
                state: sheetState,
                person,
                device,
                provider: spec.provider,
                providerPhoto: spec.provider ? github : undefined,
                onChoose: noop,
                onUpload: noop,
                onRemove: noop,
              })}
              onClose={noop}
            />
          )}
          {spec.overlay === Overlay.Picker && (
            <AvatarPicker
              device={device}
              state={spec.state}
              person={person}
              initialTab={spec.pickerTab}
              initialSelectedId={spec.selectedId}
              initialCrop={spec.crop ? photo : undefined}
              onApply={noop}
              onClose={noop}
            />
          )}
          {spec.toast && (
            <Toast message={spec.toast} onUndo={spec.undo ? noop : undefined} />
          )}
        </DeviceFrame>
      </Scaled>
      <figcaption className="flex gap-2 px-1">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-max bg-surface-float font-bold text-text-secondary typo-caption2">
          {index + 1}
        </span>
        <span className="ap-pretty min-w-0 flex-1 text-text-tertiary typo-caption1">
          {spec.caption}
        </span>
      </figcaption>
    </figure>
  );
};

const Flow = ({
  title,
  description,
  steps,
}: {
  title: string;
  description: ReactNode;
  steps: StepSpec[];
}): ReactElement => (
  <Section title={title} description={description}>
    <div className="flex gap-5 overflow-x-auto pb-2">
      {steps.map((spec, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Step key={index} index={index} spec={spec} />
      ))}
    </div>
  </Section>
);

const nyan: AvatarState = {
  source: AvatarSource.Character,
  characterId: 'nyan',
};
const fetchState: AvatarState = {
  source: AvatarSource.Character,
  characterId: 'fetch',
};
const daemon: AvatarState = {
  source: AvatarSource.Character,
  characterId: 'daemon',
};
const githubState: AvatarState = {
  source: AvatarSource.Social,
  provider: SocialProvider.GitHub,
  photo: github,
};

export const Flows: StoryObj = {
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="What are the steps, case by case?"
        title="Eight real cases, step by step, at phone size where most of them happen."
        goal="Every case reads as two to four calm steps with one obvious action each."
        metric="Steps to done per case, measured in the simulator and in production funnels."
      >
        <p>
          Each row is a storyboard of real components in fixed states. Scroll a
          row sideways on small screens. The same steps on tablet and laptop
          swap the action sheet for a popover and the bottom sheet for a modal
          (6.2 Picker).
        </p>
      </PageHeader>

      <Flow
        title="1. A new user swaps the character they were given"
        description={`The most common edit. ${assigned.name} stays pinned first in the picker, so the way back is one tap.`}
        steps={[
          {
            caption: `Edit profile shows ${assigned.name} and says it was given.`,
            state: assignedState,
          },
          {
            caption: 'Tapping the avatar opens the action sheet.',
            state: assignedState,
            overlay: Overlay.Sheet,
          },
          {
            caption: 'Choose a character. Fetch selected, preview updates.',
            state: assignedState,
            overlay: Overlay.Picker,
            selectedId: 'fetch',
          },
          {
            caption: 'Saved on its own. Toast names it and offers Undo.',
            state: fetchState,
            toast: "You're Fetch now",
            undo: true,
          },
        ]}
      />

      <Flow
        title="2. Adding a photo"
        description="From any character. The phone offers library and camera, then a square crop before anything uploads."
        steps={[
          {
            caption: 'Take or choose a photo.',
            state: assignedState,
            overlay: Overlay.Sheet,
          },
          {
            caption: 'Photo tab with the two native paths.',
            state: assignedState,
            overlay: Overlay.Picker,
            pickerTab: PickerTab.Photo,
          },
          {
            caption: 'Drag and zoom. Use photo.',
            state: assignedState,
            overlay: Overlay.Picker,
            crop: true,
          },
          {
            caption:
              'Uploading over the old avatar, which stays until it is saved.',
            state: assignedState,
            isUploading: true,
          },
          {
            caption: 'Done, with Undo.',
            state: photoState,
            toast: 'Photo updated',
            undo: true,
          },
        ]}
      />

      <Flow
        title="3. Trying a character over a photo"
        description="The photo is replaced, not lost: Undo brings it back for five seconds, and the menu always offers the upload again."
        steps={[
          {
            caption: 'On a photo, the sheet adds Remove with its consequence.',
            state: photoState,
            overlay: Overlay.Sheet,
          },
          {
            caption: 'Picks Nyan.',
            state: photoState,
            overlay: Overlay.Picker,
            selectedId: 'nyan',
          },
          {
            caption: 'Saved. Undo restores the photo.',
            state: nyan,
            toast: "You're Nyan now",
            undo: true,
          },
        ]}
      />

      <Flow
        title="4. Removing a photo"
        description={`No confirmation dialog. The menu says where you will land, the toast says where you landed.`}
        steps={[
          {
            caption: `Remove photo: “You'll show as ${assigned.name}”.`,
            state: photoState,
            overlay: Overlay.Sheet,
          },
          {
            caption: `Back on ${assigned.name}, never on gray.`,
            state: assignedState,
            toast: `Photo removed. You're ${assigned.name} again`,
            undo: true,
          },
        ]}
      />

      <Flow
        title="5. A GitHub user goes back to their GitHub photo"
        description="Signed up with GitHub, tried Daemon, misses the old photo. Needs the backend to keep the provider photo URL."
        steps={[
          {
            caption: 'On Daemon. The sheet offers the GitHub photo.',
            state: daemon,
            overlay: Overlay.Sheet,
            provider: SocialProvider.GitHub,
          },
          {
            caption: 'One tap, no upload.',
            state: githubState,
            toast: 'Back to your GitHub photo',
            undo: true,
          },
        ]}
      />

      <Flow
        title="6. An upload fails"
        description="Bad network or a server error. Nothing changes until a photo is actually saved."
        steps={[
          {
            caption: 'Crops and confirms.',
            state: assignedState,
            overlay: Overlay.Picker,
            crop: true,
          },
          { caption: 'Uploading.', state: assignedState, isUploading: true },
          {
            caption:
              'Old avatar kept, reason in the caption. Tapping retries with the same crop.',
            state: assignedState,
            error: UploadError.Network,
          },
        ]}
      />

      <Flow
        title="7. Editing from your own profile"
        description="No detour to settings. The owner taps their avatar on their profile, and the same sheet and picker open in place."
        steps={[
          {
            caption: 'Owner sees the badge on their own avatar.',
            state: assignedState,
            profile: true,
          },
          {
            caption: 'Same action sheet.',
            state: assignedState,
            profile: true,
            overlay: Overlay.Sheet,
          },
          {
            caption: 'Same picker.',
            state: assignedState,
            profile: true,
            overlay: Overlay.Picker,
            selectedId: 'ember',
          },
          {
            caption: 'Updated in place.',
            state: { source: AvatarSource.Character, characterId: 'ember' },
            profile: true,
            toast: "You're Ember now",
            undo: true,
          },
        ]}
      />

      <Section
        title="8. At signup"
        description="Email signups meet their assigned character in the reveal designed in 4. Signup reveal: Keep, Choose another (this same picker), or Upload a photo (this same Photo tab). Social signups with a provider photo skip it and keep their photo."
      >
        <span className="text-text-tertiary typo-footnote">
          Same picker component, opened with the reveal as its entry point.
        </span>
      </Section>
    </Page>
  ),
};
