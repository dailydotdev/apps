import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { Button } from '../buttons/Button';
import XIcon from '../icons/Close';
import { ResponsiveModal } from './ResponsiveModal';
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
    <ResponsiveModal
      padding={false}
      {...props}
      contentClassName="!max-w-[26.25rem]"
    >
      <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 flex-row justify-between items-center px-6 w-full h-14 border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
        <h3 className="font-bold typo-title3">
          {isComment ? 'Share comment' : 'Share article'}
        </h3>
        <Button
          className="btn-tertiary"
          buttonSize="small"
          title="Close"
          icon={<XIcon />}
          onClick={props.onRequestClose}
        />
      </header>
      {!isComment && (
        <PostItemCard
          className="mt-4 mb-2"
          postItem={{ post }}
          showButtons={false}
          clickable={false}
        />
      )}
      <section className={classNames('px-6', isComment && 'mt-2')}>
        <p className="py-2.5 font-bold typo-callout">Copy link</p>
        <TextField
          className="mt-2 mb-6"
          name="postUrl"
          inputId="postUrl"
          label="Copy URL"
          type="url"
          fieldType="tertiary"
          actionIcon={<CopyIcon />}
          onActionIconClick={trackAndCopyLink}
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
      </section>
    </ResponsiveModal>
  );
}
