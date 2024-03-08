import React, { ReactElement, useContext } from 'react';
import { ShareProvider, addTrackingQueryParams } from '../../lib/share';
import { Post } from '../../graphql/posts';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Comment, getCommentHash } from '../../graphql/comments';
import { useSharePost } from '../../hooks/useSharePost';
import { SocialShareContainer } from './SocialShareContainer';
import { useCopyLink } from '../../hooks/useCopy';
import { SquadsToShare } from '../squads/SquadsToShare';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';
import { SocialShareList } from './SocialShareList';
import { useGetShortUrl } from '../../hooks';
import { ReferralCampaignKey } from '../../lib/referral';
import { useAuthContext } from '../../contexts/AuthContext';

interface SocialShareProps {
  origin: Origin;
  post: Post;
  comment?: Comment;
  onSquadShare?: () => void;
  commentary?: string;
}

export const SocialShare = ({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onSquadShare,
}: SocialShareProps & FeedItemPosition): ReactElement => {
  const isComment = !!comment;
  const { user, isAuthReady } = useAuthContext();
  const href = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const cid = isComment
    ? ReferralCampaignKey.ShareComment
    : ReferralCampaignKey.SharePost;
  // precompute the share link here, because it's used for copy link
  // as well as passed into the SocialShareList component
  const link =
    isAuthReady && user
      ? addTrackingQueryParams({ link: href, userId: user.id, cid })
      : href;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyLink();
  const { openModal } = useLazyModal();
  const { trackEvent } = useContext(AnalyticsContext);
  const { openNativeSharePost } = useSharePost(Origin.Share);
  const trackClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        columns,
        column,
        row,
        extra: { provider, origin, ...(comment && { commentId: comment.id }) },
      }),
    );

  const trackAndCopyLink = async () => {
    const shortLink = await getShortUrl(link);
    copyLink({ link: shortLink });
    trackClick(ShareProvider.CopyLink);
  };

  const onSharedSuccessfully = () => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post));

    if (onSquadShare) {
      onSquadShare();
    }
  };

  const onSquadsShare = (squad: Squad) => {
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully,
      },
    });
  };

  return (
    <>
      {!isComment && !post.private && (
        <SocialShareContainer title="Share with your squad" className="mb-4">
          <SquadsToShare onClick={(_, squad) => onSquadsShare(squad)} />
        </SocialShareContainer>
      )}
      <SocialShareContainer title="Share externally">
        <SocialShareList
          link={link}
          description={post?.title}
          isCopying={copying}
          onCopy={trackAndCopyLink}
          onNativeShare={() => openNativeSharePost(post)}
          onClickSocial={trackClick}
          emailTitle="I found this amazing post"
        />
      </SocialShareContainer>
    </>
  );
};
