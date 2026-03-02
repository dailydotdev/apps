import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { ArenaIcon } from '../icons/Arena';
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

  return (
    <Button
      tag="a"
      href={`${webappUrl}agents/arena`}
      size={ButtonSize.Medium}
      variant={variant}
      className={isIconOnly ? 'relative h-10 w-10 p-0' : 'relative gap-2'}
      aria-label="Open agents arena"
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-subtle">
        {topEntity?.entity.logo ? (
          <img
            src={topEntity.entity.logo}
            alt={topEntity.entity.name}
            className="size-full object-cover"
          />
        ) : (
          <span className="size-2 rounded-full bg-accent-avocado-default" />
        )}
      </span>
      {showLabel ? (
        <span className="max-w-24 truncate">
          {topEntity?.entity.name ?? 'Agents'}
        </span>
      ) : null}
      <span className="pointer-events-none absolute -right-2 -top-2 rounded-full border border-border-subtlest-tertiary bg-background-default p-0.5 shadow-2">
        <ArenaIcon size={IconSize.Size16} />
      </span>
    </Button>
  );
}
