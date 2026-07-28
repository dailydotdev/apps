import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ProfileShareButton } from '@dailydotdev/shared/src/components/profile/ProfileShareButton';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { Header as ProfileMobileHeader } from '@dailydotdev/shared/src/components/profile/Header';
import CustomFeedOptionsMenu from '@dailydotdev/shared/src/components/CustomFeedOptionsMenu';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LinkIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import {
  ShareStoryProviders,
  profile,
  userStats,
  withShareProviders,
} from './shareStoryContext';
import {
  Code,
  DeviceFrame,
  Grid,
  Muted,
  Page,
  PageHeader,
  Section,
  Specimen,
  Table,
} from './reviewLayout';

/**
 * Review page for the profile sharing work in PR #6354: every surface it
 * touches, every state, on one scrollable page. The behaviour ships
 * unconditionally — there is no flag to toggle, so what renders below is what
 * every user gets. Scoped to this PR: the surfaces PR 1 (#6343) owns are not
 * documented here.
 */

const shareProps = {
  text: `Check out ${profile.name}'s profile on daily.dev`,
  link: profile.permalink,
  cid: undefined,
};

const menuProps = {
  onAdd: fn(),
  onUndo: fn(),
  onCreateNewFeed: fn(),
  shareProps,
};

const HeaderCard = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
    {children}
  </div>
);

