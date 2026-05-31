import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import CloseButton from '../../components/CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { highlightsTitleGradientClassName } from '../../components/cards/highlight/common';
import { useAnonFeedTags } from './useAnonFeedTags';
import { useBuildFeedSignup } from './useBuildFeedSignup';
import type { BuildFeedSignupOrigin } from './useBuildFeedSignup';

interface AnonConversionPromptProps {
  post: Post;
  reason: BuildFeedSignupOrigin | null;
  onClose: () => void;
}

const COPY: Record<
  BuildFeedSignupOrigin,
  { title: string; body: string; cta: string }
> = {
  value_moment: {
    title: 'Liked this read?',
    body: 'Get one tuned to you every morning — no noise, just what matters.',
    cta: 'Build my feed',
  },
  exit_intent: {
    title: 'Before you go',
    body: "We'll line up more like this so it's waiting when you're back.",
    cta: 'Save my feed',
  },
  read_intent: {
    title: "We'll keep this for you",
    body: 'Save this article and get a feed of more like it, tuned to you.',
    cta: 'Build my feed',
  },
  sidebar: {
    title: 'Build your personalized feed',
    body: 'Get tech news, tools, and discussions that actually matter.',
    cta: 'Build my feed',
  },
};

/**
 * The single, timed conversion surface for anonymous readers. Controlled by
 * useAnonConversionPrompt — it appears once at the value moment / exit intent
 * / intercepted read click, framed around the feed (not "sign up"), and
 * carries the topics they've been following into the signup.
 */
export const AnonConversionPrompt = ({
  post,
  reason,
  onClose,
}: AnonConversionPromptProps): ReactElement | null => {
  const { triggerSignup } = useBuildFeedSignup();
  const { selectedTags } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  if (!reason) {
    return null;
  }

  const copy = COPY[reason];
  const topics = selectedTags.slice(0, 3);

  return (
    <div
      role="dialog"
      aria-label={copy.title}
      className={classNames(
        'fixed bottom-4 left-1/2 z-max w-[calc(100%-2rem)] max-w-[26rem] -translate-x-1/2',
        'flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2',
      )}
    >
      <CloseButton
        type="button"
        size={ButtonSize.Small}
        className="absolute right-2 top-2"
        onClick={onClose}
      />
      <Typography
        bold
        type={TypographyType.Title3}
        className={highlightsTitleGradientClassName}
      >
        {copy.title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {copy.body}
      </Typography>
      {topics.length > 0 && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Starting with {topics.join(', ')}
          {selectedTags.length > topics.length ? ' and more' : ''}.
        </Typography>
      )}
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="w-full"
        onClick={() => {
          triggerSignup(selectedTags, reason);
          onClose();
        }}
      >
        {copy.cta}
      </Button>
    </div>
  );
};
