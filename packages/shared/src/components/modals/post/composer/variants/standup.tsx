import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { MegaphoneIcon } from '../../../../icons';
import { TextField } from '../../../../fields/TextField';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../typography/Typography';
import { LiveRoomMode } from '../../../../../graphql/liveRooms';
import type { ComposerVariant, StandupConfig } from '../types';

const MAX_TOPIC_LENGTH = 280;
const DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT = 4;

export const DEFAULT_STANDUP_CONFIG: StandupConfig = {
  topic: '',
  mode: LiveRoomMode.Moderated,
  speakerLimit: DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT,
};

const isStandupValid = (config: StandupConfig): boolean => {
  const topic = config.topic.trim();
  if (!topic || topic.length > MAX_TOPIC_LENGTH) {
    return false;
  }
  if (config.mode === LiveRoomMode.FreeForAll) {
    return (
      typeof config.speakerLimit === 'number' &&
      Number.isInteger(config.speakerLimit) &&
      config.speakerLimit > 0
    );
  }
  return true;
};

export const standupVariant: ComposerVariant<'standup'> = {
  kind: 'standup',
  picker: {
    label: 'Standup',
    icon: <MegaphoneIcon />,
    description: 'Start a live audio room around a topic.',
  },
  isEnabled: () => true,
  submitLabel: () => 'Start standup',
  validate: (state) => {
    if (!isStandupValid(state.standup)) {
      return { isValid: false, reason: 'invalid-standup' };
    }
    return { isValid: true };
  },
  serialize: (state) => {
    if (!isStandupValid(state.standup)) {
      return null;
    }
    const { topic, mode, speakerLimit } = state.standup;
    return {
      kind: 'standup',
      payload: {
        topic: topic.trim(),
        mode,
        ...(mode === LiveRoomMode.FreeForAll && speakerLimit != null
          ? { speakerLimit }
          : {}),
      },
    };
  },
};

interface StandupBodyProps {
  config: StandupConfig;
  onChange: (next: StandupConfig) => void;
}

const ModeOption = ({
  value,
  label,
  description,
  isActive,
  onClick,
}: {
  value: LiveRoomMode;
  label: string;
  description: string;
  isActive: boolean;
  onClick: (value: LiveRoomMode) => void;
}): ReactElement => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={() => onClick(value)}
    className={classNames(
      'flex flex-col items-start gap-1 rounded-12 border p-3 text-left transition-colors',
      isActive
        ? 'border-accent-cabbage-default bg-surface-float'
        : 'border-border-subtlest-tertiary hover:bg-surface-float',
    )}
  >
    <Typography type={TypographyType.Callout} bold>
      {label}
    </Typography>
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </button>
);

export const StandupBody = ({
  config,
  onChange,
}: StandupBodyProps): ReactElement => {
  const handleTopicChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...config, topic: event.target.value });
    },
    [config, onChange],
  );

  const handleModeChange = useCallback(
    (mode: LiveRoomMode) => {
      const speakerLimit =
        mode === LiveRoomMode.FreeForAll && config.speakerLimit == null
          ? DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT
          : config.speakerLimit;
      onChange({ ...config, mode, speakerLimit });
    },
    [config, onChange],
  );

  const handleSpeakerLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      const parsed = next === '' ? undefined : Number(next);
      onChange({
        ...config,
        speakerLimit:
          parsed !== undefined && Number.isInteger(parsed) && parsed > 0
            ? parsed
            : undefined,
      });
    },
    [config, onChange],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-1">
      <textarea
        name="topic"
        value={config.topic}
        onChange={handleTopicChange}
        placeholder="What do you want to talk about?"
        maxLength={MAX_TOPIC_LENGTH}
        rows={1}
        className="w-full resize-none overflow-hidden break-words bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
        aria-label="Standup topic"
      />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Footnote} bold>
          Standup mode
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Pick how the stage works — we&apos;ll spin up the standup right away.
        </Typography>
        <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
          <ModeOption
            value={LiveRoomMode.Moderated}
            label="Moderated"
            description="People join a queue and the host brings them on stage."
            isActive={config.mode === LiveRoomMode.Moderated}
            onClick={handleModeChange}
          />
          <ModeOption
            value={LiveRoomMode.FreeForAll}
            label="Free for all"
            description="Anyone can hop on stage until the speaker limit is full."
            isActive={config.mode === LiveRoomMode.FreeForAll}
            onClick={handleModeChange}
          />
        </div>
      </div>
      {config.mode === LiveRoomMode.FreeForAll && (
        <TextField
          inputId="standup-speaker-limit"
          name="speakerLimit"
          label="Speaker limit"
          type="number"
          min={1}
          placeholder={String(DEFAULT_FREE_FOR_ALL_SPEAKER_LIMIT)}
          value={config.speakerLimit ?? ''}
          onChange={handleSpeakerLimitChange}
          fieldType="secondary"
          hint="How many audience members can be on stage at once."
        />
      )}
    </div>
  );
};
