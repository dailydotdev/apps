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
import {
  UpvoteIcon,
  DiscussIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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
        first: 8,
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

function FeedPeekCard({ post }: { post: PeekPost }): ReactElement {
  return (
    <div className="border-white/10 w-full rounded-16 border bg-white/[0.05] p-3 shadow-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {!!post.source?.image && (
          <img
            src={post.source.image}
            alt=""
            className="bg-white/10 size-6 rounded-full object-cover"
          />
        )}
        <span className="text-white/60 truncate typo-footnote">
          {post.source?.name}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-left font-bold text-white typo-callout">
        {post.title}
      </p>
      <div className="mt-3 flex items-center gap-4 text-white/50">
        <span className="flex items-center gap-1 typo-caption1">
          <UpvoteIcon size={IconSize.Size16} />
          {post.numUpvotes ?? 0}
        </span>
        <span className="flex items-center gap-1 typo-caption1">
          <DiscussIcon size={IconSize.Size16} />
          {post.numComments ?? 0}
        </span>
      </div>
    </div>
  );
}

function FeedPeekRail({ posts }: { posts: PeekPost[] }): ReactElement {
  const visible = posts.slice(0, 4);
  return (
    <div
      aria-hidden
      className="pointer-events-none relative hidden w-[19rem] shrink-0 self-stretch overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%,#000_84%,transparent_100%)] laptop:block"
    >
      <div className="top-hero-feed-scroll absolute inset-x-0 top-0">
        {/* Render the set twice so a -50% translate loops seamlessly. */}
        {['a', 'b'].map((set) =>
          visible.map((post) => (
            <div key={`${set}-${post.id}`} className="mb-3">
              <FeedPeekCard post={post} />
            </div>
          )),
        )}
      </div>
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
  const showPeek = variant === 'signin' && feedPeek.length >= 4;

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

  return chrome(
    <div
      className={classNames(
        'flex flex-col items-center gap-8 px-6 py-14 text-center',
        showPeek
          ? 'laptop:flex-row laptop:items-stretch laptop:justify-between laptop:gap-6 laptop:py-12 laptop:pl-10 laptop:pr-0 laptop:text-left'
          : 'tablet:py-16',
      )}
    >
      <div className="flex flex-col items-center laptop:items-start laptop:justify-center">
        <BrandLockup />
        <h2
          className={classNames(
            'mt-6 text-balance typo-title1 tablet:typo-mega2',
            onboardingGradientClasses,
          )}
        >
          Make this feed yours
        </h2>
        <p className="text-white/70 mt-3 max-w-[24rem] text-balance typo-callout tablet:typo-title3">
          The dev news, tools, and discussions that matter — in every new tab.
        </p>
        <div
          className={classNames(
            'mt-7 flex w-full max-w-80 flex-col gap-3',
            showPeek && 'laptop:mx-0',
          )}
        >
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
      {showPeek && <FeedPeekRail posts={feedPeek} />}
    </div>,
  );
}
