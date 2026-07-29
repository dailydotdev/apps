import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  UpdateInterestInput,
  UserInterest,
} from '../../graphql/interests';
import { useSendInterestCommand } from './hooks/useSendInterestCommand';
import { useUpdateInterest } from './hooks/useUpdateInterest';
import { useToastNotification } from '../../hooks/useToastNotification';

export type AgentActivityKind =
  | 'run'
  | 'command'
  | 'finding'
  | 'post'
  | 'notification';

export type AgentActivityItem = {
  id: string;
  at: string;
  kind: AgentActivityKind;
  text: string;
};

type RunCommandArgs = {
  text: string;
  label?: string;
  targetId?: string;
  onComplete?: () => void;
};

type AgentContextValue = {
  id: string;
  interest?: UserInterest;
  isDemo: boolean;
  isWorking: boolean;
  workingLabel?: string;
  isTargetWorking: (targetId: string) => boolean;
  runCommand: (args: RunCommandArgs) => void;
  update: (data: UpdateInterestInput) => void;
  isUpdating: boolean;
  activity: AgentActivityItem[];
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
};

const AgentContext = createContext<AgentContextValue>({} as AgentContextValue);

export const useAgent = (): AgentContextValue => useContext(AgentContext);

const workDurationMs = 2600;

export const AgentProvider = ({
  id,
  interest,
  isDemo,
  children,
}: {
  id: string;
  interest?: UserInterest;
  isDemo: boolean;
  children: ReactNode;
}): ReactElement => {
  const { displayToast } = useToastNotification();
  const { sendCommand } = useSendInterestCommand(id);
  const { isUpdating, updateInterest } = useUpdateInterest(id);
  const [working, setWorking] = useState<{
    label: string;
    targetId?: string;
  } | null>(null);
  const [activity, setActivity] = useState<AgentActivityItem[]>([]);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const runCommand = useCallback(
    ({ text, label, targetId, onComplete }: RunCommandArgs) => {
      if (!isDemo && interest) {
        sendCommand(text).catch(() => undefined);
      } else {
        displayToast('Sent to the agent — it will update in the background');
      }

      setWorking({ label: label ?? text, targetId });
      setActivity((current) => [
        {
          id: `${Date.now()}`,
          at: new Date().toISOString(),
          kind: 'command',
          text,
        },
        ...current,
      ]);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setWorking(null);
        setActivity((current) => [
          {
            id: `${Date.now()}-done`,
            at: new Date().toISOString(),
            kind: 'run',
            text: `Applied "${text}" and refreshed the results`,
          },
          ...current,
        ]);
        onComplete?.();
      }, workDurationMs);
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  const update = useCallback(
    (data: UpdateInterestInput) => {
      if (isDemo || !interest) {
        return;
      }

      updateInterest(data).catch(() => undefined);
    },
    [interest, isDemo, updateInterest],
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      id,
      interest,
      isDemo,
      isWorking: !!working,
      workingLabel: working?.label,
      isTargetWorking: (targetId) => working?.targetId === targetId,
      runCommand,
      update,
      isUpdating,
      activity,
      isSettingsOpen,
      setSettingsOpen,
    }),
    [
      activity,
      id,
      interest,
      isDemo,
      isSettingsOpen,
      isUpdating,
      runCommand,
      update,
      working,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
