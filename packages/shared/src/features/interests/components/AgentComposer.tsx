import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  AiIcon,
  FeatherIcon,
  MagicIcon,
  SendAirplaneIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAgent } from '../AgentContext';

const quickActions = [
  { label: 'Explore more', icon: <MagicIcon />, command: 'Explore more' },
  {
    label: 'Write a post',
    icon: <FeatherIcon />,
    command: 'Write me a post summarising what you found',
  },
  {
    label: 'Raise the bar',
    icon: <AiIcon />,
    command: 'Raise the bar — only surface top-tier content from now on',
  },
];

const maxComposerHeight = 160;

export const AgentComposer = (): ReactElement => {
  const { isWorking, workingLabel, runCommand, stopCommand } = useAgent();
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
  };

  const onSubmit = () => {
    const trimmed = feedback.trim();

    if (!trimmed) {
      return;
    }

    runCommand({ text: trimmed, label: `Applying “${trimmed}”` });
    setFeedback('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="relative shrink-0 px-3 pb-3 tablet:px-4 tablet:pb-4">
      {/* Softens the hard cut where the transcript disappears behind the bar,
          so the last line fades out instead of being sliced. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-background-default to-transparent"
      />
      <FlexCol className="mx-auto w-full max-w-[45rem] gap-2">
        <FlexRow className="min-h-12 items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-secondary">
          <textarea
            ref={inputRef}
            id="agent-composer"
            name="agent-composer"
            rows={1}
            aria-label="Tell the agent what to change"
            placeholder="Tell the agent what to change…"
            value={feedback}
            className="min-w-0 flex-1 resize-none self-center bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
            onChange={(event) => {
              setFeedback(event.target.value);
              resize();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
          {isWorking ? (
            <Button
              // No stop glyph in the icon set, and a drawn square is the
              // universal one — so it is rendered rather than imported.
              icon={
                <span
                  aria-hidden
                  className="size-2.5 rounded-2 bg-text-primary"
                />
              }
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Secondary}
              className="self-end"
              aria-label="Stop the agent"
              onClick={stopCommand}
            />
          ) : (
            <Button
              icon={<SendAirplaneIcon size={IconSize.Size16} />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
              className="self-end"
              aria-label="Send to agent"
              disabled={!feedback.trim()}
              onClick={onSubmit}
            />
          )}
        </FlexRow>

        <FlexRow className="items-center gap-2 px-0.5">
          <FlexRow className="no-scrollbar min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {quickActions.map(({ label, icon, command }) => (
              <Button
                key={label}
                icon={React.cloneElement(icon, { size: IconSize.Size16 })}
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Subtle}
                className="shrink-0"
                onClick={() => runCommand({ text: command, label })}
              >
                {label}
              </Button>
            ))}
          </FlexRow>
          {isWorking && (
            <FlexRow className="min-w-0 shrink items-center gap-1.5">
              <span className="size-1.5 shrink-0 animate-pulse rounded-6 bg-brand-default" />
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
                className="min-w-0 truncate"
              >
                {workingLabel}
              </Typography>
            </FlexRow>
          )}
        </FlexRow>
      </FlexCol>
    </div>
  );
};
