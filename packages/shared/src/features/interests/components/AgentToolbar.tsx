import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { TextField } from '../../../components/fields/TextField';
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
  PauseIcon,
  PlayIcon,
  SendAirplaneIcon,
  SettingsIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { UserInterestStatus } from '../../../graphql/interests';
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

export const AgentToolbar = (): ReactElement => {
  const {
    interest,
    isWorking,
    workingLabel,
    runCommand,
    update,
    setSettingsOpen,
  } = useAgent();
  const [feedback, setFeedback] = useState('');
  const isPaused = interest?.status !== UserInterestStatus.Active;

  const onSubmit = () => {
    const trimmed = feedback.trim();
    if (!trimmed) {
      return;
    }

    runCommand({ text: trimmed, label: `Applying “${trimmed}”` });
    setFeedback('');
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-popup px-3 pb-3 laptop:bottom-0 laptop:px-4 laptop:pb-6">
      <FlexCol className="pointer-events-auto mx-auto w-full max-w-[42rem] gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3">
        <FlexRow className="items-center gap-2">
          <span
            className={classNames(
              'flex size-8 shrink-0 items-center justify-center rounded-10',
              isWorking ? 'bg-action-bookmark-float' : 'bg-surface-float',
            )}
          >
            <AiIcon
              size={IconSize.Small}
              className={classNames(
                isWorking
                  ? 'animate-pulse text-brand-default'
                  : 'text-text-tertiary',
              )}
            />
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={
              isWorking ? TypographyColor.Primary : TypographyColor.Tertiary
            }
            className="min-w-0 flex-1"
            truncate
          >
            {isWorking
              ? `${workingLabel} — updating in the background…`
              : 'Your agent is listening. Tell it what to change.'}
          </Typography>
          <Button
            icon={isPaused ? <PlayIcon /> : <PauseIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            aria-label={isPaused ? 'Resume agent' : 'Pause agent'}
            onClick={() =>
              update({
                status: isPaused
                  ? UserInterestStatus.Active
                  : UserInterestStatus.Paused,
              })
            }
          />
          <Button
            icon={<SettingsIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            aria-label="Agent settings"
            onClick={() => setSettingsOpen(true)}
          />
        </FlexRow>

        <FlexRow className="items-center gap-2">
          <TextField
            className={{ container: 'flex-1' }}
            inputId="agent-toolbar-feedback"
            name="agent-toolbar-feedback"
            label="Tell the agent what to change"
            placeholder="e.g. fewer announcements, more source-level deep dives"
            value={feedback}
            valueChanged={setFeedback}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              }
            }}
          />
          <Button
            icon={<SendAirplaneIcon />}
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            aria-label="Send to agent"
            disabled={!feedback.trim()}
            onClick={onSubmit}
          />
        </FlexRow>

        <FlexRow className="flex-wrap gap-2">
          {quickActions.map(({ label, icon, command }) => (
            <Button
              key={label}
              icon={icon}
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              onClick={() => runCommand({ text: command, label })}
            >
              {label}
            </Button>
          ))}
        </FlexRow>
      </FlexCol>
    </div>
  );
};
