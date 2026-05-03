import type { ReactElement } from 'react';
import React from 'react';
import { ButtonV2, ButtonVariant } from '../../buttons/ButtonV2';
import { ShareIcon } from '../../icons';
import { useLoggedCopyPostLink } from '../../../hooks/post';
import type { Post } from '../../../graphql/posts';
import { ShareProvider } from '../../../lib/share';
import { CardCoverContainer } from './CardCoverContainer';
import { wrapStopPropagation } from '../../../lib/func';

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
        <ButtonV2
          variant={ButtonVariant.Secondary}
          onClick={wrapStopPropagation(onClick)}
          loading={isLoading}
        >
          Copy link
        </ButtonV2>
        <ButtonV2
          variant={ButtonVariant.Secondary}
          icon={<ShareIcon />}
          onClick={wrapStopPropagation(onShare)}
        />
      </span>
    </CardCoverContainer>
  );
}
