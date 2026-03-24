import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  TrashIcon,
  EditIcon,
  ShareIcon,
  FlagIcon,
  DownvoteIcon,
  AddUserIcon,
  BlockIcon,
  GiftIcon,
  MenuIcon,
} from '../icons';
import type { Comment } from '../../graphql/comments';
import type { UserShortProfile } from '../../lib/user';
import { Roles } from '../../lib/user';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import { SourcePermissions } from '../../graphql/sources';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { labels, largeNumberFormat } from '../../lib';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { VoteEntityPayload } from '../../hooks';
import {
  usePlusSubscription,
  useViewSize,
  useVoteComment,
  ViewSize,
  voteMutationHandlers,
} from '../../hooks';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { isFollowingContent } from '../../hooks/contentPreference/types';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';
import { truncateTextClassNames } from '../utilities';
import { CommentAwardActions } from './CommentAwardActions';
import { Tooltip } from '../tooltip/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';

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
  isModalThread?: boolean;
  threadRepliesControl?: ReactNode;
}

export default function CommentActionButtons({
  post,
  comment,
  origin,
  parentId,
  className,
  threadRepliesControl,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onShowUpvotes,
}: Props): ReactElement {
  const isMobileSmall = useViewSize(ViewSize.MobileXL);
  const { isLoggedIn, user, showLogin } = useAuthContext();
  const { isCompanion } = useRequestProtocol();
  const client = useQueryClient();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { logSubscriptionEvent } = usePlusSubscription();
  const [voteState, setVoteState] = useState<VoteEntityPayload>(() => {
    return {
      id: comment.id,
      numUpvotes: comment.numUpvotes,
      userState: comment.userState,
    };
  });
  const { follow, unfollow, block, unblock } = useContentPreference();
  const { author } = comment;
  const authorName =
    author?.name || (author?.username ? `@${author.username}` : 'this user');
  const authorBlockLabel = author?.username
    ? `@${author.username}`
    : authorName;
  const numUpvotes = voteState.numUpvotes ?? 0;

  useEffect(() => {
    setVoteState({
      id: comment.id,
      numUpvotes: comment.numUpvotes,
      userState: comment.userState,
    });
  }, [comment.id, comment.numUpvotes, comment.userState]);

  const { toggleUpvote, toggleDownvote } = useVoteComment({
    onMutate: (voteProps) => {
      client.cancelQueries({
        queryKey: [RequestKey.PostComments],
      });

      const mutationHandler = voteMutationHandlers[voteProps.vote];

      if (!mutationHandler) {
        return undefined;
      }

      const previousVote = voteState.userState?.vote || UserVote.None;

      setVoteState((currentVoteState) => ({
        ...currentVoteState,
        ...mutationHandler(currentVoteState),
      }));

      return () => {
        const rollbackMutationHandler = voteMutationHandlers[previousVote];

        if (!rollbackMutationHandler) {
          return;
        }

        setVoteState((currentVoteState) => ({
          ...currentVoteState,
          ...rollbackMutationHandler(currentVoteState),
        }));
      };
    },
  });
  const isAuthor = user?.id === author?.id;
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
      action: () => {
        onEdit(comment);
      },
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

  if (isMobileSmall) {
    commentOptions.push({
      icon: <ShareIcon />,
      label: 'Share via',
      action: () => onShare(comment),
    });
  }

  if (user && author && user.id !== author.id) {
    commentOptions.push({
      icon: <BlockIcon />,
      label: `Block ${authorBlockLabel}`,
      action: async () => {
        const params = {
          id: author.id,
          entity: ContentPreferenceType.User,
          entityName: authorName,
          feedId: user.id,
          opts: {
            hideToast: true,
          },
        };

        await block(params);

        const commentQueryKey = generateQueryKey(RequestKey.PostComments);
        client.invalidateQueries({
          queryKey: commentQueryKey,
        });

        displayToast(`🚫 ${authorName} has been blocked`, {
          action: {
            copy: 'Undo',
            onClick: () => {
              unblock(params);
              client.invalidateQueries({
                queryKey: commentQueryKey,
              });
            },
          },
        });
      },
    });
  }

  const shouldShowFollow =
    !useIsSpecialUser({ userId: author?.id ?? '' }) &&
    isLoggedIn &&
    !!author &&
    !isCompanion;

  if (shouldShowFollow) {
    const isFollowingUser = isFollowingContent(author?.contentPreference);

    commentOptions.push({
      icon: <AddUserIcon />,
      label: `${isFollowingUser ? 'Unfollow' : 'Follow'} ${authorName}`,
      action: () => {
        const opts = {
          extra: {
            origin: Origin.PostCommentContextMenu,
            post_id: comment.post?.id,
          },
        };

        if (!isFollowingUser) {
          follow({
            id: author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        } else {
          unfollow({
            id: author.id,
            entity: ContentPreferenceType.User,
            entityName: authorName,
            opts,
          });
        }
      },
    });
  }

  if (!isAuthor) {
    commentOptions.push({
      label: 'Report comment',
      action: openReportCommentModal,
      icon: <FlagIcon />,
    });
  }

  if (isPlusAvailable && author && author.id !== user?.id && !author.isPlus) {
    commentOptions.push({
      label: 'Gift daily.dev Plus',
      action: () => {
        logSubscriptionEvent({
          event_name: LogEvent.GiftSubscription,
          target_id: TargetId.ContextMenu,
        });
        openModal({
          type: LazyModal.GiftPlus,
          props: {
            preselected: author as UserShortProfile,
          },
        });
      },
      icon: <GiftIcon />,
    });
  }

  return (
    <div
      className={classNames(
        'flex flex-row items-center',
        { relative: !!threadRepliesControl },
        className,
      )}
    >
      {threadRepliesControl && (
        // -left-12 (48px) escapes the action bar bounding box to place the toggle button in the avatar lane.
        // This offset is tied to avatar width (40px) + 8px spacing; update if avatar size changes.
        <div className="absolute -left-12 top-1/2 -translate-y-1/2">
          {threadRepliesControl}
        </div>
      )}
      <Tooltip content="Upvote">
        <Button
          id={`comment-${comment.id}-upvote-btn`}
          size={ButtonSize.Small}
          pressed={voteState.userState?.vote === UserVote.Up}
          onClick={() => {
            toggleUpvote({
              payload: {
                ...voteState,
                post,
              },
              origin,
            });
          }}
          icon={
            <UpvoteIcon secondary={voteState.userState?.vote === UserVote.Up} />
          }
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
        />
      </Tooltip>
      <Tooltip content="Downvote">
        <Button
          id={`comment-${comment.id}-downvote-btn`}
          size={ButtonSize.Small}
          pressed={voteState.userState?.vote === UserVote.Down}
          onClick={() => {
            toggleDownvote({
              payload: {
                ...voteState,
                post,
              },
              origin,
            });
          }}
          icon={
            <DownvoteIcon
              secondary={voteState.userState?.vote === UserVote.Down}
            />
          }
          className="mr-3"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
        />
      </Tooltip>
      <Tooltip content="Reply">
        <Button
          size={ButtonSize.Small}
          onClick={() => onComment(comment, parentId)}
          icon={<CommentIcon />}
          className="mr-3"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.BlueCheese}
        />
      </Tooltip>
      <CommentAwardActions comment={comment} post={post} />
      <Tooltip content="Share comment">
        <Button
          size={ButtonSize.Small}
          onClick={() => onShare(comment)}
          icon={<ShareIcon />}
          className="mr-3 hidden mobileXL:flex"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </Tooltip>
      {!!commentOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
            <Button
              variant={ButtonVariant.Tertiary}
              className="my-auto"
              icon={<MenuIcon />}
              size={ButtonSize.Small}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {commentOptions.map(
              ({ label, icon, action, disabled }: MenuItemProps) => (
                <DropdownMenuItem
                  key={label}
                  onClick={action}
                  disabled={disabled}
                  role="menuitem"
                >
                  <div className="flex w-full items-center gap-2 typo-callout">
                    {icon} {label}
                  </div>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {numUpvotes > 0 && (
        <Tooltip content="See who upvoted">
          <ClickableText
            className={classNames('ml-auto !block', truncateTextClassNames)}
            onClick={() => onShowUpvotes(comment.id, numUpvotes)}
          >
            {largeNumberFormat(numUpvotes)} upvote
            {numUpvotes === 1 ? '' : 's'}
          </ClickableText>
        </Tooltip>
      )}
    </div>
  );
}
