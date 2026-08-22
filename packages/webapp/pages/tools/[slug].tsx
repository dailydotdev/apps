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
  ToolAlternative,
  ToolClaimedBy,
  ToolOfficialSource,
  ToolPageTool,
  ToolStacker,
  ToolTake,
  ToolTopPost,
  ToolVoteState,
} from '@dailydotdev/shared/src/graphql/tools';
import {
  claimTool,
  getDatasetTool,
  getToolAdoption,
  getToolAlternatives,
  getToolCategoryAnchor,
  getToolClaimedBy,
  getToolOfficialSource,
  getToolsAlsoStacked,
  getToolStackers,
  getToolStackersFollowing,
  getToolTakes,
  getToolTopPosts,
  getToolViewerCanClaim,
  getToolVoteState,
  voteTool,
} from '@dailydotdev/shared/src/graphql/tools';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
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
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  ApiError,
  DEFAULT_ERROR,
} from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import {
  DiscussIcon,
  DownvoteIcon,
  OpenLinkIcon,
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
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useUserCompaniesQuery } from '@dailydotdev/shared/src/hooks/userCompany';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getDomainFromUrl } from '@dailydotdev/shared/src/lib/links';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { ProfilePictureGroup } from '@dailydotdev/shared/src/components/ProfilePictureGroup';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import classNames from 'classnames';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';
import { ToolDiscussion } from '../../components/tools/ToolDiscussion';
import { ToolIcon } from '../../components/tools/ToolIcon';
import { ToolCard } from '../../components/tools/ToolCard';
import { ToolPageNavbar } from '../../components/tools/ToolPageNavbar';
import { ToolSection } from '../../components/tools/ToolSection';

const TOP_POSTS_COUNT = 5;
const STACKERS_COUNT = 5;
const ALTERNATIVES_COUNT = 6;
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
  officialSource: ToolOfficialSource | null;
  alternatives: ToolAlternative[];
  claimedBy: ToolClaimedBy | null;
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

const getSparklineTrendDescription = (adoption: ToolAdoption): string => {
  const counts = adoption.monthly.map(({ count }) => count);
  const first = counts[0] ?? 0;
  const last = counts[counts.length - 1] ?? 0;

  if (last > first) {
    return `Stack additions trended up over the trailing 12 months, from ${first} to ${last} per month.`;
  }

  if (last < first) {
    return `Stack additions trended down over the trailing 12 months, from ${first} to ${last} per month.`;
  }

  return `Stack additions stayed roughly flat over the trailing 12 months, around ${last} per month.`;
};

// Mirrors the transition math a fresh vote count would produce server-side,
// so the click feels instant while `sendVote` is in flight.
const applyOptimisticVote = (
  state: ToolVoteState,
  vote: number,
): ToolVoteState => {
  let { upvotes, downvotes } = state;

  if (state.userVote === 1) {
    upvotes -= 1;
  } else if (state.userVote === -1) {
    downvotes -= 1;
  }

  if (vote === 1) {
    upvotes += 1;
  } else if (vote === -1) {
    downvotes += 1;
  }

  return { ...state, upvotes, downvotes, userVote: vote === 0 ? null : vote };
};

// Row chrome shared by the tool page's lists — the filled, hoverable row the
// profile page uses for stack items and hot takes.
const rowClassName =
  'flex items-center gap-4 rounded-16 bg-surface-float p-4 transition-colors';
const linkRowClassName = classNames(rowClassName, 'hover:bg-surface-hover');

const MetaSeparator = (): ReactElement => <span aria-hidden>·</span>;

