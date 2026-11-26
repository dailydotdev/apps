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

const meta: Meta = {
  title: 'Avatar Characters/6. Edit profile/5. Build',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-6 bg-surface-float px-1 text-text-secondary">
    {children}
  </code>
);

const tree = `packages/shared/src/components/profile/avatar/
  AvatarField.tsx        // replaces ControlledAvatarUpload on Edit profile
  AvatarMenu.tsx         // DropdownMenu on tablet+, ListDrawer on mobile
  AvatarPickerModal.tsx  // Modal (FlexibleCenter, isDrawerOnMobile)
  CharacterGrid.tsx      // radiogroup, "Given to you" pinned first
  AvatarPhotoTab.tsx     // drop zone / library + camera, provider photo row
  AvatarCrop.tsx         // square crop, drag + zoom, outputs a 1024px webp
packages/shared/src/hooks/
  useAvatarMutation.ts   // saves the avatar alone, optimistic, with undo
packages/shared/src/lib/
  avatarCharacters.ts    // frozen v1 list, resolver, isAvatarCharacter(url)`;

export const Build: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="How do we ship it?"
        title="Six small components, one mutation hook, and three backend asks."
        goal="A reviewer can build this from this page without guessing."
        metric="Zero avatar regressions in the webapp test suite, no new Edit profile errors in Sentry."
      >
        <p>
          The editor is one set of components opened from three places: Edit
          profile, your own profile header, and the signup reveal. Everything
          below assumes phase one of the main rollout (characters rendered from
          the id behind <Code>avatar_characters</Code>) is already live.
        </p>
      </PageHeader>

      <Section title="Components">
        <pre className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5 font-mono text-text-secondary typo-footnote">
          {tree}
        </pre>
        <Table
          head={['Where', 'Today', 'Change']}
          rows={[
            [
              'Edit profile',
              <Code key="a">ControlledAvatarUpload</Code>,
              'AvatarField outside the react-hook-form value. The cover upload stays as it is.',
            ],
            [
              'Own profile header',
              <Code key="b">ProfileHeader</Code>,
              'Owner-only: avatar becomes the AvatarField trigger with the camera badge. The pencil keeps going to settings.',
            ],
            [
              'Signup reveal',
              'Not built',
              'The reveal in 4. Signup reveal opens this same picker.',
            ],
            [
              'Social signup form',
              <Code key="c">ImageInput viewOnly</Code>,
              'Unchanged. Provider photo is kept, and its URL is stored as the provider photo.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Saving: the avatar saves on its own"
        description="Recommendation. Today the avatar rides along with the Edit profile form and needs Save."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why on its own">
            The picker already has an explicit confirm (“Use Nocturne”). Asking
            for a second Save is the trap that loses changes today, and your own
            profile has no form at all. Every avatar UI people know (GitHub,
            Slack, X) works this way.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="How, without breaking the form"
          >
            useAvatarMutation sends only the image, updates AuthContext and the
            profile query cache, and never calls methods.reset. Unsaved name or
            bio edits on the page stay untouched and still need Save.
          </Callout>
        </div>
        <Table
          head={['Action', 'Request', 'Backend need']}
          rows={[
            [
              'Choose a character',
              <Code key="1">
                updateUserProfile(data: {'{'} image: characterUrl {'}'})
              </Code>,
              'Accept only URLs from the character whitelist. Reject any other external URL.',
            ],
            [
              'Back to the given one, or Remove photo',
              <Code key="2">
                updateUserProfile(data: {'{'} image: null {'}'})
              </Code>,
              'Store noProfile for null (confirm today’s behavior), never an empty string.',
            ],
            [
              'Upload a photo',
              <Code key="3">updateUserProfile(upload: File)</Code>,
              'Unchanged. The client sends a cropped, resized 1024px webp, so the 1 MB limit stops biting.',
            ],
            [
              'Use your GitHub photo',
              <Code key="4">
                updateUserProfile(data: {'{'} image: providerUrl {'}'})
              </Code>,
              'New: keep the provider photo URL from signup (for example providerImage) and allow it back.',
            ],
            [
              'Undo',
              'Re-send the previous value',
              'Keep a replaced upload for at least a day instead of deleting it on replace.',
            ],
          ]}
        />
      </Section>

      <Section title="Breakpoints and primitives">
        <Table
          head={['View size', 'Menu', 'Picker', 'Notes']}
          rows={[
            [
              'Below tablet (656px)',
              'ListDrawer action sheet',
              'Modal isDrawerOnMobile, 92% height',
              'Library and camera inputs. Sticky CTA respects the safe area. Avatar 96px in Edit profile, 80px on the profile header.',
            ],
            [
              'Tablet (656 to 1019px)',
              'DropdownMenu popover',
              'Modal, 32rem, one column',
              'Drop zone in the Photo tab. Avatar 120px.',
            ],
            [
              'Laptop (1020px and up)',
              'DropdownMenu popover',
              'Modal, 46rem, two panes',
              'Drop a file straight onto the avatar field as a shortcut to crop.',
            ],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Detect with useViewSize">
            useViewSize(ViewSize.Tablet) and ViewSize.Laptop, not the extension
            or webapp flag. The native wrappers run the webapp shell and get the
            mobile sheet on phones automatically.
          </Callout>
          <Callout title="Portal the sheet">
            Overlays opened from the profile header must portal to the root
            (appendOnRoot), or animated and transformed ancestors trap the fixed
            position.
          </Callout>
        </div>
      </Section>

      <Section title="Accessibility">
        <Table
          head={['Element', 'Behavior']}
          rows={[
            [
              'Avatar field',
              'A button labelled “Change profile picture”, aria-haspopup="menu", visible focus ring that follows the avatar radius.',
            ],
            [
              'Menu',
              'role="menu", arrow keys, Escape closes and returns focus to the avatar. Remove is the last item and states its result in text, not only color.',
            ],
            [
              'Character grid',
              'role="radiogroup", each tile a radio named after the character, “current” announced. Arrow keys move, Enter applies.',
            ],
            [
              'Crop',
              'Arrow keys nudge the position, the zoom slider is a labelled range input, and Use photo works without dragging at all.',
            ],
            [
              'Toast',
              'role="status", Undo reachable by keyboard while it is open, five seconds, paused on hover and focus.',
            ],
            [
              'Images',
              'Alt text stays “{username}’s profile”. Character names never become the person’s alt text.',
            ],
          ]}
        />
      </Section>

      <Section title="Edge cases">
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          <Callout title="iPhone HEIC">
            Safari converts HEIC to JPEG when the input accepts JPEG, so no
            extra handling. Test it on a device.
          </Callout>
          <Callout title="Huge or odd images">
            Panoramas and tiny images: the crop clamps to the short side and
            refuses nothing below 20 MB. Under 256px, warn that it may look
            blurry but allow it.
          </Callout>
          <Callout title="Animated images">
            AVIF and WEBP animations upload as their first frame. Say nothing,
            it is what people expect from an avatar.
          </Callout>
          <Callout title="Offline or slow">
            The old avatar stays until the new one is saved. The caption says
            “Uploading…”, then the reason if it fails, and a tap retries with
            the same crop.
          </Callout>
          <Callout title="Unsaved form edits">
            Saving the avatar never resets the Edit profile form, and the
            dirty-form prompt keeps guarding the other fields.
          </Callout>
          <Callout title="Hiring surfaces">
            Recruiter checks ask for a real photo. Use isAvatarCharacter(url) so
            a chosen character still counts as “no photo” there.
          </Callout>
        </div>
      </Section>

      <Section title="Analytics">
        <Table
          head={['Event', 'When', 'Extra']}
          rows={[
            [
              'avatar_menu_open',
              'Avatar tapped',
              'origin: settings | profile | reveal',
            ],
            ['avatar_picker_open', 'Picker opened', 'tab'],
            [
              'avatar_character_apply',
              'Character saved',
              'character id, was_given',
            ],
            [
              'avatar_photo_upload',
              'Photo saved',
              'source: library | camera | drop, zoom',
            ],
            ['avatar_photo_remove', 'Photo removed', ''],
            [
              'avatar_provider_photo_restore',
              'Provider photo restored',
              'provider',
            ],
            ['avatar_undo', 'Undo tapped', 'from source, to source'],
            [
              'avatar_upload_error',
              'Upload refused or failed',
              'reason: type | size | network',
            ],
          ]}
        />
      </Section>

      <Section title="Tests worth writing">
        <Table
          head={['Test', 'Catches']}
          rows={[
            [
              'Menu items per state',
              'Remove only on photos, provider row only for social users on a character',
            ],
            [
              'useAvatarMutation keeps form values',
              'Saving the avatar wiping an unsaved bio',
            ],
            [
              'Undo restores the exact previous value',
              'Undo landing on the assigned character instead of the photo',
            ],
            [
              'Remove lands on the assigned character',
              'Regression to the gray silhouette',
            ],
            [
              'Invalid drop shows a message, never throws',
              'Today’s onError crash',
            ],
            ['Breakpoint switch', 'Sheet below tablet, modal above'],
          ]}
        />
      </Section>

      <Section title="Open questions">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="What does image: null store today?">
            Remove relies on it becoming noProfile. Confirm in daily-api before
            relying on it.
          </Callout>
          <Callout title="Do we keep the provider photo?">
            “Use your GitHub photo” needs the signup photo URL saved separately.
            Without it, the row simply does not appear.
          </Callout>
          <Callout title="Does Keep in the reveal store the character?">
            Recommended yes: it turns the assigned character into a chosen one
            and makes adoption measurable.
          </Callout>
          <Callout title="Immediate save, everywhere?">
            Recommended above. If product prefers the form Save on Edit profile,
            the picker still applies to the form and the toast becomes “Save to
            keep your new avatar”.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
