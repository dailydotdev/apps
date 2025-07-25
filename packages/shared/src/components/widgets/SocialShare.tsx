import type { Dispatch, ReactElement } from 'react';
import React, { useContext } from 'react';
import { ShareProvider, addLogQueryParams } from '../../lib/share';
import type { Post } from '../../graphql/posts';
import type { FeedItemPosition } from '../../lib/feed';
import { postLogEvent } from '../../lib/feed';
import { ActiveFeedContext } from '../../contexts';
import { LogEvent, Origin } from '../../lib/log';
import LogContext from '../../contexts/LogContext';
import type { Comment } from '../../graphql/comments';
import { getCommentHash } from '../../graphql/comments';
import { useSharePost } from '../../hooks/useSharePost';
import { SocialShareContainer } from './SocialShareContainer';
import { useCopyLink } from '../../hooks/useCopy';
import { SquadsToShare } from '../squads/SquadsToShare';
import { SocialShareList } from './SocialShareList';
import { useGetShortUrl } from '../../hooks';
import { ReferralCampaignKey } from '../../lib';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Squad } from '../../graphql/sources';
import { CreateSharedPostModal } from '../modals/post/CreateSharedPostModal';
import type { ModalProps } from '../modals/common/Modal';

interface SocialShareProps extends Pick<ModalProps, 'parentSelector'> {
  origin: Origin;
  post: Post;
  comment?: Comment;
  onClose?: () => void;
  commentary?: string;
  shareToSquadState: [Squad, Dispatch<Squad>];
}

export const SocialShare = ({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onClose,
  parentSelector,
  shareToSquadState,
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
      ? addLogQueryParams({ link: href, userId: user.id, cid })
      : href;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyLink();
  const { logEvent } = useContext(LogContext);
  const { logOpts } = useContext(ActiveFeedContext);
  const { openNativeSharePost } = useSharePost(Origin.Share);
  const [squadToShare, setSquadToShare] = shareToSquadState;
  const logClick = (provider: ShareProvider) =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        columns,
        column,
        row,
        extra: { provider, origin, ...(comment && { commentId: comment.id }) },
        ...(logOpts && logOpts),
      }),
    );

  const logAndCopyLink = async () => {
    const shortLink = await getShortUrl(link);
    copyLink({ link: shortLink });
    logClick(ShareProvider.CopyLink);
  };

  const onSharedSuccessfully = () => {
    logEvent(
      postLogEvent(LogEvent.ShareToSquad, post, { ...(logOpts && logOpts) }),
    );

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {!isComment && !post.private && (
        <SocialShareContainer title="Share with your squad" className="mb-4">
          <SquadsToShare onClick={(_, squad) => setSquadToShare(squad)} />
        </SocialShareContainer>
      )}
      <SocialShareContainer title="Share externally">
        <SocialShareList
          link={link}
          description={post?.title}
          isCopying={copying}
          onCopy={logAndCopyLink}
          onNativeShare={() => openNativeSharePost(post)}
          onClickSocial={logClick}
          emailTitle="I found this amazing post"
        />
      </SocialShareContainer>
      {squadToShare && ( // using lazy modal would result to dep-cycle since this whole component is used in the share modal
        <CreateSharedPostModal
          isOpen
          preview={post}
          squad={squadToShare}
          onSharedSuccessfully={onSharedSuccessfully}
          parentSelector={parentSelector}
          onRequestClose={() => setSquadToShare(null)}
        />
      )}
    </>
  );
};
