import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { SocialShare } from '../widgets/SocialShare';
import LogContext from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { Modal, ModalProps } from './common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';
import { ShareProps } from './post/common';
import { Squad } from '../../graphql/sources';
import { useViewSize, ViewSize } from '../../hooks';

export default function ShareModal({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  parentSelector,
  onRequestClose,
  ...props
}: ShareProps & ModalProps): ReactElement {
  const isComment = !!comment;
  const isMobile = useViewSize(ViewSize.MobileL);
  const { logEvent } = useContext(LogContext);

  const baseLogEvent = (eventName: string, extra?: Record<string, unknown>) =>
    logEvent(
      postLogEvent(eventName, post, {
        extra: {
          ...extra,
          origin,
          variant: ExperimentWinner.PostCardShareVersion,
          ...(comment && { commentId: comment.id }),
        },
        columns,
        column,
        row,
      }),
    );

  useEffect(() => {
    baseLogEvent('open share');

    return () => baseLogEvent('close share');
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
  const squadState = useState<Squad>();

  return (
    <Modal
      size={Modal.Size.Small}
      kind={Modal.Kind.FlexibleCenter}
      onRequestClose={onRequestClose}
      {...props}
      parentSelector={parentSelector}
      className="overflow-hidden"
      isDrawerOnMobile
      shouldCloseOnOverlayClick={!isMobile || !squadState[0]}
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
          parentSelector={parentSelector}
          shareToSquadState={squadState}
        />
      </Modal.Body>
    </Modal>
  );
}
