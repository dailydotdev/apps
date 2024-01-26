import React, { ReactElement, useContext, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Post } from '../../graphql/posts';
import { SocialShare } from '../widgets/SocialShare';
import { Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { Comment } from '../../graphql/comments';
import { Modal, ModalProps } from './common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';
import { useViewSize, ViewSize } from '../../hooks';

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
  onRequestClose,
  ...props
}: ShareModalProps): ReactElement {
  const isComment = !!comment;
  const { trackEvent } = useContext(AnalyticsContext);
  const isMobile = useViewSize(ViewSize.MobileL);

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

  useEffect(() => {
    baseTrackingEvent('open share');

    return () => baseTrackingEvent('close share');
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSwipedDown = (e) => {
    const { scrollTop } = e.event.currentTarget;

    if (scrollTop === 0) {
      onRequestClose(e);
    }
  };

  const handlers = useSwipeable({ onSwipedDown });

  return (
    <Modal
      size={Modal.Size.Small}
      kind={isMobile ? Modal.Kind.FixedBottom : Modal.Kind.FlexibleCenter}
      onRequestClose={onRequestClose}
      {...props}
      className="overflow-hidden"
    >
      <Modal.Header title={isComment ? 'Share comment' : 'Share post'} />
      <Modal.Body {...handlers}>
        <SocialShare
          post={post}
          comment={comment}
          origin={origin}
          columns={columns}
          column={column}
          row={row}
          onSquadShare={() => onRequestClose(null)}
        />
      </Modal.Body>
    </Modal>
  );
}
