import React, { ReactElement, useState, MouseEvent, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  Comment,
  CommentOnData,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
  PREVIEW_COMMENT_MUTATION,
} from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import Markdown from '../Markdown';
import TabContainer, { Tab } from '../tabs/TabContainer';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { Button } from '../buttons/Button';
import { Post } from '../../graphql/posts';
import { ModalCloseButton } from './ModalCloseButton';
import DiscardCommentModal from './DiscardCommentModal';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';

interface CommentVariables {
  id: string;
  content: string;
}

type CommentProps = Omit<
  CommentBoxProps,
  | 'onKeyDown'
  | 'input'
  | 'errorMessage'
  | 'sendingComment'
  | 'sendComment'
  | 'onInput'
  | 'onKeyDown'
>;

export interface NewCommentModalProps extends ModalProps, CommentProps {
  post: Post;
  commentId: string;
  onComment?: (comment: Comment, isNew?: boolean) => void;
  editContent?: string;
  editId?: string;
  onInputChange?: (value: string) => void;
}

export default function NewCommentModal({
  onRequestClose,
  editId,
  onComment,
  onInputChange,
  ...props
}: NewCommentModalProps): ReactElement {
  const [input, setInput] = useState<string>(props.editContent || '');
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Write');
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const isPreview = activeTab === 'Preview';
  const { requestMethod } = useRequestProtocol();
  const previewQueryKey = ['comment_preview', input];
  const { data: previewContent } = useQuery<{ preview: string }>(
    previewQueryKey,
    () =>
      requestMethod(
        `${apiUrl}/graphql`,
        PREVIEW_COMMENT_MUTATION,
        { content: input },
        { requestKey: JSON.stringify(previewQueryKey) },
      ),
    { enabled: isPreview && input?.length > 0 },
  );

  const confirmClose = (event: MouseEvent): void => {
    if (
      (!props.editContent && input?.length) ||
      (props.editContent && props.editContent !== input)
    ) {
      setShowDiscardModal(true);
    } else {
      onRequestClose(event);
    }
  };

  const key = ['post_comments_mutations', props.post.id];
  const { mutateAsync: comment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      requestMethod(
        `${apiUrl}/graphql`,
        props.commentId
          ? COMMENT_ON_COMMENT_MUTATION
          : COMMENT_ON_POST_MUTATION,
        variables,
        { requestKey: JSON.stringify(key) },
      ),
    { onSuccess: (data) => data && onComment(data.comment, true) },
  );

  const { mutateAsync: editComment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      requestMethod(`${apiUrl}/graphql`, EDIT_COMMENT_MUTATION, variables, {
        requestKey: JSON.stringify(key),
      }),
    { onSuccess: (data) => data && onComment(data.comment, false) },
  );

  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      // eslint-disable-next-line no-param-reassign
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  const sendComment = async (): Promise<void> => {
    if (sendingComment || !input?.trim().length) {
      return;
    }
    setErrorMessage(null);
    setSendingComment(true);
    try {
      if (editId) {
        await editComment({
          id: editId,
          content: input,
        });
      } else {
        await comment({
          id: props.commentId || props.post.id,
          content: input,
        });
      }
    } catch (err) {
      setErrorMessage('Something went wrong, try again');
      setSendingComment(false);
    }
  };

  useEffect(() => {
    onInputChange?.(input);
  }, [input]);

  return (
    <ResponsiveModal
      contentRef={modalRef}
      onRequestClose={confirmClose}
      overlayClassName="fixed-position"
      padding={false}
      {...props}
    >
      <ModalCloseButton onClick={confirmClose} className="top-2" />
      <TabContainer
        onActiveChange={(active: string) => setActiveTab(active)}
        shouldMountInactive
        className="tablet:max-h-[40rem] grow tablet:grow-0"
      >
        <Tab label="Write" className="flex flex-col flex-1">
          <CommentBox
            {...props}
            onInput={setInput}
            input={input}
            editId={editId}
            errorMessage={errorMessage}
            sendingComment={sendingComment}
            sendComment={sendComment}
          />
        </Tab>
        <Tab label="Preview" className="flex overflow-y-auto flex-col flex-1">
          {isPreview && previewContent?.preview && (
            <Markdown
              content={previewContent.preview}
              appendTooltipTo={props.parentSelector}
            />
          )}
          {isPreview && (
            <Button
              disabled={!input?.trim().length || input === props.editContent}
              loading={sendingComment}
              onClick={sendComment}
              className="mt-auto ml-auto btn-primary-avocado"
            >
              {editId ? 'Update' : 'Comment'}
            </Button>
          )}
        </Tab>
      </TabContainer>
      <DiscardCommentModal
        isOpen={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
        onDeleteComment={onRequestClose}
        shouldCloseOnOverlayClick={false}
        parentSelector={props.parentSelector}
      />
    </ResponsiveModal>
  );
}
