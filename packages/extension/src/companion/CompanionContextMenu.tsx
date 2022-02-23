import React, { ReactElement, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import ShareIcon from '@dailydotdev/shared/icons/share.svg';
import FlagIcon from '@dailydotdev/shared/icons/flag.svg';
import FeedbackIcon from '@dailydotdev/shared/icons/feedback.svg';
import EyeIcon from '@dailydotdev/shared/icons/eye.svg';
import { Item, Menu } from '@dailydotdev/react-contexify';
import RepostPostModal from '@dailydotdev/shared/src/components/modals/ReportPostModal';
import { BootData } from './common';

export default function CompanionContextMenu({
  postData,
  onMessage,
}: {
  postData: BootData;
  onMessage?: (message: string, timeout?: number) => Promise<unknown>;
}): ReactElement {
  const [reportModal, setReportModal] = useState<boolean>();

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
        <Item>
          <EyeIcon className="mr-2 text-xl" /> Disable widget
        </Item>
      </Menu>
      {reportModal && (
        <RepostPostModal
          isOpen={!!reportModal}
          postIndex={1}
          onReport={() => {}}
          onRequestClose={() => setReportModal(null)}
        />
      )}
    </>
  );
}
