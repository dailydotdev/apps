import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  TrashIcon,
  EditIcon,
  ShareIcon,
  FlagIcon,
} from '../icons';
import {
  CANCEL_COMMENT_UPVOTE_MUTATION,
  Comment,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/comments';
import { Roles } from '../../lib/user';
import { graphqlUrl } from '../../lib/config';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { postAnalyticsEvent } from '../../lib/feed';
import { upvoteCommentEventName } from '../utilities';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Origin } from '../../lib/analytics';
import { Post } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import ContextMenu, { MenuItemProps } from '../fields/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import OptionsButton from '../buttons/OptionsButton';
import { SourcePermissions } from '../../graphql/sources';
import { RequestKey } from '../../lib/query';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { labels } from '../../lib';
import { useToastNotification } from '../../hooks/useToastNotification';

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
  const { onMenuClick, isOpen } = useContextMenu({ id });
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const [upvoted, setUpvoted] = useState(comment.upvoted);
  const [numUpvotes, setNumUpvotes] = useState(comment.numUpvotes);
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();

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
        await queryClient.cancelQueries([RequestKey.PostComments]);
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
        await queryClient.cancelQueries([RequestKey.PostComments]);
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
    showLogin({ trigger: AuthTriggers.CommentUpvote });
    return undefined;
  };

  const isAuthor = user?.id === comment.author.id;
  const canModifyComment =
    isAuthor ||
    user?.roles?.includes(Roles.Moderator) ||
    post?.source?.currentMember?.permissions?.includes(
      SourcePermissions.CommentDelete,
    );

  const openReportCommentModal = () => {
    if (!user) {
      return showLogin({ trigger: AuthTriggers.ReportComment });
    }

    return openModal({
      type: LazyModal.ReportComment,
      props: {
        onReport: () => displayToast(labels.reporting.reportFeedbackText),
        comment,
        post,
      },
    });
  };

  const commentOptions: MenuItemProps[] = [];

  if (isAuthor) {
    commentOptions.push({
      label: 'Edit comment',
      action: () => onEdit(comment),
      icon: <EditIcon />,
    });
  }

  if (canModifyComment) {
    commentOptions.push({
      label: 'Delete comment',
      action: () => onDelete(comment, parentId),
      icon: <TrashIcon />,
    });
  }

  if (!isAuthor) {
    commentOptions.push({
      label: 'Report comment',
      action: openReportCommentModal,
      icon: <FlagIcon />,
    });
  }

  return (
    <div className={classNames('flex flex-row items-center', className)}>
      <SimpleTooltip content="Upvote">
        <Button
          id={`comment-${comment.id}-upvote-btn`}
          size={ButtonSize.Small}
          pressed={upvoted}
          onClick={toggleUpvote}
          icon={<UpvoteIcon secondary={upvoted} />}
          className="mr-3"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
        />
      </SimpleTooltip>
      <SimpleTooltip content="Reply">
        <Button
          size={ButtonSize.Small}
          onClick={() => onComment(comment, parentId)}
          icon={<CommentIcon />}
          className="mr-3"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.BlueCheese}
        />
      </SimpleTooltip>
      <SimpleTooltip content="Share comment">
        <Button
          size={ButtonSize.Small}
          onClick={() => onShare(comment)}
          icon={<ShareIcon />}
          className="mr-3"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </SimpleTooltip>
      {!!commentOptions && (
        <OptionsButton tooltipPlacement="top" onClick={onMenuClick} />
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
      <ContextMenu
        disableBoundariesCheck
        id={id}
        className="menu-primary typo-callout"
        animation="fade"
        options={commentOptions}
        isOpen={isOpen}
      />
    </div>
  );
}
