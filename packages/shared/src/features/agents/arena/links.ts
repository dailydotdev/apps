import type { ArenaTab } from './types';

export type AgentEntityOrigin = 'hub';

export const getAgentEntityPath = (
  entityId: string,
  tab?: ArenaTab,
  origin?: AgentEntityOrigin,
): string => {
  const hasTabContext = !!tab;
  const encodedEntityId = encodeURIComponent(entityId);
  const path = `/agents/${encodedEntityId}`;

  if (hasTabContext) {
    if (origin) {
      return `${path}?origin=${origin}`;
    }

    return path;
  }

  if (origin) {
    return `${path}?origin=${origin}`;
  }

  return path;
};
