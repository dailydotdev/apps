import type {
  FocusEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useClickbaitTries } from '../../hooks/useClickbaitTries';
import { useFeedPreviewMode } from '../../hooks/useFeedPreviewMode';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { useHasIntroQuests } from '../../hooks/useHasIntroQuests';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureClickbaitShieldIntroQuests } from '../../lib/featureManagement';
import { LogEvent, TargetId } from '../../lib/log';
import { DevPlusIcon } from '../icons/DevPlus';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import { ElementPlaceholder } from '../ElementPlaceholder';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { PlusPreview } from './PlusPreview';

const smartTitleUnderline =
  'underline decoration-text-quaternary decoration-dotted decoration-1 underline-offset-4';

const hasClickbaitTitle = (post: Post): boolean =>
  post.sharedPost
    ? !post.title && !!post.sharedPost.clickbaitTitleDetected
    : !!post.clickbaitTitleDetected;

const useShowCleanTitleHint = (post: Post): boolean => {
  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const isFeedPreview = useFeedPreviewMode();
  const hasIntroQuests = useHasIntroQuests({ shouldEvaluate: !isPlus });
  const { value: showDuringIntroQuests } = useConditionalFeature({
    feature: featureClickbaitShieldIntroQuests,
    shouldEvaluate: !isPlus && hasIntroQuests,
  });

  if (hasIntroQuests && !showDuringIntroQuests) {
    return false;
  }

  return isLoggedIn && !isPlus && !isFeedPreview && hasClickbaitTitle(post);
};

const CleanTitle = ({ post }: { post: Post }): ReactElement => {
  const { smartTitle, smartTitleFailed, previewSmartTitle } =
    useSmartTitle(post);
  const { maxTries, triesLeft } = useClickbaitTries();
  const [isLoading, setIsLoading] = useState(false);

  if (!smartTitle && !isLoading && triesLeft <= 0) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        You have seen {maxTries} clean titles this month. Plus rewrites every
        one.
      </Typography>
    );
  }

  const showCleanTitle = async () => {
    setIsLoading(true);
    await previewSmartTitle();
    setIsLoading(false);
  };

  return (
    <>
      <span className="flex items-center gap-1 text-accent-bacon-subtlest typo-caption1">
        <DevPlusIcon aria-hidden size={IconSize.Size16} />
        Clean title by Plus
      </span>
      {smartTitle && (
        <Typography type={TypographyType.Callout} bold>
          {smartTitle}
        </Typography>
      )}
      {isLoading && <ElementPlaceholder className="h-5 w-4/5 rounded-6" />}
      {!smartTitle && !isLoading && (
        <div className="flex items-center justify-between gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {smartTitleFailed
              ? 'The clean title did not load.'
              : `${triesLeft} free left this month`}
          </Typography>
          {!smartTitleFailed && (
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={showCleanTitle}
            >
              Show clean title
            </Button>
          )}
        </div>
      )}
    </>
  );
};

// Pointer focus lands on the title with every click or tap, so only keyboard
// focus opens the card.
const openOnKeyboardFocus = (event: FocusEvent<HTMLElement>): void => {
  if (!event.target.matches(':focus-visible')) {
    event.preventDefault();
  }
};

interface CleanTitleLinkProps {
  href: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onAuxClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface CleanTitlePreviewProps {
  post: Post;
  children: ReactNode;
  /**
   * The card's own link. Inside a clickable card the title has to sit above
   * the card link to receive hover, so it repeats that link to keep opening
   * the post. It stays out of the tab order: the card link is the tab stop.
   */
  linkProps?: CleanTitleLinkProps;
}

export const CleanTitlePreview = ({
  post,
  children,
  linkProps,
}: CleanTitlePreviewProps): ReactElement => {
  const showHint = useShowCleanTitleHint(post);
  const { logSubscriptionEvent } = usePlusSubscription();

  if (!showHint) {
    return <>{children}</>;
  }

  return (
    <PlusPreview
      side="bottom"
      context={<CleanTitle post={post} />}
      onAction={() =>
        logSubscriptionEvent({
          event_name: LogEvent.UpgradeSubscription,
          target_id: TargetId.ClickbaitShield,
        })
      }
    >
      <span className={smartTitleUnderline} onFocus={openOnKeyboardFocus}>
        {linkProps ? (
          <Link href={linkProps.href}>
            <a
              href={linkProps.href}
              rel={linkProps.rel}
              onClick={linkProps.onClick}
              onAuxClick={linkProps.onAuxClick}
              tabIndex={-1}
              className="pointer-events-auto relative z-1"
            >
              {children}
            </a>
          </Link>
        ) : (
          children
        )}
      </span>
    </PlusPreview>
  );
};

// Touch has no hover, so the post page offers the clean title inline. With a
// mouse the line stays hidden until keyboard focus reaches it.
export const CleanTitleReveal = ({
  post,
  className,
}: {
  post: Post;
  className?: string;
}): ReactElement | null => {
  const showHint = useShowCleanTitleHint(post);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!showHint) {
    return null;
  }

  if (isRevealed) {
    return (
      <div
        className={classNames(
          'flex flex-col gap-1.5 border-l-2 border-border-subtlest-tertiary pl-3',
          className,
        )}
      >
        <CleanTitle post={post} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex items-center gap-1.5 text-text-tertiary typo-footnote mouse:sr-only mouse:focus-visible:not-sr-only',
        className,
      )}
      onClick={() => setIsRevealed(true)}
    >
      <DevPlusIcon
        aria-hidden
        size={IconSize.Size16}
        className="text-action-plus-default"
      />
      <span className={smartTitleUnderline}>See the clean title</span>
    </button>
  );
};
