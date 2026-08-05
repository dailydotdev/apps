import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexRow } from '../../../components/utilities';
import { useAgent } from '../AgentContext';
import { AgentThinkingOrb } from './AgentThinkingOrb';

const formatElapsed = (ms: number): string => {
  const seconds = Math.max(0, Math.floor(ms / 1000));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

// The transcript's answer to Claude Code's running-status row: one line that
// says the turn was received, what it is doing and how long it has been at it.
// It stands in for the reply until the reply exists, so the conversation never
// shows an empty slot.
export const AgentThinkingStrip = (): ReactElement => {
  const { workingLabel, workingSince } = useAgent();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!workingSince) {
      return undefined;
    }

    setElapsed(Date.now() - workingSince);
    const timer = setInterval(
      () => setElapsed(Date.now() - workingSince),
      1000,
    );

    return () => clearInterval(timer);
  }, [workingSince]);

  return (
    <FlexRow className="items-center gap-2" aria-live="polite">
      <span className="shrink-0 text-brand-default">
        <AgentThinkingOrb size={22} />
      </span>
      <Typography type={TypographyType.Footnote} bold>
        Working
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {formatElapsed(elapsed)}
      </Typography>
      {workingLabel && (
        <>
          <span
            aria-hidden
            className="size-0.5 shrink-0 rounded-6 bg-text-quaternary"
          />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 truncate"
          >
            {workingLabel}
          </Typography>
        </>
      )}
    </FlexRow>
  );
};
