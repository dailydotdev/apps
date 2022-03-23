import React, {
  ReactElement,
  useState,
  MouseEvent,
  KeyboardEvent,
  useContext,
  KeyboardEventHandler,
} from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import cloneDeep from 'lodash.clonedeep';
import {
  Comment,
  CommentOnData,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  EDIT_COMMENT_MUTATION,
  PostCommentsData,
  PREVIEW_COMMENT_MUTATION,
} from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import Markdown from '../Markdown';
import TabContainer, { Tab } from '../tabs/TabContainer';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { Button } from '../buttons/Button';
import { Edge } from '../../graphql/common';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { Post } from '../../graphql/posts';
import { ModalCloseButton } from './ModalCloseButton';

const DiscardCommentModal = dynamic(() => import('./DiscardCommentModal'));

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
  onComment?: (newComment: Comment, parentId: string | null) => void;
  editContent?: string;
  editId?: string;
}

export default function NewCommentModal({
  onRequestClose,
  editId,
  onComment,
  ...props
}: NewCommentModalProps): ReactElement {
  const [input, setInput] = useState<string>(null);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Write');
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const { trackEvent } = useContext(AnalyticsContext);
  const [errorMessage, setErrorMessage] = useState<string>(null);
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

  const { mutateAsync: comment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      request(
        `${apiUrl}/graphql`,
        props.commentId
          ? COMMENT_ON_COMMENT_MUTATION
          : COMMENT_ON_POST_MUTATION,
        variables,
      ),
    {
      onSuccess: async (data) => {
        const queryKey = ['post_comments', props.post.id];
        const cached = cloneDeep(
          queryClient.getQueryData<PostCommentsData>(queryKey),
        );
        if (cached) {
          const newEdge: Edge<Comment> = {
            __typename: 'CommentEdge',
            node: {
              ...data.comment,
            },
            cursor: '',
          };
          // Update the sub tree of the parent comment
          if (props.commentId) {
            const edgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === props.commentId,
            );
            if (edgeIndex > -1) {
              if (cached.postComments.edges[edgeIndex].node.children) {
                cached.postComments.edges[edgeIndex].node.children.edges.push(
                  newEdge,
                );
              } else {
                cached.postComments.edges[edgeIndex].node.children = {
                  edges: [newEdge],
                  pageInfo: {},
                };
              }
            }
          } else {
            cached.postComments.edges.push(newEdge);
          }
          queryClient.setQueryData(queryKey, cached);
        }
      },
    },
  );

  const { mutateAsync: editComment } = useMutation<
    CommentOnData,
    unknown,
    CommentVariables
  >(
    (variables) =>
      request(`${apiUrl}/graphql`, EDIT_COMMENT_MUTATION, variables),
    {
      onSuccess: async (data) => {
        const queryKey = ['post_comments', props.post.id];
        const cached = cloneDeep(
          queryClient.getQueryData<PostCommentsData>(queryKey),
        );
        if (cached) {
          // Update the sub tree of the parent comment
          if (props.commentId) {
            const parentEdgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === props.commentId,
            );
            if (parentEdgeIndex > -1) {
              const edgeIndex = cached.postComments.edges[
                parentEdgeIndex
              ].node.children.edges.findIndex((e) => e.node.id === editId);
              if (edgeIndex > -1) {
                cached.postComments.edges[parentEdgeIndex].node.children.edges[
                  edgeIndex
                ].node = {
                  ...cached.postComments.edges[parentEdgeIndex].node.children
                    .edges[edgeIndex].node,
                  ...data.comment,
                };
              }
            }
          } else {
            const edgeIndex = cached.postComments.edges.findIndex(
              (e) => e.node.id === editId,
            );
            if (edgeIndex > -1) {
              cached.postComments.edges[edgeIndex].node = {
                ...cached.postComments.edges[edgeIndex].node,
                ...data.comment,
              };
            }
          }
          queryClient.setQueryData(queryKey, cached);
        }
      },
    },
  );

  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      // eslint-disable-next-line no-param-reassign
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  const sendComment = async (
    event: MouseEvent | KeyboardEvent,
  ): Promise<void> => {
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
        onRequestClose(event);
      } else {
        const data = await comment({
          id: props.commentId || props.post.id,
          content: input,
        });
        trackEvent(
          postAnalyticsEvent('comment post', props.post, {
            extra: { commentId: props.commentId, origin: 'comment modal' },
          }),
        );
        onComment?.(data.comment, props.commentId);
        onRequestClose(event);
      }
    } catch (err) {
      setErrorMessage('Something went wrong, try again');
      setSendingComment(false);
    }
  };

  const onKeyDown = async (
    event: KeyboardEvent<HTMLTextAreaElement>,
    defaultCallback?: KeyboardEventHandler<HTMLTextAreaElement>,
  ): Promise<void> => {
    // Ctrl / Command + Enter
    if (
      (event.ctrlKey || event.metaKey) &&
      event.keyCode === 13 &&
      input?.length
    ) {
      await sendComment(event);
    } else {
      defaultCallback?.(event);
    }
  };

  return (
    <ResponsiveModal
      contentRef={modalRef}
      onRequestClose={confirmClose}
      {...props}
    >
      <ModalCloseButton onClick={confirmClose} className="top-2" />
      <TabContainer
        onActiveChange={(active: string) => setActiveTab(active)}
        shouldMountInactive
      >
        <Tab label="Write">
          <CommentBox
            {...props}
            onInput={setInput}
            input={input}
            editId={editId}
            errorMessage={errorMessage}
            sendingComment={sendingComment}
            sendComment={sendComment}
            onKeyDown={onKeyDown}
          />
        </Tab>
        <Tab
          label="Preview"
          style={{ minHeight: '28rem' }}
          className="flex flex-col"
        >
          {isPreview && previewContent?.preview && (
            <Markdown content={previewContent.preview} />
          )}
          {isPreview && (
            <Button
              disabled={!input?.trim().length}
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
      />
    </ResponsiveModal>
  );
}
