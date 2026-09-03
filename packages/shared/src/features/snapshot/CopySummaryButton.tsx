import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { CopyStateIcon } from '../../components/share/CopyStateIcon';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useCopyText } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks';
import { ReferralCampaignKey } from '../../lib/referral';
import {
  ToastType,
  useToastNotification,
} from '../../hooks/useToastNotification';

/**
 * #6350's Copy summary. One press puts the headline, the TLDR and the link on
 * the clipboard together, so pasting into a thread gives a usable message
 * rather than a bare URL — the payload is text because the point is that it
 * can be pasted and edited, not looked at.
 */
export function CopySummaryButton({
  title,
  summary,
  link,
  className,
}: {
  title: string;
  summary: string;
  link: string;
  className?: string;
}): ReactElement {
  const [copied, copy] = useCopyText();
  const { getShortUrl } = useGetShortUrl();
  const { displayToast } = useToastNotification();

  // The clipboard rejects outright when the document is not focused, and a
  // press that reports nothing at all reads as a dead button.
  const onCopy = useCallback(async () => {
    try {
      // The tracked short link, like every other copy on the page — a raw
      // permalink pasted into a thread is attributed to nobody.
      const shortLink = await getShortUrl(link, ReferralCampaignKey.SharePost);

      await copy({
        textToCopy: [title, summary, shortLink].join('\n\n'),
        message: '✅ Copied summary',
      });
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  }, [copy, displayToast, getShortUrl, link, summary, title]);

  return (
    <Tooltip content="Copy summary">
      <Button
        aria-label="Copy summary"
        // Quieter than the body copy it trails: it runs in at the end of the
        // summary's last line and must not break the paragraph's colour.
        className={classNames(
          'ml-1 align-middle !text-text-quaternary',
          className,
        )}
        icon={<CopyStateIcon copied={copied} />}
        onClick={onCopy}
        size={ButtonSize.XSmall}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
}
