import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { TerminalIcon } from '../../../components/icons/Terminal';
import { VIcon } from '../../../components/icons/V';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featureAgentOnboardingEntry } from '../../../lib/featureManagement';
import { LogEvent } from '../../../lib/log';
import { agentOnboardingPrompt } from '../prompt';

type AgentOnboardingEntryProps = {
  className?: string;
};

type CopyState = 'idle' | 'copied' | 'blocked';

// Agents run on a computer, so smaller screens are left out of the experiment.
export const AgentOnboardingEntry = ({
  className,
}: AgentOnboardingEntryProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureAgentOnboardingEntry,
    shouldEvaluate: isLaptop,
  });

  if (!isLaptop || !isEnabled) {
    return null;
  }

  const onCopy = async () => {
    logEvent({ event_name: LogEvent.ClickAgentOnboardingEntry });

    try {
      await navigator.clipboard.writeText(agentOnboardingPrompt);
      setCopyState('copied');
    } catch {
      setCopyState('blocked');
    }
  };

  const isCopied = copyState === 'copied';

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <Button
        className="w-full"
        icon={isCopied ? <VIcon /> : <TerminalIcon />}
        onClick={onCopy}
        size={ButtonSize.Large}
        type="button"
        variant={ButtonVariant.Float}
      >
        {isCopied ? 'Prompt copied' : 'Set up with your coding agent'}
      </Button>
      <p aria-live="polite" className="text-text-tertiary typo-footnote">
        {copyState === 'idle' &&
          'Copies a prompt for Claude Code, Codex, or Cursor.'}
        {isCopied &&
          'Paste it into your coding agent. It sets up daily.dev for you.'}
        {copyState === 'blocked' && (
          <>
            Your browser blocked the clipboard. Copy this prompt into your
            coding agent:{' '}
            <span className="select-all break-words text-text-primary">
              {agentOnboardingPrompt}
            </span>
          </>
        )}
      </p>
    </div>
  );
};
