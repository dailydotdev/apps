import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { LinkIcon, VIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useToastNotification } from '../../hooks/useToastNotification';

interface CoverClosingProps {
  totals: {
    total: number;
    readMinutes: number;
    savedMinutes: number;
    readCount: number;
    isComplete: boolean;
  };
  edition: number;
}

const formatTomorrow = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(9, 0, 0, 0);
  return t.toLocaleString(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const CoverClosing = ({
  totals,
  edition,
}: CoverClosingProps): ReactElement => {
  const tomorrow = useMemo(formatTomorrow, []);
  const { displayToast } = useToastNotification();

  const onCopy = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      displayToast('Link copied to clipboard');
    } catch {
      displayToast("Couldn't copy link, try again");
    }
  };

  return (
    <section
      aria-label="End of brief"
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <div className="bg-accent-avocado-float flex size-12 items-center justify-center rounded-full text-accent-avocado-default">
        <VIcon size={IconSize.Medium} secondary />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="!leading-tight tracking-[-0.02em]"
        >
          You&apos;re all caught up
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[28rem] !leading-snug"
        >
          That&apos;s everything in today&apos;s brief — {totals.total} stories,
          ~{totals.readMinutes} minutes of reading distilled for you.
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="mt-1"
        >
          Next brief drops {tomorrow}
          {edition ? ` · No. ${edition + 1}` : ''}.
        </Typography>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="mt-1 inline-flex items-center gap-1.5 rounded-10 border border-border-subtlest-quaternary bg-background-default px-3 py-2 text-text-primary transition-colors hover:bg-surface-float"
      >
        <LinkIcon size={IconSize.XSmall} />
        <Typography type={TypographyType.Footnote} bold>
          Share this brief
        </Typography>
      </button>
    </section>
  );
};
