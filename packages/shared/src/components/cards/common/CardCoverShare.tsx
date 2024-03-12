import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ShareIcon } from '../../icons';
import { useTrackedCopyPostLink } from '../../../hooks/post';
import { Post } from '../../../graphql/posts';
import { ShareProvider } from '../../../lib/share';

interface CardCoverShareProps {
  onShare: () => void;
  onCopy: () => void;
  post: Post;
}

export function CardCoverShare({
  post,
  onCopy,
  onShare,
}: CardCoverShareProps): ReactElement {
  const onCopyLink = useTrackedCopyPostLink(post);
  const onClick = () => {
    onCopyLink(ShareProvider.CopyLink);
    onCopy();
  };

  return (
    <span className="absolute inset-0 z-1 flex flex-col items-center justify-center">
      <p className="font-bold typo-callout">
        Should anyone else see this post?
      </p>
      <span className="mt-2 flex flex-row gap-3 p-2">
        <Button variant={ButtonVariant.Secondary} onClick={onClick}>
          Copy link
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          icon={<ShareIcon />}
          onClick={onShare}
        />
      </span>
    </span>
  );
}
