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
  FeedbackIcon,
  HelpIcon,
  MagicIcon,
  ReadingStreakIcon,
  ReputationIcon,
  SettingsIcon,
  TimerIcon,
  UserIcon,
} from '../icons';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { ReadingStreakPopup } from '../streak/popup/ReadingStreakPopup';
import { useReadingStreak } from '../../hooks/streaks';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { SubscriptionStatus } from '../../lib/plus';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  plusUrl,
  settingsUrl,
  docs,
  walletUrl,
  webappUrl,
} from '../../lib/constants';
import { largeNumberFormat } from '../../lib';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useUserFollowStats } from '../../hooks/profile/useUserFollowStats';
import { PlusUser } from '../PlusUser';
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

// A count the member can act on: the follow counts read inline under the
// handle, as on the profile; reputation, streak and Cores are tiles in the
// wallet's language.
const Stat = ({
  amount,
  label,
  onClick,
  href,
  icon: Icon,
  tile = false,
}: {
  amount: number;
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: (props: IconProps) => ReactElement;
  tile?: boolean;
}): ReactElement => {
  const content = tile ? (
    <>
      <span className="flex items-center gap-1 text-text-tertiary typo-caption1">
        {Icon && <Icon size={IconSize.Size16} />}
        {label}
      </span>
      <b className="text-text-primary typo-callout">
        {largeNumberFormat(amount)}
      </b>
    </>
  ) : (
    <>
      <b className="text-text-primary">{largeNumberFormat(amount)}</b>
      <span className="text-text-tertiary">{label}</span>
    </>
  );
  const className = tile
    ? 'shell-press flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-14 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-left'
    : 'shell-press flex items-center gap-1 typo-footnote';

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

// The page behind the avatar, X's menu: who you are and your counts on
// top, then the places only this page leads to, then the utilities. It
// fits one screen; what the tabs already reach (feeds, squads, following)
// is not repeated here.
export function YouPage(): ReactElement | null {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { streak } = useReadingStreak();
  const { isPlus } = usePlusSubscription();
  const { data: followStats } = useUserFollowStats(user?.id);
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
  const followQuery = {
    queryProps: { id: user.id, entity: ContentPreferenceType.User },
  };
  const openFollowList = (
    type: LazyModal.UserFollowersModal | LazyModal.UserFollowingModal,
    placeholderAmount: number,
  ) => {
    if (!placeholderAmount) {
      return;
    }
    openModal({ type, props: { ...followQuery, placeholderAmount } });
  };

  return (
    <div className="flex flex-col pb-6">
      <ShellPage
        title="You"
        actions={
          <ShellSquare
            aria-label="Feedback"
            onClick={() => openModal({ type: LazyModal.Feedback })}
          >
            <FeedbackIcon size={IconSize.Small} />
          </ShellSquare>
        }
      />
      <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
        <Link href={profileUrl} passHref>
          <a className="flex items-center gap-3">
            <ProfilePicture
              user={user}
              size={ProfileImageSize.XLarge}
              nativeLazyLoading
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex min-w-0 items-center gap-1">
                <span className="truncate font-bold typo-title3">
                  {user.name}
                </span>
                {isPlus && <PlusUser withText={false} />}
              </span>
              <span className="truncate text-text-tertiary typo-footnote">
                @{user.username}
              </span>
            </span>
          </a>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Stat
            amount={followStats?.numFollowing ?? 0}
            label="Following"
            onClick={() =>
              openFollowList(
                LazyModal.UserFollowingModal,
                followStats?.numFollowing ?? 0,
              )
            }
          />
          <Stat
            amount={followStats?.numFollowers ?? 0}
            label="Followers"
            onClick={() =>
              openFollowList(
                LazyModal.UserFollowersModal,
                followStats?.numFollowers ?? 0,
              )
            }
          />
        </div>
        <div className="flex gap-2">
          <Stat
            tile
            icon={ReputationIcon}
            amount={user.reputation ?? 0}
            label="Reputation"
            href={profileUrl}
          />
          {streak && (
            <Stat
              tile
              icon={ReadingStreakIcon}
              amount={streak.current}
              label="Streak"
              onClick={() => setIsStreakOpen(true)}
            />
          )}
          {hasAccessToCores && (
            <Stat
              tile
              icon={CoreFlatIcon}
              amount={user.balance?.amount ?? 0}
              label="Cores"
              href={walletUrl}
            />
          )}
        </div>
      </div>
      <YouGroup className="border-t-0 pt-0">
        <YouRow icon={UserIcon} label="Profile" href={profileUrl} />
        <YouRow
          icon={DevPlusIcon}
          label={plusRow.label}
          meta={plusRow.meta}
          href={plusUrl}
        />
        <YouRow
          icon={BookmarkIcon}
          label="Bookmarks"
          href={`${webappUrl}bookmarks`}
        />
        <YouRow icon={TimerIcon} label="History" href={`${webappUrl}history`} />
        {!hideGameCenter && (
          <YouRow
            icon={MagicIcon}
            label="Game center"
            href={`${webappUrl}game-center`}
          />
        )}
        <YouRow
          icon={DevCardIcon}
          label="DevCard"
          href={`${webappUrl}devcard`}
        />
      </YouGroup>
      <YouGroup>
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
        <YouRow icon={HelpIcon} label="Help" href={docs} />
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
