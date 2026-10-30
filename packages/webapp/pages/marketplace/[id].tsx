import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
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
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { RenderMarkdown } from '@dailydotdev/shared/src/components/RenderMarkdown';
import SquadPostAuthor from '@dailydotdev/shared/src/components/post/SquadPostAuthor';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useTrackQuestClientEvent } from '@dailydotdev/shared/src/hooks/useTrackQuestClientEvent';
import { ClientQuestEventType } from '@dailydotdev/shared/src/graphql/quests';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import type {
  Plugin,
  PluginData,
} from '@dailydotdev/shared/src/graphql/plugins';
import {
  getPluginSkillMdUrl,
  marketplaceSubmitUrl,
  marketplaceUrl,
  PLUGIN_QUERY,
  pluginQueryOptions,
} from '@dailydotdev/shared/src/graphql/plugins';

import { personalAccessTokensQueryOptions } from '@dailydotdev/shared/src/hooks/api/usePersonalAccessTokens';
import {
  mcpClaudeInstallCommand,
  oauthConsentsQueryOptions,
} from '@dailydotdev/shared/src/lib/oauthApps';
import {
  mcpServerDocs,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import useLogEventOnce from '@dailydotdev/shared/src/hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  getPluginLinkHost,
  getPluginRepositoryIcon,
} from '../../components/marketplace/PluginCard';
import { PluginUpvoteButton } from '../../components/marketplace/PluginUpvoteButton';
import { PluginAwardButton } from '../../components/marketplace/PluginAwardButton';
import { PluginShareActions } from '../../components/marketplace/PluginShareActions';
import { CopyableCodeBlock } from '../../components/CopyableCodeBlock';
import { MarketplacePageLayout } from '../../components/marketplace/MarketplacePageLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getAppOrigin, toJsonLd } from '../../lib/seo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { aiAgentsOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

interface PluginPageProps {
  plugin: Plugin;
  seo: NextSeoProps;
}

const getPluginSchema = (plugin: Plugin): string =>
  toJsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: plugin.name,
    description: plugin.description,
    applicationCategory: 'DeveloperApplication',
    url: `${getAppOrigin()}/marketplace/${plugin.id}`,
    author: { '@type': 'Person', name: plugin.author.name },
    ...((plugin.url || plugin.repositoryUrl) && {
      sameAs: [plugin.url, plugin.repositoryUrl].filter(Boolean),
    }),
    dateModified: plugin.updatedAt,
  });

