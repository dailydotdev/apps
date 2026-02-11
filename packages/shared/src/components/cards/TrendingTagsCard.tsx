import type { CSSProperties, ReactElement } from 'react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { ArrowIcon, TrendingIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

// Mock trending tags data - in production this would come from an API
const TRENDING_TAGS = [
  'ai',
  'webdev',
  'react',
  'typescript',
  'devops',
  'javascript',
  'python',
  'nodejs',
  'cloud',
  'docker',
  'kubernetes',
  'rust',
  'golang',
  'vue',
  'nextjs',
  'aws',
  'security',
  'database',
  'api',
  'opensource',
];

interface TrendingTagsCardProps {
  className?: string;
  style?: CSSProperties;
}

interface TagChipProps {
  tag: string;
  href: string;
  isActive?: boolean;
}

const TagChip = ({ tag, href, isActive }: TagChipProps): ReactElement => (
  <Link href={href}>
    <span
      className={classNames(
        'flex h-8 flex-shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-10 border px-3 typo-callout transition-colors',
        isActive
          ? 'border-text-primary bg-text-primary text-background-default'
          : 'border-border-subtlest-tertiary bg-background-default text-text-tertiary hover:bg-surface-hover hover:text-text-secondary',
      )}
    >
      {tag}
    </span>
  </Link>
);

// Mobile card version - shown only on mobile
const MobileTrendingCard = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:hidden',
      className,
    )}
  >
    {/* Header */}
    <div className="flex items-center gap-2">
      <TrendingIcon className="size-5 text-text-tertiary" />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        Trending tags
      </Typography>
    </div>

    {/* Tags - show first 8 on mobile */}
    <div className="flex flex-wrap gap-2">
      {TRENDING_TAGS.slice(0, 8).map((tag) => (
        <Link key={tag} href={`${webappUrl}tags/${tag}`}>
          <span className="flex items-center rounded-8 bg-surface-float px-2.5 py-1 typo-footnote text-text-secondary hover:bg-surface-hover">
            #{tag}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

// Desktop strip version with scroll
const DesktopTrendingStrip = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): ReactElement => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const scrollLeftFn = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollBy({ left: -120, behavior: 'smooth' });
  }, []);

  const scrollRightFn = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollBy({ left: 120, behavior: 'smooth' });
  }, []);

  return (
    <div
      className={classNames('relative hidden tablet:block', className)}
      style={style}
    >
      {/* Floating left arrow with gradient fade */}
      {showLeftArrow && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 z-1 h-full w-16 bg-gradient-to-r from-background-default to-transparent" />
          <button
            type="button"
            onClick={scrollLeftFn}
            className="absolute -left-4 top-1/2 z-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-default shadow-2 transition-colors hover:bg-surface-hover"
            aria-label="Scroll left"
          >
            <ArrowIcon className="-rotate-90 text-text-primary" />
          </button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className="flex w-full items-center gap-2 overflow-x-auto py-2 no-scrollbar px-2"
      >
        {/* All tag - always first */}
        <TagChip tag="All" href={`${webappUrl}`} isActive />

        {/* Trending tags */}
        {TRENDING_TAGS.map((tag) => (
          <TagChip key={tag} tag={`#${tag}`} href={`${webappUrl}tags/${tag}`} />
        ))}
      </div>

      {/* Floating right arrow with gradient fade */}
      {showRightArrow && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background-default to-transparent" />
          <button
            type="button"
            onClick={scrollRightFn}
            className="absolute -right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-default shadow-2 transition-colors hover:bg-surface-hover"
            aria-label="Scroll right"
          >
            <ArrowIcon className="rotate-90 text-text-primary" />
          </button>
        </>
      )}
    </div>
  );
};

export const TrendingTagsCard = ({
  className,
  style,
}: TrendingTagsCardProps): ReactElement => {
  return (
    <>
      <MobileTrendingCard className={className} />
      <DesktopTrendingStrip className={className} style={style} />
    </>
  );
};

export default TrendingTagsCard;
