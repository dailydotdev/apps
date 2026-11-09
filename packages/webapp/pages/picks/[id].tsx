import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import {
  getNewPicksPath,
  picksQueryOptions,
  picksViewCountQueryOptions,
  trackPicksView,
} from '@dailydotdev/shared/src/graphql/picks';
import type { Picks, PicksItem } from '@dailydotdev/shared/src/graphql/picks';
import {
  getCurrentWeekStart,
  getIsoWeekNumber,
  getPickPostHref,
  isNewPicksViewer,
} from '@dailydotdev/shared/src/lib/picks';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSharePicks } from '@dailydotdev/shared/src/hooks/picks/useSharePicks';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { AFTER_AUTH_PARAM } from '@dailydotdev/shared/src/components/auth/common';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  formatReadTime,
  ResponsivePageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  PicksSignupBanner,
  usePicksSignupBannerGate,
} from '@dailydotdev/shared/src/components/picks/PicksSignupBanner';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import {
  defaultOpenGraph,
  getShareImageUrl,
  noindexSeoProps,
} from '../../next-seo';

const PICKS_PAGE_ORIGIN = 'picks_page';

interface PicksPageProps {
  picksId: string;
  seo: NextSeoProps;
  dehydratedState: DehydratedState;
}

const getOpensLabel = (count: number): string =>
  count ? `Opened by ${count}` : 'Not opened yet';

const getPostsLabel = (picks: Picks): string => {
  const count = picks.items.length;

  return `${count} ${count === 1 ? 'post' : 'posts'} worth your time, picked by ${picks.author.name}`;
};

