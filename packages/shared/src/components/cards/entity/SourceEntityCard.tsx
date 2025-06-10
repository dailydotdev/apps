import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type {
  Source,
  SourceData,
  SourceTooltip,
} from '../../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import type { Origin } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { largeNumberFormat, ReferralCampaignKey } from '../../../lib';
import { SQUAD_QUERY } from '../../../graphql/squads';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import SourceActionsFollow from '../../sources/SourceActions/SourceActionsFollow';
import { ButtonVariant } from '../../buttons/Button';
import { useSourceActions } from '../../../hooks';

const SourceEntityCard = ({
  source,
  origin,
}: {
  source: SourceTooltip;
  origin: Origin;
}) => {
  const { isFollowing, toggleFollow } = useSourceActions({
    source: source as Source,
  });
  const router = useRouter();
  const { data, isLoading } = useQuery<SourceData>({
    queryKey: generateQueryKey(RequestKey.Source, { id: source.id }),
    queryFn: () =>
      gqlClient.request(SQUAD_QUERY, {
        handle: source.handle,
      }),
  });
  const { follow, unfollow } = useContentPreference();

  const actionButtons = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return (
      <>
        <CustomFeedOptionsMenu
          className={{
            button: 'bg-background-popover',
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
  }, [source, isLoading, router, follow, unfollow, isFollowing, toggleFollow]);

  if (isLoading) {
    return null;
  }

  const { description } = data?.source || {};
  return (
    <EntityCard
      image={source.image}
      type="source"
      className={{
        image: 'size-10 rounded-full',
        container: 'w-72',
      }}
      entityName={source.name}
      actionButtons={actionButtons}
    >
      <div className="flex w-full flex-col gap-2">
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description.length <= 100 ? (
              description
            ) : (
              <>
                {description.slice(0, 100)}...{' '}
                <Link
                  className="text-text-link"
                  href={`/sources/${data.source.id}`}
                >
                  Read more
                </Link>
              </>
            )}
          </Typography>
        )}
        <div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(data.source.flags.totalUpvotes)} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
