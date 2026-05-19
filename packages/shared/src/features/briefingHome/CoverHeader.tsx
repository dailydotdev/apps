import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { RefreshIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
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
    readCount: number;
  };
  sourceCount: number;
  onReset: () => void;
}

export const CoverHeader = ({
  totals,
  sourceCount,
  onReset,
}: CoverHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  return (
    <header
      id="brief-top"
      className="flex scroll-mt-20 flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
    >
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Title2}
        bold
        className="!leading-tight tracking-[-0.02em]"
      >
        {greetingFor(displayName)}
      </Typography>
      <div className="flex shrink-0 items-center gap-3">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.16em]"
        >
          {formatDate()} ·{' '}
          {briefCopy.briefMetaLine(totals.readMinutes, sourceCount)}
        </Typography>
        {totals.readCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-8 px-1.5 py-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-tertiary"
          >
            <RefreshIcon size={IconSize.XXSmall} />
            <Typography type={TypographyType.Caption2} bold>
              Reset
            </Typography>
          </button>
        ) : null}
      </div>
    </header>
  );
};
