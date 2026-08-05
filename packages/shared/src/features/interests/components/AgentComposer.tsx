import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
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
import { useAgent } from '../AgentContext';

const quickActions = [
  { label: 'Explore more', icon: <MagicIcon />, command: 'Explore more' },
  {
    label: 'Write me a post',
    icon: <FeatherIcon />,
    command: 'Write me a post summarising what you found',
  },
  {
    label: 'Only the best',
    icon: <AiIcon />,
    command: 'Raise the bar — only surface top-tier content from now on',
  },
];

const maxComposerHeight = 160;

export const AgentComposer = (): ReactElement => {
  const { isWorking, workingLabel, runCommand } = useAgent();
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
    <div className="shrink-0 px-3 pb-3 tablet:px-4 tablet:pb-4">
      <FlexCol className="mx-auto w-full max-w-[45rem] gap-1.5">
        <FlexRow className="h-4 items-center gap-2 px-1">
          {isWorking && (
            <>
              <span className="size-1.5 shrink-0 animate-pulse rounded-6 bg-brand-default" />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="min-w-0"
                truncate
              >
                {workingLabel} — updating in the background…
              </Typography>
            </>
          )}
        </FlexRow>
        <FlexCol className="rounded-16 border border-border-subtlest-tertiary bg-surface-float transition-colors focus-within:border-border-subtlest-secondary">
          <textarea
            ref={inputRef}
            id="agent-composer"
            name="agent-composer"
            rows={1}
            aria-label="Tell the agent what to change"
            placeholder="Tell the agent what to change…"
            value={feedback}
            className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
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
          <FlexRow className="items-center gap-0.5 px-2 pb-2">
            {quickActions.map(({ label, icon, command }) => (
              <Tooltip key={label} content={label}>
                <Button
                  icon={icon}
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Tertiary}
                  aria-label={label}
                  onClick={() => runCommand({ text: command, label })}
                />
              </Tooltip>
            ))}
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              className={classNames(
                'ml-2 hidden min-w-0 truncate tablet:block',
                feedback && 'opacity-0',
              )}
            >
              Enter to send, Shift + Enter for a new line
            </Typography>
            <Button
              icon={<SendAirplaneIcon />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
              className="ml-auto"
              aria-label="Send to agent"
              disabled={!feedback.trim()}
              onClick={onSubmit}
            />
          </FlexRow>
        </FlexCol>
      </FlexCol>
    </div>
  );
};
