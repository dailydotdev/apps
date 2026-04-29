import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../utilities/Link';
import SourceButton from './SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { Post } from '../../../graphql/posts';
import { webappUrl } from '../../../lib/constants';
import { useFeedLayout } from '../../../hooks/useFeedLayout';
import styles from './YoutubeLiveFeedCard.module.css';

export type YoutubeLiveFeedCardProps = {
  post: Post;
  style?: CSSProperties;
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const previewVideoSrc = `${webappUrl}assets/videos/syntax-live-preview.webm`;
const previewPosterSrc = `${webappUrl}assets/videos/syntax-live-preview-poster.jpg`;

/**
 * Option 3 design for the Syntax live YouTube experiment: a card-shaped
 * variant of the option 2 pill that occupies a single slot in the feed grid.
 */
export function YoutubeLiveFeedCard({
  post,
  style,
  className,
  onClick,
}: YoutubeLiveFeedCardProps): ReactElement {
  const href = post.commentsPermalink;
  const { shouldUseListFeedLayout } = useFeedLayout();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onClick) {
      return;
    }
    event.preventDefault();
    onClick(event);
  };

  return (
    <Link href={href} passHref>
      <a
        style={style}
        onClick={handleClick}
        data-testid="youtube-live-feed-card"
        className={classNames(
          'group relative flex h-full w-full flex-col items-start justify-end gap-4 overflow-hidden rounded-16 p-4 no-underline transition-shadow hover:shadow-2',
          shouldUseListFeedLayout
            ? 'min-h-[17rem]'
            : 'min-h-card max-h-cardLarge',
          styles.card,
          className,
        )}
      >
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          src={previewVideoSrc}
          poster={previewPosterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-overlay-tertiary-black opacity-55" />
        <div
          className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center"
          aria-hidden
        >
          <span className="flex size-24 items-center justify-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-110">
            <PlayIcon secondary size={IconSize.XXLarge} />
          </span>
        </div>
        <div className="relative z-1 flex w-full flex-col items-start gap-2">
          <span className="block w-full break-words text-left font-bold text-white typo-title3">
            {post.title}
          </span>
          <div className="flex items-center gap-2">
            {post.source && (
              <SourceButton
                source={post.source}
                size={ProfileImageSize.Large}
                className="shrink-0"
              />
            )}
            {post.source?.name && (
              <span className="font-bold text-raw-salt-50 typo-footnote">
                {post.source.name}
              </span>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
