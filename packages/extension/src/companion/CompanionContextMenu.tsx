import React, { ReactElement, useState } from 'react';
import {
  DiscussIcon as CommentIcon,
  FlagIcon,
  FeedbackIcon,
  EyeIcon,
  DownvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Item, Menu } from '@dailydotdev/react-contexify';
import {
  ReportPostModal,
  ReportedCallback,
} from '@dailydotdev/shared/src/components/modals';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { feedback } from '@dailydotdev/shared/src/lib/constants';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import classNames from 'classnames';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { labels } from '@dailydotdev/shared/src/lib';
import { Post, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { getCompanionWrapper } from '@dailydotdev/shared/src/lib/extension';

interface CompanionContextMenuProps {
  postData: PostBootData;
  onBlockSource: (T) => void;
  onDisableCompanion: () => void;
  onDownvote: () => void;
  onShare?: (post?: Post) => void;
}

export default function CompanionContextMenu({
  postData,
  onBlockSource,
  onDisableCompanion,
  onDownvote,
}: CompanionContextMenuProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [reportModal, setReportModal] = useState<boolean>();
  const { showPrompt } = usePrompt();

  const onReportPost: ReportedCallback = async (
    reportedPost,
    { shouldBlockSource },
  ): Promise<void> => {
    if (shouldBlockSource) {
      onBlockSource({ id: reportedPost?.source?.id });
    }

    displayToast(labels.reporting.reportFeedbackText);
  };

  const disableModal = async () => {
    const options: PromptOptions = {
      title: 'Disable the companion widget?',
      description: 'You can always re-enable it through the customize menu.',
      okButton: {
        title: 'Disable',
      },
    };
    if (await showPrompt(options)) {
      onDisableCompanion();
    }
  };

  return (
    <>
      <Menu
        disableBoundariesCheck
        id="companion-options-context"
        className="menu-primary"
        animation="fade"
      >
        <Item
          onClick={onDownvote}
          aria-pressed={postData?.userState?.vote === UserVote.Down}
          aria-label={
            postData?.userState?.vote === UserVote.Down
              ? 'Remove downvote'
              : 'Downvote'
          }
        >
          <DownvoteIcon
            size={IconSize.Small}
            className={classNames(
              'mr-2',
              postData?.userState?.vote === UserVote.Down &&
                'text-accent-ketchup-default',
            )}
            secondary={postData?.userState?.vote === UserVote.Down}
          />{' '}
          Downvote
        </Item>
        <Item>
          <a
            className="flex w-full items-center"
            href={postData?.commentsPermalink}
          >
            <CommentIcon size={IconSize.Small} className="mr-2" /> View
            discussion
          </a>
        </Item>
        <Item onClick={() => setReportModal(true)}>
          <FlagIcon size={IconSize.Small} className="mr-2" /> Report
        </Item>
        <Item>
          <a
            className="flex w-full items-center"
            href={feedback}
            target="_blank"
          >
            <FeedbackIcon size={IconSize.Small} className="mr-2" /> Give us
            feedback
          </a>
        </Item>
        <Item onClick={() => disableModal()}>
          <EyeIcon size={IconSize.Small} className="mr-2" /> Disable widget
        </Item>
      </Menu>
      {reportModal && (
        <ReportPostModal
          className="z-rank"
          post={postData}
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
