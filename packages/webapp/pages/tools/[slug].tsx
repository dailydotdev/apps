import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { NextSeoProps } from 'next-seo';
import type {
  AlsoStackedTool,
  ToolAdoption,
  ToolPageTool,
  ToolStacker,
  ToolTake,
  ToolTopPost,
} from '@dailydotdev/shared/src/graphql/tools';
import {
  getDatasetTool,
  getToolAdoption,
  getToolCategoryAnchor,
  getToolsAlsoStacked,
  getToolStackers,
  getToolStackersFollowing,
  getToolTakes,
  getToolTopPosts,
  getToolVoteState,
  voteTool,
} from '@dailydotdev/shared/src/graphql/tools';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  ToolTopSquad,
  AddUserStackInput,
} from '@dailydotdev/shared/src/graphql/user/userStack';
import { getTopSquadsForTool } from '@dailydotdev/shared/src/graphql/user/userStack';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
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
import {
  DiscussIcon,
  DownvoteIcon,
  PlusIcon,
  ShareIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useUserStack } from '@dailydotdev/shared/src/features/profile/hooks/useUserStack';
import { UserStackModal } from '@dailydotdev/shared/src/features/profile/components/stack/UserStackModal';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import classNames from 'classnames';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';
import { ToolDiscussion } from '../../components/tools/ToolDiscussion';

const TOP_POSTS_COUNT = 5;
const STACKERS_COUNT = 5;
// Mirrors the sitemap inclusion gate in daily-api.
const MIN_INDEXABLE_STACKS = 3;

const appOrigin = getAppOrigin();

