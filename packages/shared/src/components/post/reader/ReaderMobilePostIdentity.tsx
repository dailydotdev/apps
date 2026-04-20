import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Post } from '../../../graphql/posts';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

type ReaderMobilePostIdentityProps = {
  post: Post;
  displayTitle: string;
  onExpand: () => void;
};

const isInternalDailyHost = (host: string | null): boolean =>
  !!host &&
  (host.toLowerCase() === 'daily.dev' ||
    host.toLowerCase().endsWith('.daily.dev'));

export function ReaderMobilePostIdentity({
  post,
  displayTitle,
  onExpand,
}: ReaderMobilePostIdentityProps): ReactElement {
  const { sourceName, handleLabel, coverSrc } = useMemo(() => {
    const domain = post.domain?.trim() ?? '';
    const src = post.source;
    const name =
      src?.name?.trim() ||
      (domain && !isInternalDailyHost(domain) ? domain : '') ||
      'Source';
    let handle = '';
    if (src?.handle && src.handle.length > 0) {
      handle = `@${src.handle}`;
    } else if (domain && !isInternalDailyHost(domain)) {
      handle = `@${domain}`;
    }
    const img = src?.image || post.image;
    return { sourceName: name, handleLabel: handle, coverSrc: img };
  }, [post]);

  return (
    <button
      type="button"
      onClick={onExpand}
      className="rounded-xl flex w-full flex-col gap-3 px-1 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-bun-default active:bg-surface-hover"
      aria-label="Expand post details to full screen"
    >
      <div className="flex min-w-0 items-start gap-3">
        <LazyImage
          imgSrc={coverSrc}
          imgAlt=""
          ratio="100%"
          className="size-10 shrink-0 rounded-full"
          eager
          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          fetchPriority="high"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Subhead}
            bold
            className="truncate text-text-primary"
          >
            {sourceName}
          </Typography>
          {handleLabel ? (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              {handleLabel}
            </Typography>
          ) : null}
        </div>
      </div>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Title3}
        bold
        className="line-clamp-2 text-left text-text-primary"
      >
        {displayTitle}
      </Typography>
    </button>
  );
}
