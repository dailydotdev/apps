import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { NextSeoProps } from 'next-seo';
import type {
  AlsoStackedTool,
  ToolPageTool,
} from '@dailydotdev/shared/src/graphql/tools';
import {
  getDatasetTool,
  getToolsAlsoStacked,
} from '@dailydotdev/shared/src/graphql/tools';
import type {
  ToolTopSquad,
  AddUserStackInput,
} from '@dailydotdev/shared/src/graphql/user/userStack';
import { getTopSquadsForTool } from '@dailydotdev/shared/src/graphql/user/userStack';
import type {
  TopPost,
  TopPostsData,
} from '@dailydotdev/shared/src/graphql/feed';
import { TAG_TOP_POSTS_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
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
import { PlusIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useUserStack } from '@dailydotdev/shared/src/features/profile/hooks/useUserStack';
import { UserStackModal } from '@dailydotdev/shared/src/features/profile/components/stack/UserStackModal';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const TOP_POSTS_COUNT = 5;

export interface ToolPageProps {
  tool: ToolPageTool;
  alsoStacked: AlsoStackedTool[];
  topSquads: ToolTopSquad[];
  topPosts: TopPost[];
}

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

const SectionTitle = ({ children }: { children: string }): ReactElement => (
  <Typography
    tag={TypographyTag.H2}
    type={TypographyType.Callout}
    color={TypographyColor.Tertiary}
    bold
    className="uppercase"
  >
    {children}
  </Typography>
);

const ToolPage = ({
  tool,
  alsoStacked,
  topSquads,
  topPosts,
}: ToolPageProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { stackItems, add } = useUserStack(user as PublicProfile);
  const { displayToast } = useToastNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isInStack = useMemo(
    () => stackItems.some((item) => item.tool.id === tool.id),
    [stackItems, tool.id],
  );

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
    <main className="mx-auto flex w-full max-w-screen-laptop flex-col gap-8 px-4 py-6 laptop:px-8">
      <section className="flex flex-wrap items-center gap-4">
        <ToolIcon
          title={tool.title}
          faviconUrl={tool.faviconUrl}
          className="size-16 rounded-16 object-contain"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            {tool.title}
          </Typography>
          <div className="flex flex-wrap items-center gap-3">
            {tool.url && websiteHost && (
              <a
                href={tool.url}
                target="_blank"
                rel={anchorDefaultRel}
                className="text-text-link typo-callout"
              >
                {websiteHost}
              </a>
            )}
            {tool.keyword && (
              <Link href={`/tags/${encodeURIComponent(tool.keyword)}`} passHref>
                <a className="text-text-tertiary typo-callout hover:underline">
                  #{tool.keyword}
                </a>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tool.stackCount > 0 && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              In {largeNumberFormat(tool.stackCount)}{' '}
              {tool.stackCount === 1 ? 'stack' : 'stacks'}
            </Typography>
          )}
          <Button
            variant={
              isInStack ? ButtonVariant.Secondary : ButtonVariant.Primary
            }
            size={ButtonSize.Medium}
            icon={isInStack ? <VIcon /> : <PlusIcon />}
            disabled={isInStack}
            onClick={handleAddClick}
          >
            {isInStack ? 'In your stack' : 'Add to my stack'}
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 laptop:grid-cols-2">
        {topPosts.length > 0 && tool.keyword && (
          <section className="flex flex-col gap-3">
            <SectionTitle>Trending posts</SectionTitle>
            <ul className="flex flex-col gap-2">
              {topPosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.slug || post.id}`} passHref>
                    <a className="block rounded-12 border border-border-subtlest-tertiary p-3 typo-callout hover:bg-surface-hover">
                      {post.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/tags/${encodeURIComponent(tool.keyword)}`} passHref>
              <a className="text-text-link typo-callout">
                See all #{tool.keyword} posts
              </a>
            </Link>
          </section>
        )}

        <div className="flex flex-col gap-8">
          {topSquads.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionTitle>Top squads running it</SectionTitle>
              <ul className="flex flex-col gap-2">
                {topSquads.map((squad) => (
                  <li key={squad.id}>
                    <Link href={`/squads/${squad.handle}`} passHref>
                      <a className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3 hover:bg-surface-hover">
                        <img
                          src={squad.image}
                          alt={`${squad.name} avatar`}
                          className="size-10 rounded-full object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Typography
                            type={TypographyType.Callout}
                            bold
                            truncate
                          >
                            {squad.name}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                          >
                            {largeNumberFormat(squad.membersCount)} members
                          </Typography>
                        </div>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {alsoStacked.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionTitle>Devs also stack</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {alsoStacked.map((related) => (
                  <Link
                    key={related.id}
                    href={`/tools/${related.slug}`}
                    passHref
                  >
                    <a className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2 typo-callout hover:bg-surface-hover">
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
            </section>
          )}
        </div>
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

    const [alsoStacked, topSquads, topPostsData] = await Promise.all([
      getToolsAlsoStacked(tool.id),
      getTopSquadsForTool({ toolId: tool.id, first: 3 }),
      tool.keyword
        ? gqlClient.request<TopPostsData>(TAG_TOP_POSTS_QUERY, {
            tag: tool.keyword,
            first: TOP_POSTS_COUNT,
          })
        : Promise.resolve(null),
    ]);

    const seoTitles = getPageSeoTitles(
      `${tool.title} — adoption, squads and posts for developers`,
    );

    return {
      props: {
        tool,
        alsoStacked,
        topSquads,
        topPosts:
          topPostsData?.page?.edges?.map(({ node }) => node).filter(Boolean) ??
          [],
        seo: {
          title: seoTitles.title,
          openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
          description: `Discover how developers use ${tool.title}: adoption on daily.dev, squads discussing it, related tools, and the latest posts.`,
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
