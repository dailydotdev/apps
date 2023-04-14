import React, {
  MouseEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  Comment,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
  EDIT_COMMENT_MUTATION,
  PREVIEW_COMMENT_MUTATION,
} from '../../graphql/comments';
import { graphqlUrl } from '../../lib/config';
import Markdown from '../Markdown';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { Button, ButtonSize } from '../buttons/Button';
import { Post } from '../../graphql/posts';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { Modal, ModalProps } from './common/Modal';
import AtIcon from '../icons/At';
import { ClickableText } from '../buttons/ClickableText';
import { useUserMention } from '../../hooks/useUserMention';
import { markdownGuide } from '../../lib/constants';
import { Justify } from '../utilities';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { ModalPropsContext } from './common/types';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { checkUserMembership } from '../../graphql/squads';
import { SourceMemberRole, SourceType } from '../../graphql/sources';
import Alert, { AlertType } from '../widgets/Alert';
import { disabledRefetch } from '../../lib/func';

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
  onComment?: (comment: Comment, isNew?: boolean) => void;
  onInputChange?: (value: string) => void;
}

enum CommentTabs {
  Write = 'Write',
  Preview = 'Preview',
}

const promptOptions: PromptOptions = {
  title: 'Discard comment',
  description: 'Are you sure you want to close and discard your comment?',
  okButton: {
    className: 'btn-primary-ketchup',
    title: 'Discard',
  },
  cancelButton: {
    title: 'Stay',
  },
};

interface PreviewTabProps {
  input: string;
  sourceId: string;
  parentSelector: () => HTMLElement;
}

const PreviewTab = ({ input, sourceId, parentSelector }: PreviewTabProps) => {
  const { activeView } = useContext(ModalPropsContext);
  const { requestMethod } = useRequestProtocol();
  const previewQueryKey = ['comment_preview', input];
  const { data: previewContent } = useQuery<{ preview: string }>(
    previewQueryKey,
    () =>
      requestMethod(
        graphqlUrl,
        PREVIEW_COMMENT_MUTATION,
        { content: input, sourceId },
        { requestKey: JSON.stringify(previewQueryKey) },
      ),
    { enabled: input?.length > 0 && activeView === CommentTabs.Preview },
  );

  return (
    <Modal.Body view={CommentTabs.Preview}>
      <Markdown
        content={previewContent?.preview}
        appendTooltipTo={parentSelector}
      />
    </Modal.Body>
  );
};

export default function NewCommentModal({
  onRequestClose,
  onComment,
  onInputChange,
  parentSelector,
  parentComment,
  post,
  ...props
}: NewCommentModalProps): ReactElement {
  const { handle, commentId, editId, editContent, replyTo, authorId } =
    parentComment;
  const [input, setInput] = useState<string>(editContent || replyTo);
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const { showPrompt } = usePrompt();
  const { requestMethod } = useRequestProtocol();
  const { data: member, isFetched: isMembershipFetched } = useQuery(
    generateQueryKey(RequestKey.PostComments, null, {
      authorId,
      sourceId: post.source.id,
    }),
    () => checkUserMembership(post.source.id, authorId),
    {
      enabled: !!authorId && post.source.type === SourceType.Squad,
      retry: false,
      ...disabledRefetch,
    },
  );

  const confirmClose = async (event: MouseEvent): Promise<void> => {
    if (
      ((!editContent && input?.length) ||
        (editContent && editContent !== input)) &&
      !(await showPrompt(promptOptions))
    ) {
      return;
    }
    onRequestClose(event);
  };

  const key = ['post_comments_mutations', post.id];
  const { mutateAsync: comment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      requestMethod(
        graphqlUrl,
        commentId ? COMMENT_ON_COMMENT_MUTATION : COMMENT_ON_POST_MUTATION,
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
      requestMethod(graphqlUrl, EDIT_COMMENT_MUTATION, variables, {
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
          id: commentId || post.id,
          content: input,
        });
      }
    } catch (err) {
      setErrorMessage('Something went wrong, try again');
      setSendingComment(false);
    }
  };
  const useUserMentionOptions = useUserMention({
    postId: post.id,
    sourceId: post.source.id,
    onInput: setInput,
  });

  useEffect(() => {
    onInputChange?.(input);
  }, [input]);
  const disabled = !input?.trim().length;
  const updateButton = (
    <Button
      disabled={disabled}
      loading={sendingComment}
      onClick={sendComment}
      className="ml-auto btn-primary-avocado"
    >
      {editId ? 'Update' : 'Post'}
    </Button>
  );

  return (
    <Modal
      contentRef={modalRef}
      onRequestClose={confirmClose}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      tabs={Object.values(CommentTabs)}
      parentSelector={parentSelector}
      {...props}
    >
      <Modal.Header.Tabs
        disabledTab={(tab) => tab === CommentTabs.Preview && disabled}
      />
      <Modal.Body view={CommentTabs.Write}>
        <CommentBox
          {...props}
          parentComment={parentComment}
          useUserMentionOptions={useUserMentionOptions}
          onInput={setInput}
          input={input}
          errorMessage={errorMessage}
          sendComment={sendComment}
        >
          {isMembershipFetched &&
          (!member || member.role === SourceMemberRole.Blocked) ? (
            <Alert
              type={AlertType.Info}
              title={`${handle} is no longer part of the squad and will not be able to see or reply to your comment.`}
            />
          ) : null}
        </CommentBox>
      </Modal.Body>
      <PreviewTab
        input={input}
        sourceId={post.source.id}
        parentSelector={parentSelector}
      />
      <Modal.Footer justify={Justify.Between} view={CommentTabs.Write}>
        <Button
          className="btn-tertiary"
          buttonSize={ButtonSize.Small}
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
      <Modal.Footer view={CommentTabs.Preview}>{updateButton}</Modal.Footer>
    </Modal>
  );
}