const ToolPage = ({
  tool,
  alsoStacked,
  topSquads,
  topPosts,
  stackers,
  adoption,
  takes,
  officialSource,
  alternatives,
  claimedBy,
}: ToolPageProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { stackItems, add } = useUserStack(user as PublicProfile);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { showPrompt } = usePrompt();
  const { userCompanies } = useUserCompaniesQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimedByState, setClaimedByState] = useState(claimedBy);

  const isInStack = useMemo(
    () => stackItems.some((item) => item.tool.id === tool.id),
    [stackItems, tool.id],
  );

  const websiteHost = tool.url ? getDomainFromUrl(tool.url) : null;

  const [copying, onShareOrCopy] = useShareOrCopyLink({
    link: `${webappUrl}tools/${tool.slug}`,
    text: `Check out ${tool.title} on daily.dev`,
    logObject: (provider) => ({
      event_name: LogEvent.ShareTool,
      target_id: tool.slug,
      extra: JSON.stringify({ provider, origin: Origin.ToolPage }),
    }),
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
    // The anonymous SSG payload only carries public counts; `userVote` is
    // always seeded null so it's never trusted as the signed-in user's vote.
    placeholderData: {
      upvotes: tool.upvotes,
      downvotes: tool.downvotes,
      userVote: null,
      discussionPostId: tool.discussionPostId,
    },
    staleTime: 0,
  });
  const { mutate: sendVote } = useMutation({
    mutationFn: (vote: number) => voteTool(tool.id, vote),
    onMutate: async (vote: number) => {
      await queryClient.cancelQueries({ queryKey: voteKey });
      const previous = queryClient.getQueryData<ToolVoteState>(voteKey);

      if (previous) {
        queryClient.setQueryData<ToolVoteState>(
          voteKey,
          applyOptimisticVote(previous, vote),
        );
      }

      return { previous };
    },
    onError: (_err, _vote, context) => {
      if (context?.previous) {
        queryClient.setQueryData(voteKey, context.previous);
      }
      displayToast('Failed to vote');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: voteKey }),
  });

  const handleVote = useCallback(
    (vote: number) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });
        return;
      }

      const nextVote = voteState?.userVote === vote ? 0 : vote;
      sendVote(nextVote);

      const extra = JSON.stringify({ origin: Origin.ToolPage });
      if (nextVote === 1) {
        logEvent({
          event_name: LogEvent.UpvoteTool,
          target_id: tool.slug,
          extra,
        });
      } else if (nextVote === -1) {
        logEvent({
          event_name: LogEvent.DownvoteTool,
          target_id: tool.slug,
          extra,
        });
      } else if (voteState?.userVote === 1) {
        logEvent({
          event_name: LogEvent.RemoveToolUpvote,
          target_id: tool.slug,
          extra,
        });
      } else if (voteState?.userVote === -1) {
        logEvent({
          event_name: LogEvent.RemoveToolDownvote,
          target_id: tool.slug,
          extra,
        });
      }
    },
    [user, showLogin, sendVote, voteState?.userVote, logEvent, tool.slug],
  );

  const viewerCanClaimKey = generateQueryKey(
    RequestKey.UserTools,
    user,
    'tool-viewer-can-claim',
    tool.id,
  );
  const { data: viewerCanClaim } = useQuery({
    queryKey: viewerCanClaimKey,
    // TODO(daily-api#4110): fold into TOOL_VOTE_STATE_QUERY (same
    // datasetTool(slug) selection, also client-side/viewer-scoped) once the
    // API ships, and narrow this catch to the unknown-field case so a real
    // regression doesn't silently disappear.
    queryFn: () => getToolViewerCanClaim(tool.slug).catch(() => false),
    enabled: !!user && !claimedByState,
    staleTime: StaleTime.Default,
  });

  // Best-effort match to the verified company whose email domain claims
  // this tool; falls back to the viewer's first verified company for the
  // confirm-dialog copy if the domains don't line up exactly.
  const claimCompanyName = useMemo(() => {
    const domain = websiteHost?.toLowerCase();
    const domainMatch = userCompanies.find(
      (userCompany) =>
        !!domain && userCompany.email?.split('@')[1]?.toLowerCase() === domain,
    );
    return (
      domainMatch?.company?.name ?? userCompanies[0]?.company?.name ?? null
    );
  }, [userCompanies, websiteHost]);

  const { mutate: sendClaimTool, isPending: isClaiming } = useMutation({
    mutationFn: () => claimTool(tool.id),
    onSuccess: (result) => {
      setClaimedByState(result.claimedBy);
      queryClient.setQueryData(viewerCanClaimKey, result.viewerCanClaim);
      if (!result.claimedBy) {
        return;
      }
      displayToast(`Page claimed for ${result.claimedBy.name}`);
      logEvent({
        event_name: LogEvent.ClaimTool,
        target_type: TargetType.Tool,
        target_id: tool.slug,
        extra: JSON.stringify({ origin: Origin.ToolPage }),
      });
    },
    onError: (error) => {
      const message = (error as unknown as ApiErrorResult)?.response
        ?.errors?.[0]?.message;
      displayToast(message ?? DEFAULT_ERROR);
    },
  });

  const handleClaimClick = useCallback(async () => {
    logEvent({
      event_name: LogEvent.ClickClaimTool,
      target_type: TargetType.Tool,
      target_id: tool.slug,
      extra: JSON.stringify({ origin: Origin.ToolPage }),
    });

    const companyName = claimCompanyName ?? 'your company';
    const options: PromptOptions = {
      title: `Claim this page for ${companyName}?`,
      description: `This marks ${tool.title} as claimed by ${companyName} publicly, and can't be undone from the app.`,
      okButton: { title: 'Claim page' },
    };
    const confirmed = await showPrompt(options);

    if (!confirmed) {
      return;
    }

    sendClaimTool();
  }, [
    logEvent,
    tool.slug,
    tool.title,
    claimCompanyName,
    showPrompt,
    sendClaimTool,
  ]);

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
    logEvent({
      event_name: LogEvent.StartAddUserStack,
      target_id: tool.slug,
      extra: JSON.stringify({ origin: Origin.ToolPage }),
    });
    setIsModalOpen(true);
  }, [user, showLogin, logEvent, tool.slug]);

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

  const handleDiscussClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.CommentsClick,
      target_id: tool.slug,
      extra: JSON.stringify({ origin: Origin.ToolPage }),
    });
  }, [logEvent, tool.slug]);

  const handleAlsoStackedClick = useCallback(
    (related: AlsoStackedTool) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.Tool,
        target_id: related.slug,
        extra: JSON.stringify({ origin: Origin.ToolPage }),
      });
    },
    [logEvent],
  );

  const handleTopPostClick = useCallback(
    (post: ToolTopPost) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.Post,
        target_id: post.id,
        extra: JSON.stringify({ origin: Origin.ToolPage }),
      });
    },
    [logEvent],
  );

  const handleOfficialSourceClick = useCallback(() => {
    if (!officialSource) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Source,
      target_id: officialSource.id,
      extra: JSON.stringify({ origin: Origin.ToolPage }),
    });
  }, [logEvent, officialSource]);

  const handleAlternativeClick = useCallback(
    (alternative: ToolAlternative) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.Tool,
        target_id: alternative.slug,
        extra: JSON.stringify({
          origin: Origin.ToolPage,
          section: 'alternatives',
        }),
      });
    },
    [logEvent],
  );

  const sparklinePoints = useMemo(
    () => (adoption ? getSparklinePoints(adoption) : null),
    [adoption],
  );
  const sparklineTrendDescription = useMemo(
    () => (adoption ? getSparklineTrendDescription(adoption) : null),
    [adoption],
  );

  const metaParts: ReactNode[] = [];
  if (tool.category) {
    metaParts.push(
      <Link
        key="category"
        href={`/tools#${getToolCategoryAnchor(tool.category)}`}
        passHref
      >
        <a className="hover:text-text-primary">{tool.category}</a>
      </Link>,
    );
  }
  if (websiteHost) {
    metaParts.push(
      <a
        key="website"
        href={tool.url ?? undefined}
        target="_blank"
        rel={anchorDefaultRel}
        className="flex items-center gap-1 hover:text-text-primary"
      >
        {websiteHost}
        <OpenLinkIcon size={IconSize.Size16} />
      </a>,
    );
  }
  if (tool.keyword) {
    metaParts.push(
      <Link
        key="keyword"
        href={`/tags/${encodeURIComponent(tool.keyword)}`}
        passHref
      >
        <a className="hover:text-text-primary">#{tool.keyword}</a>
      </Link>,
    );
  }

  return (
    <>
      <ToolPageNavbar activeTool={tool} relatedTools={alternatives} />
      <main className="mx-auto flex w-full max-w-screen-laptop flex-col px-4 py-6 tablet:px-6">
        <Head>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: getToolPageJsonLd(tool, topPosts),
            }}
          />
        </Head>

        <header className="mx-auto flex w-full max-w-[48rem] flex-col items-center gap-4 py-8 text-center">
          <ToolIcon
            title={tool.title}
            faviconUrl={tool.faviconUrl}
            className="size-20 rounded-16 border border-border-subtlest-tertiary object-contain p-3"
          />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            {tool.title}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            <span>Tool</span>
            {metaParts.map((part) => (
              <React.Fragment key={(part as ReactElement).key}>
                <MetaSeparator />
                {part}
              </React.Fragment>
            ))}
          </Typography>

          {(!!officialSource || !!claimedByState) && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {officialSource && (
                <Link href={officialSource.permalink} passHref>
                  <a
                    href={officialSource.permalink}
                    onClick={handleOfficialSourceClick}
                    className="flex items-center rounded-10 border border-accent-cabbage-subtler bg-accent-cabbage-flat px-3 py-1 font-bold text-accent-cabbage-default typo-footnote"
                  >
                    <SourceAvatar
                      source={officialSource}
                      size={ProfileImageSize.Size16}
                      className="!mr-1.5"
                    />
                    {officialSource.type === SourceType.Squad
                      ? 'Official squad'
                      : 'Official source'}
                  </a>
                </Link>
              )}
              {claimedByState && (
                <Tooltip content={`Claimed by ${claimedByState.name}`}>
                  <span className="flex items-center rounded-10 border border-accent-avocado-subtler bg-accent-avocado-flat px-3 py-1 font-bold text-accent-avocado-default typo-footnote">
                    <ProfilePicture
                      size={ProfileImageSize.Size16}
                      rounded="full"
                      className="!mr-1.5"
                      user={{
                        image: claimedByState.image,
                        id: claimedByState.name,
                      }}
                    />
                    Claimed by {claimedByState.name}
                  </span>
                </Tooltip>
              )}
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
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
            <div className="flex items-center rounded-12 bg-surface-float px-1">
              <CardAction
                label="Upvote"
                labelVisible
                icon={<UpvoteIcon />}
                iconPressed={<UpvoteIcon secondary />}
                color={ButtonColor.Avocado}
                pressed={voteState?.userVote === 1}
                count={voteState?.upvotes}
                onClick={() => handleVote(1)}
              />
              <CardAction
                label="Downvote"
                icon={<DownvoteIcon />}
                iconPressed={<DownvoteIcon secondary />}
                color={ButtonColor.Ketchup}
                pressed={voteState?.userVote === -1}
                onClick={() => handleVote(-1)}
              />
            </div>
            <Button
              tag="a"
              href="#discussion"
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              icon={<DiscussIcon />}
              onClick={handleDiscussClick}
            >
              Discuss
            </Button>
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              icon={<ShareIcon secondary={copying} />}
              onClick={() => onShareOrCopy()}
            >
              {copying ? 'Copied!' : 'Share'}
            </Button>
          </div>

          {!claimedByState && !!user && !!viewerCanClaim && (
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              loading={isClaiming}
              disabled={isClaiming}
              onClick={handleClaimClick}
            >
              {websiteHost ? `Work at ${websiteHost}? ` : ''}Claim this page
            </Button>
          )}
        </header>

        <div className="h-px w-full bg-border-subtlest-tertiary" />

        <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
          <section className="grid grid-cols-2 gap-4 py-8 tablet:grid-cols-4">
            <DataTile
              label="In stacks"
              value={tool.stackCount}
              info={`How many developers have ${tool.title} on their daily.dev profile`}
              subtitle={
                stackers.length > 0 && (
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <ProfilePictureGroup
                      limit={stackers.length}
                      size={ProfileImageSize.Small}
                    >
                      {stackers.map((stacker) => (
                        <ProfilePicture
                          key={stacker.id}
                          user={stacker}
                          size={ProfileImageSize.Small}
                          className="border-2 border-background-default"
                        />
                      ))}
                    </ProfilePictureGroup>
                    {!!followedStackers?.length && (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        {followedStackers.length} you follow
                      </Typography>
                    )}
                  </span>
                )
              }
            />
            {sentiment !== null && (
              <DataTile
                label="Dev sentiment"
                value={`${sentiment}%`}
                info="Share of votes on this page that are upvotes"
                subtitle={
                  <span className="mt-2 flex h-1.5 overflow-hidden rounded-6 bg-surface-float">
                    <span
                      className="h-full rounded-6 bg-accent-avocado-default"
                      style={{ width: `${sentiment}%` }}
                    />
                  </span>
                }
              />
            )}
            {adoption && adoption.percentile !== null && (
              <DataTile
                label="Adoption"
                value={`Top ${Math.max(
                  1,
                  Math.round((1 - adoption.percentile) * 100),
                )}%`}
                info="Where this tool ranks against every other tool by stack presence"
                subtitle={
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    of all tools on daily.dev
                  </Typography>
                }
              />
            )}
            {!!adoption?.quarterGrowth && adoption.quarterGrowth > 0 && (
              <DataTile
                label="This quarter"
                value={`+${Math.round(adoption.quarterGrowth)}%`}
                info="Growth in stack additions over the last quarter"
                valueClassName="text-accent-avocado-default"
                subtitle={
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    new stack additions
                  </Typography>
                }
              />
            )}
          </section>

          {adoption && adoption.monthly.length > 0 && sparklinePoints && (
            <ToolSection title="Adoption on daily.dev">
              <svg
                viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
                className="h-28 w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polygon
                  points={`0,${SPARK_HEIGHT} ${sparklinePoints} ${SPARK_WIDTH},${SPARK_HEIGHT}`}
                  style={{
                    fill: 'var(--theme-accent-cabbage-default)',
                    opacity: 0.12,
                  }}
                />
                <polyline
                  points={sparklinePoints}
                  style={{
                    fill: 'none',
                    stroke: 'var(--theme-accent-cabbage-default)',
                    strokeWidth: 2.5,
                  }}
                />
              </svg>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Stack additions, trailing 12 months
              </Typography>
              {sparklineTrendDescription && (
                <span className="sr-only">{sparklineTrendDescription}</span>
              )}
            </ToolSection>
          )}

          {topPosts.length > 0 && tool.keyword && (
            <ToolSection
              title="Trending posts"
              action={
                <Link
                  href={`/tags/${encodeURIComponent(tool.keyword)}`}
                  passHref
                >
                  <a className="text-text-link typo-callout">See all</a>
                </Link>
              }
            >
              <ul className="flex flex-col gap-2">
                {topPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/posts/${post.slug || post.id}`} passHref>
                      <a
                        href={`/posts/${post.slug || post.id}`}
                        className={linkRowClassName}
                        onClick={() => handleTopPostClick(post)}
                      >
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="size-12 flex-none rounded-14 object-cover"
                          />
                        ) : (
                          <span className="grid size-12 flex-none place-items-center rounded-14 bg-background-default font-bold text-text-tertiary">
                            {(post.title ?? '?').charAt(0)}
                          </span>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <Typography
                            type={TypographyType.Body}
                            bold
                            className="multi-truncate line-clamp-2"
                          >
                            {post.title}
                          </Typography>
                          <Typography
                            tag={TypographyTag.Span}
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                            className="flex w-full flex-wrap items-center gap-x-1.5"
                          >
                            <UpvoteIcon
                              size={IconSize.Size16}
                              className="text-accent-avocado-default"
                            />
                            <span className="font-bold text-accent-avocado-default">
                              {largeNumberFormat(post.numUpvotes) ??
                                post.numUpvotes}
                            </span>
                            <MetaSeparator />
                            <span suppressHydrationWarning>
                              {publishTimeRelativeShort(post.createdAt)}
                            </span>
                            <MetaSeparator />
                            <span>#{tool.keyword}</span>
                          </Typography>
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </ToolSection>
          )}

          {topSquads.length > 0 && (
            <ToolSection title="Squads running it">
              <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
                {topSquads.map((squad) => (
                  <li key={squad.id}>
                    <Link href={`/squads/${squad.handle}`} passHref>
                      <a
                        href={`/squads/${squad.handle}`}
                        className={linkRowClassName}
                      >
                        <img
                          src={squad.image}
                          alt={`${squad.name} avatar`}
                          className="size-12 flex-none rounded-full object-cover"
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <Typography type={TypographyType.Body} bold truncate>
                            {squad.name}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                          >
                            {largeNumberFormat(squad.membersCount)} members
                          </Typography>
                        </span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </ToolSection>
          )}

          {takes.length > 0 && (
            <ToolSection title="Community takes">
              <ul className="flex flex-col gap-2">
                {takes.map((take) => (
                  <li key={take.id} className={rowClassName}>
                    <span className="grid size-12 flex-none place-items-center rounded-14 bg-overlay-quaternary-cabbage text-2xl">
                      {take.emoji}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <Typography type={TypographyType.Body} bold>
                        &ldquo;{take.title}&rdquo;
                      </Typography>
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        className="flex w-full flex-wrap items-center gap-x-1.5"
                      >
                        <span>{take.user?.name ?? 'A developer'}</span>
                        <MetaSeparator />
                        <UpvoteIcon
                          size={IconSize.Size16}
                          className="text-accent-avocado-default"
                        />
                        <span className="font-bold text-accent-avocado-default">
                          {take.upvotes}
                        </span>
                      </Typography>
                    </span>
                  </li>
                ))}
              </ul>
            </ToolSection>
          )}

          {alsoStacked.length > 0 && (
            <ToolSection title="Devs also stack">
              <div className="flex flex-wrap gap-2">
                {alsoStacked.map((related) => (
                  <Link
                    key={related.id}
                    href={`/tools/${related.slug}`}
                    passHref
                  >
                    <a
                      href={`/tools/${related.slug}`}
                      className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2 font-bold typo-callout hover:border-border-subtlest-secondary"
                      onClick={() => handleAlsoStackedClick(related)}
                    >
                      <ToolIcon
                        title={related.title}
                        faviconUrl={related.faviconUrl}
                        className="size-6 flex-none rounded-6 object-contain"
                      />
                      {related.title}
                    </a>
                  </Link>
                ))}
              </div>
            </ToolSection>
          )}

          {alternatives.length > 0 && (
            <ToolSection title={`Alternatives to ${tool.title}`}>
              <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
                {alternatives.map((alternative) => (
                  <ToolCard
                    key={alternative.id}
                    tool={alternative}
                    onClick={() => handleAlternativeClick(alternative)}
                  />
                ))}
              </div>
            </ToolSection>
          )}

          <ToolSection id="discussion" title="Discussion">
            <ToolDiscussion
              toolId={tool.id}
              toolTitle={tool.title}
              discussionPostId={
                voteState?.discussionPostId ?? tool.discussionPostId
              }
            />
          </ToolSection>
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
    </>
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

    const [
      alsoStacked,
      topSquads,
      topPosts,
      stackers,
      adoption,
      takes,
      officialSource,
      alternatives,
      claimedBy,
    ] = await Promise.all([
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
      getToolOfficialSource(slug).catch(() => null),
      getToolAlternatives(tool.id, ALTERNATIVES_COUNT).catch(() => []),
      // TODO(daily-api#4110): narrow this catch to the unknown-field case
      // once the API deploys, so a real regression doesn't silently drop
      // the claim badge for every tool.
      getToolClaimedBy(slug).catch(() => null),
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
        officialSource,
        alternatives,
        claimedBy,
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
