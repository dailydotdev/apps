import type { ReactElement } from 'react';
import React, { useRef, useEffect, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { Header } from './Header';
import { HeroImage } from './HeroImage';
import { UserMetadata } from './UserMetadata';
import { UserStats } from './UserStats';
import { SocialChips } from './SocialChips';
import { SquadsList } from './SquadsList';
import { useDynamicHeader } from '../../useDynamicHeader';
import AuthContext from '../../contexts/AuthContext';
import type { ProfileV2 } from '../../graphql/users';
import {
  ReferralCampaignKey,
  useActions,
  useReferralCampaign,
} from '../../hooks';
import ReferralWidget from '../widgets/ReferralWidget';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { PlusIcon } from '../icons';
import { DragDrop } from '../fields/DragDrop';
import {
  fileValidation,
  useUploadCv,
} from '../../features/profile/hooks/useUploadCv';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { ActionType } from '../../graphql/actions';

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
  const { logEvent } = useLogContext();
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

  const { checkHasCompleted } = useActions();
  const { onUpload, status, shouldShow } = useUploadCv();
  const hasClosedBanner = useMemo(
    () => checkHasCompleted(ActionType.ClosedProfileBanner),
    [checkHasCompleted],
  );
  const hasLoggedImpression = useRef(false);
  const shouldShowUpload = isSameUser && hasClosedBanner && shouldShow;

  useEffect(() => {
    if (shouldShowUpload && !hasLoggedImpression.current) {
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.CvBanner,
        target_id: TargetId.CVWidget,
      });
      hasLoggedImpression.current = true;
    }
  }, [shouldShowUpload, logEvent]);

  return (
    <div
      className={classNames('my-4 flex flex-col gap-6 laptop:my-0', className)}
    >
      <Header user={user} isSameUser={isSameUser} className="-mb-2" />
      {!hideSticky && (
        <Header
          user={user}
          isSameUser={isSameUser}
          sticky
          className="fixed left-0 top-0 z-3 w-full bg-background-default transition-transform duration-75 tablet:pl-20"
          style={{ transform: `translateY(${(stickyProgress - 1) * 100}%)` }}
        />
      )}
      <HeroImage
        cover={user.cover}
        image={user.image}
        username={user.username}
        id={user.id}
        ref={stickyRef}
        className={{
          container: 'mx-4',
        }}
      />
      <div className="relative flex flex-col gap-6 px-4">
        <UserMetadata
          username={user.username}
          name={user.name}
          createdAt={user.createdAt}
          company={user.companies?.[0]}
          isPlus={user?.isPlus}
          className="gap-3"
        />
        <UserStats stats={stats} userId={user.id} />
        {(user.bio || isSameUser) && (
          <div className="text-text-tertiary typo-callout">
            {user.bio || (
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                tag="a"
                href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
                icon={<PlusIcon />}
              >
                Add bio
              </Button>
            )}
          </div>
        )}
      </div>
      {shouldShowUpload && (
        <DragDrop
          isCompactList
          className="mx-4 max-w-80"
          onFilesDrop={([file]) => onUpload(file)}
          validation={fileValidation}
          state={status}
        />
      )}
      <SocialChips links={user} />
      {(isSameUser || sources?.edges?.length > 0) && (
        <div className="flex flex-col gap-3">
          <div className="px-4 text-text-tertiary typo-footnote">
            Active in these Squads
          </div>
          <SquadsList memberships={sources} userId={user.id} />
        </div>
      )}
      {isSameUser && (
        <ReferralWidget url={referralUrl} className="hidden laptop:flex" />
      )}
    </div>
  );
}
