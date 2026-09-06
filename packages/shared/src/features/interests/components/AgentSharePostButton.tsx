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
import { getPostTitle } from '../../../graphql/posts';

export const AgentSharePostButton = ({
  post,
  reveal,
  className,
}: {
  post: Post;
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
          // Subtle has no fill, and these overlay live content.
          '!bg-background-subtle',
          reveal &&
            'opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100',
          // opacity-0 stays tappable and hover never comes to reveal it, so a
          // touch pointer would tap invisible buttons; touch shares from the
          // pane's post view or the feed tab's card share instead.
          reveal && '[@media(hover:none)]:hidden',
          className,
        )}
        aria-label={`Share: ${getPostTitle(post) ?? 'Untitled post'}`}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();
          openSharePost({ post });
        }}
      />
    </Tooltip>
  );
};
