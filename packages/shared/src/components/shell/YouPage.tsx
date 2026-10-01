import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  AddUserIcon,
  BookmarkIcon,
  CoreFlatIcon,
  DevCardIcon,
  DevPlusIcon,
  FilterIcon,
  HelpIcon,
  MagicIcon,
  MegaphoneIcon,
  ReadingStreakIcon,
  SettingsIcon,
  SquadIcon,
  TimerIcon,
  UserIcon,
} from '../icons';
import { MedalIcon } from '../icons/Medal';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { ReadingStreakPopup } from '../streak/popup/ReadingStreakPopup';
import { useReadingStreak } from '../../hooks/streaks';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { SubscriptionStatus } from '../../lib/plus';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  docs,
  plusUrl,
  settingsUrl,
  squadCategoriesPaths,
  walletUrl,
  webappUrl,
} from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { ShellPage } from './ShellPageContext';
import { ShellSquare } from './ShellSquare';

interface YouRowProps {
  icon: (props: IconProps) => ReactElement;
  label: string;
  meta?: string;
  href?: string;
  onClick?: () => void;
}

const YouRow = ({
  icon: Icon,
  label,
  meta,
  href,
  onClick,
}: YouRowProps): ReactElement => {
  const content = (
    <>
      <span className="flex text-text-secondary">
        <Icon size={IconSize.Medium} />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta && (
        <span className="shrink-0 text-text-tertiary typo-footnote">
          {meta}
        </span>
      )}
    </>
  );
  const className =
    'shell-press flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary typo-callout';

  if (href) {
    return (
      <Link href={href} passHref>
        <a className={className}>{content}</a>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

const YouGroup = ({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col border-t border-border-subtlest-tertiary py-2',
      className,
    )}
  >
    {title && (
      <span className="px-4 pb-1 pt-1 text-text-tertiary typo-caption1">
        {title}
      </span>
    )}
    {children}
  </div>
);

const usePlusRow = (): { label: string; meta: string } => {
  const { isPlus, status } = usePlusSubscription();

  if (!isPlus) {
    return { label: 'daily.dev Plus', meta: 'Upgrade' };
  }
  if (status === SubscriptionStatus.Cancelled) {
    return { label: 'daily.dev Plus', meta: 'Renew' };
  }

  return { label: 'daily.dev Plus', meta: 'Manage' };
};

// The page behind the avatar: everything that is about the member, in
// the order decided in the Mobile UX review (9b), with the profile one tap
// away and Help as the page's one top action.
export function YouPage(): ReactElement | null {
  const { user, squads } = useAuthContext();
  const { streak } = useReadingStreak();
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const hasAccessToCores = useHasAccessToCores();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const plusRow = usePlusRow();
  const hideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;

  if (!user) {
    return null;
  }

  const profileUrl = `${webappUrl}${user.username}`;

  return (
    <div className="flex flex-col pb-6">
      <ShellPage
        title="You"
        actions={
          <ShellSquare
            tag="a"
            href={docs}
            target="_blank"
            rel="noopener"
            aria-label="Help"
          >
            <HelpIcon size={IconSize.Small} />
          </ShellSquare>
        }
      />
      <Link href={profileUrl} passHref>
        <a className="flex items-center gap-3 px-4 py-4">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.XLarge}
            nativeLazyLoading
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold typo-title3">{user.name}</span>
            <span className="truncate text-text-tertiary typo-footnote">
              @{user.username}
              {typeof user.reputation === 'number' &&
                ` · ${largeNumberFormat(user.reputation)} reputation`}
            </span>
          </span>
        </a>
      </Link>
      <Link href={profileUrl} passHref>
        <a className="shell-press mx-4 mb-2 flex h-11 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary font-bold typo-callout">
          <UserIcon size={IconSize.Small} />
          View profile
        </a>
      </Link>
      <YouGroup className="border-t-0">
        <YouRow
          icon={DevPlusIcon}
          label={plusRow.label}
          meta={plusRow.meta}
          href={plusUrl}
        />
        <YouRow
          icon={FilterIcon}
          label="Custom feeds"
          href={`${webappUrl}feeds/new`}
        />
        <YouRow
          icon={SquadIcon}
          label="My squads"
          meta={squads?.length ? String(squads.length) : undefined}
          href={
            squads?.length
              ? squadCategoriesPaths['My Squads']
              : squadCategoriesPaths.discover
          }
        />
        <YouRow
          icon={AddUserIcon}
          label="Following"
          href={`${webappUrl}following`}
        />
        <YouRow
          icon={BookmarkIcon}
          label="Bookmarks"
          href={`${webappUrl}bookmarks`}
        />
        <YouRow icon={TimerIcon} label="History" href={`${webappUrl}history`} />
      </YouGroup>
      <YouGroup title="Your progress">
        {!optOutAchievements && (
          <YouRow
            icon={MedalIcon}
            label="Achievements"
            href={`${profileUrl}/achievements`}
          />
        )}
        {streak && (
          <YouRow
            icon={ReadingStreakIcon}
            label="Streak"
            meta={`${streak.current} days`}
            onClick={() => setIsStreakOpen(true)}
          />
        )}
        <YouRow
          icon={DevCardIcon}
          label="DevCard"
          href={`${webappUrl}devcard`}
        />
        <YouRow
          icon={MegaphoneIcon}
          label="Hot takes"
          href={`${webappUrl}?openModal=hottakes`}
        />
        {!hideGameCenter && (
          <YouRow
            icon={MagicIcon}
            label="Game center"
            href={`${webappUrl}game-center`}
          />
        )}
      </YouGroup>
      <YouGroup>
        {hasAccessToCores && (
          <YouRow icon={CoreFlatIcon} label="Core wallet" href={walletUrl} />
        )}
        <YouRow
          icon={AddUserIcon}
          label="Invite friends"
          href={`${settingsUrl}/invite`}
        />
        <YouRow
          icon={SettingsIcon}
          label="Settings"
          href={`${settingsUrl}/profile`}
        />
      </YouGroup>
      {streak && (
        <RootPortal>
          <Drawer isOpen={isStreakOpen} onClose={() => setIsStreakOpen(false)}>
            <ReadingStreakPopup streak={streak} fullWidth />
          </Drawer>
        </RootPortal>
      )}
    </div>
  );
}

export default YouPage;
