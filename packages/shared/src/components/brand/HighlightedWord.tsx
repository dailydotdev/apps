import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, Fragment } from 'react';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import { SponsoredTooltip } from './SponsoredTooltip';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import type { HighlightStyle } from '../../lib/brand';

interface HighlightedWordProps {
  /** The word/text to highlight */
  word: string;
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
  className,
}: HighlightedWordProps): ReactElement => {
  const { getHighlightedWordConfig } = useBrandSponsorship();
  const { config, brandName, brandLogo, colors } = getHighlightedWordConfig();

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
        className={classNames(
          'transition-colors',
          highlightClasses,
          className,
        )}
      >
        {word}
      </span>
    </Tooltip>
  );
};

interface HighlightedTextProps {
  /** The full text to scan for keywords */
  text: string;
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
  className,
}: HighlightedTextProps): ReactElement => {
  const { findKeywordsInText, getHighlightedWordConfig } =
    useBrandSponsorship();
  const { config } = getHighlightedWordConfig();

  const parts = useMemo((): ReactNode[] => {
    if (!config || !text) {
      return [text];
    }

    const matches = findKeywordsInText(text);

    if (matches.length === 0) {
      return [text];
    }

    // Only highlight the first match
    const match = matches[0];

    return [
      text.slice(0, match.start),
      <HighlightedWord key="highlight-0" word={match.keyword} />,
      text.slice(match.end),
    ];
  }, [text, config, findKeywordsInText]);

  return <span className={className}>{parts}</span>;
};

export default HighlightedWord;
