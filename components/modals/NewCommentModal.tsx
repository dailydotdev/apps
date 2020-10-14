import React, {
  FormEvent,
  ReactElement,
  useContext,
  useState,
  MouseEvent,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import cloneDeep from 'lodash.clonedeep';
import { Props as ModalProps } from './StyledModal';
import { size2, size3, size6, sizeN } from '../../styles/sizes';
import AuthContext from '../AuthContext';
import { ButtonLoader, RoundedImage, SmallRoundedImage } from '../utilities';
import { CommentBox, CommentPublishDate } from '../comments/common';
import { commentDateFormat } from '../../lib/dateFormat';
import { typoJr, typoLil2Base, typoSmallBase } from '../../styles/typography';
import { colorKetchup30, colorWater60 } from '../../styles/colors';
import { ColorButton, FloatButton } from '../Buttons';
import { useMutation, useQueryCache } from 'react-query';
import {
  Comment,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
  PostCommentsData,
} from '../../graphql/comments';
import { Edge } from '../../graphql/common';
import ReactGA from 'react-ga';
import ResponsiveModal from './ResponsiveModal';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';

const DiscardCommentModal = dynamic(() => import('./DiscardCommentModal'));

export interface NewCommentModalProps extends ModalProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  commentId: string | null;
  postId: string;
  onComment?: (newComment: Comment, parentId: string | null) => void;
}

const ParentComment = styled(CommentBox)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ParentCommentHeader = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${size2};
`;

const ParentCommentMetadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${size2};
`;

const Subheader = styled.div`
  display: flex;
  align-items: center;
  height: ${sizeN(11)};
  padding: 0 ${size2};
`;

const Timeline = styled.div`
  width: 0.063rem;
  height: 100%;
  margin-left: ${size3};
  background: var(--theme-separator);
`;

const ReplyTo = styled.div`
  margin-left: ${size6};
  color: var(--theme-secondary);
  ${typoSmallBase}

  strong {
    color: var(--theme-primary);
    font-weight: bold;
  }
`;

const NewCommentContainer = styled.div`
  display: flex;
  padding: 0 ${size2};
`;

const NewCommentTextArea = styled.div`
  min-height: ${sizeN(44)};
  margin-left: ${size3};
  flex: 1;
  color: var(--theme-primary);
  background: none;
  border: none;
  caret-color: ${colorWater60};
  word-break: break-word;
  ${typoJr}
  font-style: normal;

  &:focus {
    outline: 0;
  }

  &:empty:before {
    content: attr(aria-placeholder);
    color: var(--theme-secondary);
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${size2} 0;
  border-top: 0.063rem solid var(--theme-separator);
`;

const CommentButton = styled(ColorButton).attrs({
  background: 'var(--theme-avocado)',
})``;

const ErrorMessage = styled.div`
  min-height: 1rem;
  margin: ${size2} ${size3};
  color: ${colorKetchup30};
  ${typoSmallBase};
`;

const CommentAuthor = styled.div`
  color: var(--theme-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${typoLil2Base}
`;

interface CommentVariables {
  id: string;
  content: string;
}

export default function NewCommentModal({
  authorImage,
  authorName,
  publishDate,
  content,
  onRequestClose,
  onComment,
  ...props
}: NewCommentModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState<string>(null);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  const queryCache = useQueryCache();
  const [comment] = useMutation<CommentOnData, unknown, CommentVariables>(
    (variables) =>
      request(
        `${apiUrl}/graphql`,
        props.commentId
          ? COMMENT_ON_COMMENT_MUTATION
          : COMMENT_ON_POST_MUTATION,
        variables,
      ),
    {
      onSuccess: (data) => {
        const queryKey = ['post_comments', props.postId];
        queryCache.cancelQueries(queryKey);
        const cached = cloneDeep(
          queryCache.getQueryData<PostCommentsData>(queryKey),
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
          queryCache.setQueryData(queryKey, cached);
        }
      },
    },
  );

  const commentRef = (element: HTMLDivElement): void => {
    element?.focus();
  };

  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  const onInput = (event: FormEvent<HTMLDivElement>): void => {
    setInput(event.currentTarget.innerText);
  };

  const sendComment = async (
    event: MouseEvent | KeyboardEvent,
  ): Promise<void> => {
    if (sendingComment) {
      return;
    }
    setErrorMessage(null);
    setSendingComment(true);
    try {
      const data = await comment({
        id: props.commentId || props.postId,
        content: input,
      });
      ReactGA.event({ category: 'Comment Popup', action: 'Comment' });
      onComment?.(data.comment, props.commentId);
      onRequestClose(event);
    } catch (err) {
      setErrorMessage('Something went wrong, try again');
      setSendingComment(false);
    }
  };

  const onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    // Ctrl / Command + Enter
    if (
      (event.ctrlKey || event.metaKey) &&
      event.keyCode === 13 &&
      input?.length
    ) {
      await sendComment(event);
    }
  };

  const onPaste = (event: ClipboardEvent): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }
  };

  const confirmClose = (event: MouseEvent): void => {
    if (input?.length) {
      setShowDiscardModal(true);
    } else {
      onRequestClose(event);
    }
  };

  useEffect(() => {
    ReactGA.event({ category: 'Comment Popup', action: 'Impression' });
  }, []);

  return (
    <ResponsiveModal
      {...{ contentRef: modalRef, onRequestClose: confirmClose, ...props }}
    >
      <ParentComment as="article">
        <ParentCommentHeader>
          <RoundedImage
            imgSrc={authorImage}
            imgAlt={`${authorName}'s profile image`}
            background="var(--theme-background-highlight)"
          />
          <ParentCommentMetadata>
            <CommentAuthor>{authorName}</CommentAuthor>
            <CommentPublishDate>
              {commentDateFormat(publishDate)}
            </CommentPublishDate>
          </ParentCommentMetadata>
        </ParentCommentHeader>
        <div>{content}</div>
      </ParentComment>
      <Subheader>
        <Timeline />
        <ReplyTo>
          Reply to <strong>{authorName}</strong>
        </ReplyTo>
      </Subheader>
      <NewCommentContainer>
        <SmallRoundedImage imgSrc={user.image} imgAlt="Your profile image" />
        <NewCommentTextArea
          ref={commentRef}
          contentEditable
          role="textbox"
          aria-placeholder="Write your comment..."
          aria-multiline
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />
      </NewCommentContainer>
      <ErrorMessage>
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </ErrorMessage>
      <Footer>
        <FloatButton onClick={confirmClose}>Cancel</FloatButton>
        <CommentButton
          disabled={!input?.length}
          waiting={sendingComment}
          onClick={sendComment}
        >
          <span>Comment</span>
          <ButtonLoader />
        </CommentButton>
      </Footer>
      <DiscardCommentModal
        isOpen={showDiscardModal}
        onRequestClose={() => setShowDiscardModal(false)}
        onDeleteComment={onRequestClose}
        shouldCloseOnOverlayClick={false}
      />
    </ResponsiveModal>
  );
}
