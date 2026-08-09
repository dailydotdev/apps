import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { ShareIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useSharePost } from '../../../hooks/useSharePost';
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';

/**
 * Passing on something the agent found.
 *
 * Straight to the app's own share modal rather than a bespoke sheet: squads,
 * every external provider and the tracked copy link are already there, and a
 * second share UI in one product is a second one to keep honest.
 *
 * Glyph only. It sits beside "Add to chat" on a row whose own title is the
 * thing being read, and two labelled buttons over one row of content is the
 * row losing an argument with its own furniture.
 */
export const AgentSharePostButton = ({
  post,
  reveal,
  className,
}: {
  post: Post;
  /** Kept out of the way until the pointer is on the row it belongs to. */
  reveal?: boolean;
  className?: string;
}): ReactElement => {
  const { openSharePost } = useSharePost(Origin.Agent);

  return (
    <Tooltip content="Share">
      <Button
        icon={<ShareIcon size={IconSize.Size16} />}
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
        aria-label={`Share: ${post.title}`}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();
          openSharePost({ post });
        }}
      />
    </Tooltip>
  );
};
