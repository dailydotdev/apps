import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { TruncateText } from '../utilities';
import AdLink from '../cards/ad/common/AdLink';
import { adLogEvent } from '../../lib/feed';
import { useLogContext } from '../../contexts/LogContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import PlaceholderCommentList from './PlaceholderCommentList';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { AdPixel } from '../cards/ad/common/AdPixel';
import { AdViewability } from '../cards/ad/common/AdViewability';
import type { ViewabilityData } from '../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../features/monetization/viewability';
import { AdActions, AdPlacement, shouldSkipSourceAds } from '../../lib/ads';
import type { Post } from '../../graphql/posts';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { RemoveAd } from '../cards/ad/common/RemoveAd';
import { AdRefresh } from '../cards/ad/common/AdRefresh';
import { ButtonVariant } from '../buttons/common';
import { MiniCloseIcon } from '../icons';
import { useAdQuery } from '../../features/monetization/useAdQuery';
import { ImpressionStatus } from '../../hooks/feed/useLogImpression';
import { useScrambler } from '../../hooks/useScrambler';
import { TargetId } from '../../lib/log';
import { AdvertiseLink } from '../cards/ad/common/AdvertiseLink';
import { getAdFaviconImageLink } from '../cards/ad/common/getAdFaviconImageLink';

interface AdAsCommentProps {
  postId: string;
  /** The post's source; an ad-free squad gets no ad and no ad request. */
  source: Post['source'];
  /** No top margin, for hosts that space their children. */
  isCompact?: boolean;
}
export const AdAsComment = ({
  postId,
  source: postSource,
  isCompact = false,
}: AdAsCommentProps): ReactElement => {
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
      <div
        className={classNames(
          'min-h-48 rounded-16 border border-border-subtlest-tertiary p-4',
          !isCompact && 'mt-6',
        )}
      >
        <PlaceholderCommentList placeholderAmount={1} className="!mt-0" />
      </div>
    );
  }

  if (isAdFree || !ad) {
    return <></>;
  }

  const { providerId, source, description, pixel, tagLine } = ad;
  // Direct ads send no `company`; `source` is the advertiser's name.
  const advertiserName = ad.company?.trim() || source;
  // `image` is the creative's banner, not a logo: prefer the company logo, then
  // the advertiser's site icon, and only use the banner for ads with neither.
  const avatar =
    ad.companyLogo || ad.adDomain
      ? getAdFaviconImageLink({ ad, adImprovementsV3: true, size: 40 })
      : ad.image;

  return (
    <div
      className={classNames(
        'relative flex flex-wrap content-start rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline',
        !isCompact && 'mt-6',
      )}
    >
      <AdLink ad={ad} onLinkClick={() => onAdAction(AdActions.Click)} />
      <ProfilePicture
        nativeLazyLoading
        className="!inline-block"
        size={ProfileImageSize.Large}
        user={{ id: providerId, username: source, image: avatar }}
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        style={{ backgroundColor: ad?.backgroundColor }}
      />
      <div className="ml-3">
        <TruncateText className="commentAuthor flex w-fit font-bold text-text-primary typo-callout">
          {advertiserName}
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
        {tagLine && (
          <>
            <b>{tagLine}</b>
            <br />
          </>
        )}
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
