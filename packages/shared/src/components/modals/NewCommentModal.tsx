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
import { ModalProps } from './StyledModal';
import Markdown from '../Markdown';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { Button } from '../buttons/Button';
import { Post } from '../../graphql/posts';
import DiscardActionModal from './DiscardActionModal';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { Modal } from './common/Modal';
import AtIcon from '../icons/At';
import { ClickableText } from '../buttons/ClickableText';
import { UseUserMention, useUserMention } from '../../hooks/useUserMention';
import { markdownGuide } from '../../lib/constants';
import { Justify } from '../utilities';

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
  | 'useUserMentionOptions'
>;

export interface NewCommentModalProps extends ModalProps, CommentProps {
  post: Post;
  commentId: string;
  onComment?: (comment: Comment, isNew?: boolean) => void;
  editContent?: string;
  editId?: string;
  onInputChange?: (value: string) => void;
}

enum CommentTabs {
  Write = 'Write',
  Preview = 'Preview',
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
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
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
    { enabled: input?.length > 0 },
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
  const useUserMentionOptions = useUserMention({
    postId: props.post.id,
    onInput: setInput,
  });

  useEffect(() => {
    onInputChange?.(input);
  }, [input]);
  const disabled = !input?.trim().length || input === props.editContent;
  const updateButton = (
    <Button
      disabled={disabled}
      loading={sendingComment}
      onClick={sendComment}
      className="ml-auto btn-primary-avocado"
    >
      {editId ? 'Update' : 'Comment'}
    </Button>
  );
  return (
    <Modal
      contentRef={modalRef}
      onRequestClose={confirmClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      tabs={Object.values(CommentTabs)}
      {...props}
    >
      <Modal.Header.Tabs
        disabledTab={(tab) => tab === CommentTabs.Preview && disabled}
      />
      <Modal.Body tab={CommentTabs.Write}>
        <CommentBox
          {...props}
          useUserMentionOptions={useUserMentionOptions}
          onInput={setInput}
          input={input}
          errorMessage={errorMessage}
          sendComment={sendComment}
        />
      </Modal.Body>
      <Modal.Body tab={CommentTabs.Preview}>
        <Markdown
          content={previewContent?.preview}
          appendTooltipTo={props.parentSelector}
        />
      </Modal.Body>
      <Modal.Footer justify={Justify.Between} tab={CommentTabs.Write}>
        <Button
          className="btn-tertiary"
          buttonSize="small"
          icon={<AtIcon />}
          onClick={useUserMentionOptions.onInitializeMention}
        />
        <div className="-ml-2 w-px h-6 border border-opacity-24 border-theme-divider-tertiary" />
        <ClickableText
          tag="a"
          href={markdownGuide}
          className="typo-caption1"
          defaultTypo={false}
          target="_blank"
        >
          Markdown supported
        </ClickableText>
        {updateButton}
      </Modal.Footer>
      <Modal.Footer tab={CommentTabs.Preview}>{updateButton}</Modal.Footer>
      <DiscardActionModal
        isOpen={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
        rightButtonAction={onRequestClose}
        shouldCloseOnOverlayClick={false}
        parentSelector={props.parentSelector}
      />
    </Modal>
  );
}
