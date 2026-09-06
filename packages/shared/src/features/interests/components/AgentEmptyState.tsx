import type { ReactElement } from 'react';
import React from 'react';
import { CharmEmptyState } from '../../../components/charm/CharmEmptyState';
import { cloudinaryCharmReadLater } from '../../../lib/image';
import { useAgent } from '../AgentContext';

export const AgentEmptyState = (): ReactElement => {
  const { interest, update } = useAgent();
  const needsNotifications = interest?.outputModes.notification === false;

  return (
    <CharmEmptyState
      className="my-8"
      image={cloudinaryCharmReadLater}
      imageAlt="daily.dev charm waiting for the agent's next update"
      title="Your agent is working"
      description="It keeps looking on its own and will let you know when there's something new."
      action={
        needsNotifications
          ? {
              label: 'Turn on notifications',
              onClick: () => update({ outputModes: { notification: true } }),
            }
          : undefined
      }
    />
  );
};
