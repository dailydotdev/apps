import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { useAgentsLeaderboardEntrypoint } from '../../features/agents/leaderboard/useAgentsLeaderboardEntrypoint';

interface AgentsLeaderboardEntrypointButtonProps {
  groupId: string;
  showLabel?: boolean;
  variant?: ButtonVariant;
}

export function AgentsLeaderboardEntrypointButton({
  groupId,
  showLabel = false,
  variant = ButtonVariant.Tertiary,
}: AgentsLeaderboardEntrypointButtonProps): ReactElement {
  const { topEntity } = useAgentsLeaderboardEntrypoint({ groupId });
  const isIconOnly = !showLabel;
  const label = topEntity?.entity.name ?? 'Agents';

  return (
    <Button
      tag="a"
      href={`${webappUrl}agents/arena`}
      size={ButtonSize.Medium}
      variant={variant}
      className={
        isIconOnly
          ? 'relative h-10 w-10 overflow-visible p-0'
          : 'relative gap-2 overflow-visible pr-3'
      }
      aria-label="Open agents arena"
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center rounded-full border border-border-subtlest-secondary bg-background-subtle">
        {topEntity?.entity.logo ? (
          <>
            <span className="relative size-full overflow-hidden rounded-full">
              <img
                src={topEntity.entity.logo}
                alt={topEntity.entity.name}
                className="size-full object-cover"
              />
            </span>
            <span className="pointer-events-none absolute -inset-0.5 rounded-full text-text-primary">
              <span className="agent-live-radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_298deg,currentColor_324deg_356deg,transparent_360deg)] mix-blend-screen" />
            </span>
          </>
        ) : (
          <span className="size-2 rounded-full bg-accent-avocado-default" />
        )}
      </span>
      {showLabel ? (
        <>
          <span className="max-w-24 truncate">{label}</span>
          <span className="pointer-events-none inline-flex items-center rounded-full border border-border-subtlest-tertiary bg-background-default px-1.5 py-0.5 text-text-tertiary typo-caption1">
            Live
          </span>
        </>
      ) : null}
    </Button>
  );
}
