import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Dropdown } from '../../../components/fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/Button';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const formatPart = (value: number): string => value.toString().padStart(2, '0');

export type TimeDropdownProps = {
  /** Minutes since midnight (0-1440). */
  value: number;
  onChange: (minutes: number) => void;
  ariaLabel: string;
  id?: string;
  className?: string;
};

/**
 * Hour + minute pickers built on the shared `Dropdown` primitive so the
 * trigger styling matches the rest of the design system instead of
 * dropping a raw `<select>` into the panel.
 */
export const TimeDropdown = ({
  value,
  onChange,
  ariaLabel,
  id,
  className,
}: TimeDropdownProps): ReactElement => {
  const hour = Math.floor(value / 60) % 24;
  const minute = value % 60;

  const hourOptions = useMemo(() => HOURS.map(formatPart), []);
  const minuteOptions = useMemo(() => MINUTES.map(formatPart), []);

  const minuteIndex = Math.max(
    0,
    MINUTES.findIndex((m) => m === minute),
  );

  return (
    <div
      id={id}
      aria-label={ariaLabel}
      className={classNames('flex items-center gap-1', className)}
    >
      <Dropdown
        options={hourOptions}
        selectedIndex={hour}
        onChange={(_, index) => onChange(index * 60 + minute)}
        buttonAriaLabel={`${ariaLabel} hour`}
        buttonSize={ButtonSize.Small}
        buttonVariant={ButtonVariant.Float}
        scrollable
      />
      <span aria-hidden className="text-text-tertiary">
        :
      </span>
      <Dropdown
        options={minuteOptions}
        selectedIndex={minuteIndex}
        onChange={(_, index) => onChange(hour * 60 + MINUTES[index])}
        buttonAriaLabel={`${ariaLabel} minute`}
        buttonSize={ButtonSize.Small}
        buttonVariant={ButtonVariant.Float}
      />
    </div>
  );
};
