import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ShareIcon,
  LinkIcon,
  MailIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { briefCopy } from './copy';

interface ShareBriefProps {
  variant?: ButtonVariant;
  label?: string;
}

const SHARE_URL = 'https://app.daily.dev/brief';
const SHARE_TITLE = "Today's daily.dev brief";

export const ShareBrief = ({
  variant = ButtonVariant.Primary,
  label,
}: ShareBriefProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked; fall through silently
    }
  }, []);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(SHARE_TITLE);
    const body = encodeURIComponent(
      `Today's brief caught me up on the dev world in 3 min: ${SHARE_URL}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  }, []);

  const handleSystem = useCallback(async () => {
    type ShareCapable = Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    const nav = navigator as ShareCapable;
    if (nav.share) {
      try {
        await nav.share({ title: SHARE_TITLE, url: SHARE_URL });
      } catch {
        // share dismissed; no-op
      }
    } else {
      await handleCopy();
    }
    setOpen(false);
  }, [handleCopy]);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        type="button"
        variant={variant}
        size={ButtonSize.Small}
        icon={<ShareIcon />}
        onClick={() => setOpen((v) => !v)}
      >
        {label ?? briefCopy.closingShare}
      </Button>
      <div
        role="menu"
        className={classNames(
          'absolute right-0 z-tooltip mt-2 min-w-[14rem] origin-top-right rounded-12 border border-border-subtlest-secondary bg-background-popover p-2 shadow-3 transition-all',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none translate-y-1 opacity-0',
        )}
      >
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          bold
          className="px-2 py-1 uppercase tracking-[0.14em]"
        >
          {briefCopy.shareHead}
        </Typography>
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center gap-2 rounded-8 px-2 py-2 text-left transition-colors hover:bg-surface-float"
        >
          <LinkIcon size={IconSize.XSmall} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            {copied ? briefCopy.shareCopied : briefCopy.shareCopy}
          </Typography>
        </button>
        <button
          type="button"
          onClick={handleEmail}
          className="flex w-full items-center gap-2 rounded-8 px-2 py-2 text-left transition-colors hover:bg-surface-float"
        >
          <MailIcon size={IconSize.XSmall} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            {briefCopy.shareEmail}
          </Typography>
        </button>
        <button
          type="button"
          onClick={handleSystem}
          className="flex w-full items-center gap-2 rounded-8 px-2 py-2 text-left transition-colors hover:bg-surface-float"
        >
          <ShareIcon size={IconSize.XSmall} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            {briefCopy.shareSystem}
          </Typography>
        </button>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="mt-1 border-t border-border-subtlest-tertiary px-2 pt-2 italic"
        >
          {briefCopy.shareFooter}
        </Typography>
      </div>
    </div>
  );
};
