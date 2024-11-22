import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { TruncateText } from '../utilities';
import AdLink from '../cards/ad/common/AdLink';
import { adLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import PlaceholderCommentList from './PlaceholderCommentList';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import AuthContext from '../../contexts/AuthContext';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { AdPixel } from '../cards/ad/common/AdPixel';
import { AdActions, fetchCommentAd } from '../../lib/ads';

interface AdAsCommentProps {
  postId: string;
}
export const AdAsComment = ({ postId }: AdAsCommentProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const { user } = useContext(AuthContext);
  const isImpressionTracked = useRef(false);
  const ad = useQuery({
    queryKey: generateQueryKey(RequestKey.Ads, user, postId),

    queryFn: fetchCommentAd,
    enabled: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: StaleTime.OneHour,
  });

  const { isPending, data, isError } = ad || {};
  const { providerId, source, image, description, pixel, company, tagLine } =
    data || {};

  const onAdAction = useCallback(
    (action: AdActions) => {
      logEvent(
        adLogEvent(action, data, {
          extra: {
            origin: 'post page',
          },
        }),
      );
    },
    [logEvent, data],
  );

  useEffect(() => {
    if (isImpressionTracked.current || isPending || isError) {
      return;
    }

    onAdAction(AdActions.Impression);

    isImpressionTracked.current = true;
  }, [isPending, isError, isImpressionTracked, onAdAction]);

  if (isError) {
    return null;
  }
  if (isPending) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  return (
    <div className="relative mt-6 flex flex-wrap rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
      <AdLink ad={data} onLinkClick={() => onAdAction(AdActions.Click)} />
      <ProfilePicture
        nativeLazyLoading
        className="!inline-block"
        size={ProfileImageSize.Large}
        user={{ id: providerId, username: source, image }}
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        style={{ backgroundColor: data?.backgroundColor }}
      />
      <div className="ml-3">
        <TruncateText className="commentAuthor flex w-fit font-bold text-text-primary typo-callout">
          {company}
        </TruncateText>
        <TruncateText className="flex w-fit text-text-quaternary typo-callout">
          Promoted by {source}
        </TruncateText>
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
