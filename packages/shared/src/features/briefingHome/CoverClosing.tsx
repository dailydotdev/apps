import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { ShareIcon, VIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { briefCopy } from './copy';

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
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  const onShare = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: briefCopy.shareHead, url });
      } catch {
        /* user dismissed */
      }
      return;
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareState('copied');
        window.setTimeout(() => setShareState('idle'), 2000);
      } catch {
        /* clipboard blocked */
      }
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
        onClick={onShare}
        className="mt-1 inline-flex items-center gap-1.5 rounded-10 border border-border-subtlest-quaternary bg-background-default px-3 py-2 text-text-primary transition-colors hover:bg-surface-float"
      >
        <ShareIcon size={IconSize.XSmall} />
        <Typography type={TypographyType.Footnote} bold>
          {shareState === 'copied' ? 'Link copied' : 'Share this brief'}
        </Typography>
      </button>
    </section>
  );
};
