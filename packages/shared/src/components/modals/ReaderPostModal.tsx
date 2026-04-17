import type { MouseEvent, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import styles from './BasePostModal.module.css';
import type { Post } from '../../graphql/posts';
import type { PassedPostNavigationProps } from '../post/common';
import { ReaderPostLayout } from '../post/reader/ReaderPostLayout';
import { usePostReferrerContext } from '../../contexts/PostReferrerContext';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { useEventListener } from '../../hooks';
import useDebounceFn from '../../hooks/useDebounceFn';

interface ReaderPostModalProps extends ModalProps, PassedPostNavigationProps {
  id: string;
  post: Post;
}

export default function ReaderPostModal({
  id: _id,
  className,
  onRequestClose,
  onPreviousPost,
  onNextPost,
  postPosition,
  post,
  ...props
}: ReaderPostModalProps): ReactElement {
  const usePostReferrer =
    usePostReferrerContext()?.usePostReferrer ?? (() => {});
  const { logEvent } = useLogContext();
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);

  usePostReferrer({ post });

  const onScroll = useCallback(
    (event?: Event) => {
      if (!post?.id || !event) {
        return;
      }
      const targetElement = event.target as HTMLElement;
      logEvent({
        event_name: LogEvent.PageScroll,
        target_type: TargetType.Post,
        target_id: post.id,
        extra: JSON.stringify({
          scrollTop: targetElement.scrollTop,
        }),
      });
    },
    [logEvent, post?.id],
  );

  const [debouncedOnScroll] = useDebounceFn(onScroll, 100);
  useEventListener(scrollNode, 'scroll', debouncedOnScroll);

  return (
    <Modal
      size={Modal.Size.XLarge}
      kind={Modal.Kind.FlexibleTop}
      portalClassName={styles.postModal}
      id="reader-post-modal"
      overlayRef={(node) => setScrollNode(node)}
      onRequestClose={onRequestClose}
      {...props}
      overlayClassName="post-modal-overlay bg-overlay-quaternary-onion"
      className={classNames(
        className,
        'reader-post-modal !mx-0 h-full max-h-screen !max-w-full !bg-background-default focus:outline-none tablet:!mx-auto tablet:!max-w-[min(100vw-1rem,100rem)] laptop:!mt-2 laptop:h-[min(100vh-1rem,56rem)] laptop:max-h-[min(100vh-1rem,56rem)] laptop:overflow-hidden',
        '!overscroll-y-auto',
      )}
    >
      <ReaderPostLayout
        post={post}
        postPosition={postPosition}
        onPreviousPost={onPreviousPost}
        onNextPost={onNextPost}
        onClose={() => {
          onRequestClose?.({} as MouseEvent<Element>);
        }}
      />
    </Modal>
  );
}
