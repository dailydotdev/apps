import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { OpenLinkIcon } from '../../icons';
import { IconSize } from '../../Icon';

export interface ArbitrageReadButtonProps {
  post: Post;
}

/**
 * The outbound click this template monetises. Kept in the same window rather
 * than `target="_blank"`: Google's vignette only fires on same-window anchor
 * clicks, and that slot (12) is the highest-earning unit on the page.
 */
export function ArbitrageReadButton({
  post,
}: ArbitrageReadButtonProps): ReactElement {
  return (
    <div className="mb-6 flex items-center gap-3 border-y border-border-subtlest-tertiary py-4">
      <Button
        tag="a"
        href={post.permalink}
        rel="noopener"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        icon={<OpenLinkIcon size={IconSize.Small} />}
        data-testid="arbitrage-read-button"
      >
        Read post
      </Button>
      <span className="text-text-quaternary typo-caption1">
        Slot 12 (vignette) fires on this click
      </span>
    </div>
  );
}
