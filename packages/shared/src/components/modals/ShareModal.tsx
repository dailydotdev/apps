import React, { ReactElement, useContext, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { SocialShare } from '../widgets/SocialShare';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { Modal, ModalProps } from './common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';
import { ShareModalProps } from './post/common';

export default function ShareModal({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onRequestClose,
  ...props
}: ShareModalProps & ModalProps): ReactElement {
  const isComment = !!comment;
  const { trackEvent } = useContext(AnalyticsContext);

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
      kind={Modal.Kind.FlexibleCenter}
      onRequestClose={onRequestClose}
      {...props}
      className="overflow-hidden"
      isDrawerOnMobile
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
          onClose={() => onRequestClose(null)}
        />
      </Modal.Body>
    </Modal>
  );
}
