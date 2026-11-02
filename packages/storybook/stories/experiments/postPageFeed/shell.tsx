import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons/Source';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { ButtonColor } from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import {
  RAIL_ICON_SIZE,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { BAR, PhoneBlock } from '../../history/shell';

// The app around the post page in the layout that ships (layout_v2_2), at
// every width, drawn from production's recipes:
//
// - laptop: the v2 rail (SidebarDesktopV2) and the floating page card the
//   post page fills (MainLayout's frame and card classes);
// - tablet: SidebarTablet's 64px rail (the v2 layout is laptop only);
// - phone: ShellBlock's page row (the back square), ShellCluster's bottom
//   bar, and PostCapsule with the post's actions above it.
//
// Production's own shell components measure the top window (useViewSize)
// and portal to its body, so inside a device frame they would render for
// the wrong width; these are their markup, not their logic.

const railIcon =
  'flex size-10 items-center justify-center rounded-12 text-text-tertiary';

const RailTab = ({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}): ReactElement => (
  <span className={railTabClass}>
    <span className={railGlyphBoxClass}>{icon}</span>
    <span className={railTabLabelClass}>{label}</span>
  </span>
);

/** SidebarDesktopV2's rail. A post page is no tab's root: nothing is lit. */
const Rail = (): ReactElement => (
  <nav
    aria-label="Primary navigation"
    className="fixed inset-y-0 left-0 z-sidebar hidden w-20 shrink-0 flex-col items-center gap-0.5 px-1.5 pb-3 pt-[0.8125rem] laptop:flex"
  >
    <span className="mt-2.5 flex size-10 items-center justify-center text-text-primary">
      <span className={railGlyphBoxClass}>
        <LogoIcon className={{ container: 'h-[1.125rem] w-auto' }} />
      </span>
    </span>
    <span className={railIcon}>
      <HomeIcon size={RAIL_ICON_SIZE} />
    </span>
    <span className={railIcon}>
      <SearchIcon size={RAIL_ICON_SIZE} />
    </span>
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <RailTab label="Explore" icon={<CompassIcon size={RAIL_ICON_SIZE} />} />
    <RailTab
      label="You"
      icon={
        <img
          alt=""
          src="https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1"
          className="size-6 rounded-8 object-cover"
        />
      }
    />
    <RailTab label="Squads" icon={<SquadIcon size={RAIL_ICON_SIZE} />} />
    <RailTab label="Activity" icon={<BellIcon size={RAIL_ICON_SIZE} />} />
    <RailTab label="Streak" icon={<HotIcon size={RAIL_ICON_SIZE} />} />
    <span className="my-2 flex size-9 items-center justify-center rounded-12 bg-accent-cabbage-default text-white">
      <PlusIcon />
    </span>
    <span className="my-3 h-px w-8 bg-border-subtlest-quaternary" />
    <span className={railIcon}>
      <BookmarkIcon size={RAIL_ICON_SIZE} />
    </span>
    <span className={railIcon}>
      <EyeIcon size={RAIL_ICON_SIZE} />
    </span>
  </nav>
);

/** SidebarTablet: the 64px icon rail between phone and laptop. */
const TabletRail = (): ReactElement => (
  <aside className="fixed left-0 top-0 z-sidebar hidden h-full w-16 flex-col items-center gap-6 border-r border-border-subtlest-tertiary bg-background-default pt-4 tablet:flex laptop:hidden">
    <LogoIcon className={{ container: 'h-6 w-auto' }} />
    {[HomeIcon, SearchIcon, SourceIcon, BellIcon].map((Icon, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <span key={index} className="text-text-tertiary">
        <Icon size={IconSize.Medium} />
      </span>
    ))}
  </aside>
);

/** ShellCluster on a page no tab owns: four tabs, none lit, and Create. */
const PhoneCluster = (): ReactElement => (
  <div
    className="pointer-events-none fixed inset-x-0 z-3 flex items-end gap-2 px-4 tablet:hidden"
    style={{ bottom: BAR.floor }}
  >
    <nav
      aria-label="Main"
      className="shell-material pointer-events-auto flex min-w-0 flex-1 items-stretch rounded-[1.375rem] p-1"
      style={{ height: BAR.height }}
    >
      {[HomeIcon, SearchIcon, SquadIcon, BellIcon].map((Icon, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex min-w-0 flex-1 items-center justify-center text-text-secondary"
        >
          <Icon size={IconSize.Large} />
        </span>
      ))}
    </nav>
    <span
      aria-label="Create post"
      className="shell-material shell-material-action pointer-events-auto flex shrink-0 items-center justify-center rounded-[1.375rem] text-text-primary"
      style={{ width: BAR.height, height: BAR.height }}
    >
      <PlusIcon size={IconSize.Large} />
    </span>
  </div>
);

/** PostCapsule at rest: the post's actions, one gap above the bottom bar. */
const PhoneCapsule = ({ post }: { post: Post }): ReactElement => (
  <div
    className="shell-capsule pointer-events-none fixed inset-x-0 z-3 px-4 tablet:hidden"
    style={{ bottom: BAR.floor + BAR.height + BAR.gap }}
  >
    <div
      className="shell-material shell-material-action pointer-events-auto flex w-full items-center justify-between px-1"
      style={{ height: BAR.field, borderRadius: 22 }}
    >
      <CardAction
        label="Upvote"
        icon={<UpvoteIcon />}
        count={post.numUpvotes}
        color={ButtonColor.Avocado}
        className="shell-press"
      />
      <CardAction
        label="Downvote"
        icon={<DownvoteIcon />}
        color={ButtonColor.Ketchup}
        className="shell-press"
      />
      <CardAction
        label="Comment"
        icon={<DiscussIcon />}
        count={post.numComments}
        color={ButtonColor.BlueCheese}
        className="shell-press"
      />
      <CardAction
        label="Bookmark"
        icon={<BookmarkIcon />}
        color={ButtonColor.Bun}
        className="shell-press"
      />
      <CardAction
        label="Copy link"
        icon={<LinkIcon />}
        color={ButtonColor.Cabbage}
        className="shell-press"
      />
    </div>
  </div>
);

/** Room under the page for the capsule and the bar (FooterNavBarLayout). */
export const phoneFooterSpace = 'pb-[8.25rem] tablet:pb-0';

export const AppShell = ({
  post,
  mainRef,
  children,
}: {
  post?: Post;
  mainRef?: React.Ref<HTMLElement>;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default text-text-primary antialiased laptop:bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))]">
    <Rail />
    <TabletRail />
    <main ref={mainRef} className="flex flex-col tablet:pl-16 laptop:pl-20">
      <div className="flex min-h-0 flex-1 flex-col laptop:my-3 laptop:ml-1 laptop:mr-3">
        <div
          className={classNames(
            'layout-frame relative flex min-h-0 flex-1 flex-col',
            'laptop:min-h-[calc(100vh-1.5rem)] laptop:overflow-clip laptop:rounded-24 laptop:border laptop:border-border-subtlest-quaternary laptop:bg-background-default laptop:p-0.5',
          )}
        >
          {post && <PhoneBlock title="" />}
          {children}
        </div>
      </div>
    </main>
    <PhoneCluster />
    {post && <PhoneCapsule post={post} />}
  </div>
);
