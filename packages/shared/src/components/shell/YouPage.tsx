import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import {
  AnalyticsIcon,
  BookmarkIcon,
  CoreIcon,
  DevCardIcon,
  DevPlusIcon,
  DocsIcon,
  EyeIcon,
  FeedbackIcon,
  FilterIcon,
  FlagIcon,
  HelpIcon,
  InviteIcon,
  JoystickIcon,
  PhoneIcon,
  PrivacyIcon,
  ReputationIcon,
  SettingsIcon,
  TerminalIcon,
  UserIcon,
} from '../icons';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { SubscriptionStatus } from '../../lib/plus';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  appsUrl,
  docs,
  feedback,
  plusUrl,
  privacyPolicy,
  reputation as reputationDocsUrl,
  settingsUrl,
  termsOfService,
  walletUrl,
  webappUrl,
} from '../../lib/constants';
import { usePhoneBrowser } from '../../features/getApp/hooks/usePhoneBrowser';
import { largeNumberFormat } from '../../lib';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useUserFollowStats } from '../../hooks/profile/useUserFollowStats';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { PlusUser } from '../PlusUser';
import { ShellPage } from './ShellPageContext';
import { ShellSquare } from './ShellSquare';

interface YouRowProps {
  icon: (props: IconProps) => ReactElement;
  label: string;
  meta?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

const YouRow = ({
  icon: Icon,
  label,
  meta,
  href,
  external = false,
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
    'flex h-11 w-full items-center gap-3 px-4 text-left text-text-primary transition-colors typo-callout mouse:hover:bg-surface-hover active:bg-surface-hover';

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

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
  <div className={classNames('flex flex-col py-2', className)}>
    {/* The rule between groups is inset like the settings lists; only a
        sheet's header rule runs edge to edge. */}
    <span
      aria-hidden
      className="mx-4 mb-2 h-px shrink-0 bg-border-subtlest-tertiary"
    />
    {title && (
      <span className="px-4 pb-1 pt-1 text-text-tertiary typo-caption1">
        {title}
      </span>
    )}
    {children}
  </div>
);

// A count the member can act on: the follow counts read inline under the
// handle, as on the profile.
const FollowStat = ({
  amount,
  label,
  onClick,
}: {
  amount: number;
  label: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 rounded-8 transition-colors typo-footnote active:bg-surface-hover mouse:hover:bg-surface-hover"
  >
    <b className="text-text-primary">{largeNumberFormat(amount)}</b>
    <span className="text-text-tertiary">{label}</span>
  </button>
);

// Reputation and Cores as small pills under the follow counts: the number
// bold, the label beside it, each pill its own tap target. The streak
// stays on the Home row.
const StatPill = ({
  icon,
  amount,
  label,
  href,
  external = false,
}: {
  icon: ReactNode;
  amount: number;
  label: string;
  href: string;
  external?: boolean;
}): ReactElement => {
  const className =
    'shell-press flex h-8 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float pl-2 pr-2.5 typo-footnote transition-colors mouse:hover:bg-surface-hover active:bg-surface-hover';
  const content = (
    <>
      {icon}
      <b className="tabular-nums text-text-primary">
        {largeNumberFormat(amount)}
      </b>
      <span className="text-text-tertiary">{label}</span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} passHref>
      <a className={className}>{content}</a>
    </Link>
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

// The page behind the avatar: who you are and your counts on top, then
// only the places nothing else leads to, then the utilities. One screen,
// no scroll; what the tabs and the header already reach (feeds, squads,
// following, the streak) is not repeated here.
export function YouPage(): ReactElement | null {
  const { openModal } = useLazyModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: followStats } = useUserFollowStats(user?.id);
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hasAccessToCores = useHasAccessToCores();
  const isPhoneBrowser = usePhoneBrowser();
  const { optOutAchievements, optOutLevelSystem, optOutQuestSystem } =
    useSettingsContext();
  const plusRow = usePlusRow();
  const hideGameCenter =
    optOutAchievements && optOutLevelSystem && optOutQuestSystem;

  if (!user) {
    return null;
  }

  const profileUrl = `${webappUrl}${user.username}`;
  const feedSettingsUrl = `${webappUrl}feeds/${
    isCustomDefaultFeed ? defaultFeedId : user.id
  }/edit`;
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

  const actions = (
    <>
      <Link href={`${settingsUrl}/invite`} passHref>
        <a className="shell-material shell-press shell-hit relative flex h-[2.375rem] shrink-0 items-center gap-1.5 rounded-14 px-3 font-bold text-text-primary typo-callout">
          <InviteIcon size={IconSize.Small} />
          Invite
        </a>
      </Link>
      <ShellSquare aria-label="Help" onClick={() => setIsHelpOpen(true)}>
        <HelpIcon size={IconSize.Small} />
      </ShellSquare>
    </>
  );

  return (
    <div className="flex flex-col pb-6">
      <ShellPage title="You" actions={actions} />
      <div className="flex flex-col gap-3 px-4 pb-3 pt-2">
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
          <FollowStat
            amount={followStats?.numFollowing ?? 0}
            label="Following"
            onClick={() =>
              openFollowList(
                LazyModal.UserFollowingModal,
                followStats?.numFollowing ?? 0,
              )
            }
          />
          <FollowStat
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
        <div className="flex flex-wrap items-center gap-2">
          <StatPill
            icon={
              <ReputationIcon
                size={IconSize.Small}
                className="text-accent-onion-default"
              />
            }
            amount={user.reputation ?? 0}
            label="Reputation"
            href={reputationDocsUrl}
            external
          />
          {hasAccessToCores && (
            <StatPill
              icon={
                <CoreIcon
                  size={IconSize.Small}
                  className="text-accent-cheese-default"
                />
              }
              amount={user.balance?.amount ?? 0}
              label="Cores"
              href={walletUrl}
            />
          )}
        </div>
      </div>
      <YouGroup className="pt-0 [&>span:first-child]:hidden">
        <YouRow icon={UserIcon} label="Profile" href={profileUrl} />
        <YouRow
          icon={DevPlusIcon}
          label={plusRow.label}
          meta={plusRow.meta}
          href={plusUrl}
        />
        <YouRow
          icon={FilterIcon}
          label="Feed settings"
          href={feedSettingsUrl}
        />
        <YouRow
          icon={BookmarkIcon}
          label="Bookmarks"
          href={`${webappUrl}bookmarks`}
        />
        <YouRow icon={EyeIcon} label="History" href={`${webappUrl}history`} />
        <YouRow
          icon={AnalyticsIcon}
          label="Analytics"
          href={`${webappUrl}analytics`}
        />
        {!hideGameCenter && (
          <YouRow
            icon={JoystickIcon}
            label="Game center"
            href={`${webappUrl}game-center`}
          />
        )}
        <YouRow
          icon={DevCardIcon}
          label="DevCard"
          href={`${webappUrl}devcard`}
        />
        <YouRow
          icon={SettingsIcon}
          label="Settings"
          onClick={async () => {
            // On a phone the settings menu is state over the first settings
            // page; the layout closes it on arrival, so it opens after.
            await router.push(`${settingsUrl}/profile`);
            queryClient.setQueryData(
              generateQueryKey(RequestKey.AccountNavigation),
              true,
            );
          }}
        />
      </YouGroup>
      <RootPortal>
        <Drawer
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="Help"
          className={{ drawer: 'py-1' }}
        >
          <YouRow
            icon={FeedbackIcon}
            label="Send feedback"
            onClick={() => {
              setIsHelpOpen(false);
              openModal({ type: LazyModal.Feedback });
            }}
          />
          <YouRow
            icon={FlagIcon}
            label="Report a bug"
            href={feedback}
            external
          />
          <YouRow icon={DocsIcon} label="Docs" href={docs} external />
          <YouRow
            icon={TerminalIcon}
            label="Changelog"
            href={`${webappUrl}sources/daily_updates`}
          />
          {isPhoneBrowser && (
            <YouRow
              icon={PhoneIcon}
              label="Get the mobile app"
              href={appsUrl}
              external
            />
          )}
          <YouGroup className="mt-2 pb-0">
            <YouRow
              icon={PrivacyIcon}
              label="Privacy policy"
              href={privacyPolicy}
              external
            />
            <YouRow
              icon={DocsIcon}
              label="Terms of service"
              href={termsOfService}
              external
            />
          </YouGroup>
        </Drawer>
      </RootPortal>
    </div>
  );
}

export default YouPage;
