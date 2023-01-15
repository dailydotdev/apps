import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Item, useContextMenu } from '@dailydotdev/react-contexify';
import { useMutation, useQueryClient } from 'react-query';
import classNames from 'classnames';
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
import { getContextBottomPosition, upvoteCommentEventName } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import PortalMenu from '../fields/PortalMenu';
import classed from '../../lib/classed';
import OptionsButton from '../buttons/OptionsButton';

const ContextItem = classed('span', 'flex gap-2 items-center w-full');

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
  className?: string;
}

export default function CommentActionButtons({
  post,
  comment,
  origin,
  parentId,
  className,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
}: Props): ReactElement {
  const id = `comment-actions-menu-${comment.id}`;
  const { show } = useContextMenu({ id });
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
    showLogin(AuthTriggers.CommentUpvote);
    return undefined;
  };

  return (
    <div className={classNames('flex flex-row items-center', className)}>
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
      <SimpleTooltip content="Share comment">
        <Button
          buttonSize="small"
          onClick={() => onShare(comment)}
          icon={<ShareIcon />}
          className="mr-3 btn-tertiary-cabbage"
        />
      </SimpleTooltip>
      {user?.id === comment.author.id && (
        <OptionsButton
          tooltipPlacement="top"
          onClick={(e) => show(e, { position: getContextBottomPosition(e) })}
        />
      )}
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
      <PortalMenu
        disableBoundariesCheck
        id={id}
        className="menu-primary typo-callout"
        animation="fade"
      >
        <Item onClick={() => onEdit(comment)}>
          <ContextItem>
            <EditIcon size="small" /> Edit
          </ContextItem>
        </Item>
        {(user?.id === comment.author.id ||
          user?.roles?.includes(Roles.Moderator)) && (
          <Item onClick={() => onDelete(comment, parentId)}>
            <ContextItem className="flex items-center w-full">
              <TrashIcon size="small" /> Delete
            </ContextItem>
          </Item>
        )}
      </PortalMenu>
    </div>
  );
}
