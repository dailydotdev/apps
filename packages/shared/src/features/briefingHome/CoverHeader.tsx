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

interface CoverHeaderProps {
  edition: number;
  totals: {
    total: number;
    readMinutes: number;
  };
  sourceCount: number;
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export const CoverHeader = ({
  edition,
  totals,
  sourceCount,
}: CoverHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  return (
    <header id="brief-top" className="flex scroll-mt-20 flex-col gap-1.5">
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        bold
        className="uppercase tracking-[0.16em]"
      >
        {formatDate()} · {briefCopy.editionLabel(edition)} ·{' '}
        {briefCopy.briefMetaLine(totals.readMinutes, sourceCount)}
      </Typography>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Title1}
        bold
        className="!leading-tight tracking-[-0.025em]"
      >
        {greetingFor(displayName)}{' '}
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Title1}
          color={TypographyColor.Tertiary}
        >
          — {briefCopy.heroDeck(totals.total, totals.readMinutes)}
        </Typography>
      </Typography>
    </header>
  );
};
