import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { CopyStateIcon } from '../../../components/share/CopyStateIcon';
import { useCopyText } from '../../../hooks/useCopy';
import { truncateAtWordBoundary } from '../../../lib/strings';
import {
  ToastType,
  useToastNotification,
} from '../../../hooks/useToastNotification';

/** Enough of the block to tell two buttons apart, not the whole paragraph. */
const LABEL_LENGTH = 60;

/**
 * #6350's copy-summary icon, per bullet: the text plus the brief link, so a
 * paste carries the claim and where it came from.
 */
export function BriefBlockCopyButton({
  text,
  link,
}: {
  text: string;
  link: string;
}): ReactElement {
  const [copied, copy] = useCopyText([text, link].join('\n\n'));
  const { displayToast } = useToastNotification();
  // Every bullet carries one of these, so a label that only said "Copy" would
  // read as a wall of identical buttons on a screen reader.
  const label = `Copy: ${truncateAtWordBoundary(text, LABEL_LENGTH)}`;

  // The clipboard rejects outright when the document is not focused, and a
  // press that reports nothing at all reads as a dead button.
  const onCopy = useCallback(async () => {
    try {
      await copy({ message: '✅ Copied' });
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  }, [copy, displayToast]);

  return (
    <Tooltip content={copied ? 'Copied!' : 'Copy'}>
      <Button
        aria-label={label}
        // Quieter than the body it trails: it runs in at the end of the last
        // line and must not break the paragraph's colour.
        className="ml-1 align-middle !text-text-quaternary"
        icon={<CopyStateIcon copied={copied} />}
        onClick={onCopy}
        size={ButtonSize.XSmall}
        type="button"
        variant={ButtonVariant.Tertiary}
      />
    </Tooltip>
  );
}
