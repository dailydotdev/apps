import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { ProfileShareButton } from '@dailydotdev/shared/src/components/profile/ProfileShareButton';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { Header as ProfileMobileHeader } from '@dailydotdev/shared/src/components/profile/Header';
import CustomFeedOptionsMenu from '@dailydotdev/shared/src/components/CustomFeedOptionsMenu';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon, LinkIcon } from '@dailydotdev/shared/src/components/icons';
import {
  FlagScope,
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
 * Review page for the sharing-visibility initiative: every surface the two
 * share PRs touch, in both flag states, on one scrollable page.
 *
 * PR 1 — #6343 `ShareActions` primitive + `sharing_visibility` / `share_copy_icon`
 * PR 2 — #6354 profile share control + `share_profile`
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

/** Live specimen wrapper: one flag state, laid out inside a Specimen card. */
const Live = ({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}): ReactElement => <FlagScope enabled={enabled}>{children}</FlagScope>;

const HeaderCard = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
    {children}
  </div>
);

const Review = (): ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Sharing visibility · States & variants"
      title="Every share control, every state, on one page"
    >
      Two PRs make sharing visible instead of buried in a <Code>⋯</Code> menu:
      PR 1 adds the shared <Code>ShareActions</Code> primitive and the icon
      swap, PR 2 puts a real copy-link control on profile headers. Everything
      below is the live component — the left column of each pair is what a
      control user sees today, the right column is the experiment.
    </PageHeader>

    <Section n="01" title="What ships, where">
      <Muted>
        Every surface below resolves its own flag, but they all sit under the{' '}
        <Code>sharing_visibility</Code> master kill-switch, so the whole
        initiative can be turned off in one toggle.
      </Muted>
      <Table
        columns={['Surface', 'Control (today)', 'Experiment', 'Flag']}
        rows={[
          [
            'Profile header — own profile',
            'Edit profile button only',
            'Copy-link button next to Edit profile',
            <Code key="a">share_profile</Code>,
          ],
          [
            'Profile header — public profile',
            'An invisible Edit placeholder holding the row height',
            'Copy-link button fills that slot',
            <Code key="b">share_profile</Code>,
          ],
          [
            'Pinned mobile profile bar',
            'Share lives inside the ⋯ menu',
            'Copy-link icon in the bar, only while pinned',
            <Code key="c">share_profile</Code>,
          ],
          [
            'Profile ⋯ menus (bar + actions card)',
            '“Share” menu entry',
            'Entry removed — promoted to the visible control',
            <Code key="d">share_profile</Code>,
          ],
          [
            'Feed card action bar · brief header · mobile share widget',
            <>
              <LinkIcon key="link" /> LinkIcon
            </>,
            <>
              <CopyIcon key="copy" /> CopyIcon
            </>,
            <Code key="e">share_copy_icon</Code>,
          ],
        ]}
      />
    </Section>

    <Section n="02" title="Gating matrix" badge="useShareProfileEnabled()">
      <Muted>
        The per-topic flag is only evaluated once the master passes, so control
        users are never bucketed into the experiment.
      </Muted>
      <Table
        columns={[
          'sharing_visibility',
          'share_profile',
          'share_copy_icon',
          'What renders',
        ]}
        rows={[
          [
            'off',
            'any',
            'any',
            'Nothing from the initiative. Pixel-identical to main.',
          ],
          [
            'on',
            'off',
            'off',
            'Nothing visible yet — the primitive exists but no surface mounts it.',
          ],
          [
            'on',
            'on',
            'off',
            'Profile share controls; copy actions keep the legacy LinkIcon.',
          ],
          [
            'on',
            'off',
            'on',
            'Icon swap only, on feed cards / brief header / mobile share widget.',
          ],
          ['on', 'on', 'on', 'Everything below.'],
        ]}
      />
    </Section>

    <Section n="03" title="The primitive — ShareActions" badge="variant">
      <Muted>
        One component behind every surface. <Code>icon</Code> renders a trigger
        that opens the network popover on desktop and goes straight to the
        native share sheet on mobile; <Code>inline</Code> drops the network row
        into the page.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="variant: icon"
          note="Click to open the popover. Tooltip is suppressed while it's open."
        >
          <ShareActions
            link={profile.permalink}
            text="Check out this post on daily.dev"
            label="Copy link"
            onShare={fn()}
          />
        </Specimen>
        <Specimen
          label="variant: icon · openOnHover"
          note="Feed-card pattern — hover reveals the popover, 120ms close delay so the pointer can travel into it."
        >
          <ShareActions
            link={profile.permalink}
            text="Check out this post on daily.dev"
            label="Copy link"
            openOnHover
            onShare={fn()}
          />
        </Specimen>
      </Grid>
      <Grid cols={1}>
        <Specimen
          label="variant: inline"
          note="The same network list, rendered directly — for share strips and drawers. Copy flips to “Copied!” for a beat after a click."
        >
          <ShareActions
            link={profile.permalink}
            text="Check out this post on daily.dev"
            variant="inline"
            onShare={fn()}
          />
        </Specimen>
      </Grid>

      <Muted style={{ marginTop: 24 }}>
        Button variants and sizes are props, so each surface can match its own
        control group. These are the combinations actually used.
      </Muted>
      <Grid cols={4}>
        <Specimen label="Float · Medium" note="Profile header (default)">
          <ShareActions
            link={profile.permalink}
            text="Share"
            buttonVariant={ButtonVariant.Float}
            buttonSize={ButtonSize.Medium}
            onShare={fn()}
          />
        </Specimen>
        <Specimen label="Float · Small" note="Pinned mobile bar">
          <ShareActions
            link={profile.permalink}
            text="Share"
            buttonVariant={ButtonVariant.Float}
            buttonSize={ButtonSize.Small}
            onShare={fn()}
          />
        </Specimen>
        <Specimen label="Tertiary · Small" note="Primitive default">
          <ShareActions
            link={profile.permalink}
            text="Share"
            buttonVariant={ButtonVariant.Tertiary}
            buttonSize={ButtonSize.Small}
            onShare={fn()}
          />
        </Specimen>
        <Specimen label="Primary · Small" note="Over media / imagery">
          <ShareActions
            link={profile.permalink}
            text="Share"
            buttonVariant={ButtonVariant.Primary}
            buttonSize={ButtonSize.Small}
            onShare={fn()}
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="04" title="Responsive behaviour" badge="useViewSize(Laptop)">
      <Muted>
        Below laptop there is no popover at all: one tap calls{' '}
        <Code>navigator.share</Code>, or copies when native share is
        unavailable. The frames below are the real story rendered at 390px, so
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
            <Live enabled>
              <HeaderCard>
                <ProfileHeader
                  user={profile}
                  userStats={userStats}
                  isSameUser={false}
                />
              </HeaderCard>
            </Live>
          </Specimen>
        </div>
      </div>
    </Section>

    <Section
      n="05"
      title="Profile header — public profile"
      badge="ProfileHeader"
    >
      <Muted>
        The control reserves the slot with an <Code>invisible</Code> Edit button
        purely to hold the row height. The experiment fills that slot instead of
        leaving a dead placeholder, so the header height is unchanged.
      </Muted>
      <Grid cols={2}>
        <Specimen label="Flag off — control" tone="off" align="start">
          <Live enabled={false}>
            <HeaderCard>
              <ProfileHeader
                user={profile}
                userStats={userStats}
                isSameUser={false}
              />
            </HeaderCard>
          </Live>
        </Specimen>
        <Specimen label="Flag on" tone="on" align="start">
          <Live enabled>
            <HeaderCard>
              <ProfileHeader
                user={profile}
                userStats={userStats}
                isSameUser={false}
              />
            </HeaderCard>
          </Live>
        </Specimen>
      </Grid>
    </Section>

    <Section n="06" title="Profile header — own profile" badge="isSameUser">
      <Muted>
        The owner keeps Edit profile; share sits beside it. Today a signed-in
        user on desktop has no way to share their own profile at all — the
        “Public profile &amp; URL” widget is <Code>laptop:hidden</Code>.
      </Muted>
      <Grid cols={2}>
        <Specimen label="Flag off — control" tone="off" align="start">
          <Live enabled={false}>
            <HeaderCard>
              <ProfileHeader user={profile} userStats={userStats} isSameUser />
            </HeaderCard>
          </Live>
        </Specimen>
        <Specimen label="Flag on" tone="on" align="start">
          <Live enabled>
            <HeaderCard>
              <ProfileHeader user={profile} userStats={userStats} isSameUser />
            </HeaderCard>
          </Live>
        </Specimen>
      </Grid>
    </Section>

    <Section n="07" title="Pinned mobile bar" badge="profile/Header · sticky">
      <Muted>
        The bar only shows the control while it is pinned. Unpinned, the profile
        card right below owns it, and two identical copy buttons on one screen
        read as a mistake. Share is also promoted out of this bar&apos;s ⋯ menu.
      </Muted>
      <Muted>
        This bar is a mobile surface, so each frame below is the real story at
        390px — at desktop width it would show controls (Edit profile) that a
        phone never gets.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="Pinned — flag on"
          tone="on"
          note="Utility icon sits after the Follow group with ml-1, so the two intents never read as one control group."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-pinned-bar"
            height={72}
          />
        </Specimen>
        <Specimen
          label="Unpinned — flag on"
          tone="neutral"
          note="No share control: the profile card right below is showing its own."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-unpinned-bar"
            height={72}
          />
        </Specimen>
      </Grid>
      <Grid cols={2}>
        <Specimen
          label="Pinned — flag off (control)"
          tone="off"
          note="Share is reachable only from inside the ⋯ menu."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-pinned-bar-control"
            height={72}
          />
        </Specimen>
        <Specimen
          label="Pinned — own profile, flag on"
          tone="on"
          note="Same control, first-person label."
          padded={false}
        >
          <DeviceFrame
            storyId="components-share-overview--mobile-pinned-bar-own"
            height={72}
          />
        </Specimen>
      </Grid>
    </Section>

    <Section n="08" title="The ⋯ menu, before and after" badge="hideShare">
      <Muted>
        Click each trigger. <Code>shareProps</Code> stays required; the new{' '}
        <Code>hideShare</Code> prop drops just the entry, so no other call site
        changes.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="hideShare: false — control"
          tone="off"
          note="Share · Add to custom feed · Block · Report"
        >
          <CustomFeedOptionsMenu {...menuProps} />
        </Specimen>
        <Specimen
          label="hideShare: true — experiment"
          tone="on"
          note="Add to custom feed · Block · Report. Share moved up to the header."
        >
          <CustomFeedOptionsMenu {...menuProps} hideShare />
        </Specimen>
      </Grid>
    </Section>

    <Section n="09" title="Icon swap" badge="share_copy_icon">
      <Muted>
        A separate flag, because it touches a core high-traffic glyph on three
        surfaces at once: the feed card action bar, the brief post header and
        the mobile share widget. Control keeps <Code>LinkIcon</Code>.
      </Muted>
      <Grid cols={2}>
        <Specimen
          label="LinkIcon — control"
          tone="off"
          note="Reads as “link”, easily confused with the post's outbound link."
        >
          <div className="flex items-center gap-4">
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<LinkIcon />}
              aria-label="Copy link"
            />
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              icon={<LinkIcon />}
              aria-label="Copy link"
            />
          </div>
        </Specimen>
        <Specimen
          label="CopyIcon — experiment"
          tone="on"
          note="Reads as “copy”. Filled state (secondary) is the post-copy confirmation."
        >
          <div className="flex items-center gap-4">
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
              aria-label="Copy link"
            />
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              icon={<CopyIcon secondary />}
              aria-label="Copied"
            />
          </div>
        </Specimen>
      </Grid>
    </Section>

    <Section n="10" title="Copy and accessible labels">
      <Muted>
        Both label variants are asserted in <Code>ProfileShareButton.spec</Code>
        . The share text is what lands in the tweet / WhatsApp message / email
        subject.
      </Muted>
      <Table
        columns={['Context', 'aria-label + tooltip', 'Share text']}
        rows={[
          [
            'Public profile',
            <Code key="l1">Share @idoshamun&apos;s profile</Code>,
            'Check out Ido Shamun’s profile on daily.dev',
          ],
          [
            'Own profile',
            <Code key="l2">Share your profile</Code>,
            'Check out my profile on daily.dev',
          ],
          [
            'Copy chip, idle → copied',
            <Code key="l3">Copy link → Copied!</Code>,
            'Link is shortened through dly.to with the ShareProfile campaign',
          ],
        ]}
      />
      <Grid cols={2}>
        <Specimen label="Public label" note="Hover the button to see it.">
          <Live enabled>
            <ProfileShareButton user={profile} />
          </Live>
        </Specimen>
        <Specimen label="Own label" note="Hover the button to see it.">
          <Live enabled>
            <ProfileShareButton user={profile} isSameUser />
          </Live>
        </Specimen>
      </Grid>
    </Section>

    <Section n="11" title="Open questions for this review">
      <Table
        columns={['#', 'Question', 'Where to look']}
        rows={[
          [
            '1',
            'Is “pinned only” right for the mobile bar, or should the icon always be there and accept two copy buttons on one screen?',
            'Section 07',
          ],
          [
            '2',
            'Removing “Share” from the ⋯ menus moves cheese for anyone who learned it. Keep both?',
            'Section 08',
          ],
          [
            '3',
            'Share text wording — “Check out …’s profile on daily.dev” is inherited from the old menu item. Worth a copy pass?',
            'Section 10',
          ],
          [
            '4',
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
          'Sharing-visibility review page: every surface and state the share PRs touch, flag-off next to flag-on.',
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
 * Rendered at 390px inside section 04. Also useful on its own with the
 * Storybook viewport toolbar.
 */
export const MobileProfileHeader: Story = {
  render: () => (
    <ProfileHeader user={profile} userStats={userStats} isSameUser={false} />
  ),
  decorators: [withShareProviders(true, 'w-full')],
};

/** The four pinned-bar states, each embedded at 390px in section 07. */
export const MobilePinnedBar: Story = {
  render: () => (
    <ProfileMobileHeader user={profile} sticky isSameUser={false} />
  ),
  decorators: [withShareProviders(true, 'w-full')],
};

export const MobileUnpinnedBar: Story = {
  render: () => <ProfileMobileHeader user={profile} isSameUser={false} />,
  decorators: [withShareProviders(true, 'w-full')],
};

export const MobilePinnedBarControl: Story = {
  render: () => (
    <ProfileMobileHeader user={profile} sticky isSameUser={false} />
  ),
  decorators: [withShareProviders(false, 'w-full')],
};

export const MobilePinnedBarOwn: Story = {
  render: () => <ProfileMobileHeader user={profile} sticky isSameUser />,
  decorators: [withShareProviders(true, 'w-full')],
};
