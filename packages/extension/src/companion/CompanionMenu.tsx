import type { ReactElement } from 'react';
import React, { useState, useContext, useEffect } from 'react';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  ShareIcon,
  MenuIcon,
  BookmarkIcon,
  DownvoteIcon,
  FlagIcon,
  EyeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import Modal from 'react-modal';
import { feedback, isTesting } from '@dailydotdev/shared/src/lib/constants';
import type { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { postLogEvent } from '@dailydotdev/shared/src/lib/feed';
import { useKeyboardNavigation } from '@dailydotdev/shared/src/hooks/useKeyboardNavigation';
import { useSharePost } from '@dailydotdev/shared/src/hooks/useSharePost';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  useToastNotification,
  useVotePost,
} from '@dailydotdev/shared/src/hooks';
import type { UpvotedPopupModalProps } from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import UpvotedPopupModal from '@dailydotdev/shared/src/components/modals/UpvotedPopupModal';
import { getCompanionWrapper } from '@dailydotdev/shared/src/lib/extension';
import ShareModal from '@dailydotdev/shared/src/components/modals/ShareModal';
import type { ShareProps } from '@dailydotdev/shared/src/components/modals/post/common';
import '@dailydotdev/shared/src/styles/globals.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import type { MenuItemProps } from '@dailydotdev/shared/src/components/dropdown/common';
import { MenuIcon as WrapperMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import type { ReportedCallback } from '@dailydotdev/shared/src/components/modals';
import { ReportPostModal } from '@dailydotdev/shared/src/components/modals';
import { labels } from '@dailydotdev/shared/src/lib';
import useCompanionActions from './useCompanionActions';
import CompanionToggle from './CompanionToggle';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

type CompanionMenuProps = {
  post: PostBootData;
  companionHelper: boolean;
  setPost: (T) => void;
  companionState: boolean;
  onOptOut: () => void;
  setCompanionState: (T) => void;
  onOpenComments?: () => void;
};

export default function CompanionMenu({
  post,
  companionHelper,
  setPost,
  companionState,
  onOptOut,
  setCompanionState,
}: CompanionMenuProps): ReactElement {
  const { modal, closeModal } = useLazyModal();
  const { logEvent } = useContext(LogContext);
  const { user } = useContext(AuthContext);
  const { showPrompt } = usePrompt();
  const [reportModal, setReportModal] = useState<boolean>();
  const { displayToast } = useToastNotification();

  const [showCompanionHelper, setShowCompanionHelper] = usePersistentContext(
    'companion_helper',
    companionHelper,
  );
  const updatePost = async ({ update, event }) => {
    const oldPost = post;
    setPost({
      ...post,
      ...update,
    });
    logEvent(
      postLogEvent(event, post, {
        extra: { origin: Origin.CompanionContextMenu },
      }),
    );
    return () => setPost(oldPost);
  };

  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { openSharePost } = useSharePost(Origin.Companion);
  const {
    bookmark,
    removeBookmark,
    blockSource,
    disableCompanion,
    removeCompanionHelper,
    toggleCompanionExpanded,
  } = useCompanionActions({
    onBookmarkMutate: () =>
      updatePost({
        update: { bookmarked: true },
        event: LogEvent.BookmarkPost,
      }),
    onRemoveBookmarkMutate: () =>
      updatePost({
        update: { bookmarked: false },
        event: LogEvent.RemovePostBookmark,
      }),
  });

  /**
   * Use a cleanup effect to always set the local cache helper state to false on destroy
   */
  useEffect(() => {
    if (user) {
      removeCompanionHelper({});
    }
    const cleanup = () => {
      setShowCompanionHelper(false);
    };
    window.addEventListener('beforeunload', cleanup);
    return () => cleanup();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCompanion = () => {
    setShowCompanionHelper(false);
    logEvent({
      event_name: `${companionState ? 'close' : 'open'} companion`,
    });
    toggleCompanionExpanded({ companionExpandedValue: !companionState });
    setCompanionState((state) => !state);
  };

  const onShare = () => openSharePost({ post });

  const optOut = async () => {
    const options: PromptOptions = {
      title: 'Disable the companion widget?',
      description: 'You can always re-enable it through the customize menu.',
      okButton: {
        title: 'Disable',
      },
    };
    if (await showPrompt(options)) {
      disableCompanion({});
      onOptOut();
    }
  };

  const onToggleUpvote = async () => {
    if (!user) {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );

      return;
    }

    await toggleUpvote({ payload: post, origin: Origin.CompanionContextMenu });
  };

  const onToggleDownvote = async () => {
    if (!user) {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );

      return;
    }

    await toggleDownvote({
      payload: post,
      origin: Origin.CompanionContextMenu,
    });
  };

  const toggleBookmark = async () => {
    if (user) {
      if (!post.bookmarked) {
        await bookmark({ id: post.id });
      } else {
        await removeBookmark({ id: post.id });
      }
    } else {
      window.open(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`,
        '_blank',
      );
    }
  };

  const tooltipContainerClassName = 'shadow-2 whitespace-nowrap';

  const onEscape = () => {
    if (!companionState) {
      return;
    }

    logEvent({ event_name: 'close companion' });
    toggleCompanionExpanded({ companionExpandedValue: false });
    setCompanionState(false);
  };

  useKeyboardNavigation(window, [['Escape', onEscape]], {
    disabledModalOpened: true,
  });

  const onReportPost: ReportedCallback = async (
    reportedPost,
    { shouldBlockSource },
  ): Promise<void> => {
    if (shouldBlockSource) {
      blockSource({ id: reportedPost?.source?.id });
    }

    displayToast(labels.reporting.reportFeedbackText);
  };

  const options: Array<MenuItemProps> = [
    {
      icon: (
        <WrapperMenuIcon
          Icon={DownvoteIcon}
          className={
            post?.userState?.vote === UserVote.Down &&
            'text-accent-ketchup-default'
          }
          secondary={post?.userState?.vote === UserVote.Down}
        />
      ),
      label: 'Downvote',
      action: onToggleDownvote,
    },
    {
      icon: <WrapperMenuIcon Icon={CommentIcon} />,
      label: 'View discussion',
      anchorProps: {
        href: post?.commentsPermalink,
        target: '_blank',
      },
    },
    {
      icon: <WrapperMenuIcon Icon={FlagIcon} />,
      label: 'Report',
      action: () => setReportModal(true),
    },
    {
      icon: <WrapperMenuIcon Icon={BookmarkIcon} />,
      label: 'Give us feedback',
      anchorProps: {
        href: feedback,
        target: '_blank',
      },
    },
    {
      icon: <WrapperMenuIcon Icon={EyeIcon} />,
      label: 'Disable widget',
      action: optOut,
    },
  ];

  return (
    <>
      <div className="group relative my-6 flex w-14 flex-col gap-2 self-center rounded-l-16 border border-border-subtlest-quaternary bg-background-default p-2">
        <CompanionToggle
          companionState={companionState}
          isAlertDisabled={!showCompanionHelper}
          tooltipContainerClassName={tooltipContainerClassName}
          onToggleCompanion={toggleCompanion}
        />
        <Tooltip
          side="left"
          content={
            post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
          }
          className={tooltipContainerClassName}
        >
          <Button
            icon={
              <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
            }
            pressed={post?.userState?.vote === UserVote.Up}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
          />
        </Tooltip>
        <Tooltip
          side="left"
          content="Add comment"
          className={tooltipContainerClassName}
        >
          <Button
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.BlueCheese}
            pressed={post?.commented}
            icon={<CommentIcon />}
            onClick={() => {
              setCompanionState(true);

              const commentBox =
                getCompanionWrapper()?.querySelector<HTMLElement>(
                  '.companion-new-comment-button',
                );

              if (commentBox) {
                commentBox.click();
              }
            }}
          />
        </Tooltip>
        <Tooltip
          side="left"
          content={`${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`}
          className={tooltipContainerClassName}
        >
          <Button
            icon={<BookmarkIcon secondary={post?.bookmarked} />}
            pressed={post?.bookmarked}
            onClick={toggleBookmark}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Bun}
          />
        </Tooltip>
        <Tooltip
          side="left"
          content="Share post"
          className={tooltipContainerClassName}
        >
          <Button
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Cabbage}
            onClick={onShare}
            icon={<ShareIcon />}
          />
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger
            tooltip={{ content: 'More options', side: 'left' }}
            asChild
          >
            <Button variant={ButtonVariant.Tertiary} icon={<MenuIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuOptions options={options} />
          </DropdownMenuContent>
        </DropdownMenu>
        {modal?.type === LazyModal.Share && (
          <ShareModal
            isOpen
            parentSelector={getCompanionWrapper}
            onRequestClose={closeModal}
            {...(modal.props as ShareProps)}
          />
        )}
        {modal?.type === LazyModal.UpvotedPopup && (
          <UpvotedPopupModal
            isOpen
            parentSelector={getCompanionWrapper}
            onRequestClose={closeModal}
            {...(modal.props as UpvotedPopupModalProps)}
          />
        )}
      </div>
      {reportModal && (
        <ReportPostModal
          className="z-rank"
          post={post}
          parentSelector={getCompanionWrapper}
          isOpen={!!reportModal}
          index={1}
          origin={Origin.CompanionContextMenu}
          onReported={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
    </>
  );
}
