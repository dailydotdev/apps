import React, { ReactElement, useState, MouseEvent } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { Comment, PREVIEW_COMMENT_MUTATION } from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { Post } from '../../graphql/posts';
import Markdown from '../Markdown';
import TabContainer, { Tab } from '../tabs/TabContainer';
import CommentBox, { CommentBoxProps } from './CommentBox';

const DiscardCommentModal = dynamic(() => import('./DiscardCommentModal'));

export interface NewCommentModalProps extends ModalProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  contentHtml: string;
  commentId: string | null;
  post: Post;
  onComment?: (newComment: Comment, parentId: string | null) => void;
  editContent?: string;
  editId?: string;
}

export default function NewCommentModal({
  onRequestClose,
  ...props
}: CommentBoxProps): ReactElement {
  const [input, setInput] = useState<string>(null);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Write');
  const isPreview = activeTab === 'Preview';
  const { data: previewContent } = useQuery<{ preview: string }>(
    input,
    () =>
      request(`${apiUrl}/graphql`, PREVIEW_COMMENT_MUTATION, {
        content: input,
      }),
    { enabled: isPreview && input?.length > 0 },
  );

  const confirmClose = (event: MouseEvent): void => {
    if (input?.length) {
      setShowDiscardModal(true);
    } else {
      onRequestClose(event);
    }
  };

  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      // eslint-disable-next-line no-param-reassign
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  return (
    <ResponsiveModal
      {...{ contentRef: modalRef, onRequestClose: confirmClose, ...props }}
      padding={false}
      contentClassName="p-2"
    >
      <TabContainer
        onActiveChange={(active: string) => setActiveTab(active)}
        shouldMountInactive
      >
        <Tab label="Write">
          <CommentBox
            {...props}
            onInput={setInput}
            input={input}
            onRequestClose={onRequestClose}
          />
        </Tab>
        <Tab label="Preview" style={{ minHeight: '20rem' }}>
          {isPreview && previewContent?.preview && (
            <Markdown content={previewContent.preview} />
          )}
        </Tab>
      </TabContainer>
      <DiscardCommentModal
        isOpen={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
        onDeleteComment={onRequestClose}
        shouldCloseOnOverlayClick={false}
      />
    </ResponsiveModal>
  );
}
