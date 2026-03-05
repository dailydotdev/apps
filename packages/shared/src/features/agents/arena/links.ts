import type { ArenaTab } from './types';

export type AgentEntityOrigin = 'hub';

export const getAgentEntityPath = (
  entityId: string,
  _tab?: ArenaTab,
  origin?: AgentEntityOrigin,
): string => {
  const encodedEntityId = encodeURIComponent(entityId);
  const path = `/agents/${encodedEntityId}`;

  if (origin) {
    return `${path}?origin=${origin}`;
  }

  return path;
};
