import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

const formatDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

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

interface CoverHeaderProps {
  totals: {
    total: number;
    readMinutes: number;
  };
  sourceCount: number;
}

export const CoverHeader = ({
  totals,
  sourceCount,
}: CoverHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  return (
    <header
      id="brief-top"
      className="flex scroll-mt-20 items-baseline justify-between gap-3"
    >
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Title2}
        bold
        className="!leading-tight tracking-[-0.02em]"
      >
        {greetingFor(displayName)}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        bold
        className="shrink-0 uppercase tracking-[0.16em]"
      >
        {formatDate()} ·{' '}
        {briefCopy.briefMetaLine(totals.readMinutes, sourceCount)}
      </Typography>
    </header>
  );
};
