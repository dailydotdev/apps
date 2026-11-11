import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  getMarketplacePluginUrl,
  marketplaceUrl,
  topPluginsQueryOptions,
} from '../../graphql/plugins';
import { mcpServerDocs } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { ArrowIcon } from '../icons/Arrow';
import { IconSize } from '../Icon';
import { shuffleArray } from '../../lib/func';
import { marketplaceHeroImage } from '../../lib/image';
import { marketplaceHeroScrim } from '../../styles/custom';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, Origin, TargetId, TargetType } from '../../lib/log';

const AGENT_PLUGIN_POST_TAGS = [
  'ai-agents',
  'agentic-ai',
  'ai-coding',
  'ai-engineering',
  'ai-sdk',
  'anthropic',
  'claude',
  'claude-code',
  'google-gemini',
  'langchain',
  'llm',
  'mcp',
  'microsoft-copilot',
  'openai-codex',
  'prompt-engineering',
  'rag',
  'vibe-coding',
];

const POST_PLUGINS_POOL = 50;

const POST_PLUGINS_LIMIT = 2;

interface PostPluginsWidgetProps {
  postTags: string[];
}

export const PostPluginsWidget = ({
  postTags,
}: PostPluginsWidgetProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const isAgentPost = postTags.some((tag) =>
    AGENT_PLUGIN_POST_TAGS.includes(tag),
  );
  const { data: pool } = useQuery({
    ...topPluginsQueryOptions(POST_PLUGINS_POOL),
    enabled: isAgentPost,
  });
  const plugins = useMemo(
    () => pool && shuffleArray(pool).slice(0, POST_PLUGINS_LIMIT),
    [pool],
  );
  const shownPluginIds = useMemo(
    () => plugins?.map(({ id }) => id) ?? [],
    [plugins],
  );
  const { ref, inView } = useInView({ threshold: 0.5 });
  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionMarketplacePromo,
      target_id: TargetId.PostPluginsWidget,
      extra: JSON.stringify({ shownPluginIds }),
    }),
    { condition: inView && shownPluginIds.length > 0 },
  );

  if (!isAgentPost || !plugins?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    >
      <div className="relative isolate flex items-center px-4 py-3 text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-1 bg-cover bg-right"
          style={{ backgroundImage: `url("${marketplaceHeroImage}")` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-1"
          style={{ background: marketplaceHeroScrim }}
        />
        <Typography type={TypographyType.Body} bold>
          Plugins for your agent
        </Typography>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-3 pt-2">
        <div className="-mx-3 flex flex-col">
          {plugins.map((plugin) => (
            <a
              key={plugin.id}
              href={getMarketplacePluginUrl(plugin.id)}
              className="group flex items-center gap-3 rounded-12 px-3 py-2 transition-colors hover:bg-surface-hover"
              onClick={() =>
                logEvent({
                  event_name: LogEvent.ClickPluginCard,
                  target_type: TargetType.Plugin,
                  target_id: plugin.id,
                  extra: JSON.stringify({
                    origin: Origin.PostPluginsWidget,
                    shownPluginIds,
                  }),
                })
              }
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                  bold
                  className="truncate"
                >
                  {plugin.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="line-clamp-2"
                >
                  {plugin.description}
                </Typography>
              </div>
              <ArrowIcon
                size={IconSize.Small}
                className="shrink-0 rotate-90 text-text-tertiary transition-colors group-hover:text-text-primary"
              />
            </a>
          ))}
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          <a
            href={marketplaceUrl}
            className="text-text-link hover:underline"
            onClick={() =>
              logEvent({
                event_name: LogEvent.OpenMarketplace,
                target_id: TargetId.PostPluginsWidget,
                extra: JSON.stringify({ shownPluginIds }),
              })
            }
          >
            Browse the marketplace
          </a>{' '}
          or{' '}
          <a
            href={mcpServerDocs}
            className="text-text-link hover:underline"
            target="_blank"
            rel={anchorDefaultRel}
            onClick={() =>
              logEvent({
                event_name: LogEvent.ClickConnectAgent,
                extra: JSON.stringify({
                  origin: Origin.PostPluginsWidget,
                  method: 'docs',
                  shownPluginIds,
                }),
              })
            }
          >
            connect daily.dev to your agent
          </a>
        </Typography>
      </div>
    </div>
  );
};
