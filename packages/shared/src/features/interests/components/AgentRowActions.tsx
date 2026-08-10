import type { ReactElement } from 'react';
import React from 'react';
import { FlexRow } from '../../../components/utilities';
import type { Post } from '../../../graphql/posts';
import { postAttachment } from '../attachments';
import { AgentAddToChatButton } from './AgentAddToChatButton';
import { AgentCopyPostLinkButton } from './AgentCopyPostLinkButton';
import { AgentSharePostButton } from './AgentSharePostButton';

/**
 * What you can do with a post the agent found, as one cluster.
 *
 * Straddling the top edge at the right, the way Slack hangs its message
 * actions, so it belongs to the thing under it without taking any of its room.
 * The same place at every width — a control that moves between devices is a
 * second control to learn.
 *
 * Outward actions first, then the inward one. Copy-link and share are both for
 * someone else and are what a reader reaches for without having learned this
 * screen; add-to-chat is for the next prompt and only makes sense once they
 * have. Copy-link leads share because pasting a link is the commonest of the
 * three by a distance, and the sheet behind share is for everything else.
 */
export const AgentRowActions = ({
  post,
  reveal,
}: {
  post: Post;
  /** Kept out of the way until the pointer is on the row it belongs to. */
  reveal?: boolean;
}): ReactElement => (
  <FlexRow className="absolute -top-3 right-3 z-1 items-center gap-1">
    <AgentCopyPostLinkButton post={post} reveal={reveal} />
    <AgentSharePostButton post={post} reveal={reveal} />
    <AgentAddToChatButton attachment={postAttachment(post)} reveal={reveal} />
  </FlexRow>
);
