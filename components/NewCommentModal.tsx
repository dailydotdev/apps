import React, {
  FormEvent,
  ReactElement,
  useContext,
  useState,
  MouseEvent,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import cloneDeep from 'lodash.clonedeep';
import { Props as ModalProps, StyledModal } from './StyledModal';
import { size2, size3, size4, size6, sizeN } from '../styles/sizes';
import AuthContext from './AuthContext';
import {
  ButtonLoader,
  CommentAuthor,
  CommentBox,
  CommentPublishDate,
  RoundedImage,
  SmallRoundedImage,
} from './utilities';
import { commentDateFormat } from '../lib/dateFormat';
import { typoMicro1, typoSmallBase } from '../styles/typography';
import { colorKetchup30, colorWater60 } from '../styles/colors';
import { ColorButton, FloatButton } from './Buttons';
import { mobileL } from '../styles/media';
import { useMutation } from '@apollo/client';
import {
  Comment,
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
  POST_COMMENTS_QUERY,
  PostCommentsData,
} from '../graphql/comments';
import { Edge } from '../graphql/common';
import ReactGA from 'react-ga';

const DiscardCommentModal = dynamic(() => import('./DiscardCommentModal'));

export interface Props extends ModalProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
  commentId: string | null;
  postId: string;
}

const MyModal = styled(StyledModal)`
  .Modal {
    max-width: ${sizeN(120)};
    align-items: stretch;
    padding: ${size2};
    background: var(--theme-background-secondary);
    border-radius: 0;

    ${mobileL} {
      border-radius: ${size4};
    }
  }
`;

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
  ${typoMicro1}

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

export default function NewCommentModal({
  authorImage,
  authorName,
  publishDate,
  content,
  onRequestClose,
  ...props
}: Props): ReactElement {
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState<string>(null);
  const [errorMessage, setErrorMessage] = useState<string>(null);
  const [sendingComment, setSendingComment] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  const [comment] = useMutation<CommentOnData>(
    props.commentId ? COMMENT_ON_COMMENT_MUTATION : COMMENT_ON_POST_MUTATION,
    {
      update(cache, { data }) {
        const query = {
          query: POST_COMMENTS_QUERY,
          variables: { postId: props.postId },
        };
        const cached = cloneDeep(cache.readQuery<PostCommentsData>(query));
        const newEdge: Edge<Comment> = {
          __typename: 'CommentEdge',
          node: {
            ...data.comment,
            upvoted: false,
            author: {
              id: user.id,
              name: user.name,
              image: user.image,
            },
          },
          // TODO: need to update the cursor somehow
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
        cache.writeQuery({ ...query, data: cached });
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

  const sendComment = async (event: MouseEvent): Promise<void> => {
    if (sendingComment) {
      return;
    }
    setErrorMessage(null);
    setSendingComment(true);
    try {
      await comment({
        variables: { id: props.commentId || props.postId, content: input },
      });
      ReactGA.event({ category: 'Comment Popup', action: 'Comment' });
      onRequestClose(event);
    } catch (err) {
      setErrorMessage('Failed to send your comment...');
      setSendingComment(false);
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
    <MyModal
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
    </MyModal>
  );
}
