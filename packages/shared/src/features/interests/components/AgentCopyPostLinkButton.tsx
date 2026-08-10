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

/**
 * The post's own link, straight to the clipboard.
 *
 * Beside the share button rather than inside it: pasting a link into a thread is
 * the commonest thing anyone does with something they found, and putting it two
 * presses deep behind a sheet that offers six providers is charging for the
 * frequent case to make room for the rare one. The sheet stays for everything
 * else.
 *
 * Answers by becoming a green tick, the way the header's does — the same control
 * confirming rather than a second one arriving.
 */
export const AgentCopyPostLinkButton = ({
  post,
  reveal,
  className,
}: {
  post: Post;
  /** Kept out of the way until the pointer is on the row it belongs to. */
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
          // Subtle is an outline with no fill, and these sit over live content.
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
          copyLink();
        }}
      />
    </Tooltip>
  );
};
