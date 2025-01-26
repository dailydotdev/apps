import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { AdActions, fetchCommentAd } from '../../lib/ads';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { RemoveAd } from '../cards/ad/common/RemoveAd';
import { AdRefresh } from '../cards/ad/common/AdRefresh';
import { ButtonVariant } from '../buttons/common';
import { MiniCloseIcon } from '../icons';
import type { Ad } from '../../graphql/posts';
import { ImpressionStatus } from '../../hooks/feed/useLogImpression';

interface AdAsCommentProps {
  postId: string;
}
export const AdAsComment = ({ postId }: AdAsCommentProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();

  const {
    data: ad,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery<Ad>({
    queryKey: generateQueryKey(RequestKey.Ads, user, postId),
    queryFn: fetchCommentAd,
    enabled: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: StaleTime.OneHour,
  });

  const onAdAction = useCallback(
    (action: AdActions) => {
      logEvent(
        adLogEvent(action, ad, {
          extra: {
            origin: 'post page',
          },
        }),
      );
    },
    [logEvent, ad],
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

  if (!ad) {
    return null;
  }

  if (isFetching && !isRefetching) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  const { providerId, source, image, description, pixel, company, tagLine } =
    ad;

  return (
    <div className="relative mt-6 flex flex-wrap rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
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
        <TruncateText className="flex w-fit text-text-quaternary typo-callout">
          Promoted by {source}
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
      <AdPixel pixel={pixel} />
    </div>
  );
};
