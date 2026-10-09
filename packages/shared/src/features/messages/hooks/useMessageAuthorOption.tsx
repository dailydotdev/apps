import React from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Comment } from '../../../graphql/comments';
import type { MenuItemProps } from '../../../components/dropdown/common';
import { MailIcon } from '../../../components/icons/Mail';
import { useMessagesEnabled } from './useMessagesEnabled';
import { DmOrigin, getMessagesUrl } from '../urls';

// The comment's "Message {author}" menu item; opening the chat from here
// carries the comment along as a reference card.
export const useMessageAuthorOption = (
  comment: Comment,
  authorName: string,
): MenuItemProps | undefined => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isEnabled } = useMessagesEnabled();
  const { author } = comment;

  if (!isEnabled || !user || !author || author.id === user.id) {
    return undefined;
  }

  return {
    icon: <MailIcon />,
    label: `Message ${authorName}`,
    action: () =>
      router.push(
        getMessagesUrl(author.id, {
          commentId: comment.id,
          origin: DmOrigin.Comment,
        }),
      ),
  };
};
