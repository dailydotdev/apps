import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import {
  AppIcon,
  BrowserGroupIcon,
  DocsIcon,
  FlagIcon,
  HelpIcon,
  PhoneIcon,
  PlayIcon,
  TerminalIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils/useThemedAsset';
import ExtensionProviders from './_providers';

// The companion permission ask, before and after #7043. Before: the v1
// header's `additionalButtons` slot, which #6083 parked under the Explore
// panel title — an unlabeled square that opened the permission popover.
// After: a one-time TopHero card beside "Add shortcuts" above the feed card,
// and a labelled "Enable the companion" row leading the rail's Support menu
// while the permission is not granted. The card and the row here carry the
// production components' props and copy; the gates (content-script status,
// the closed action) live in ExtensionTopBanners and SidebarDesktopV2.

const noop = (): void => undefined;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Section = ({
  title,
  lead,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {lead && (
        <p className="max-w-[80ch] text-text-tertiary typo-callout">{lead}</p>
      )}
    </div>
    {children}
  </section>
);

/** The sidebar's Explore panel head with the orphaned square, as shipped. */
const BeforePanel = (): ReactElement => (
  <div
    style={{ width: '19rem' }}
    className="rounded-16 border border-border-subtlest-tertiary bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]"
  >
    <div className="flex">
      <div className="flex w-16 shrink-0 flex-col items-center gap-2 border-r !border-border-subtlest-quaternary py-4">
        <span className="size-6 rounded-6 bg-surface-float" />
        <span className="size-6 rounded-6 bg-surface-float" />
        <span className="size-6 rounded-6 bg-surface-float" />
      </div>
      <div className="flex min-h-[14rem] flex-1 flex-col">
        <div className="pl-5 pr-3 pt-6">
          <div className="flex h-10 items-center">
            <Typography bold type={TypographyType.Callout}>
              Explore
            </Typography>
          </div>
        </div>
        {/* SidebarDesktopV2: `mt-2 flex items-center gap-1 px-3` around
            `additionalButtons`, i.e. CompanionPopupButton's Float button. */}
        <div className="mt-2 flex items-center gap-1 px-3">
          <Button
            type="button"
            variant={ButtonVariant.Float}
            aria-label="Companion permission"
            icon={<AppIcon className="size-6" />}
          />
        </div>
        <ul className="mt-3 flex flex-col gap-1 px-3 text-text-tertiary typo-callout">
          <li className="rounded-10 px-2 py-2">Explore</li>
          <li className="rounded-10 px-2 py-2">Happening Now</li>
          <li className="rounded-10 px-2 py-2">Tags</li>
        </ul>
      </div>
    </div>
  </div>
);

const illustrationFrameClass =
  '!m-0 flex h-24 w-32 shrink-0 items-center justify-center self-center tablet:h-28 tablet:w-36';

/** ExtensionTopBanners' CompanionIllustration. */
const CompanionIllustration = (): ReactElement => (
  <a
    target="_blank"
    rel="noopener"
    href={companionExplainerVideo}
    aria-label="Watch the companion overview video"
    className={classNames(illustrationFrameClass, 'relative')}
  >
    <img
      src="https://media.daily.dev/image/upload/v1655218347/public/companion_preview_v2.png"
      alt=""
      loading="lazy"
      className="h-full w-full rounded-10 object-cover"
    />
    <PlayIcon secondary className="absolute" size={IconSize.XLarge} />
  </a>
);

/** ExtensionTopBanners' ShortcutsIllustration, for the card beside it. */
const ShortcutsIllustration = (): ReactElement => {
  const { githubShortcut } = useThemedAsset();
  return (
    <div className={classNames(illustrationFrameClass, 'gap-2')}>
      <img alt="" src={githubShortcut} className="size-10 rounded-10" />
      <span className="size-10 rounded-10 bg-surface-float" />
      <span className="size-10 rounded-10 bg-surface-float" />
    </div>
  );
};

/** The card, with the props ExtensionTopBanners passes. */
const CompanionCard = (): ReactElement => (
  <TopHero
    title="Try the new companion feature!"
    subtitle="We'll ask for extra permissions so we can show the companion directly on the original content!"
    illustration={<CompanionIllustration />}
    onClose={noop}
    actions={
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={noop}
        >
          Activate companion
        </Button>
        <ClickableText
          tag="a"
          target="_blank"
          rel="noopener"
          defaultTypo={false}
          href={companionExplainerVideo}
          textClassName="text-accent-cabbage-default typo-footnote"
        >
          Overview video
        </ClickableText>
      </div>
    }
  />
);

/** The top-hero slot above the feed card: MainLayout's grid classes. */
const TopHeroRow = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="grid w-full grid-cols-1 gap-3 tablet:has-[>:nth-child(2)]:grid-cols-2">
    {children}
  </div>
);

/** The rail's Support popup with the new row leading it. */
const SupportMenu = (): ReactElement => (
  <div className="flex w-64 flex-col gap-2 rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3">
    <ProfileSection
      linkIconHoverOnly
      items={[
        { title: 'Enable the companion', icon: AppIcon, onClick: noop },
        {
          title: 'Get the mobile app',
          icon: PhoneIcon,
          href: '#',
          external: true,
        },
        {
          title: 'Get the browser extension',
          icon: BrowserGroupIcon,
          href: '#',
          external: true,
        },
        { title: 'Changelog', icon: TerminalIcon, href: '#' },
        { title: 'Docs', icon: DocsIcon, href: '#', external: true },
        { title: 'Report a bug', icon: FlagIcon, href: '#', external: true },
      ]}
    />
    <HorizontalSeparator />
    <div className="flex items-center gap-2 px-2 text-text-tertiary typo-footnote">
      <HelpIcon size={IconSize.Small} /> Opened from the rail’s Support button
    </div>
  </div>
);

const CompanionPermission = (): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-dvh bg-background-default text-text-primary antialiased">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-2">
          <Eyebrow>Extension new tab · companion permission</Eyebrow>
          <h1 className="font-bold typo-mega2">
            The companion ask, before and after #7043
          </h1>
          <p className="max-w-[90ch] text-text-secondary typo-body">
            One-time ask for the companion’s content-script permission. It only
            exists until the permission is granted, and only for members on the
            extension’s new tab.
          </p>
        </header>

        <Section
          title="Before: a square under the panel title"
          lead="SidebarDesktopV2 rendered the extension’s CompanionPopupButton in the v1 header’s additionalButtons slot, parked under the Explore panel title by #6083. No label; clicking it opened the permission popover."
        >
          <BeforePanel />
        </Section>

        <Section
          title="After: a card above the feed, beside “Add shortcuts”"
          lead="ExtensionTopBanners renders it in the top-hero slot above the floating card, on the same frame as the shortcuts card. Activate asks for the permission; the close completes ClosedCompanionBanner so it never returns."
        >
          <TopHeroRow>
            <CompanionCard />
            <TopHero
              className="order-last"
              subtitle="Pin the sites you visit most, right from your new tab."
              ctaLabel="Add shortcuts"
              illustration={<ShortcutsIllustration />}
              onCtaClick={noop}
              onClose={noop}
            />
          </TopHeroRow>
          <p className="text-text-tertiary typo-footnote">
            Alone, once the shortcuts card has been closed:
          </p>
          <TopHeroRow>
            <CompanionCard />
          </TopHeroRow>
        </Section>

        <Section
          title="After: the way back, in the Support menu"
          lead="“Enable the companion” leads the rail’s Support popup while the permission is not granted, for anyone who closed the card. It reads the extension context, so it never appears on the webapp."
        >
          <SupportMenu />
        </Section>
      </div>
    </div>
  </ExtensionProviders>
);

const meta: Meta<typeof CompanionPermission> = {
  title: 'Extension/Companion permission',
  component: CompanionPermission,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof CompanionPermission>;

export const BeforeAndAfter: Story = { name: 'Before and after' };
