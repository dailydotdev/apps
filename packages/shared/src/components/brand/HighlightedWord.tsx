import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, Fragment } from 'react';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import { SponsoredTooltip } from './SponsoredTooltip';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import type { HighlightStyle } from '../../lib/brand';
import { findHighlightedKeywords } from '../../lib/brand';
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
    const match = creatives.find((c) =>
      c.keywords.some((k) => k.toLowerCase() === lowerWord),
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
      className="no-arrow !max-w-none !rounded-16 !bg-transparent !p-0"
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

interface HighlightedTextProps {
  /** The full text to scan for keywords */
  text: string;
  /** Tags used to look up the matching creative. When omitted, checks all creatives. */
  tags?: string[];
  /** Optional className for the container */
  className?: string;
}

/**
 * HighlightedText Component
 *
 * Scans text for sponsored keywords and wraps them with HighlightedWord components.
 * Non-matching text is rendered as-is.
 *
 * @example
 * ```tsx
 * <HighlightedText text="Learn about AI and machine learning" />
 * // "AI" would be highlighted if it's a sponsored keyword
 * ```
 */
export const HighlightedText = ({
  text,
  tags,
  className,
}: HighlightedTextProps): ReactElement => {
  const { getHighlightedWordConfig } = useBrandSponsorship();
  const { creatives } = useEngagementAdsContext();

  // Build a highlight config: from specific tags, or by merging all creatives' keywords
  const config = useMemo(() => {
    if (tags?.length) {
      return getHighlightedWordConfig(tags).config;
    }

    if (!creatives.length) {
      return null;
    }

    // Merge all creatives' keywords into one config for text scanning
    const allKeywords = creatives.flatMap((c) => c.keywords);

    if (!allKeywords.length) {
      return null;
    }

    return {
      keywords: allKeywords,
      highlightStyle: 'dotted' as const,
      triggerOn: 'hover' as const,
      tooltipTitle: '',
      tooltipDescription: '',
    };
  }, [tags, creatives, getHighlightedWordConfig]);

  const parts = useMemo((): ReactNode[] => {
    if (!config || !text) {
      return [text];
    }

    const matches = findHighlightedKeywords(text, config);

    if (matches.length === 0) {
      return [text];
    }

    // Only highlight the first match
    const match = matches[0];

    return [
      text.slice(0, match.start),
      <HighlightedWord key="highlight-0" word={match.keyword} tags={tags} />,
      text.slice(match.end),
    ];
  }, [text, tags, config]);

  return <span className={className}>{parts}</span>;
};

export default HighlightedWord;
