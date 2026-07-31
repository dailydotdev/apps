import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../../components/modals/common/types';
import { ArticleList } from '../../../components/cards/article/ArticleList';
import { FlexCol } from '../../../components/utilities';
import type { Post } from '../../../graphql/posts';
import { useAgent } from '../AgentContext';

const noop = () => undefined;

export const AgentFeedModal = ({
  label,
  posts,
  onRequestClose,
  ...props
}: ModalProps & { label: string; posts: Post[] }): ReactElement => {
  const { setActiveContent } = useAgent();

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Large}
      isDrawerOnMobile
    >
      <Modal.Header title={label} />
      <Modal.Body>
        <FlexCol className="gap-2">
          {posts.map((post) => (
            <ArticleList
              key={post.id}
              post={post}
              onPostClick={(clicked, event) => {
                event?.preventDefault();
                setActiveContent({ type: 'post', post: clicked });
              }}
              onUpvoteClick={noop}
              onDownvoteClick={noop}
              onCommentClick={noop}
              onBookmarkClick={noop}
              onCopyLinkClick={noop}
              onShare={noop}
            />
          ))}
        </FlexCol>
      </Modal.Body>
    </Modal>
  );
};
