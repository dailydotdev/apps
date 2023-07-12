import React, { ReactElement, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/src/components/icons/Discuss';
import FlagIcon from '@dailydotdev/shared/src/components/icons/Flag';
import FeedbackIcon from '@dailydotdev/shared/src/components/icons/Feedback';
import EyeIcon from '@dailydotdev/shared/src/components/icons/Eye';
import { Item, Menu } from '@dailydotdev/react-contexify';
import {
  ReportPostModal,
  ReportedCallback,
} from '@dailydotdev/shared/src/components/modals';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ShareBookmarkProps } from '@dailydotdev/shared/src/components/post/PostActions';
import { feedback } from '@dailydotdev/shared/src/lib/constants';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import DownvoteIcon from '@dailydotdev/shared/src/components/icons/Downvote';
import classNames from 'classnames';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { getCompanionWrapper } from './common';

interface CompanionContextMenuProps
  extends Omit<ShareBookmarkProps, 'onBookmark'> {
  postData: PostBootData;
  onBlockSource: (T) => void;
  onDisableCompanion: () => void;
  onDownvote: () => void;
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

    displayToast('🚨 Thanks for reporting!');
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
          aria-pressed={!!postData?.downvoted}
          aria-label={postData?.downvoted ? 'Remove downvote' : 'Downvote'}
        >
          <DownvoteIcon
            size={IconSize.Small}
            className={classNames(
              'mr-2',
              postData?.downvoted && 'text-theme-color-ketchup',
            )}
            secondary={postData?.downvoted}
          />{' '}
          Downvote
        </Item>
        <Item>
          <a
            className="flex items-center w-full"
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
            className="flex items-center w-full"
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
