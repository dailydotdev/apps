import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useUserStack } from '@dailydotdev/shared/src/features/profile/hooks/useUserStack';
import { UserStackModal } from '@dailydotdev/shared/src/features/profile/components/stack/UserStackModal';
import type { AddUserStackInput } from '@dailydotdev/shared/src/graphql/user/userStack';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';

export interface StackableTool {
  id: string;
  title: string;
  slug: string;
}

interface UseAddToolToStack {
  stackedToolIds: Set<string>;
  openAddModal: (tool: StackableTool) => void;
  modal: ReactElement | null;
}

export function useAddToolToStack(origin: Origin): UseAddToolToStack {
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { stackItems, add } = useUserStack(
    (user ?? null) as PublicProfile | null,
  );
  const [pendingTool, setPendingTool] = useState<StackableTool | null>(null);

  const stackedToolIds = useMemo(
    () => new Set(stackItems.map((item) => item.tool.id)),
    [stackItems],
  );

  const openAddModal = useCallback(
    (tool: StackableTool) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.AddToStack });
        return;
      }
      logEvent({
        event_name: LogEvent.StartAddUserStack,
        target_id: tool.slug,
        extra: JSON.stringify({ origin }),
      });
      setPendingTool(tool);
    },
    [user, showLogin, logEvent, origin],
  );

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

  const modal = pendingTool ? (
    <UserStackModal
      isOpen
      onRequestClose={() => setPendingTool(null)}
      onSubmit={handleAdd}
      defaultTitle={pendingTool.title}
      modalTitle="Add stack/tool to profile"
    />
  ) : null;

  return { stackedToolIds, openAddModal, modal };
}
