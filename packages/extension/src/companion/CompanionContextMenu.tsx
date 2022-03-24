import React, { ReactElement, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import ShareIcon from '@dailydotdev/shared/icons/share.svg';
import FlagIcon from '@dailydotdev/shared/icons/flag.svg';
import FeedbackIcon from '@dailydotdev/shared/icons/feedback.svg';
import EyeIcon from '@dailydotdev/shared/icons/eye.svg';
import { Item, Menu } from '@dailydotdev/react-contexify';
import RepostPostModal from '@dailydotdev/shared/src/components/modals/ReportPostModal';
import { PostBootData } from './common';
import DisableCompanionModal from './DisableCompanionModal';

interface CompanionContextMenuProps {
  postData: PostBootData;
  onMessage?: (message: string, timeout?: number) => Promise<unknown>;
  onReport;
  onBlockSource;
  onDisableCompanion;
}

const getCompanionWrapper = (): HTMLElement =>
  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper');

export default function CompanionContextMenu({
  postData,
  onMessage,
  onReport,
  onBlockSource,
  onDisableCompanion,
}: CompanionContextMenuProps): ReactElement {
  const [reportModal, setReportModal] = useState<boolean>();
  const [disableModal, setDisableModal] = useState<boolean>();

  const onSharePost = async () => {
    const shareLink = postData?.commentsPermalink;
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postData?.title,
          url: shareLink,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareLink);
      onMessage('✅ Copied link to clipboard');
    }
  };

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
    onMessage('🚨 Thanks for reporting!');
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
          <a className="flex w-full" href={postData?.commentsPermalink}>
            <CommentIcon className="mr-2 text-xl" /> View discussion
          </a>
        </Item>
        <Item onClick={onSharePost}>
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
