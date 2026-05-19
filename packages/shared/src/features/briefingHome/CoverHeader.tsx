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
    <header id="brief-top" className="flex flex-col gap-3 pt-1">
      <div className="flex items-center gap-2 text-text-quaternary">
        <span className="inline-block size-1.5 rounded-full bg-accent-ketchup-default" />
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.18em]"
        >
          {formatDate()} · {briefCopy.editionLabel(edition)}
        </Typography>
        <span className="text-border-subtlest-secondary">·</span>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          {briefCopy.briefMetaLine(totals.readMinutes, sourceCount)}
        </Typography>
      </div>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="!leading-[1.05] tracking-[-0.03em]"
      >
        {greetingFor(displayName)}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="max-w-[42rem] !leading-snug"
      >
        {briefCopy.heroDeck(totals.total, totals.readMinutes)}
      </Typography>
    </header>
  );
};
