import React, { ReactElement } from 'react';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import ShareIcon from '@dailydotdev/shared/icons/share.svg';
import FlagIcon from '@dailydotdev/shared/icons/flag.svg';
import FeedbackIcon from '@dailydotdev/shared/icons/feedback.svg';
import EyeIcon from '@dailydotdev/shared/icons/eye.svg';
import PortalMenu from '@dailydotdev/shared/src/components/fields/PortalMenu';
import { Item } from '@dailydotdev/react-contexify';

export default function CompanionContextMenu({
  onMessage,
}: {
  onMessage?: (message: string, timeout?: number) => Promise<unknown>;
}): ReactElement {
  const onSharePost = async () => {
    const shareLink = 'blabla';
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: 'asasasas',
          url: shareLink,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      // await navigator.clipboard.writeText(shareLink);
      onMessage('✅ Copied link to clipboard');
    }
  };

  return (
    <PortalMenu
      disableBoundariesCheck
      id="companion-options-context"
      className="menu-primary"
      animation="fade"
    >
      <Item>
        <a
          className="flex w-full"
          href="https://daily.dev/feedback"
          target="_parent"
        >
          <CommentIcon className="mr-2 text-xl" /> View discussion
        </a>
      </Item>
      <Item onClick={onSharePost}>
        <ShareIcon className="mr-2 text-xl" /> Share article
      </Item>
      <Item>
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
    </PortalMenu>
  );
}
