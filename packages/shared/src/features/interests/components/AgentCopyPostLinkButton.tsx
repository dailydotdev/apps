import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { LinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useCopyPostLink } from '../../../hooks/useCopyPostLink';
import type { Post } from '../../../graphql/posts';

export const AgentCopyPostLinkButton = ({
  post,
  reveal,
  className,
}: {
  post: Post;
  reveal?: boolean;
  className?: string;
}): ReactElement => {
  const [isCopying, copyLink] = useCopyPostLink(post.commentsPermalink);

  return (
    <Tooltip content={isCopying ? 'Link copied' : 'Copy link'}>
      <Button
        icon={
          isCopying ? (
            <VIcon
              size={IconSize.Size16}
              className="agent-icon-in text-status-success"
            />
          ) : (
            <LinkIcon size={IconSize.Size16} />
          )
        }
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Subtle}
        className={classNames(
          // Subtle has no fill, and these overlay live content.
          '!bg-background-subtle',
          reveal &&
            'opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100',
          // A pointer that cannot hover would never find it.
          reveal && '[@media(hover:none)]:opacity-100',
          className,
        )}
        aria-label={isCopying ? 'Link copied' : `Copy link: ${post.title}`}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();
          // The hook toasts its own failure; swallowed so the press does not
          // also throw an unhandled rejection.
          Promise.resolve(copyLink()).catch(() => undefined);
        }}
      />
    </Tooltip>
  );
};
