import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActionsKeys,
} from '@dailydotdev/shared/src/features/common/hooks/useAppAuth';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useFunnelBoot } from '@dailydotdev/shared/src/features/onboarding/hooks/useFunnelBoot';

export const ClientTest: FC = () => {
  const { user, dispatch } = useAppAuth();
  const { data: funnelBoot } = useFunnelBoot();
  const currentStep = funnelBoot?.funnelState?.session?.currentStep;

  return (
    <div className="border-gray-200 rounded-lg mt-6 border p-4">
      <h2 className="mb-2 text-lg font-bold">Client Component</h2>
      <p>
        <strong>Client</strong> says user is {user?.id ?? 'not logged'}
      </p>

      {funnelBoot?.funnelState && (
        <div className="my-2">
          <p>
            <strong>Current step (client):</strong> {currentStep || 'None'}
          </p>
          <p>
            <strong>Session ID (client):</strong>{' '}
            {funnelBoot.funnelState.session.id}
          </p>
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          onClick={() => dispatch({ type: AppAuthActionsKeys.REFRESH })}
        >
          Refetch user
        </Button>
        <Button
          type="button"
          onClick={() => dispatch({ type: AppAuthActionsKeys.LOGOUT })}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
