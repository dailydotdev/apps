import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { useLogContext } from '../../contexts/LogContext';
import { TargetType } from '../../lib/log';
import {
  clearPostSignupActivation,
  hasPostSignupActivation,
} from '../../lib/postSignupActivation';
import { AFTER_AUTH_PARAM } from '../auth/common';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { ArrowIcon, SparkleIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface PostOnboardingActivationProps {
  post: Pick<Post, 'tags'>;
  inline?: boolean;
}

const getSupportingCopy = (tags: string[]): string => {
  if (!tags.length) {
    return 'Pick what you care about. We’ll bring you the tech worth knowing — minus the noise.';
  }

  const topics = tags.slice(0, 2).join(' and ');
  return `Start with ${topics}, then pick what else you care about. We’ll do the filtering.`;
};

export const PostOnboardingActivation = ({
  post,
  inline = false,
}: PostOnboardingActivationProps): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isOnboardingActionsReady, isOnboardingComplete } =
    useOnboardingActions();
  const [isVisible, setIsVisible] = useState(false);
  const hasLoggedImpression = useRef(false);
  const tags = useMemo(() => post.tags?.slice(0, 3) ?? [], [post.tags]);

  useEffect(() => {
    if (!user?.id || !isOnboardingActionsReady) {
      return;
    }

    if (isOnboardingComplete) {
      clearPostSignupActivation();
      return;
    }

    setIsVisible(hasPostSignupActivation(user.id));
  }, [isOnboardingActionsReady, isOnboardingComplete, user?.id]);

  const shouldShow =
    !!user?.id &&
    isOnboardingActionsReady &&
    !isOnboardingComplete &&
    isVisible;

  useEffect(() => {
    if (!shouldShow || hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;
    logEvent({
      event_name: 'impression',
      target_type: TargetType.PostSignupActivation,
      target_id: 'post signup activation',
    });
  }, [logEvent, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const onDismiss = (): void => {
    clearPostSignupActivation();
    setIsVisible(false);
    logEvent({
      event_name: 'click',
      target_type: TargetType.PostSignupActivation,
      target_id: 'dismiss post signup activation',
    });
  };

  const onBuildFeed = (): void => {
    logEvent({
      event_name: 'click',
      target_type: TargetType.PostSignupActivation,
      target_id: 'build feed from post signup activation',
      extra: JSON.stringify({ tags }),
    });

    router.push({
      pathname: '/onboarding',
      query: { [AFTER_AUTH_PARAM]: router.asPath },
    });
  };

  return (
    <aside
      aria-label="Personalize your feed"
      className={classNames(
        'isolate overflow-hidden border border-accent-cabbage-default bg-surface-float shadow-2-cabbage',
        inline
          ? 'relative mx-4 mt-6 rounded-16'
          : 'fixed bottom-0 left-0 z-modal w-full border-x-0 border-b-0',
      )}
    >
      <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-20 -top-24 -z-1 h-56 w-56 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/15 pointer-events-none absolute -right-20 -top-20 -z-1 h-48 w-48 rounded-full blur-3xl" />
      <div
        className={classNames(
          'relative mx-auto flex w-full max-w-[63.75rem] flex-col gap-4 px-4 py-5 pr-14 tablet:px-6 tablet:pr-16',
          !inline &&
            'laptop:flex-row laptop:items-center laptop:gap-6 laptop:py-4',
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="shadow-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-12 bg-accent-cabbage-subtlest text-accent-cabbage-default">
            <SparkleIcon secondary size={IconSize.Small} />
          </div>
          <div className="min-w-0 flex-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Brand}
              bold
              className="uppercase tracking-wide"
            >
              You&apos;re in
            </Typography>
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title3}
              bold
              className="mt-0.5"
            >
              One good post is luck. Build a feed full of them.
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-1"
            >
              {getSupportingCopy(tags)}
            </Typography>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 laptop:max-w-64 laptop:justify-end">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border-accent-cabbage-default/30 rounded-10 border bg-accent-cabbage-subtlest px-2.5 py-1 text-accent-cabbage-default typo-caption1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full shrink-0 tablet:w-auto"
          icon={<ArrowIcon />}
          iconPosition={ButtonIconPosition.Right}
          onClick={onBuildFeed}
        >
          Build my feed
        </Button>

        <CloseButton
          type="button"
          aria-label="Dismiss feed personalization"
          className="absolute right-3 top-3"
          size={ButtonSize.Small}
          onClick={onDismiss}
        />
      </div>
    </aside>
  );
};
