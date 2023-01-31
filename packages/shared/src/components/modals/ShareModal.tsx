import React, { ReactElement, useContext, useEffect } from 'react';
import { Button } from '../buttons/Button';
import PostItemCard from '../post/PostItemCard';
import { Post } from '../../graphql/posts';
import CopyIcon from '../icons/Copy';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopyLink';
import { SocialShare } from '../widgets/SocialShare';
import { Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { ShareProvider } from '../../lib/share';
import { Comment, getCommentHash } from '../../graphql/comments';
import { Modal, ModalProps } from './common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';

type ShareModalProps = {
  post: Post;
  comment?: Comment;
  origin: Origin;
} & FeedItemPosition &
  ModalProps;

export default function ShareModal({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  ...props
}: ShareModalProps): ReactElement {
  const isComment = !!comment;
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { trackEvent } = useContext(AnalyticsContext);
  const [, copyUrl] = useCopyLink(() => link);

  const baseTrackingEvent = (
    eventName: string,
    extra?: Record<string, unknown>,
  ) =>
    trackEvent(
      postAnalyticsEvent(eventName, post, {
        extra: {
          ...extra,
          origin,
          variant: ExperimentWinner.PostCardShareVersion,
          ...(comment && { commentId: comment.id }),
        },
      }),
    );

  const trackAndCopyLink = () => {
    baseTrackingEvent('share post', { provider: ShareProvider.CopyLink });
    copyUrl();
  };

  useEffect(() => {
    baseTrackingEvent('open share');

    return () => baseTrackingEvent('close share');
  }, []);

  return (
    <Modal size={Modal.Size.Small} kind={Modal.Kind.FlexibleCenter} {...props}>
      <Modal.Header title={isComment ? 'Share comment' : 'Share article'} />
      {!isComment && (
        <PostItemCard
          className="mt-2"
          postItem={{ post }}
          showButtons={false}
          clickable={false}
        />
      )}
      <Modal.Body>
        <p className="pb-2.5 font-bold typo-callout">Copy link</p>
        <TextField
          className={{ container: 'mt-2 mb-6' }}
          name="postUrl"
          inputId="postUrl"
          label="Copy URL"
          type="url"
          fieldType="tertiary"
          actionButton={
            <Button
              icon={<CopyIcon />}
              onClick={trackAndCopyLink}
              className="btn-tertiary"
              data-testid="textfield-action-icon"
            />
          }
          value={link}
          readOnly
        />
        <p className="py-2.5 font-bold typo-callout">Share via</p>
        <SocialShare
          post={post}
          comment={comment}
          origin={origin}
          columns={columns}
          column={column}
          row={row}
        />
      </Modal.Body>
    </Modal>
  );
}
