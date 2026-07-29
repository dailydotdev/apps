import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, CopyIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizSharePopoverProps {
  onClose: () => void;
}

// An in-card popover for sharing the quiz link: a big close button, a heading,
// the shareable URL in a read-only field, and a copy button. Rendered as an
// overlay inside the quiz surface (not a separate modal).
export const WeeklyQuizSharePopover = ({
  onClose,
}: WeeklyQuizSharePopoverProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  // Placeholder link until the real shareable quiz URL is wired up.
  const url = 'https://daily.dev/quiz/weekly-tech-news';

  const copy = (): void => {
    navigator.clipboard
      ?.writeText(url)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  return (
    <div className="absolute inset-0 z-[20] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-overlay-primary-pepper"
        onClick={onClose}
      />
      <div
        className={classNames(
          'relative flex w-full max-w-sm flex-col gap-4 rounded-24 p-6',
          styles.sharePanel,
        )}
      >
        <button
          type="button"
          aria-label="Close share"
          className="hover:bg-white/15 absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-12 text-white transition-colors"
          onClick={onClose}
        >
          <MiniCloseIcon size={IconSize.Large} />
        </button>
        <Typography
          type={TypographyType.Title3}
          bold
          tag={TypographyTag.H2}
          className="!text-white"
        >
          Share the quiz
        </Typography>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Quiz link"
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 rounded-10 bg-white px-3 py-2 text-black typo-footnote"
          />
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<CopyIcon />}
            onClick={copy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
};