const getToolPageJsonLd = (
  tool: ToolPageTool,
  topPosts: ToolTopPost[],
): string => {
  const toolUrl = `${appOrigin}/tools/${tool.slug}`;
  const breadcrumbItems = [
    { name: 'Tools', item: `${appOrigin}/tools` },
    ...(tool.category
      ? [
          {
            name: tool.category,
            item: `${appOrigin}/tools#${getToolCategoryAnchor(tool.category)}`,
          },
        ]
      : []),
    { name: tool.title, item: toolUrl },
  ];

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${toolUrl}#page`,
        url: toolUrl,
        name: `${tool.title} on daily.dev`,
        description: `How developers use ${tool.title}: adoption, squads, related tools and posts.`,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${toolUrl}#breadcrumbs`,
        itemListElement: breadcrumbItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.item,
        })),
      },
      ...(topPosts.length
        ? [
            {
              '@type': 'ItemList',
              '@id': `${toolUrl}#posts`,
              numberOfItems: topPosts.length,
              itemListElement: topPosts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appOrigin}/posts/${post.slug || post.id}`,
                name: post.title || '',
              })),
            },
          ]
        : []),
    ],
  });
};

export interface ToolPageProps {
  tool: ToolPageTool;
  alsoStacked: AlsoStackedTool[];
  topSquads: ToolTopSquad[];
  topPosts: ToolTopPost[];
  stackers: ToolStacker[];
  adoption: ToolAdoption | null;
  takes: ToolTake[];
}

const SPARK_WIDTH = 400;
const SPARK_HEIGHT = 70;

const getSparklinePoints = (adoption: ToolAdoption): string | null => {
  const counts = adoption.monthly.map(({ count }) => count);
  if (counts.length < 2) {
    return null;
  }
  const max = Math.max(...counts, 1);
  const stepX = SPARK_WIDTH / (counts.length - 1);
  return counts
    .map(
      (count, index) =>
        `${Math.round(index * stepX)},${Math.round(
          SPARK_HEIGHT - 6 - (count / max) * (SPARK_HEIGHT - 12),
        )}`,
    )
    .join(' ');
};

const ToolIcon = ({
  title,
  faviconUrl,
  className,
}: {
  title: string;
  faviconUrl: string | null;
  className: string;
}): ReactElement =>
  faviconUrl ? (
    <img src={faviconUrl} alt={`${title} logo`} className={className} />
  ) : (
    <span
      className={`${className} grid place-items-center bg-surface-float font-bold text-text-tertiary`}
    >
      {title.charAt(0).toUpperCase()}
    </span>
  );

const Card = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <div className="flex items-center justify-between gap-2">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
        bold
        className="uppercase tracking-wide"
      >
        {title}
      </Typography>
      {action}
    </div>
    {children}
  </section>
);

const ToolPage = ({
  tool,
  alsoStacked,
  topSquads,
  topPosts,
  stackers,
  adoption,
  takes,
}: ToolPageProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { stackItems, add } = useUserStack(user as PublicProfile);
  const { displayToast } = useToastNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isInStack = useMemo(
    () => stackItems.some((item) => item.tool.id === tool.id),
    [stackItems, tool.id],
  );

  const [copying, onShareOrCopy] = useShareOrCopyLink({
    link: `${webappUrl}tools/${tool.slug}`,
    text: `Check out ${tool.title} on daily.dev`,
  });

  const { data: followedStackers } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserTools,
      user,
      'tool-stackers-following',
      tool.id,
    ),
    queryFn: () => getToolStackersFollowing(tool.id),
    staleTime: StaleTime.OneHour,
    enabled: !!user,
  });

  const queryClient = useQueryClient();
  const voteKey = generateQueryKey(
    RequestKey.UserTools,
    user,
    'tool-vote',
    tool.id,
  );
  const { data: voteState } = useQuery({
    queryKey: voteKey,
    queryFn: () => getToolVoteState(tool.slug),
    initialData: {
      upvotes: tool.upvotes,
      downvotes: tool.downvotes,
      userVote: tool.userVote,
    },
    staleTime: 0,
  });
  const { mutate: sendVote } = useMutation({
    mutationFn: (vote: number) => voteTool(tool.id, vote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteKey }),
    onError: () => displayToast('Failed to vote'),
  });

  const handleVote = useCallback(
    (vote: number) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });
        return;
      }
      sendVote(voteState?.userVote === vote ? 0 : vote);
    },
    [user, showLogin, sendVote, voteState?.userVote],
  );

  const totalVotes = (voteState?.upvotes ?? 0) + (voteState?.downvotes ?? 0);
  const sentiment =
    totalVotes > 0
      ? Math.round(((voteState?.upvotes ?? 0) / totalVotes) * 100)
      : null;

  const handleAddClick = useCallback(() => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.AddToStack });
      return;
    }
    setIsModalOpen(true);
  }, [user, showLogin]);

  const handleAdd = useCallback(
    async (input: AddUserStackInput) => {
      try {
        await add(input);
        displayToast('Added to your stack');
      } catch (error) {
        displayToast('Failed to add item');
        throw error;
      }
    },
    [add, displayToast],
  );

  const websiteHost = tool.url ? new URL(tool.url).hostname : null;

  return (
    <main className="mx-auto flex w-full max-w-screen-laptop flex-col gap-5 px-4 py-6 laptop:px-8">
      <Head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: getToolPageJsonLd(tool, topPosts),
          }}
        />
      </Head>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
      >
        <Link href="/tools" passHref>
          <a className="hover:text-text-primary">Tools</a>
        </Link>
        {tool.category && (
          <>
            {' / '}
            <Link
              href={`/tools#${getToolCategoryAnchor(tool.category)}`}
              passHref
            >
              <a className="hover:text-text-primary">{tool.category}</a>
            </Link>
          </>
        )}
        {' / '}
        <span className="text-text-secondary">{tool.title}</span>
      </Typography>

      <section className="flex flex-wrap items-start gap-5">
        <ToolIcon
          title={tool.title}
          faviconUrl={tool.faviconUrl}
          className="size-[72px] rounded-16 border border-border-subtlest-tertiary object-contain p-2"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            {tool.title}
          </Typography>
          <div className="flex flex-wrap items-center gap-2">
            {tool.url && websiteHost && (
              <a
                href={tool.url}
                target="_blank"
                rel={anchorDefaultRel}
                className="rounded-8 border border-border-subtlest-tertiary px-2.5 py-0.5 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
              >
                {websiteHost}
              </a>
            )}
            {tool.keyword && (
              <Link href={`/tags/${encodeURIComponent(tool.keyword)}`} passHref>
                <a className="rounded-8 border border-border-subtlest-tertiary px-2.5 py-0.5 font-bold text-text-tertiary typo-footnote hover:text-text-primary">
                  #{tool.keyword}
                </a>
              </Link>
            )}
          </div>
        </div>
        <Button
          variant={isInStack ? ButtonVariant.Secondary : ButtonVariant.Primary}
          size={ButtonSize.Medium}
          icon={isInStack ? <VIcon /> : <PlusIcon />}
          disabled={isInStack}
          onClick={handleAddClick}
        >
          {isInStack ? 'In your stack' : 'Add to my stack'}
        </Button>
      </section>

      <section className="flex flex-wrap items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 py-3">
        <div className="flex items-center">
          {stackers.map((stacker, index) => (
            <img
              key={stacker.id}
              src={stacker.image}
              alt={`${stacker.name}'s avatar`}
              className={`size-7 rounded-full border-2 border-background-subtle object-cover ${
                index > 0 ? '-ml-2' : ''
              }`}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <Typography type={TypographyType.Callout} bold>
            {largeNumberFormat(tool.stackCount) ?? tool.stackCount}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            in {tool.stackCount === 1 ? 'stack' : 'stacks'}
            {!!followedStackers?.length && (
              <>
                {' · '}
                <span className="font-bold text-accent-cabbage-default">
                  {followedStackers.length} you follow
                </span>
              </>
            )}
          </Typography>
        </div>
        {sentiment !== null && (
          <div className="hidden min-w-40 max-w-56 flex-1 flex-col gap-1 tablet:flex">
            <div className="flex items-baseline justify-between gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Dev sentiment
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                bold
                className="text-accent-avocado-default"
              >
                {sentiment}%
              </Typography>
            </div>
            <div className="h-1.5 overflow-hidden rounded-2 bg-surface-float">
              <div
                className="h-full rounded-2 bg-accent-avocado-default"
                style={{ width: `${sentiment}%` }}
              />
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<UpvoteIcon secondary={voteState?.userVote === 1} />}
            className={classNames(
              voteState?.userVote === 1 && 'text-accent-avocado-default',
            )}
            onClick={() => handleVote(1)}
            aria-label="Upvote tool"
          >
            {voteState?.upvotes
              ? largeNumberFormat(voteState.upvotes) ?? voteState.upvotes
              : null}
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<DownvoteIcon secondary={voteState?.userVote === -1} />}
            className={classNames(
              voteState?.userVote === -1 && 'text-accent-ketchup-default',
            )}
            onClick={() => handleVote(-1)}
            aria-label="Downvote tool"
          />
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<DiscussIcon />}
            tag="a"
            href="#discussion"
          >
            Discuss
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<ShareIcon secondary={copying} />}
            onClick={() => onShareOrCopy()}
          >
            {copying ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 laptop:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-5">
          {topPosts.length > 0 && tool.keyword && (
            <Card
              title="Trending posts"
              action={
                <Link
                  href={`/tags/${encodeURIComponent(tool.keyword)}`}
                  passHref
                >
                  <a className="text-text-link typo-footnote">See all</a>
                </Link>
              }
            >
              <ul className="flex flex-col">
                {topPosts.map((post) => (
                  <li
                    key={post.id}
                    className="border-b border-border-subtlest-tertiary py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <Link href={`/posts/${post.slug || post.id}`} passHref>
                      <a className="flex items-center gap-3">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="size-9 flex-none rounded-10 object-cover"
                          />
                        ) : (
                          <span className="grid size-9 flex-none place-items-center rounded-10 bg-surface-float font-bold text-text-tertiary">
                            {(post.title ?? '?').charAt(0)}
                          </span>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col">
                          <Typography type={TypographyType.Footnote} bold>
                            {post.title}
                          </Typography>
                          <span className="mt-0.5 flex items-center gap-1.5 text-text-quaternary typo-caption1">
                            <UpvoteIcon
                              size={IconSize.XSmall}
                              className="text-accent-avocado-default"
                            />
                            <span className="font-bold text-accent-avocado-default">
                              {largeNumberFormat(post.numUpvotes) ??
                                post.numUpvotes}
                            </span>
                            · {publishTimeRelativeShort(post.createdAt)} · #
                            {tool.keyword}
                          </span>
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {adoption && adoption.monthly.length > 0 && (
            <Card title="Adoption on daily.dev">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  {adoption.percentile !== null && (
                    <Typography type={TypographyType.Title3} bold>
                      Top{' '}
                      {Math.max(1, Math.round((1 - adoption.percentile) * 100))}
                      %
                    </Typography>
                  )}
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                  >
                    of all tools by stack presence
                  </Typography>
                </div>
                {adoption.quarterGrowth !== null &&
                  adoption.quarterGrowth > 0 && (
                    <Typography
                      type={TypographyType.Footnote}
                      bold
                      className="text-accent-avocado-default"
                    >
                      ▲ {Math.round(adoption.quarterGrowth)}% this quarter
                    </Typography>
                  )}
              </div>
              {getSparklinePoints(adoption) && (
                <svg
                  viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                  width="100%"
                  height={SPARK_HEIGHT}
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <polygon
                    points={`0,${SPARK_HEIGHT} ${getSparklinePoints(
                      adoption,
                    )} ${SPARK_WIDTH},${SPARK_HEIGHT}`}
                    style={{
                      fill: 'var(--theme-accent-cabbage-default)',
                      opacity: 0.12,
                    }}
                  />
                  <polyline
                    points={getSparklinePoints(adoption) ?? ''}
                    style={{
                      fill: 'none',
                      stroke: 'var(--theme-accent-cabbage-default)',
                      strokeWidth: 2.5,
                    }}
                  />
                </svg>
              )}
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Stack additions, trailing 12 months
              </Typography>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {topSquads.length > 0 && (
            <Card title="Top squads running it">
              <ul className="flex flex-col">
                {topSquads.map((squad) => (
                  <li
                    key={squad.id}
                    className="border-b border-border-subtlest-tertiary py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <Link href={`/squads/${squad.handle}`} passHref>
                      <a className="flex items-center gap-3">
                        <img
                          src={squad.image}
                          alt={`${squad.name} avatar`}
                          className="size-9 rounded-full object-cover"
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <Typography type={TypographyType.Footnote} bold>
                            {squad.name}
                          </Typography>
                          <Typography
                            type={TypographyType.Caption1}
                            color={TypographyColor.Quaternary}
                          >
                            {largeNumberFormat(squad.membersCount)} members
                          </Typography>
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {alsoStacked.length > 0 && (
            <Card title="Devs also stack">
              <div className="flex flex-wrap gap-2">
                {alsoStacked.map((related) => (
                  <Link
                    key={related.id}
                    href={`/tools/${related.slug}`}
                    passHref
                  >
                    <a className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5 font-bold typo-footnote hover:bg-surface-hover">
                      <ToolIcon
                        title={related.title}
                        faviconUrl={related.faviconUrl}
                        className="size-5 rounded-6 object-contain"
                      />
                      {related.title}
                    </a>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {takes.length > 0 && (
            <Card title="Community takes">
              <ul className="flex flex-col">
                {takes.map((take) => (
                  <li
                    key={take.id}
                    className="flex items-start gap-3 border-b border-border-subtlest-tertiary py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <span className="grid size-9 flex-none place-items-center rounded-10 bg-surface-float text-lg">
                      {take.emoji}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Typography type={TypographyType.Footnote} bold>
                        &ldquo;{take.title}&rdquo;
                      </Typography>
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Quaternary}
                        className="mt-0.5"
                      >
                        {take.user?.name ?? 'A developer'} ·{' '}
                        <span className="font-bold text-accent-avocado-default">
                          ▲ {take.upvotes}
                        </span>
                      </Typography>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <div id="discussion" className="scroll-mt-16">
        <Card title="Discussion">
          <ToolDiscussion
            toolId={tool.id}
            toolTitle={tool.title}
            discussionPostId={tool.discussionPostId}
          />
        </Card>
      </div>

      {isModalOpen && (
        <UserStackModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleAdd}
          defaultTitle={tool.title}
          modalTitle="Add stack/tool to profile"
        />
      )}
    </main>
  );
};

const getToolPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ToolPage.getLayout = getToolPageLayout;
ToolPage.layoutProps = { screenCentered: false };

export default ToolPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface ToolPageParams extends ParsedUrlQuery {
  slug: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ToolPageParams>): Promise<
  GetStaticPropsResult<ToolPageProps & { seo: NextSeoProps }>
> {
  const slug = params?.slug;

  if (!slug) {
    return { notFound: true, revalidate: false };
  }

  try {
    const tool = await getDatasetTool(slug);

    const [alsoStacked, topSquads, topPosts, stackers, adoption, takes] =
      await Promise.all([
        getToolsAlsoStacked(tool.id),
        getTopSquadsForTool({ toolId: tool.id, first: 3 }),
        tool.keyword
          ? getToolTopPosts(tool.keyword, TOP_POSTS_COUNT)
          : Promise.resolve([]),
        // Tolerate the API not exposing the social queries yet during deploy
        // windows.
        getToolStackers(tool.id, STACKERS_COUNT).catch(() => []),
        getToolAdoption(tool.id).catch(() => null),
        getToolTakes(tool.id).catch(() => []),
      ]);

    const seoTitles = getPageSeoTitles(
      `${tool.title} — adoption, squads and posts for developers`,
    );

    return {
      props: {
        tool,
        alsoStacked,
        topSquads,
        topPosts,
        stackers,
        adoption,
        takes,
        seo: {
          title: seoTitles.title,
          openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
          description: `Discover how developers use ${tool.title}: adoption on daily.dev, squads discussing it, related tools, and the latest posts.`,
          ...(tool.stackCount < MIN_INDEXABLE_STACKS ? noindexSeoProps : {}),
        },
      },
      revalidate: 300,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (error?.response?.errors?.[0]?.extensions?.code === ApiError.NotFound) {
      return { notFound: true, revalidate: 60 };
    }
    throw err;
  }
}
