import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

interface StoredIntention {
  text: string;
  date: string;
}

const STORAGE_KEY = 'newtab:zen:intention';
const MAX_LENGTH = 140;

// ISO date string, local time, YYYY-MM-DD. We compare dates (not timestamps)
// so the intention survives time zone changes within the same local day but
// resets at local midnight.
const todayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readStoredIntention = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return '';
  }
  try {
    const parsed = JSON.parse(raw) as StoredIntention;
    if (parsed.date !== todayKey()) {
      return '';
    }
    return parsed.text ?? '';
  } catch {
    return '';
  }
};

const writeStoredIntention = (text: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!text) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const stored: StoredIntention = { text, date: todayKey() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

export const ZenIntention = (): ReactElement => {
  const { logEvent } = useLogContext();
  const [value, setValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = readStoredIntention();
    setValue(stored);
    setIsEditing(!stored);
  }, []);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const commit = useCallback(
    (next: string) => {
      const trimmed = next.trim().slice(0, MAX_LENGTH);
      setValue(trimmed);
      writeStoredIntention(trimmed);
      setIsEditing(false);
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: trimmed ? 'intention_set' : 'intention_cleared',
      });
    },
    [logEvent],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(event.currentTarget.value);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
      >
        What&apos;s your focus today?
      </Typography>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          maxLength={MAX_LENGTH}
          placeholder="Ship focus mode v2"
          onBlur={(event) => commit(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          className={classNames(
            'w-full max-w-xl rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-center text-text-primary typo-title3',
            'placeholder:text-text-quaternary focus:border-accent-cabbage-default focus:outline-none',
          )}
          aria-label="Today's focus"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="max-w-xl rounded-12 px-4 py-3 text-center text-text-primary typo-title3 hover:bg-surface-float"
        >
          {value || (
            <span className="text-text-tertiary">
              Click to set today&apos;s focus
            </span>
          )}
        </button>
      )}
    </div>
  );
};
