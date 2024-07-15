import React, { ReactElement } from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ShareIcon } from '../../icons';
import { useLoggedCopyPostLink } from '../../../hooks/post';
import { Post } from '../../../graphql/posts';
import { ShareProvider } from '../../../lib/share';
import { CardCoverContainer } from './CardCoverContainer';

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
  const { onCopyLink, isLoading } = useLoggedCopyPostLink(post);
  const onClick = () => {
    onCopyLink(ShareProvider.CopyLink);
    onCopy();
  };

  return (
    <CardCoverContainer title="Should anyone else see this post?">
      <span className="mt-2 flex flex-row flex-wrap justify-center gap-3 p-2">
        <Button
          variant={ButtonVariant.Secondary}
          onClick={onClick}
          loading={isLoading}
        >
          Copy link
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          icon={<ShareIcon />}
          onClick={onShare}
        />
      </span>
    </CardCoverContainer>
  );
}
