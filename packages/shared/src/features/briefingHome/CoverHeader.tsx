import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon, MiniCloseIcon } from '../../components/icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

interface CoverHeaderProps {
  onCollapse: () => void;
  onHide: () => void;
  skipAnchor: string;
}

const greetingFor = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return briefCopy.greeting.morning(name);
  }
  if (hour < 18) {
    return briefCopy.greeting.afternoon(name);
  }
  return briefCopy.greeting.evening(name);
};

const formatDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

export const CoverHeader = ({
  onCollapse,
  onHide,
  skipAnchor,
}: CoverHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  return (
    <header className="mb-6 flex items-end justify-between gap-3 pt-4">
      <div className="min-w-0 flex-1">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="mb-1 uppercase tracking-[0.18em]"
        >
          {formatDate()} · {briefCopy.eyebrowToday}
        </Typography>
        <Typography
          type={TypographyType.Title2}
          bold
          className="!leading-tight tracking-[-0.02em]"
        >
          {greetingFor(displayName)}
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="rotate-180" />}
          tag="a"
          href={skipAnchor}
          aria-label={briefCopy.controlSkip}
        />
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon />}
          onClick={onCollapse}
          aria-label={briefCopy.controlCollapse}
        />
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MiniCloseIcon />}
          onClick={onHide}
          aria-label={briefCopy.controlHide}
        />
      </div>
    </header>
  );
};
