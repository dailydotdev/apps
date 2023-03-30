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
import { graphqlUrl } from '../../lib/config';
import { Button, ButtonSize } from '../buttons/Button';
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
import { SourcePermissions } from '../../graphql/sources';

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
      requestMethod(graphqlUrl, UPVOTE_COMMENT_MUTATION, {
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
      requestMethod(graphqlUrl, CANCEL_COMMENT_UPVOTE_MUTATION, {
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

  const isAuthor = user?.id === comment.author.id;
  const canModifyComment =
    isAuthor ||
    user?.roles?.includes(Roles.Moderator) ||
    post?.source?.currentMember?.permissions?.includes(
      SourcePermissions.CommentDelete,
    );

  return (
    <div className={classNames('flex flex-row items-center', className)}>
      <SimpleTooltip content="Upvote">
        <Button
          id={`comment-${comment.id}-upvote-btn`}
          buttonSize={ButtonSize.Small}
          pressed={upvoted}
          onClick={toggleUpvote}
          icon={<UpvoteIcon secondary={upvoted} />}
          className="mr-3 btn-tertiary-avocado"
        />
      </SimpleTooltip>
      <SimpleTooltip content="Comment">
        <Button
          buttonSize={ButtonSize.Small}
          onClick={() => onComment(comment, parentId)}
          icon={<CommentIcon />}
          className="mr-3 btn-tertiary-blueCheese"
        />
      </SimpleTooltip>
      <SimpleTooltip content="Share comment">
        <Button
          buttonSize={ButtonSize.Small}
          onClick={() => onShare(comment)}
          icon={<ShareIcon />}
          className="mr-3 btn-tertiary-cabbage"
        />
      </SimpleTooltip>
      {canModifyComment && (
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
        {isAuthor && (
          <Item onClick={() => onEdit(comment)}>
            <ContextItem>
              <EditIcon /> Edit comment
            </ContextItem>
          </Item>
        )}
        <Item onClick={() => onDelete(comment, parentId)}>
          <ContextItem className="flex items-center w-full">
            <TrashIcon /> Delete comment
          </ContextItem>
        </Item>
      </PortalMenu>
    </div>
  );
}
