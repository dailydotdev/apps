import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CopyBlock } from '../../../components/CopyBlock';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { AgentOnboardingEntryState } from '../hooks/useAgentOnboardingEntry';
import {
  SignupMode,
  useAgentOnboardingEntry,
} from '../hooks/useAgentOnboardingEntry';
import { agentOnboardingPrompt } from '../prompt';
import { SupportedAgents } from './SupportedAgents';

const modes = [
  { mode: SignupMode.Manual, label: 'Sign up' },
  { mode: SignupMode.Agent, label: 'Use your agent' },
];

type AgentSignupModesProps = {
  entry: AgentOnboardingEntryState;
  children: ReactNode;
  className?: string;
};

/** The choice between the regular sign-up and the agent's prompt. */
export const AgentSignupModes = ({
  entry: { hasModes, isAgentMode, selectedMode, onSelect },
  children,
  className,
}: AgentSignupModesProps): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <>
      {hasModes && (
        <div
          role="tablist"
          aria-label="How to sign up"
          className={classNames(
            'flex w-full gap-1 rounded-12 bg-surface-float p-1',
            className,
          )}
        >
          {modes.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={mode === selectedMode}
              className={classNames(
                'min-w-0 flex-1 whitespace-nowrap rounded-10 px-3 py-2 font-bold transition-colors typo-callout',
                mode === selectedMode
                  ? 'bg-background-default text-text-primary shadow-2'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
              onClick={() => onSelect(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div
        className={isAgentMode ? undefined : 'contents'}
        hidden={isAgentMode}
      >
        {children}
      </div>
      {isAgentMode && (
        <div
          role="tabpanel"
          className={classNames('flex w-full flex-col gap-4', className)}
        >
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Paste this into your coding agent. It opens daily.dev so you can
            create your account in one click, then builds a feed around what you
            work on.
          </Typography>
          <CopyBlock
            text={agentOnboardingPrompt}
            label="Copy prompt"
            onCopy={() =>
              logEvent({ event_name: LogEvent.CopyAgentOnboardingPrompt })
            }
          />
          <SupportedAgents />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Your agent asks before it looks at your projects, and nothing
            changes until you approve its plan.
          </Typography>
        </div>
      )}
    </>
  );
};

type AgentOnboardingEntryProps = {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
};

export const AgentOnboardingEntry = ({
  children,
  isActive = true,
  className,
}: AgentOnboardingEntryProps): ReactElement => {
  const entry = useAgentOnboardingEntry(isActive);

  return (
    <AgentSignupModes entry={entry} className={className}>
      {children}
    </AgentSignupModes>
  );
};
