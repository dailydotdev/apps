import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, Fragment } from 'react';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import { SponsoredTooltip } from './SponsoredTooltip';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import type { HighlightStyle } from '../../lib/brand';
import { findFirstHighlightedKeyword } from '../../lib/brand';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';

interface HighlightedWordProps {
  /** The word/text to highlight */
  word: string;
  /** Tags used to look up the matching creative. When omitted, checks all creatives. */
  tags?: string[];
  className?: string;
}

/**
 * Get Tailwind classes for highlight style
 */
const getHighlightClasses = (style: HighlightStyle): string => {
  switch (style) {
    case 'dotted':
      return 'border-b border-dotted border-accent-onion-default cursor-pointer';
    case 'underline':
      return 'underline decoration-1 underline-offset-2 cursor-pointer';
    case 'background':
      return 'bg-accent-onion-default/20 rounded px-0.5 -mx-0.5 cursor-pointer';
    default:
      return 'underline decoration-1 underline-offset-2 cursor-pointer';
  }
};

/**
 * HighlightedWord Component
 *
 * Renders a single highlighted keyword with a sponsored tooltip on hover.
 * Uses the brand sponsorship configuration for styling and tooltip content.
 */
export const HighlightedWord = ({
  word,
  tags,
  className,
}: HighlightedWordProps): ReactElement => {
  const { getHighlightedWordConfig } = useBrandSponsorship();
  const { creatives } = useEngagementAdsContext();

  // When tags are provided, use them to find the creative.
  // When omitted, find the first creative whose keywords include this word.
  const highlightResult = useMemo(() => {
    if (tags?.length) {
      return getHighlightedWordConfig(tags);
    }

    const lowerWord = word.toLowerCase().trim();
    const match = creatives.find(
      (c) =>
        c.keywords.some((k) => k.toLowerCase() === lowerWord) ||
        c.tags.some((t) => t.toLowerCase() === lowerWord),
    );

    if (!match) {
      return { config: null, brandName: null, brandLogo: null, colors: null };
    }

    return getHighlightedWordConfig(match.tags);
  }, [tags, word, creatives, getHighlightedWordConfig]);

  const { config, brandName, brandLogo, colors } = highlightResult;

  if (!config || !brandName) {
    return <>{word}</>;
  }

  const highlightClasses = getHighlightClasses(config.highlightStyle);

  const tooltipContent = (
    <SponsoredTooltip
      config={config}
      brandName={brandName}
      brandLogo={brandLogo}
      colors={colors}
    />
  );

  return (
    <Tooltip
      content={tooltipContent}
      noArrow
      className="!max-w-none !rounded-16 !bg-transparent !p-0"
      delayDuration={100}
    >
      <span
        className={classNames('transition-colors', highlightClasses, className)}
      >
        {word}
      </span>
    </Tooltip>
  );
};

interface HighlightedBrandTextProps {
  /** The full text to scan for keywords */
  text: string;
  /** Tags used to look up the matching creative. When omitted, checks all creatives. */
  tags?: string[];
  /** Optional className for the container */
  className?: string;
}

/**
 * HighlightedBrandText Component
 *
 * Scans text for sponsored keywords and wraps them with HighlightedWord components.
 * Non-matching text is rendered as-is.
 *
 * @example
 * ```tsx
 * <HighlightedBrandText text="Learn about AI and machine learning" />
 * // "AI" would be highlighted if it's a sponsored keyword
 * ```
 */
export const HighlightedBrandText = ({
  text,
  tags,
  className,
}: HighlightedBrandTextProps): ReactElement => {
  const { creatives, getCreativeForTags } = useEngagementAdsContext();

  // Resolve the primary creative (keywords list) and a fallback tags list.
  // Keywords are scanned first; tags are only used if no keyword matched.
  const { keywords, fallbackTags } = useMemo(() => {
    if (tags?.length) {
      const creative = getCreativeForTags(tags);

      return {
        keywords: creative?.keywords ?? [],
        fallbackTags: creative?.tags ?? [],
      };
    }

    return {
      keywords: creatives.flatMap((c) => c.keywords),
      fallbackTags: creatives.flatMap((c) => c.tags),
    };
  }, [tags, creatives, getCreativeForTags]);

  const parts = useMemo((): ReactNode[] => {
    if (!text) {
      return [text];
    }

    // Scan keywords first; only fall back to tags if no keyword matched
    const match =
      findFirstHighlightedKeyword(text, keywords) ??
      findFirstHighlightedKeyword(text, fallbackTags);

    if (!match) {
      return [text];
    }

    return [
      text.slice(0, match.start),
      <HighlightedWord key="highlight-0" word={match.keyword} tags={tags} />,
      text.slice(match.end),
    ];
  }, [text, tags, keywords, fallbackTags]);

  return <span className={className}>{parts}</span>;
};
