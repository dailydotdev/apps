import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Header } from './Header';
import { HeroImage } from './HeroImage';
import { UserMetadata } from './UserMetadata';
import { UserStats } from './UserStats';
import { SocialChips } from './SocialChips';
import { SquadsList } from './SquadsList';
import { useDynamicHeader } from '../../useDynamicHeader';
import AuthContext from '../../contexts/AuthContext';
import { ProfileV2 } from '../../graphql/users';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import ReferralWidget from '../widgets/ReferralWidget';

export interface ProfileWidgetsProps extends ProfileV2 {
  className?: string;
  enableSticky?: boolean;
}

export function ProfileWidgets({
  user,
  sources,
  userStats,
  className,
  enableSticky,
}: ProfileWidgetsProps): ReactElement {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;
  const stats = { ...userStats, reputation: user?.reputation };

  const { ref: stickyRef, progress: stickyProgress } =
    useDynamicHeader<HTMLDivElement>(enableSticky);
  const hideSticky = !stickyProgress;

  const { url: referralUrl } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
    enabled: isSameUser,
  });

  return (
    <div className={classNames('flex flex-col', className)}>
      <Header user={user} isSameUser={isSameUser} />
      {!hideSticky && (
        <Header
          user={user}
          isSameUser={isSameUser}
          sticky
          className="fixed top-0 left-0 z-3 w-full transition-transform duration-75 bg-theme-bg-primary"
          style={{ transform: `translateY(${(stickyProgress - 1) * 100}%)` }}
        />
      )}
      <HeroImage
        cover={user.cover}
        image={user.image}
        username={user.username}
        id={user.id}
        ref={stickyRef}
      />
      <div className="flex relative flex-col px-4">
        <UserMetadata
          username={user.username}
          name={user.name}
          createdAt={user.createdAt}
        />
        <UserStats stats={stats} />
        {user.bio && (
          <div className="text-theme-label-tertiary typo-callout">
            {user.bio}
          </div>
        )}
      </div>
      <SocialChips links={user} />
      {(isSameUser || sources?.edges?.length > 0) && (
        <div className="flex flex-col gap-3 tablet:px-4 pl-4 mb-4">
          <div className="typo-footnote text-theme-label-tertiary">
            Active in these Squads
          </div>
          <SquadsList memberships={sources} userId={user.id} />
        </div>
      )}
      {isSameUser && (
        <ReferralWidget url={referralUrl} className="hidden tablet:flex mt-2" />
      )}
    </div>
  );
}
