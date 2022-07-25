import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import TrashIcon from '../icons/Trash';
import EditIcon from '../icons/Edit';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import { Roles } from '../../lib/user';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import ShareIcon from '../icons/Share';
import { postAnalyticsEvent } from '../../lib/feed';
import { upvoteCommentEventName } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';

export interface CommentActionProps {
  onComment: (comment: Comment, parentId: string | null) => void;
  onShare: (comment: Comment) => void;
  onDelete: (comment: Comment, parentId: string | null) => void;
  onEdit: (comment: Comment, parentComment?: Comment) => void;
  onShowUpvotes: (commentId: string, upvotes: number) => void;
}

export interface Props extends CommentActionProps {
  post: Post;
  comment: Comment;
  origin: Origin;
  parentId: string | null;
}

export default function CommentActionButtons({
  post,
  comment,
  origin,
  parentId,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
}: Props): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);

  const [upvoted, setUpvoted] = useState(comment.upvoted);
  const [numUpvotes, setNumUpvotes] = useState(comment.numUpvotes);

  const queryClient = useQueryClient();

  useEffect(() => {
    setUpvoted(comment.upvoted);
    setNumUpvotes(comment.numUpvotes);
  }, [comment]);

  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: upvoteComment } = useMutation(
    () =>
      requestMethod(`${apiUrl}/graphql`, UPVOTE_COMMENT_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('post_comments');
        setUpvoted(true);
        setNumUpvotes(numUpvotes + 1);
        return () => {
          setUpvoted(upvoted);
          setNumUpvotes(numUpvotes);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: cancelCommentUpvote } = useMutation(
    () =>
      requestMethod(`${apiUrl}/graphql`, CANCEL_COMMENT_UPVOTE_MUTATION, {
        id: comment.id,
      }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries('post_comments');
        setUpvoted(false);
        setNumUpvotes(numUpvotes - 1);
        return () => {
          setUpvoted(upvoted);
          setNumUpvotes(numUpvotes);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const toggleUpvote = () => {
    if (user) {
      if (upvoted) {
        trackEvent(
          postAnalyticsEvent(upvoteCommentEventName(false), post, {
            extra: { origin, commentId: comment.id },
          }),
        );
        return cancelCommentUpvote();
      }

      trackEvent(
        postAnalyticsEvent(upvoteCommentEventName(true), post, {
          extra: { origin, commentId: comment.id },
        }),
      );
      return upvoteComment();
    }
    showLogin('comment upvote');
    return undefined;
  };

  return (
    <div className="flex flex-row items-center">
      <SimpleTooltip content="Upvote">
        <Button
          id={`comment-${comment.id}-upvote-btn`}
          buttonSize="small"
          pressed={upvoted}
          onClick={toggleUpvote}
          icon={<UpvoteIcon secondary={upvoted} />}
          className="mr-3 btn-tertiary-avocado"
        />
      </SimpleTooltip>
      <SimpleTooltip content="Comment">
        <Button
          buttonSize="small"
          onClick={() => onComment(comment, parentId)}
          icon={<CommentIcon />}
          className="mr-3 btn-tertiary-avocado"
        />
      </SimpleTooltip>
      {user?.id === comment.author.id && (
        <SimpleTooltip content="Edit">
          <Button
            buttonSize="small"
            onClick={() => onEdit(comment)}
            icon={<EditIcon />}
            className="mr-3 btn-tertiary"
          />
        </SimpleTooltip>
      )}
      {(user?.id === comment.author.id ||
        user?.roles?.indexOf(Roles.Moderator) > -1) && (
        <SimpleTooltip content="Delete">
          <Button
            buttonSize="small"
            onClick={() => onDelete(comment, parentId)}
            icon={<TrashIcon />}
            className="mr-3 btn-tertiary"
          />
        </SimpleTooltip>
      )}
      <SimpleTooltip content="Share comment">
        <Button
          buttonSize="small"
          onClick={() => onShare(comment)}
          icon={<ShareIcon />}
          className="mr-3 btn-tertiary-cabbage"
        />
      </SimpleTooltip>
      {numUpvotes > 0 && (
        <SimpleTooltip content="See who upvoted">
          <ClickableText
            className="ml-auto"
            onClick={() => onShowUpvotes(comment.id, numUpvotes)}
          >
            {numUpvotes} upvote{numUpvotes === 1 ? '' : 's'}
          </ClickableText>
        </SimpleTooltip>
      )}
    </div>
  );
}
