import React, { ReactElement, useContext, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/src/components/icons/Discuss';
import FlagIcon from '@dailydotdev/shared/src/components/icons/Flag';
import FeedbackIcon from '@dailydotdev/shared/src/components/icons/Feedback';
import EyeIcon from '@dailydotdev/shared/src/components/icons/Eye';
import { Item, Menu } from '@dailydotdev/react-contexify';
import ReportPostModal from '@dailydotdev/shared/src/components/modals/ReportPostModal';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ShareBookmarkProps } from '@dailydotdev/shared/src/components/post/PostActions';
import { feedback } from '@dailydotdev/shared/src/lib/constants';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { getCompanionWrapper } from './common';

interface CompanionContextMenuProps
  extends Omit<ShareBookmarkProps, 'onBookmark'> {
  postData: PostBootData;
  onReport: (T) => void;
  onBlockSource: (T) => void;
  onDisableCompanion: () => void;
}

export default function CompanionContextMenu({
  postData,
  onReport,
  onBlockSource,
  onDisableCompanion,
}: CompanionContextMenuProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { trackEvent } = useContext(AnalyticsContext);
  const [reportModal, setReportModal] = useState<boolean>();
  const { showPrompt } = usePrompt();

  const onReportPost = async (
    reportPostIndex,
    reportedPost,
    reason,
    comment,
    blockSource,
  ): Promise<void> => {
    onReport({ id: reportedPost.id, reason, comment });
    if (blockSource) {
      onBlockSource({ id: reportedPost?.source?.id });
    }

    trackEvent(
      postAnalyticsEvent('report post', reportedPost, {
        extra: { origin: 'companion context menu' },
      }),
    );

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
          postIndex={1}
          onReport={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
    </>
  );
}
