import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { TruncateText } from '@dailydotdev/shared/src/components/utilities';
import AdLink from '@dailydotdev/shared/src/components/cards/ad/common/AdLink';
import { adLogEvent } from '@dailydotdev/shared/src/lib/feed';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import PlaceholderCommentList from '@dailydotdev/shared/src/components/comments/PlaceholderCommentList';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { AdPixel } from '@dailydotdev/shared/src/components/cards/ad/common/AdPixel';
import { AdViewability } from '@dailydotdev/shared/src/components/cards/ad/common/AdViewability';
import type { ViewabilityData } from '@dailydotdev/shared/src/features/monetization/viewability';
import { viewabilityLogExtra } from '@dailydotdev/shared/src/features/monetization/viewability';
import {
  AdActions,
  AdPlacement,
  shouldSkipSourceAds,
} from '@dailydotdev/shared/src/lib/ads';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import { RemoveAd } from '@dailydotdev/shared/src/components/cards/ad/common/RemoveAd';
import { AdRefresh } from '@dailydotdev/shared/src/components/cards/ad/common/AdRefresh';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import { useAdQuery } from '@dailydotdev/shared/src/features/monetization/useAdQuery';
import { ImpressionStatus } from '@dailydotdev/shared/src/hooks/feed/useLogImpression';
import { useScrambler } from '@dailydotdev/shared/src/hooks/useScrambler';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { AdvertiseLink } from '@dailydotdev/shared/src/components/cards/ad/common/AdvertiseLink';

/**
 * AdAsComment without its 192px minimum height, which left an empty band
 * under "Advertise here", and without its own top margin: the discussion
 * column spaces it.
 */
interface CommentAdProps {
  postId: string;
  /** The post's source; an ad-free squad gets no ad and no ad request. */
  source: Post['source'];
}
export const CommentAd = ({
  postId,
  source: postSource,
}: CommentAdProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isAdFree = shouldSkipSourceAds(postSource);

  const {
    data: ad,
    refetch,
    isFetching,
    isRefetching,
  } = useAdQuery({
    placement: AdPlacement.PostComment,
    queryKey: generateQueryKey(RequestKey.Ads, user, postId),
    enabled: !isAdFree,
    staleTime: StaleTime.OneHour,
  });

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }
      logEvent(
        adLogEvent(action, ad, {
          extra: {
            origin: 'post page',
            ...extra,
          },
        }),
      );
    },
    [logEvent, ad],
  );

  const onViewable = useCallback(
    (data: ViewabilityData) =>
      onAdAction(AdActions.Viewable, viewabilityLogExtra(data)),
    [onAdAction],
  );

  const promotedText = useScrambler(
    !ad ? undefined : `Promoted by ${ad.source}`,
  );

  const onRefreshClick = useCallback(async () => {
    onAdAction(AdActions.Refresh);
    await refetch();
  }, [onAdAction, refetch]);

  useEffect(() => {
    if (!ad || ad?.impressionStatus === ImpressionStatus.LOGGED) {
      return;
    }

    onAdAction(AdActions.Impression);
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, onAdAction]);

  if (isFetching && !isRefetching) {
    return (
      <div className="rounded-16 border border-border-subtlest-tertiary p-4">
        <PlaceholderCommentList placeholderAmount={1} className="!mt-0" />
      </div>
    );
  }

  if (isAdFree || !ad) {
    return <></>;
  }

  const { providerId, source, image, description, pixel, company, tagLine } =
    ad;

  return (
    <div className="relative flex flex-wrap content-start rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
      <AdLink ad={ad} onLinkClick={() => onAdAction(AdActions.Click)} />
      <ProfilePicture
        nativeLazyLoading
        className="!inline-block"
        size={ProfileImageSize.Large}
        user={{ id: providerId, username: source, image }}
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        style={{ backgroundColor: ad?.backgroundColor }}
      />
      <div className="ml-3">
        <TruncateText className="commentAuthor flex w-fit font-bold text-text-primary typo-callout">
          {company}
        </TruncateText>
        <TruncateText className="text-text-quaternary typo-callout">
          {promotedText}
        </TruncateText>
      </div>
      <div className="z-1 ml-auto flex gap-1">
        <AdRefresh
          variant={ButtonVariant.Tertiary}
          onClick={onRefreshClick}
          loading={isRefetching}
        />
        {!isPlus && (
          <RemoveAd
            iconOnly
            variant={ButtonVariant.Tertiary}
            icon={<MiniCloseIcon />}
          />
        )}
      </div>
      <p className="mt-3 w-full text-text-primary typo-body">
        <b>{tagLine}</b>
        <br />
        {description}
      </p>
      <AdvertiseLink
        targetId={TargetId.AdComment}
        className="mt-2 w-fit whitespace-nowrap typo-caption2"
      />
      <AdPixel pixel={pixel} />
      <AdViewability ad={ad} onViewable={onViewable} />
    </div>
  );
};
