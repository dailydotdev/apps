import React, { ReactElement, useContext, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import ShareIcon from '@dailydotdev/shared/icons/share.svg';
import FlagIcon from '@dailydotdev/shared/icons/flag.svg';
import FeedbackIcon from '@dailydotdev/shared/icons/feedback.svg';
import EyeIcon from '@dailydotdev/shared/icons/eye.svg';
import { Item, Menu } from '@dailydotdev/react-contexify';
import RepostPostModal from '@dailydotdev/shared/src/components/modals/ReportPostModal';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { getCompanionWrapper } from './common';
import DisableCompanionModal from './DisableCompanionModal';

type CompanionContextMenuProps = {
  postData: PostBootData;
  onReport: (T) => void;
  onBlockSource: (T) => void;
  onViewDiscussion: () => void;
  onDisableCompanion: () => void;
};

export default function CompanionContextMenu({
  postData,
  onReport,
  onBlockSource,
  onViewDiscussion,
  onDisableCompanion,
}: CompanionContextMenuProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { trackEvent } = useContext(AnalyticsContext);
  const [reportModal, setReportModal] = useState<boolean>();
  const [disableModal, setDisableModal] = useState<boolean>();
  const shareLink = postData?.commentsPermalink;
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    link: shareLink,
    text: postData?.title,
    trackObject: () =>
      postAnalyticsEvent('share post', postData, {
        extra: { origin: 'companion context menu' },
      }),
  });

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

  return (
    <>
      <Menu
        disableBoundariesCheck
        id="companion-options-context"
        className="menu-primary"
        animation="fade"
      >
        <Item onClick={onViewDiscussion}>
          <CommentIcon className="mr-2 text-xl" /> View discussion
        </Item>
        <Item onClick={() => onShareOrCopyLink()}>
          <ShareIcon className="mr-2 text-xl" /> Share article
        </Item>
        <Item onClick={() => setReportModal(true)}>
          <FlagIcon className="mr-2 text-xl" /> Report
        </Item>
        <Item>
          <a
            className="flex w-full"
            href="https://daily.dev/feedback"
            target="_blank"
          >
            <FeedbackIcon className="mr-2 text-xl" /> Give us feedback
          </a>
        </Item>
        <Item onClick={() => setDisableModal(true)}>
          <EyeIcon className="mr-2 text-xl" /> Disable widget
        </Item>
      </Menu>
      {reportModal && (
        <RepostPostModal
          className="z-rank"
          post={postData}
          parentSelector={getCompanionWrapper}
          isOpen={!!reportModal}
          postIndex={1}
          onReport={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
      {disableModal && (
        <DisableCompanionModal
          onConfirm={onDisableCompanion}
          isOpen={!!disableModal}
          onRequestClose={() => setDisableModal(null)}
          parentSelector={getCompanionWrapper}
        />
      )}
    </>
  );
}
