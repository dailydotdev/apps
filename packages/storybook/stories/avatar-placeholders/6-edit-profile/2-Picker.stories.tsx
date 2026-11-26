import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Page,
  PageHeader,
  Section,
  Table,
} from '../shell';
import {
  AvatarField,
  AvatarPicker,
  DeviceFrame,
  EditMotion,
  PickerTab,
  Scaled,
  SettingsPageMock,
  UploadError,
} from './kit';
import type { AvatarState, Photo } from './model';
import {
  AvatarSource,
  Device,
  deviceSpec,
  samplePhoto,
  scenarios,
  SocialProvider,
} from './model';

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/2. Picker',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const person = scenarios[0].person;
const noop = (): void => undefined;

const scaleFor: Record<Device, number> = {
  [Device.Mobile]: 1,
  [Device.Tablet]: 0.72,
  [Device.Laptop]: 0.62,
};

const PickerFrame = ({
  device,
  state = { source: AvatarSource.Assigned },
  tab,
  error,
  crop,
  provider,
  providerPhoto,
  selectedId,
  caption,
}: {
  device: Device;
  state?: AvatarState;
  tab?: PickerTab;
  error?: UploadError;
  crop?: Photo;
  provider?: SocialProvider;
  providerPhoto?: Photo;
  selectedId?: string;
  caption: string;
}): ReactElement => {
  const spec = deviceSpec[device];
  const scale = scaleFor[device];
  return (
    <figure className="flex flex-col gap-2">
      <Scaled scale={scale} width={spec.width} height={spec.height}>
        <DeviceFrame device={device}>
          <SettingsPageMock
            device={device}
            person={person}
            avatar={
              <AvatarField state={state} person={person} device={device} />
            }
          />
          <AvatarPicker
            device={device}
            state={state}
            person={person}
            initialTab={tab}
            error={error}
            initialCrop={crop}
            provider={provider}
            providerPhoto={providerPhoto}
            initialSelectedId={selectedId}
            onApply={noop}
            onClose={noop}
          />
        </DeviceFrame>
      </Scaled>
      <figcaption className="flex flex-col px-1">
        <span className="font-bold typo-footnote">
          {spec.label} · {spec.range}
        </span>
        <span className="ap-pretty max-w-[40ch] text-text-tertiary typo-caption1">
          {caption}
        </span>
      </figcaption>
    </figure>
  );
};

export const Picker: StoryObj = {
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="How does choosing feel on each screen?"
        title="Same choices in the same order, shaped by the screen: a bottom sheet, a modal, and a two-pane modal."
        goal="Picking a character or a photo takes one sheet and one confirm, with a preview at the sizes people actually see."
        metric="Picker open to apply rate, per breakpoint."
      >
        <p>
          The picker opens from the avatar menu (Choose a character, or Upload a
          photo straight to the Photo tab). The character you were given is
          pinned first as &ldquo;Given to you&rdquo;, so going back is always
          one tap. The confirm button names the result: &ldquo;Use Fetch&rdquo;,
          never a generic Save.
        </p>
        <p>
          Every frame here is live: tap tiles, switch tabs, drop or pick a real
          image file, drag the crop.
        </p>
      </PageHeader>

      <Section
        title="Characters, at three breakpoints"
        description="Mobile is a bottom sheet with a sticky full-width button above the home indicator. Tablet is a single-column modal. Laptop gets two panes, with the live size preview on the left."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PickerFrame
            device={Device.Mobile}
            selectedId="fetch"
            caption="Bottom sheet at 92% height. Compact preview row stays at the top while the grid scrolls. Tiles 60px, four or five per row."
          />
          <PickerFrame
            device={Device.Tablet}
            selectedId="fetch"
            caption="Centered modal, 32rem. Preview row with the three sizes. Cancel and Use on the right."
          />
          <PickerFrame
            device={Device.Laptop}
            selectedId="fetch"
            caption="46rem modal, two panes. 120px preview plus Feed, Comments and Profile sizes on the left, grid on the right."
          />
        </div>
      </Section>

      <Section
        title="The Photo tab"
        description="Laptop and tablet get a drop zone. Phones get the two native paths: the library, and the front camera. A GitHub or Google user on a character sees their original photo first."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PickerFrame
            device={Device.Mobile}
            tab={PickerTab.Photo}
            state={{ source: AvatarSource.Character, characterId: 'daemon' }}
            provider={SocialProvider.GitHub}
            providerPhoto={samplePhoto('GH', 220)}
            caption="GitHub user currently on a character. “Use it” restores the signup photo in one tap."
          />
          <PickerFrame
            device={Device.Laptop}
            tab={PickerTab.Photo}
            caption="Drop zone. Accepted types are named in plain words. Large photos are resized for the user instead of refused."
          />
        </div>
      </Section>

      <Section
        title="Crop and errors"
        description="After choosing a file, the same sheet or modal turns into a square crop: drag to reposition, slider to zoom, and the preview shows the result at the real sizes. Errors appear above the drop zone and keep the current avatar."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PickerFrame
            device={Device.Mobile}
            crop={samplePhoto()}
            caption="Crop on mobile. Back in the header, Use photo at the bottom. Drag works with one finger."
          />
          <PickerFrame
            device={Device.Laptop}
            crop={samplePhoto('AR', 140)}
            caption="Crop on laptop, with the size preview updating as you drag."
          />
          <PickerFrame
            device={Device.Mobile}
            tab={PickerTab.Photo}
            error={UploadError.Type}
            caption="Wrong file type. Named formats, no jargon."
          />
          <PickerFrame
            device={Device.Tablet}
            tab={PickerTab.Photo}
            error={UploadError.Size}
            caption="Only refused above 20 MB."
          />
        </div>
      </Section>

      <Section title="Breakpoints">
        <Table
          head={['Breakpoint', 'Menu', 'Picker', 'Photo input', 'Grid']}
          rows={[
            [
              'Mobile, below 656px',
              'Action sheet (ListDrawer)',
              'Bottom sheet, 92% height, sticky CTA with safe area',
              'Library, and camera with capture="user"',
              'auto-fill, 60px tiles',
            ],
            [
              'Tablet, 656 to 1019px',
              'Popover (DropdownMenu)',
              'Modal, 32rem, one column',
              'Drop zone and browse',
              'auto-fill, 56px tiles',
            ],
            [
              'Laptop, 1020px and up',
              'Popover (DropdownMenu)',
              'Modal, 46rem, two panes',
              'Drop zone, browse, and drop directly on the avatar field',
              'auto-fill, 56px tiles',
            ],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Good}
            title="Breakpoint by view size, not device"
          >
            Use useViewSize(ViewSize.Tablet) and Modal&apos;s isDrawerOnMobile,
            so a narrow laptop window gets the sheet and an iPad in landscape
            gets the modal.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="The grid fills, it does not count"
          >
            auto-fill with a minimum tile size, so 320px phones and wide tablets
            both get full rows without a breakpoint per width.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
