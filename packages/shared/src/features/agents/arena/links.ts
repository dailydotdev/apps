import type { ArenaTab } from './types';

export const getAgentEntityPath = (
  entityId: string,
  tab?: ArenaTab,
): string => {
  const hasTabContext = !!tab;
  const encodedEntityId = encodeURIComponent(entityId);

  if (hasTabContext) {
    return `/agents/${encodedEntityId}`;
  }

  return `/agents/${encodedEntityId}`;
};
