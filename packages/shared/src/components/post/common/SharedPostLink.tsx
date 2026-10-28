import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { Post, SharedPost } from '../../../graphql/posts';
import type { CombinedClicks } from '../../../lib/click';
import { withSelectionGuard } from '../../../lib/click';
import { anchorUgcRel } from '../../../lib/strings';
import { useReaderInstallPromptGate } from '../../../hooks/useReaderInstallPromptGate';
import { isExternalPost } from './postMedia';

interface SharedPostTitleProps {
  sharedPost: SharedPost;
  source: Post['source'];
  children: ReactNode;
  className?: string;
  onGoToLinkProps?: CombinedClicks;
  post?: Post;
  onCloseParent?: () => void;
}

export const SharedPostLink = ({
  sharedPost,
  source,
  className,
  children,
  onGoToLinkProps,
  post,
  onCloseParent,
}: SharedPostTitleProps): ReactElement => {
  const { onReadClick: onReaderInstallGateClick } = useReaderInstallPromptGate(
    post ?? sharedPost,
    { onCloseParent },
  );
  const isExternal = isExternalPost(sharedPost);
  const { href, as, ...props } = isExternal
    ? {
        href: sharedPost?.permalink,
        target: '_blank',
        rel: anchorUgcRel,
        as: undefined,
        ...onGoToLinkProps,
      }
    : {
        href: `${sharedPost?.commentsPermalink}?squad=${source.handle}&n=${source.name}`,
        as: sharedPost?.commentsPermalink,
      };

  const handleReadClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isExternal && onReaderInstallGateClick(event)) {
      return;
    }
    if (isExternal) {
      onGoToLinkProps?.onClick(event);
    }
  };

  return (
    <Link href={href} as={as}>
      <a
        {...props}
        href={as ?? href}
        onClick={withSelectionGuard(handleReadClick)}
        className={className}
      >
        {children}
      </a>
    </Link>
  );
};
