import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  providerMap,
  type SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { onboardingGradientClasses } from '@dailydotdev/shared/src/components/onboarding/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';

type CoverVariant = 'continue' | 'signin' | 'onboarding';

const primaryCta =
  'shadow-2-cabbage transition-transform duration-200 ease-out hover:-translate-y-0.5';

const glassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

interface PeekPost {
  id: string;
  title: string;
  numUpvotes?: number;
  numComments?: number;
  source?: { name?: string; image?: string };
}

const FEED_PEEK_QUERY = gql`
  query HijackingFeedPeek($first: Int, $supportedTypes: [String!]) {
    page: mostUpvotedFeed(first: $first, supportedTypes: $supportedTypes) {
      edges {
        node {
          id
          title
          numUpvotes
          numComments
          source {
            name
            image
          }
        }
      }
    }
  }
`;

interface FeedPeekData {
  page?: { edges?: { node: PeekPost }[] };
}

function useFeedPeek(enabled: boolean): PeekPost[] {
  const { data } = useQuery({
    queryKey: ['hijacking', 'feed-peek'],
    queryFn: () =>
      gqlClient.request<FeedPeekData>(FEED_PEEK_QUERY, {
        first: 18,
        supportedTypes: ['article'],
      }),
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  return (data?.page?.edges ?? [])
    .map((edge) => edge.node)
    .filter((node): node is PeekPost => !!node?.title);
}

function BrandLockup(): ReactElement {
  return (
    <span className="flex items-center gap-2 text-white">
      <LogoIcon className={{ container: 'h-7 w-auto' }} />
      <LogoText className={{ container: 'h-6 w-auto' }} />
    </span>
  );
}

function formatCompactCount(value: number): string {
  if (value < 1000) {
    return `${value}`;
  }

  return `${Math.floor(value / 100) / 10}k`;
}

function BriefingCard({ posts }: { posts: PeekPost[] }): ReactElement {
  const discussions = posts.reduce(
    (total, post) => total + (post.numComments ?? 0),
    0,
  );
  const sources = Array.from(
    new Set(
      posts
        .map((post) => post.source?.name)
        .filter((name): name is string => !!name),
    ),
  );
  const topSource = sources[0];

  if (!posts.length) {
    return (
      <div className="w-full max-w-[21rem] rounded-24 bg-white/[0.05] p-4 text-left shadow-2 backdrop-blur-sm">
        <div className="text-white/90 flex items-center gap-2 typo-callout">
          <span className="size-2 rounded-full bg-accent-cabbage-default" />
          Your briefing is waiting
        </div>
        <p className="text-white/60 mt-3 typo-footnote">
          Sign in once and daily.dev can remember what you read, save, and care
          about.
        </p>
        <div className="mt-5 grid gap-2">
          {['Personalized topics', 'Saved reads', 'Real reputation'].map(
            (item) => (
              <div
                key={item}
                className="text-white/70 rounded-12 bg-white/[0.05] px-3 py-2 typo-footnote"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  const topPost = posts[0];
  const sourceLabel =
    sources.length > 1 ? `${sources.length} sources` : topSource;

  return (
    <div className="w-full max-w-[21rem] rounded-24 bg-white/[0.05] p-4 text-left shadow-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="text-white/90 flex items-center gap-2 typo-callout">
          <span className="size-2 rounded-full bg-accent-cabbage-default" />
          Live briefing
        </div>
        <span className="rounded-10 bg-white/[0.06] px-2.5 py-1 text-white/50 typo-caption1">
          now
        </span>
      </div>
      <p className="mt-4 line-clamp-3 font-bold text-white typo-title3">
        {topPost.title}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-12 bg-white/[0.05] px-3 py-2">
          <p className="text-white typo-callout">{posts.length}</p>
          <p className="text-white/50 typo-caption1">fresh reads</p>
        </div>
        <div className="rounded-12 bg-white/[0.05] px-3 py-2">
          <p className="text-white typo-callout">
            {formatCompactCount(discussions)}
          </p>
          <p className="text-white/50 typo-caption1">comments</p>
        </div>
      </div>
      {!!sourceLabel && (
        <p className="mt-3 text-white/50 typo-footnote">
          Trending across {sourceLabel}
        </p>
      )}
    </div>
  );
}

function HeroBenefits({ posts }: { posts: PeekPost[] }): ReactElement {
  const sources = Array.from(
    new Set(
      posts
        .map((post) => post.source?.name)
        .filter((name): name is string => !!name),
    ),
  );

  if (!posts.length) {
    return (
      <div className="text-white/60 mt-6 flex flex-wrap justify-center gap-2 tablet:justify-start">
        <span className="rounded-12 bg-white/[0.05] px-3 py-2 typo-footnote">
          remembers your topics
        </span>
        <span className="rounded-12 bg-white/[0.05] px-3 py-2 typo-footnote">
          keeps your saves
        </span>
        <span className="rounded-12 bg-white/[0.05] px-3 py-2 typo-footnote">
          carries your reputation
        </span>
      </div>
    );
  }

  const comments = posts.reduce(
    (total, post) => total + (post.numComments ?? 0),
    0,
  );

  return (
    <div className="text-white/60 mt-6 flex flex-wrap justify-center gap-2 tablet:justify-start">
      <span className="rounded-12 bg-white/[0.05] px-3 py-2 typo-footnote">
        {posts.length} fresh reads waiting
      </span>
      <span className="rounded-12 px-3 py-2 typo-footnote">
        {formatCompactCount(comments)} comments
      </span>
      {!!sources.length && (
        <span className="rounded-12 px-3 py-2 typo-footnote">
          across {sources.length} sources
        </span>
      )}
    </div>
  );
}

export default function HijackingLoginStrip(): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { signBack, provider, isLoaded: isSignBackLoaded } = useSignBack();
  const hasLoggedImpression = useRef(false);

  const isLoggedOut = !user;
  const hasContinueAs = isLoggedOut && isSignBackLoaded && !!signBack?.name;
  const firstName = signBack?.name?.split(' ')[0] ?? signBack?.name;
  const socialProvider =
    provider && provider !== 'password'
      ? (provider as SocialProvider)
      : undefined;
  const providerIcon = socialProvider
    ? providerMap[socialProvider]?.icon
    : undefined;

  const variant: CoverVariant = (() => {
    if (!isLoggedOut) {
      return 'onboarding';
    }

    return hasContinueAs ? 'continue' : 'signin';
  })();

  const feedPeek = useFeedPeek(variant === 'signin');

  const onboardingHref = (() => {
    const base = new URL(onboardingUrl);
    base.searchParams.append('r', 'extension');

    return base.toString();
  })();

  const logClick = (targetType: TargetType): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: targetType,
      target_id: 'hijacking',
    });
  };

  useEffect(() => {
    if (hasLoggedImpression.current) {
      return;
    }
    hasLoggedImpression.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type:
        variant === 'signin' ? TargetType.SignupButton : TargetType.LoginButton,
      target_id: 'hijacking',
    });
  }, [variant, logEvent]);

  const onSignupClick = (): void => {
    logClick(TargetType.SignupButton);
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  };

  const onLoginClick = (): void => {
    logClick(TargetType.LoginButton);
    showLogin({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: true },
    });
  };

  const chrome = (children: ReactNode): ReactElement => (
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 bg-raw-pepper-90 shadow-2">
        <div className="top-hero-aurora pointer-events-none absolute inset-0" />
        <div className="dark relative z-1">{children}</div>
      </div>
    </section>
  );

  if (variant === 'onboarding') {
    return chrome(
      <div className="flex flex-col items-center px-6 py-14 text-center tablet:py-16">
        <BrandLockup />
        <h2
          className={classNames(
            'mt-6 text-balance typo-title1 tablet:typo-mega2',
            onboardingGradientClasses,
          )}
        >
          Let&apos;s jump back in!
        </h2>
        <p className="text-white/70 mt-3 max-w-[24rem] text-balance typo-callout tablet:typo-title3">
          Finish onboarding to unlock the full daily.dev experience.
        </p>
        <Button
          tag="a"
          href={onboardingHref}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-7', primaryCta)}
          onClick={() => logClick(TargetType.LoginButton)}
        >
          Continue&nbsp;➔
        </Button>
      </div>,
    );
  }

  if (variant === 'continue' && signBack) {
    return chrome(
      <div className="flex flex-col items-center px-6 py-14 text-center tablet:py-16">
        <div className="relative">
          <ProfilePicture
            user={signBack}
            size={ProfileImageSize.XXXXLarge}
            nativeLazyLoading
            className="ring-white/20 ring-2"
          />
          {!!providerIcon && (
            <span className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-10 bg-white text-surface-invert shadow-2 ring-2 ring-raw-pepper-90">
              {providerIcon}
            </span>
          )}
        </div>
        <h2
          className={classNames(
            'mt-6 text-balance typo-title1 tablet:typo-mega2',
            onboardingGradientClasses,
          )}
        >
          Welcome back, {firstName}!
        </h2>
        {!!signBack?.email && (
          <p className="text-white/70 mt-2 typo-callout">{signBack.email}</p>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className={classNames('mt-6 w-full max-w-80', primaryCta)}
          onClick={onLoginClick}
        >
          Continue as {firstName}&nbsp;➔
        </Button>
        <div className="text-white/60 mt-5 flex items-center gap-1.5 typo-footnote">
          Not you?
          <ClickableText
            className="font-bold !text-white"
            onClick={onLoginClick}
          >
            Use another account
          </ClickableText>
        </div>
        <div className="text-white/60 mt-2 flex items-center gap-1.5 typo-footnote">
          New here?
          <ClickableText
            className="font-bold !text-white"
            onClick={onSignupClick}
          >
            Create an account
          </ClickableText>
        </div>
      </div>,
    );
  }

  return (
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 bg-raw-pepper-90 shadow-2">
        <div className="top-hero-aurora pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div className="via-white/25 pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
        <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -left-28 bottom-0 hidden h-72 w-72 rounded-full blur-3xl tablet:block" />
        <div className="bg-accent-onion-default/10 pointer-events-none absolute -right-28 top-4 hidden h-72 w-72 rounded-full blur-3xl tablet:block" />
        <div className="dark relative z-1 mx-auto grid min-h-[22rem] w-full max-w-[64rem] items-center gap-8 px-6 py-14 text-center tablet:min-h-[28rem] tablet:grid-cols-[minmax(0,1fr)_21rem] tablet:px-10 tablet:py-16 tablet:text-left">
          <div className="flex flex-col items-center tablet:items-start">
            <div className="rounded-16 bg-white/[0.04] px-4 py-3 shadow-2 backdrop-blur-sm">
              <BrandLockup />
            </div>
            <h2
              className={classNames(
                'mt-7 max-w-[42rem] text-balance typo-title1 tablet:typo-mega2',
                onboardingGradientClasses,
              )}
            >
              Make every new tab feel like yours.
            </h2>
            <p className="text-white/70 mt-4 max-w-[31rem] text-balance typo-callout tablet:typo-title3">
              Sign in to turn daily.dev into a calm briefing built around what
              you read, save, upvote, and discuss.
            </p>
            <HeroBenefits posts={feedPeek} />
            <div className="mt-8 flex w-full max-w-80 flex-col gap-3 tablet:mx-0">
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                className={classNames('w-full', primaryCta)}
                onClick={onSignupClick}
              >
                Sign up
              </Button>
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Large}
                className={classNames('w-full', glassCta)}
                onClick={onLoginClick}
              >
                Log in
              </Button>
            </div>
          </div>
          <div className="flex justify-center tablet:justify-end">
            <BriefingCard posts={feedPeek} />
          </div>
        </div>
      </div>
    </section>
  );
}