const Review = (): ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Profile sharing · States & variants"
      title="Every share control, every state, on one page"
    >
      Sharing a profile used to mean finding “Share” inside a <Code>⋯</Code>{' '}
      menu — and on your own profile, on desktop, there was no way to do it at
      all. This puts a real copy-link control on the profile header instead.
      Everything below is the live component, shipping to everyone: no flag, no
      variant arm.
    </PageHeader>

    <Section n="01" title="What ships, where">
      <Table
        columns={['Surface', 'Before', 'Now']}
        rows={[
          [
            'Profile header — own profile',
            'Edit profile button only; no way to share your own profile on desktop',
            'Copy-link button next to Edit profile — one click copies',
          ],
          [
            'Profile header — public profile',
            'An invisible Edit placeholder holding the row height',
            'Copy-link button fills that slot',
          ],
          [
            'Pinned mobile profile bar',
            'Share buried in the ⋯ menu',
            'Copy-link icon in the bar, while pinned',
          ],
          [
            'Profile ⋯ menus (bar + actions card)',
            '“Share” menu entry',
            'Entry removed — promoted to the visible control',
          ],
          [
            'Feed card · brief header · mobile share widget',
            <>
              <LinkIcon key="a" /> LinkIcon
            </>,
            'Untouched by this PR — they belong to PR 1 (#6343)',
          ],
        ]}
      />
      <Muted>
        The copy-link glyph is deliberately the one already used across the
        product, so the new control reads as the same action developers know
        from feed cards rather than a new one.
      </Muted>
    </Section>

    <Section n="02" title="What one click does" badge="ProfileShareButton">
      <Muted>
        One click copies the profile link — shortened through{' '}
        <Code>dly.to</Code> with the <Code>ShareProfile</Code> campaign — and
        confirms twice: the glyph flips to a green check for a beat, and a toast
        names exactly what landed on the clipboard. No network picker: choosing
        a destination is a second decision, and the link covers all of them. On
        mobile, where the platform offers a native share sheet, a tap still
        opens that instead. The control does not use PR 1's ShareActions popover
        — see the open questions.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="Click it"
          note="Copies, flips to the green check for a second, and fires the toast."
        >
          <ProfileShareButton user={profile} />
        </Specimen>
        <Specimen
          label="Copied — the confirmed state"
          note="VIcon in text-status-success, the same green check used across the product."
        >
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<VIcon className="text-status-success" />}
            aria-label="Copied"
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="03" title="Variant and size" badge="props">
      <Muted>
        The control takes <Code>buttonVariant</Code> and <Code>buttonSize</Code>
        so each surface matches the control group around it. These are the two
        combinations in use.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="Subtle · Small — default"
          note="Profile header: same variant and size as the Edit button beside it and the ⋯ menu below it."
        >
          <ProfileShareButton user={profile} />
        </Specimen>
        <Specimen
          label="Float · Small"
          note="Pinned mobile bar: Float, to match the award / options icons around it."
        >
          <ProfileShareButton
            user={profile}
            buttonVariant={ButtonVariant.Float}
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="04" title="Responsive behaviour" badge="useViewSize(Laptop)">
      <Muted>
        Below laptop there is no popover at all: one tap calls{' '}
        <Code>navigator.share</Code>, or copies when native share is
        unavailable. The frame below is the real story rendered at 390px, so
        this is the actual mobile branch and not a mock-up.
      </Muted>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        <div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              color: 'var(--theme-text-tertiary)',
              marginBottom: 8,
            }}
          >
            390px — mobile
          </div>
          <DeviceFrame
            storyId="components-share-overview--mobile-profile-header"
            height={560}
          />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <Specimen
            label="Laptop and up — desktop"
            note="Same component, popover branch."
            align="start"
          >
            <HeaderCard>
              <ProfileHeader
                user={profile}
                userStats={userStats}
                isSameUser={false}
              />
            </HeaderCard>
          </Specimen>
        </div>
      </div>
    </Section>

    <Section n="05" title="Profile header" badge="ProfileHeader">
      <Muted>
        On a public profile the control takes the slot an <Code>invisible</Code>{' '}
        Edit button used to reserve purely to hold the row height, so the header
        is no taller than before. On your own profile it sits beside Edit, both
        Subtle and Small, bottom-aligned to the avatar.
      </Muted>
      <Grid cols={2}>
        <Specimen label="Public profile" align="start">
          <HeaderCard>
            <ProfileHeader
              user={profile}
              userStats={userStats}
              isSameUser={false}
            />
          </HeaderCard>
        </Specimen>
        <Specimen label="Own profile" align="start">
          <HeaderCard>
            <ProfileHeader user={profile} userStats={userStats} isSameUser />
          </HeaderCard>
        </Specimen>
      </Grid>
    </Section>

    <Section n="06" title="Pinned mobile bar" badge="profile/Header · sticky">
      <Muted>
        The bar only shows the control while it is pinned. Unpinned, the profile
        card right below owns it, and two identical copy buttons on one screen
        read as a mistake. This is a mobile surface, so each frame below is the
        real story at 390px — at desktop width it would show controls (Edit
        profile) that a phone never gets.
      </Muted>
      <Grid cols={3}>
        <Specimen
          label="Pinned"
          note="Utility icon sits after the Follow group with ml-1, so the two intents never read as one control group."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-pinned-bar"
            height={72}
            width={340}
          />
        </Specimen>
        <Specimen
          label="Unpinned"
          note="No share control: the profile card right below is showing its own."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-unpinned-bar"
            height={72}
            width={340}
          />
        </Specimen>
        <Specimen
          label="Pinned — own profile"
          note="Same control, first-person label."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-pinned-bar-own"
            height={72}
            width={340}
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="07" title="The ⋯ menu" badge="hideShare">
      <Muted>
        Click each trigger. Profile menus pass the new <Code>hideShare</Code>{' '}
        prop because the header now carries a visible control; every other
        caller keeps the entry, so no other surface changes.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="hideShare: false — every other caller"
          note="Share · Add to custom feed · Block · Report"
        >
          <CustomFeedOptionsMenu {...menuProps} />
        </Specimen>
        <Specimen
          label="hideShare: true — the two profile menus"
          note="Add to custom feed · Block · Report. Share moved up to the header."
        >
          <CustomFeedOptionsMenu {...menuProps} hideShare />
        </Specimen>
      </Grid>
    </Section>

    <Section n="08" title="The copy-link glyph">
      <Muted>
        The same <Code>LinkIcon</Code> the feed card action bar, the brief
        header and the mobile share widget already use — those surfaces are
        untouched. Its filled (<Code>secondary</Code>) state is the post-copy
        confirmation.
      </Muted>
      <Grid cols={2}>
        <Specimen label="Idle" note="Subtle Small, as it renders in the header">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
            aria-label="Copy link"
          />
        </Specimen>
        <Specimen
          label="Copied — for one second"
          note="Green check, then back to the link glyph."
        >
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<VIcon className="text-status-success" />}
            aria-label="Copied"
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="09" title="Copy and accessible labels">
      <Muted>
        Both label variants are asserted in <Code>ProfileShareButton.spec</Code>
        . The share text is what lands in the tweet / WhatsApp message / email
        subject.
      </Muted>
      <Table
        columns={['Context', 'aria-label + tooltip', 'Toast / share text']}
        rows={[
          [
            'Public profile',
            <Code key="l1">Copy link to @idoshamun&apos;s profile</Code>,
            '✅ Copied link to @idoshamun’s profile',
          ],
          [
            'Own profile',
            <Code key="l2">Copy link to your profile</Code>,
            '✅ Copied link to your profile',
          ],
          [
            'Native share sheet (mobile)',
            '—',
            'Check out …’s profile on daily.dev + the shortened link',
          ],
        ]}
      />
      <Grid cols={2}>
        <Specimen label="Public label" note="Hover the button to see it.">
          <ProfileShareButton user={profile} />
        </Specimen>
        <Specimen label="Own label" note="Hover the button to see it.">
          <ProfileShareButton user={profile} isSameUser />
        </Specimen>
      </Grid>
    </Section>

    <Section n="10" title="Open questions for this review">
      <Table
        columns={['#', 'Question', 'Where to look']}
        rows={[
          [
            '1',
            'Is “pinned only” right for the mobile bar, or should the icon always be there and accept two copy buttons on one screen?',
            'Section 06',
          ],
          [
            '2',
            'Removing “Share” from the profile ⋯ menus moves cheese for anyone who learned it there. Keep both?',
            'Section 07',
          ],
          [
            '2b',
            "Copy-only on desktop means no one-click path to X / LinkedIn from a profile. Acceptable, or should PR 1's ShareActions popover come back as a secondary affordance?",
            'Section 02',
          ],
          [
            '3',
            'Toast + share-sheet wording — “Check out …’s profile on daily.dev” is inherited from the old menu item. Worth a copy pass?',
            'Section 09',
          ],
          [
            '4',
            'Ships to everyone with no flag, so there is no ramp and no kill-switch short of a revert.',
            'PR description',
          ],
          [
            '5',
            'The per-profile OG unfurl image is deliberately deferred — it needs a screenshot-service route on the backend.',
            'PR description',
          ],
        ]}
      />
    </Section>
  </Page>
);

const meta: Meta = {
  title: 'Components/Share/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Profile sharing review page: every surface and state the share control touches.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const StatesAndVariants: Story = {
  render: () => (
    <ShareStoryProviders>
      <Review />
    </ShareStoryProviders>
  ),
};

/**
 * Rendered at 390px inside section 03. Also useful on its own with the
 * Storybook viewport toolbar.
 */
export const MobileProfileHeader: Story = {
  render: () => (
    <ProfileHeader user={profile} userStats={userStats} isSameUser={false} />
  ),
  decorators: [withShareProviders('w-full')],
};

/** The three pinned-bar states, each embedded at 390px in section 05. */
export const MobilePinnedBar: Story = {
  render: () => (
    <ProfileMobileHeader user={profile} sticky isSameUser={false} />
  ),
  decorators: [withShareProviders('w-full')],
};

export const MobileUnpinnedBar: Story = {
  render: () => <ProfileMobileHeader user={profile} isSameUser={false} />,
  decorators: [withShareProviders('w-full')],
};

export const MobilePinnedBarOwn: Story = {
  render: () => <ProfileMobileHeader user={profile} sticky isSameUser />,
  decorators: [withShareProviders('w-full')],
};
