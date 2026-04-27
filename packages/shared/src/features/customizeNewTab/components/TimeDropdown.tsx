import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Dropdown,
  type DropdownClassName,
} from '../../../components/fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/Button';
import { TimerIcon } from '../../../components/icons';

// 30-minute granularity (48 slots) is the granularity every focus app worth
// pointing at uses for "active hours" — iOS Focus, macOS DnD, Calendar event
// quick-pickers. People setting a focus schedule for 9:17 AM is not a real
// case, and the longer list makes the popup harder to scan.
const HALF_HOUR_MINUTES = [0, 30] as const;
const HALF_HOUR_TIME_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  Array.from({ length: 24 }, (_, hour) => hour).flatMap((hour) =>
    HALF_HOUR_MINUTES.map((minute) => {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
      )}`;
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      return { value, label: format(date, 'h:mm a') };
    }),
  );

const HALF_HOUR_VALUES = HALF_HOUR_TIME_OPTIONS.map((opt) => opt.value);
const HALF_HOUR_LABELS = HALF_HOUR_TIME_OPTIONS.map((opt) => opt.label);

const PARSE_HHMM = /^(\d{2}):(\d{2})$/;

// Snap an arbitrary "HH:mm" to the nearest 30-minute slot. Lets us tolerate
// legacy values written by the previous native <input type="time"> picker
// (which let users type any minute) without dropping them out of the list.
const snapToHalfHourIndex = (value: string): number => {
  const match = PARSE_HHMM.exec(value);
  if (!match) {
    return 0;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  const totalMinutes = hours * 60 + minutes;
  const snapped = Math.round(totalMinutes / 30) * 30;
  const wrapped = ((snapped % (24 * 60)) + 24 * 60) % (24 * 60);
  const snappedHour = Math.floor(wrapped / 60);
  const snappedMinute = wrapped % 60;
  const snappedValue = `${String(snappedHour).padStart(2, '0')}:${String(
    snappedMinute,
  ).padStart(2, '0')}`;
  const index = HALF_HOUR_VALUES.indexOf(snappedValue);
  return index >= 0 ? index : 0;
};

interface TimeDropdownProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  className?: DropdownClassName;
}

const DEFAULT_CLASSNAME: DropdownClassName = {
  container: 'min-w-0',
  // ButtonSize.Small already supplies `h-8 px-3 rounded-10`. We just want
  // the surface-float fill + primary text colour the rest of the sidebar
  // fields use. `bg-surface-float` is enough to override the
  // `tertiaryFloat` Button variant's transparent default.
  button: 'bg-surface-float',
  // Inner label span — typography goes here so it wins over the parent
  // Button's `typo-body` without us having to fight Tailwind specificity
  // through `!important`.
  label: 'mr-1 flex-1 truncate text-text-primary typo-footnote',
  menu: 'menu-primary scrollable max-h-64',
};

/**
 * Half-hour time picker styled with our design tokens. We use this instead
 * of `<input type="time">` so the popup picker matches the rest of the
 * platform (rounded-10 surface-float, our typography, accent-cabbage
 * selection) — browsers don't expose the host OS picker to web pages, and
 * Chrome's stock popup is a wheel/lookup widget that clashes hard with
 * everything else in the customizer.
 */
export const TimeDropdown = ({
  value,
  onChange,
  ariaLabel,
  className,
}: TimeDropdownProps): ReactElement => {
  const selectedIndex = useMemo(() => snapToHalfHourIndex(value), [value]);

  const mergedClassName: DropdownClassName = useMemo(
    () => ({
      ...DEFAULT_CLASSNAME,
      ...className,
    }),
    [className],
  );

  return (
    <Dropdown
      aria-label={ariaLabel}
      className={mergedClassName}
      icon={<TimerIcon secondary />}
      selectedIndex={selectedIndex}
      options={HALF_HOUR_LABELS}
      onChange={(_, index) => onChange(HALF_HOUR_VALUES[index])}
      buttonSize={ButtonSize.Small}
      buttonVariant={ButtonVariant.Float}
      scrollable
      drawerProps={{ title: ariaLabel }}
    />
  );
};