const PickRow = ({
  item,
  picks,
  onAdd,
}: {
  item: PicksItem;
  picks: Picks;
  /** Absent for the author: their own picks cannot be added to themselves */
  onAdd?: (postId: string) => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { post, note, position } = item;
  const href = getPickPostHref(post.commentsPermalink, picks.author.id);

  return (
    <li className="flex items-center gap-2 border-b border-border-subtlest-tertiary last:border-0">
      <Link href={href} passHref>
        <a
          href={href}
          className="focus-outline -ml-2 flex min-w-0 flex-1 items-start gap-3 rounded-12 px-2 py-3 hover:bg-surface-hover"
          onClick={() =>
            logEvent({
              event_name: LogEvent.ClickPickPost,
              origin: Origin.PicksPage,
              extra: JSON.stringify({
                picks_id: picks.id,
                post_id: post.id,
                position,
              }),
            })
          }
        >
          <Image
            src={post.image ?? undefined}
            alt=""
            loading="lazy"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
            className="size-20 rounded-12 object-cover"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-1 break-words">
            <span className="line-clamp-3 font-bold text-text-primary typo-callout">
              {post.title}
            </span>
            {!!note && (
              <span className="italic text-text-secondary typo-callout">
                {note}
              </span>
            )}
            {!!post.readTime && (
              <span className="text-text-tertiary typo-footnote">
                {formatReadTime(post.readTime)} read
              </span>
            )}
          </span>
        </a>
      </Link>
      {!!onAdd && (
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          aria-label="Add to my picks"
          className="shrink-0"
          onClick={() => onAdd(post.id)}
        >
          <span className="hidden tablet:inline">Add to my picks</span>
          <span className="tablet:hidden">Add</span>
        </Button>
      )}
    </li>
  );
};

const PicksPage = ({ picksId }: PicksPageProps): ReactElement | null => {
  const router = useRouter();
  const { user, isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const { data: picks } = useQuery({
    ...picksQueryOptions(picksId),
    staleTime: StaleTime.OneMinute,
  });
  const hasLoggedView = useRef(false);
  const hasTrackedView = useRef(false);
  const isAuthor = !!user && user.id === picks?.author.id;
  // Read fresh on every visit, so the count the notification promised is
  // the count shown.
  const { data: viewCount } = useQuery({
    ...picksViewCountQueryOptions(picksId, user),
    enabled: isAuthor,
  });
  const { openShareSheet } = useSharePicks();
  const { isPinned: isSignupBannerPinned } = usePicksSignupBannerGate();
  // `/picks/new` edits the current week, so only this week's list is editable
  const isEditable = isAuthor && picks?.weekStart === getCurrentWeekStart();

  useEffect(() => {
    if (!picks || !isAuthReady || hasLoggedView.current) {
      return;
    }

    hasLoggedView.current = true;
    logEvent({
      event_name: LogEvent.ViewPicksPage,
      origin: Origin.PicksPage,
      extra: JSON.stringify({
        picks_id: picks.id,
        is_author: isAuthor,
        logged_in: isLoggedIn,
        is_new_user: isNewPicksViewer(user?.createdAt),
      }),
    });
  }, [picks, isAuthReady, isAuthor, isLoggedIn, user?.createdAt, logEvent]);

  // One open per viewer per list; the API dedupes, this only saves a call
  // for the author. Failing to count must never affect the page.
  useEffect(() => {
    if (!picks || !isAuthReady || isAuthor || hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;
    trackPicksView(picks.id).catch(() => undefined);
  }, [picks, isAuthReady, isAuthor]);

  if (!picks) {
    return null;
  }

  const items = [...picks.items].sort((a, b) => a.position - b.position);

  // Coming from someone else's page fills an empty picker with its posts and
  // opens the editor outside the rollout. The author's own page has nothing
  // to fill from.
  const fromPicksId = isAuthor ? undefined : picks.id;

  const goToEditor = (path: string) => {
    if (isLoggedIn) {
      router.push(path);
      return;
    }

    // Same hand-off ProtectedPage uses: onboarding/auth, then `after_auth`.
    router.push(
      `${onboardingUrl}?${new URLSearchParams({
        [AFTER_AUTH_PARAM]: path,
      }).toString()}`,
    );
  };

  const onMakePicks = () => {
    logEvent({
      event_name: LogEvent.ClickMakeYourPicks,
      origin: Origin.PicksPage,
      extra: JSON.stringify({ picks_id: picks.id, logged_in: isLoggedIn }),
    });
    goToEditor(
      getNewPicksPath({ origin: PICKS_PAGE_ORIGIN, from: fromPicksId }),
    );
  };

  const onAddToPicks = (postId: string) => {
    logEvent({
      event_name: LogEvent.ClickAddToPicks,
      origin: Origin.PicksPage,
      extra: JSON.stringify({
        picks_id: picks.id,
        post_id: postId,
        logged_in: isLoggedIn,
      }),
    });
    goToEditor(
      getNewPicksPath({
        origin: PICKS_PAGE_ORIGIN,
        from: picks.id,
        add: postId,
      }),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[42.5rem]">
      <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10 pt-4 tablet:pt-6">
        <header className="flex items-center gap-3">
          <ProfilePicture user={picks.author} size={ProfileImageSize.XLarge} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="break-words"
            >
              {picks.author.name}&apos;s picks · week{' '}
              {getIsoWeekNumber(picks.weekStart)}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="break-words"
            >
              {getPostsLabel(picks)}
            </Typography>
            {isAuthor && typeof viewCount === 'number' && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {getOpensLabel(viewCount)}
              </Typography>
            )}
          </div>
          {isAuthor && (
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={() => openShareSheet(picks, Origin.PicksPage)}
            >
              Share
            </Button>
          )}
        </header>
        <PicksSignupBanner picks={picks} />
        {items.length ? (
          <ul className="flex flex-col">
            {items.map((item) => (
              <PickRow
                key={item.post.id}
                item={item}
                picks={picks}
                onAdd={isAuthor ? undefined : onAddToPicks}
              />
            ))}
          </ul>
        ) : (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            These picks are no longer available
          </Typography>
        )}
        <section className="flex flex-col items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <Typography
            type={TypographyType.Body}
            bold
            color={TypographyColor.Primary}
          >
            {isEditable
              ? 'Changed your mind? You can edit these picks until the week ends'
              : 'Read something good this week? Make your own picks in 30 seconds'}
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={onMakePicks}
          >
            {isEditable ? "Edit this week's picks" : 'Make your picks'}
          </Button>
        </section>
        {/* The pinned banner covers the window's bottom edge on laptop */}
        {isSignupBannerPinned && <div aria-hidden className="h-72" />}
      </ResponsivePageContainer>
    </div>
  );
};

const getPicksPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

PicksPage.getLayout = getPicksPageLayout;

export const getServerSideProps: GetServerSideProps<
  PicksPageProps,
  { id: string }
> = async ({ params, res }) => {
  const id = params?.id;

  if (!id) {
    return { notFound: true };
  }

  const queryClient = new QueryClient();
  const picks = await queryClient.fetchQuery(picksQueryOptions(id));

  if (!picks) {
    return { notFound: true };
  }

  res.setHeader(
    'Cache-Control',
    'public, max-age=0, must-revalidate, s-maxage=60',
  );

  const { name } = picks.author;
  const seoTitles = getPageSeoTitles(`${name}'s weekly picks`);
  const description = getPostsLabel(picks);

  return {
    props: {
      picksId: id,
      dehydratedState: dehydrate(queryClient),
      seo: {
        title: seoTitles.title,
        description,
        openGraph: {
          ...seoTitles.openGraph,
          ...defaultOpenGraph,
          description,
          images: [
            {
              url: getShareImageUrl('picks', id, { userid: picks.author.id }),
              width: 1200,
              height: 630,
            },
          ],
        },
        ...noindexSeoProps,
      },
    },
  };
};

export default PicksPage;
