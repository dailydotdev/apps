import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { Source, SourceTooltip } from '../../../graphql/sources';
import { LogEvent } from '../../../lib/log';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { largeNumberFormat, ReferralCampaignKey } from '../../../lib';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import SourceActionsFollow from '../../sources/SourceActions/SourceActionsFollow';
import { ButtonVariant } from '../../buttons/Button';
import { useSourceActions } from '../../../hooks';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';

type SourceEntityCardProps = {
  source: SourceTooltip;
  className?: {
    container?: string;
    menuButton?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const { isFollowing, toggleFollow } = useSourceActions({
    source: source as Source,
  });
  const router = useRouter();
  const { follow, unfollow } = useContentPreference();

  const actionButtons = useMemo(() => {
    return (
      <>
        <CustomFeedOptionsMenu
          className={{
            button: className?.menuButton,
            menu: 'z-[9999]',
          }}
          onCreateNewFeed={() =>
            router.push(
              `/feeds/new?entityId=${source.id}&entityType=${ContentPreferenceType.Source}`,
            )
          }
          onAdd={(feedId) =>
            follow({
              id: source.id,
              entity: ContentPreferenceType.Source,
              entityName: source.handle,
              feedId,
            })
          }
          onUndo={(feedId) =>
            unfollow({
              id: source.id,
              entity: ContentPreferenceType.Source,
              entityName: source.handle,
              feedId,
            })
          }
          shareProps={{
            text: `Check out ${source.handle} on daily.dev`,
            link: source.permalink,
            cid: ReferralCampaignKey.ShareSource,
            logObject: () => ({
              event_name: LogEvent.ShareSource,
              target_id: source.id,
            }),
          }}
        />
        <SourceActionsFollow
          isFetching={false}
          isSubscribed={isFollowing}
          onClick={toggleFollow}
          variant={ButtonVariant.Primary}
        />
      </>
    );
  }, [
    source,
    router,
    follow,
    unfollow,
    isFollowing,
    toggleFollow,
    className?.menuButton,
  ]);

  const { description, membersCount, flags, name, image } = source || {};
  return (
    <EntityCard
      image={image}
      type="source"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={name}
      actionButtons={actionButtons}
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Typography
          className="flex"
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {name}
        </Typography>
        {description && <EntityDescription copy={description} length={100} />}
        <div className="flex items-center gap-1 text-text-tertiary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(membersCount) || 0} Followers
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(flags?.totalUpvotes) || 0} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
