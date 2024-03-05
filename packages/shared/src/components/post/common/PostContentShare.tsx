import React, { ReactElement } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { TargetId } from '../../../lib/analytics';
import { Post } from '../../../graphql/posts';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';

interface PostContentShareProps {
  post: Post;
}

export function PostContentShare({
  post,
}: PostContentShareProps): ReactElement {
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);

  if (!shouldShowOverlay) {
    return null;
  }

  return (
    <div className="border-theme-subtlest-tertiary mt-6 flex flex-row items-center rounded-16 border px-4 py-2">
      <span className="font-bold text-theme-label-tertiary typo-callout">
        Should anyone else see this post?
      </span>
      <InviteLinkInput
        className={{ container: 'ml-4 flex-1' }}
        targetId={TargetId.PostModal}
        link={post.commentsPermalink}
        onCopy={onInteract}
      />
    </div>
  );
}
