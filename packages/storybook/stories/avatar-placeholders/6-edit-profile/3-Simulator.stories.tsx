import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Page, PageHeader, Section } from '../shell';
import type { AvatarState, Scenario } from './model';
import {
  assignedFor,
  AvatarSource,
  Device,
  deviceSpec,
  displayedCharacter,
  isPhoto,
  scenarios,
  sourceLabel,
  storedImageValue,
} from './model';
import {
  avatarMenuItems,
  AvatarActionSheet,
  AvatarField,
  AvatarMenuPopover,
  AvatarPicker,
  DeviceFrame,
  EditMotion,
  FitToWidth,
  isCompact,
  OwnProfileMock,
  PickerTab,
  SettingsPageMock,
  Toast,
  UploadError,
} from './kit';

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/3. Simulator',
  parameters: { layout: 'fullscreen' },
};

export default meta;

enum Surface {
  Settings = 'settings',
  Profile = 'profile',
}

enum OverlayKind {
  None = 'none',
  Menu = 'menu',
  Picker = 'picker',
}

const SAVE_MS = 700;
const TOAST_MS = 5000;

const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-12 bg-surface-float p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={classNames(
            'ap-press rounded-8 px-3 py-1 font-bold typo-footnote',
            value === option.value
              ? 'bg-background-default text-text-primary'
              : 'text-text-tertiary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const Simulator = (): ReactElement => {
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [device, setDevice] = useState(Device.Mobile);
  const [surface, setSurface] = useState(Surface.Settings);
  const [avatar, setAvatar] = useState<AvatarState>(scenario.initial());
  const [previous, setPrevious] = useState<AvatarState | undefined>();
  const [overlay, setOverlay] = useState(OverlayKind.None);
  const [pickerTab, setPickerTab] = useState(PickerTab.Characters);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | undefined>();
  const [error, setError] = useState<UploadError | undefined>();
  const [failNextUpload, setFailNextUpload] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const toastTimer = useRef<number>();

  const { person } = scenario;
  const assigned = assignedFor(person);
  const providerPhoto = scenario.providerPhoto?.();

  const track = (event: string) =>
    setLog((items) => [event, ...items].slice(0, 8));

  const reset = (next: Scenario) => {
    setScenario(next);
    setAvatar(next.initial());
    setPrevious(undefined);
    setOverlay(OverlayKind.None);
    setToast(undefined);
    setError(undefined);
    setLog([]);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(undefined), TOAST_MS);
  };

  const commit = (next: AvatarState, message: string, event: string) => {
    setOverlay(OverlayKind.None);
    setError(undefined);
    setIsSaving(true);
    window.setTimeout(() => {
      setIsSaving(false);
      if (
        failNextUpload &&
        isPhoto(next) &&
        next.source === AvatarSource.Upload
      ) {
        setFailNextUpload(false);
        setError(UploadError.Network);
        track('avatar_upload_error {reason: network}');
        return;
      }
      setPrevious(avatar);
      setAvatar(next);
      showToast(message);
      track(event);
    }, SAVE_MS);
  };

  const apply = (next: AvatarState) => {
    const character = displayedCharacter(next, person);
    if (next.source === AvatarSource.Upload) {
      commit(next, 'Photo updated', 'avatar_photo_upload');
      return;
    }
    if (next.source === AvatarSource.Social) {
      commit(
        next,
        `Back to your ${next.provider} photo`,
        'avatar_provider_photo_restore',
      );
      return;
    }
    commit(
      next,
      `You're ${character?.name} now`,
      `avatar_character_apply {id: ${character?.id}}`,
    );
  };

  const remove = () => {
    setOverlay(OverlayKind.None);
    setPrevious(avatar);
    setAvatar({ source: AvatarSource.Assigned });
    showToast(`Photo removed. You're ${assigned.name} again`);
    track('avatar_photo_remove');
  };

  const undo = () => {
    if (!previous) {
      return;
    }
    setAvatar(previous);
    setPrevious(undefined);
    setToast(undefined);
    track('avatar_undo');
  };

  const openPicker = (tab: PickerTab) => {
    setPickerTab(tab);
    setOverlay(OverlayKind.Picker);
    track(`avatar_picker_open {tab: ${tab}}`);
  };

  const items = avatarMenuItems({
    state: avatar,
    person,
    device,
    provider: scenario.provider,
    providerPhoto,
    onChoose: () => openPicker(PickerTab.Characters),
    onUpload: () => openPicker(PickerTab.Photo),
    onRemove: remove,
    onUseProvider: () =>
      providerPhoto &&
      apply({
        source: AvatarSource.Social,
        provider: scenario.provider,
        photo: providerPhoto,
      }),
  });

  const openMenu = () => {
    setOverlay((value) =>
      value === OverlayKind.Menu ? OverlayKind.None : OverlayKind.Menu,
    );
    track('avatar_menu_open');
  };

  const popover =
    overlay === OverlayKind.Menu && !isCompact(device) ? (
      <AvatarMenuPopover items={items} />
    ) : null;

  const page =
    surface === Surface.Settings ? (
      <SettingsPageMock
        device={device}
        person={person}
        avatar={
          <AvatarField
            state={avatar}
            person={person}
            device={device}
            isUploading={isSaving}
            error={error}
            isMenuOpen={overlay === OverlayKind.Menu}
            onOpen={openMenu}
            menu={popover}
          />
        }
      />
    ) : (
      <OwnProfileMock
        device={device}
        person={person}
        state={avatar}
        onAvatarClick={openMenu}
        menu={popover}
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-6">
        <Segmented
          label="Starting point"
          value={scenario.id}
          options={scenarios.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          onChange={(id) =>
            reset(scenarios.find((item) => item.id === id) ?? scenarios[0])
          }
        />
        <Segmented
          label="Device"
          value={device}
          options={Object.values(Device).map((value) => ({
            value,
            label: deviceSpec[value].label,
          }))}
          onChange={(value) => {
            setDevice(value);
            setOverlay(OverlayKind.None);
          }}
        />
        <Segmented
          label="Page"
          value={surface}
          options={[
            { value: Surface.Settings, label: 'Edit profile' },
            { value: Surface.Profile, label: 'Own profile' },
          ]}
          onChange={(value) => {
            setSurface(value);
            setOverlay(OverlayKind.None);
          }}
        />
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <FitToWidth
          width={deviceSpec[device].width}
          height={deviceSpec[device].height}
        >
          <DeviceFrame device={device}>
            {page}
            {overlay === OverlayKind.Menu && isCompact(device) && (
              <AvatarActionSheet
                items={items}
                onClose={() => setOverlay(OverlayKind.None)}
              />
            )}
            {overlay === OverlayKind.Picker && (
              <AvatarPicker
                key={`${pickerTab}-${device}`}
                device={device}
                state={avatar}
                person={person}
                initialTab={pickerTab}
                provider={scenario.provider}
                providerPhoto={providerPhoto}
                onApply={apply}
                onClose={() => setOverlay(OverlayKind.None)}
              />
            )}
            {toast && <Toast message={toast} onUndo={undo} />}
            {surface === Surface.Profile && error && (
              <Toast message="Couldn't upload. Your avatar didn't change." />
            )}
          </DeviceFrame>
        </FitToWidth>

        <aside className="flex w-full min-w-0 flex-col gap-4 tablet:w-80">
          <div className="flex flex-col gap-1 rounded-16 bg-surface-float p-4">
            <span className="text-text-tertiary typo-caption1">Scenario</span>
            <span className="font-bold typo-callout">{scenario.label}</span>
            <span className="ap-pretty text-text-tertiary typo-footnote">
              {scenario.description}
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-16 bg-surface-float p-4">
            <span className="text-text-tertiary typo-caption1">
              Rendered as
            </span>
            <span className="font-bold typo-callout">
              {sourceLabel[avatar.source]}
              {displayedCharacter(avatar, person)
                ? `, ${displayedCharacter(avatar, person)?.name}`
                : ''}
            </span>
            <span className="text-text-tertiary typo-caption1">
              Stored in user.image
            </span>
            <code className="break-all rounded-8 bg-background-default px-2 py-1.5 font-mono text-text-secondary typo-caption1">
              {storedImageValue(avatar)}
            </code>
          </div>
          <div className="flex flex-col gap-2 rounded-16 bg-surface-float p-4">
            <span className="text-text-tertiary typo-caption1">
              Analytics events, newest first
            </span>
            {log.length === 0 ? (
              <span className="text-text-quaternary typo-footnote">
                Tap the avatar to start.
              </span>
            ) : (
              <ol className="flex flex-col gap-1">
                {log.map((item, index) => (
                  <li
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${item}-${index}`}
                    className="font-mono text-text-secondary typo-caption1"
                  >
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
          <label className="flex items-center gap-2 rounded-16 bg-surface-float p-4 typo-footnote">
            <input
              type="checkbox"
              checked={failNextUpload}
              onChange={(event) => setFailNextUpload(event.target.checked)}
            />
            Make the next photo upload fail
          </label>
        </aside>
      </div>
    </div>
  );
};

export const SimulatorStory: StoryObj = {
  name: 'Simulator',
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="Does every path actually work, on every screen?"
        title="One simulator for every avatar change: four starting points, three breakpoints, two pages."
        goal="Every path from any avatar to any other avatar in two taps or fewer, reversible, on any screen."
        metric="Avatar change completion rate, and undo rate as the regret signal."
      >
        <p>
          Pick a starting point, a device and a page, then tap the avatar.
          Choosing a character, uploading and cropping a photo, removing a
          photo, going back to a GitHub photo and undoing all work for real. The
          panel on the right shows what would be stored and which events would
          fire.
        </p>
        <p>
          Things to try: remove a photo and notice you land on your assigned
          character, never on gray. Turn on the failure switch and upload, the
          old avatar stays. On mobile, the menu is an action sheet and the
          picker a bottom sheet.
        </p>
      </PageHeader>
      <Section title="Simulator">
        <Simulator />
      </Section>
    </Page>
  ),
};
