import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { Source } from '../../../graphql/sources';
import type { CoverVariant } from '../../../lib/cover';
import { getCoverAccent } from '../../../lib/cover';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';

interface TypographicCoverProps {
  post: Pick<Post, 'title' | 'hook' | 'tags' | 'readTime'> & {
    source?: Pick<Source, 'image' | 'handle' | 'name'>;
  };
  variant: Extract<CoverVariant, 'hook' | 'title'>;
  className?: string;
}

// Stands in for the cover image of a post that has none. Paints the enrichment
// hook (or the title while no hook exists) on a tag-coloured field, so the
// card still has an eye-catcher without repeating a stock placeholder.
export function TypographicCover({
  post,
  variant,
  className,
}: TypographicCoverProps): ReactElement {
  const accent = getCoverAccent(post.tags?.[0]);
  const field: CSSProperties = {
    background: `linear-gradient(160deg, var(--theme-accent-${accent}-subtler) 0%, var(--theme-accent-${accent}-subtlest) 100%)`,
  };
  const dots: CSSProperties = {
    backgroundImage: `radial-gradient(var(--theme-accent-${accent}-default) 1px, transparent 1.2px)`,
    backgroundSize: '14px 14px',
    maskImage: 'linear-gradient(180deg, rgba(0,0,0,.5), transparent 70%)',
    WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,.5), transparent 70%)',
  };
  const rule: CSSProperties = {
    background: `var(--theme-accent-${accent}-default)`,
  };
  const text = variant === 'hook' ? post.hook : post.title;

  // The outer box carries the same classes the cover image had, padding
  // included, so the painted card keeps the image's inset from the card edge.
  return (
    <div
      className={classNames('h-40 rounded-12', className)}
      data-testid="typographicCover"
      data-cover={variant}
    >
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-12 p-3"
        style={field}
      >
        <span
          className="pointer-events-none absolute inset-0"
          style={dots}
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-2 text-text-tertiary typo-caption1">
          <span className="flex min-w-0 items-center gap-1.5">
            {post.source && (
              <SourceAvatar
                source={post.source}
                size={ProfileImageSize.XSmall}
                className="!mr-0"
              />
            )}
            <span className="truncate">
              {post.source?.handle ?? post.source?.name}
            </span>
          </span>
          {!!post.readTime && (
            <span className="shrink-0">{post.readTime}m read</span>
          )}
        </div>
        <p className="relative line-clamp-3 break-words font-bold text-text-primary typo-title3">
          {text}
        </p>
        <span className="relative h-0.5 w-9 rounded-full" style={rule} />
      </div>
    </div>
  );
}
