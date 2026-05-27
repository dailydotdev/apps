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
import { BriefFeedback } from './BriefFeedback';

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

export const CoverClosing = (): ReactElement => {
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
      <BriefFeedback
        prompt="Was today's brief useful?"
        size="md"
        align="center"
        className="mb-2"
      />

      <div className="flex flex-col items-center gap-0.5">
        <div className="bg-accent-avocado-float flex size-12 items-center justify-center rounded-full text-accent-avocado-default">
          <VIcon size={IconSize.Medium} secondary />
        </div>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="!leading-tight tracking-[-0.02em]"
        >
          You&apos;re all caught up
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          Next brief drops {tomorrow}.
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