const PluginPage = ({
  plugin: staticPlugin,
}: PluginPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user } = useAuthContext();
  const { data: fetchedPlugin } = useQuery({
    ...pluginQueryOptions(staticPlugin?.id ?? '', user),
    enabled: !!user && !!staticPlugin,
  });
  const plugin = fetchedPlugin ?? staticPlugin;
  const agentPrompt = plugin?.hasSkillMd
    ? `Read ${getPluginSkillMdUrl(
        plugin.id,
      )} and follow it using my daily.dev API token.`
    : undefined;
  const [, copyAgentPrompt] = useCopyText(agentPrompt);
  const [, copyMcpCommand] = useCopyText(mcpClaudeInstallCommand);
  const isConnectionQueryEnabled = !!user && !!agentPrompt;
  const { data: tokens, isSuccess: isTokensLoaded } = useQuery({
    ...personalAccessTokensQueryOptions(),
    enabled: isConnectionQueryEnabled,
  });
  const { data: consents, isSuccess: isConsentsLoaded } = useQuery({
    ...oauthConsentsQueryOptions(),
    enabled: isConnectionQueryEnabled,
  });
  const showConnectAgent =
    !user ||
    (isTokensLoaded && isConsentsLoaded && !tokens.length && !consents.length);
  const isConnectionKnown = !user || (isTokensLoaded && isConsentsLoaded);
  const { logEvent } = useLogContext();
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.VisitMarketplace,
  });
  const isAuthor = !!plugin && user?.id === plugin.author.id;
  const showShareNudge =
    isAuthor &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.DismissPluginShareTooltip);
  const { ref: agentPromptRef, inView: isAgentPromptInView } = useInView({
    threshold: 0.5,
  });
  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionPluginAgentPrompt,
      target_type: TargetType.Plugin,
      target_id: plugin?.id,
      extra: JSON.stringify({
        origin: Origin.PluginPage,
        connectStep: showConnectAgent,
      }),
    }),
    { condition: isAgentPromptInView && isConnectionKnown },
  );
  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionPluginShareNudge,
      target_type: TargetType.Plugin,
      target_id: plugin?.id,
      extra: JSON.stringify({ origin: Origin.PluginPage }),
    }),
    { condition: showShareNudge },
  );

  if (isFallback || !plugin) {
    return <></>;
  }

  const dismissShareNudge = () => {
    if (showShareNudge) {
      completeAction(ActionType.DismissPluginShareTooltip);
    }
  };
  const shareNudgeClassName =
    'items-center justify-between gap-3 rounded-12 border border-accent-onion-default bg-background-popover py-1 pl-3 pr-1';
  const shareNudgeContent = (
    <>
      <Typography type={TypographyType.Footnote} bold>
        Share your plugin with the world
      </Typography>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        onClick={dismissShareNudge}
      >
        Got it
      </Button>
    </>
  );
  const RepositoryIcon = plugin.repositoryUrl
    ? getPluginRepositoryIcon(plugin.repositoryUrl)
    : null;
  const pluginLink = plugin.url !== plugin.repositoryUrl ? plugin.url : null;
  const logPluginEvent = (eventName: LogEvent) =>
    logEvent({
      event_name: eventName,
      target_type: TargetType.Plugin,
      target_id: plugin.id,
    });
  const logConnectAgent = (method: string) =>
    logEvent({
      event_name: LogEvent.ClickConnectAgent,
      target_type: TargetType.Plugin,
      target_id: plugin.id,
      extra: JSON.stringify({ origin: Origin.PluginPage, method }),
    });

  return (
    <MarketplacePageLayout title={plugin.name} className="gap-6">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getPluginSchema(plugin) }}
        />
      </Head>
      <Link href={marketplaceUrl} prefetch={false}>
        <a className="w-fit text-text-tertiary typo-footnote hover:underline">
          ← Marketplace
        </a>
      </Link>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <Typography
            type={TypographyType.Title2}
            tag={TypographyTag.H1}
            bold
            className="min-w-0 flex-1 break-words"
          >
            {plugin.name}
          </Typography>
          {isAuthor && (
            <Button
              tag="a"
              href={`${marketplaceSubmitUrl}?edit=${plugin.id}`}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EditIcon />}
            >
              Edit
            </Button>
          )}
        </div>
        <SquadPostAuthor
          author={plugin.author}
          date={plugin.updatedAt}
          size={ProfileImageSize.Large}
          isUserSource
          showSkeletonWhenMissing={false}
        />
        {(pluginLink ||
          (plugin.repositoryUrl && RepositoryIcon) ||
          plugin.hasSkillMd) && (
          <div className="flex flex-wrap gap-2">
            {pluginLink && (
              <Button
                tag="a"
                href={pluginLink}
                target="_blank"
                rel="nofollow ugc noopener"
                onClick={() => logPluginEvent(LogEvent.ClickPluginLink)}
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<OpenLinkIcon />}
              >
                {getPluginLinkHost(pluginLink)}
              </Button>
            )}
            {plugin.repositoryUrl && RepositoryIcon && (
              <Button
                tag="a"
                href={plugin.repositoryUrl}
                target="_blank"
                rel="nofollow ugc noopener"
                onClick={() => logPluginEvent(LogEvent.ClickPluginRepository)}
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<RepositoryIcon />}
              >
                Source code
              </Button>
            )}
            {plugin.hasSkillMd && (
              <Button
                tag="a"
                href={getPluginSkillMdUrl(plugin.id)}
                target="_blank"
                rel="noopener"
                onClick={() => logPluginEvent(LogEvent.ClickPluginSkillMd)}
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                icon={<OpenLinkIcon />}
              >
                SKILL.md
              </Button>
            )}
          </div>
        )}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          {plugin.description}
        </Typography>
        {showShareNudge && (
          <div
            className={`${shareNudgeClassName} flex tablet:ml-auto tablet:w-fit laptop:hidden`}
          >
            {shareNudgeContent}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-16 border border-border-subtlest-tertiary px-2 py-1.5">
          <PluginUpvoteButton plugin={plugin} large />
          <PluginAwardButton plugin={plugin} large />
          {showShareNudge && (
            <div
              className={`${shareNudgeClassName} ml-auto hidden laptop:flex`}
            >
              {shareNudgeContent}
            </div>
          )}
          <div
            className={showShareNudge ? 'ml-auto laptop:ml-0' : 'ml-auto'}
            onClickCapture={dismissShareNudge}
          >
            <PluginShareActions
              plugin={plugin}
              origin={Origin.PluginPage}
              large
            />
          </div>
        </div>
      </div>
      {agentPrompt && (
        <div
          ref={agentPromptRef}
          className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4"
        >
          <Typography type={TypographyType.Callout} bold>
            Use it with your agent
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Paste this into Claude Code, Cursor, Codex or any agent that has
            your daily.dev API token or is connected to the{' '}
            <a
              href={mcpServerDocs}
              className="text-text-link hover:underline"
              target="_blank"
              rel={anchorDefaultRel}
            >
              daily.dev MCP server
            </a>
            .
          </Typography>
          <CopyableCodeBlock
            text={agentPrompt}
            multiline
            codeClassName="typo-footnote"
            onCopy={() => {
              copyAgentPrompt();
              logPluginEvent(LogEvent.CopyPluginAgentPrompt);
            }}
          />
          {showConnectAgent && (
            <div className="mt-2 flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-3">
              <Typography type={TypographyType.Callout} bold>
                Agent not connected yet?
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                In Claude Code, run this once:
              </Typography>
              <CopyableCodeBlock
                text={mcpClaudeInstallCommand}
                codeClassName="typo-footnote"
                onCopy={() => {
                  copyMcpCommand();
                  logConnectAgent('claude code');
                }}
              />
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Using Cursor, Codex or another agent? Follow the{' '}
                <a
                  href={mcpServerDocs}
                  className="text-text-link hover:underline"
                  target="_blank"
                  rel={anchorDefaultRel}
                  onClick={() => logConnectAgent('docs')}
                >
                  MCP setup guide
                </a>{' '}
                or{' '}
                <a
                  href={`${webappUrl}settings/api`}
                  className="text-text-link hover:underline"
                  onClick={() => logConnectAgent('token')}
                >
                  create an API token
                </a>
                .
              </Typography>
            </div>
          )}
        </div>
      )}
      {plugin.about && (
        <div className="rounded-16 border border-border-subtlest-tertiary p-4">
          <RenderMarkdown
            content={plugin.about}
            reactMarkdownProps={{
              disallowedElements: ['a', 'img'],
              unwrapDisallowed: true,
            }}
          />
        </div>
      )}
    </MarketplacePageLayout>
  );
};

const getPluginPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

PluginPage.getLayout = getPluginPageLayout;
PluginPage.layoutProps = {};
export default PluginPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PluginPageParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PluginPageParams>): Promise<
  GetStaticPropsResult<PluginPageProps>
> {
  try {
    const { plugin } = await gqlClient.request<PluginData>(PLUGIN_QUERY, {
      id: params?.id,
    });
    const seoTitles = getPageSeoTitles(`${plugin.name} plugin`);

    return {
      props: {
        plugin,
        seo: {
          ...defaultSeo,
          ...seoTitles,
          openGraph: { ...aiAgentsOpenGraph, ...seoTitles.openGraph },
          description: plugin.description,
        },
      },
      revalidate: 3600,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return { notFound: true, revalidate: 60 };
    }
    throw err;
  }
}
