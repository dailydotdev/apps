import type { ReactElement } from 'react';
import React from 'react';
import { FlexRow } from '../../../components/utilities';
import type { Post } from '../../../graphql/posts';
import { postAttachment } from '../attachments';
import { AgentAddToChatButton } from './AgentAddToChatButton';
import { AgentCopyPostLinkButton } from './AgentCopyPostLinkButton';
import { AgentSharePostButton } from './AgentSharePostButton';

export const AgentRowActions = ({
  post,
  reveal,
}: {
  post: Post;
  reveal?: boolean;
}): ReactElement => (
  <FlexRow className="absolute -top-3 right-3 z-1 items-center gap-1">
    <AgentCopyPostLinkButton post={post} reveal={reveal} />
    <AgentSharePostButton post={post} reveal={reveal} />
    <AgentAddToChatButton attachment={postAttachment(post)} reveal={reveal} />
  </FlexRow>
);
