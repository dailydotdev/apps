import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { Tag } from '../../graphql/feedSettings';
import { capitalize } from '../../lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { TagElement } from '../../components/tags/TagElement';
import { onboardingGradientClasses } from '../../components/onboarding/common';
import { useAnonFeedTags } from './useAnonFeedTags';
import { useTypewriter } from './useTypewriter';
import { LivePulse } from './LivePulse';
import { AnimatedFeedPreview } from './AnimatedFeedPreview';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface BuildFeedConversionCardProps {
  post: Post;
}

const MAX_CHIPS = 6;

const borderGradient: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, var(--theme-accent-cabbage-default), var(--theme-accent-onion-default), var(--theme-accent-water-default), var(--theme-accent-cabbage-default))',
  backgroundSize: '200% 100%',
  animation: 'bf-border-shift 6s linear infinite',
};

/**
 * The standout anonymous conversion surface. Rather than listing features, it
 * *shows* the product working: an animated gradient frame, a live "building
 * your feed" line that types out the reader's own topics, real posts streaming
 * in to form a feed before their eyes, a real-time activity pulse, and inline
 * one-tap signup. Built to land the aha moment.
 */
export const BuildFeedConversionCard = ({
  post,
}: BuildFeedConversionCardProps): ReactElement => {
  const { chips, selectedTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  const typewriterWords =
    chips.length > 0 ? chips.map(capitalize) : ['your stack', 'dev news'];
  const typed = useTypewriter(typewriterWords);

  return (
    <div className="rounded-[17px] p-px shadow-2" style={borderGradient}>
      <style>
        {`@keyframes bf-border-shift { to { background-position: 200% center; } }
          @keyframes bf-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }`}
      </style>
      <div className="flex flex-col gap-4 rounded-16 bg-background-default p-4">
        <header className="flex flex-col gap-2">
          <Typography
            bold
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="uppercase tracking-wider"
          >
            Built for developers like you
          </Typography>
          <Typography
            bold
            tag={TypographyTag.H2}
            type={TypographyType.LargeTitle}
            className={onboardingGradientClasses}
          >
            Your personalized dev feed
          </Typography>
          <div className="flex items-center font-mono text-text-secondary typo-footnote">
            <span className="text-text-quaternary">{'> '}</span>
            <span className="ml-1">building feed for&nbsp;</span>
            <span className="font-bold text-text-primary">{typed}</span>
            <span
              aria-hidden
              className="ml-px inline-block h-3.5 w-px bg-text-primary"
              style={{ animation: 'bf-blink 1s step-end infinite' }}
            />
          </div>
          <LivePulse post={post} />
        </header>

        <div className="flex flex-col gap-1.5 rounded-12 bg-surface-float p-2">
          <Typography
            bold
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="px-1 uppercase tracking-wider"
          >
            Streaming now
          </Typography>
          <AnimatedFeedPreview tags={selectedTags} currentPostId={post?.id} />
        </div>

        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="uppercase tracking-wider"
          >
            Tune your topics
          </Typography>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, MAX_CHIPS).map((tag) => (
              <TagElement
                key={tag}
                tag={{ name: tag } as Tag}
                isSelected={selectedTags.includes(tag)}
                onClick={({ tag: clicked }) =>
                  clicked.name && toggleTag(clicked.name)
                }
              />
            ))}
          </div>
        </div>

        <BuildFeedAuthOptions tags={selectedTags} origin="sidebar" />
      </div>
    </div>
  );
};
