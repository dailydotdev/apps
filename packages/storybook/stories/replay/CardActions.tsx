import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { CameraIcon } from '@dailydotdev/shared/src/components/icons/Camera';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { copyBlob, downloadBlob, frameIn, snapshotElement } from './snapshot';

export type Status = 'idle' | 'busy' | 'done' | 'failed';

const label: Record<Status, string> = {
  idle: 'Snapshot',
  busy: 'Rendering…',
  done: 'Saved',
  failed: 'Could not render',
};


export const useSnapshot = (
  target: RefObject<HTMLElement | null>,
  filename: string,
): { status: Status; copied: boolean; snapshot: () => Promise<void>; copy: () => Promise<void> } => {
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  const render = useCallback(async (): Promise<Blob | null> => {
    const frame = frameIn(target.current);
    if (!frame) {
      return null;
    }
    return snapshotElement(frame, {
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      scale: 2,
    });
  }, [target]);

  const snapshot = useCallback(async () => {
    setStatus('busy');
    try {
      const blob = await render();
      if (!blob) {
        throw new Error('no frame');
      }
      downloadBlob(blob, `${filename}.png`);
      setStatus('done');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('snapshot failed', error);
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 1800);
  }, [filename, render]);

  const copy = useCallback(async () => {
    const blob = await render();
    if (blob && (await copyBlob(blob))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      return;
    }
    if (blob) {
      downloadBlob(blob, `${filename}.png`);
    }
  }, [filename, render]);

  return { status, copied, snapshot, copy };
};

/**
 * The row under a card: Snapshot writes the card to a PNG at authoring size,
 * Copy image puts the same PNG on the clipboard, Share opens the channels.
 * `target` is any wrapper that contains the frame; the thumbnail's scale is
 * ignored because the frame is captured at its layout size, not its painted
 * size.
 */
export const CardActions = ({
  target,
  filename,
  compact = false,
  shares = true,
  onShare,
  className,
}: {
  target: RefObject<HTMLElement | null>;
  filename: string;
  compact?: boolean;
  shares?: boolean;
  onShare?: (channel: string) => void;
  className?: string;
}): ReactElement => {
  const { status, copied, snapshot, copy } = useSnapshot(target, filename);

  const button =
    'inline-flex items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float font-bold text-text-primary hover:bg-surface-hover disabled:opacity-60';
  const size = compact ? 'px-2 py-1 typo-caption2' : 'px-3 py-1.5 typo-caption1';

  return (
    <div className={classNames('flex flex-wrap items-center gap-1.5', className)}>
      <button type="button" onClick={snapshot} disabled={status === 'busy'} className={classNames(button, size)} title="Download this card as a PNG">
        <CameraIcon size={compact ? IconSize.XSmall : IconSize.Small} secondary={status === 'done'} />
        {label[status]}
      </button>
      {shares && (
        <>
          <button type="button" onClick={copy} className={classNames(button, size)} title="Copy the PNG to the clipboard">
            <CopyIcon size={compact ? IconSize.XSmall : IconSize.Small} />
            {copied ? 'Copied' : 'Copy image'}
          </button>
          <button type="button" onClick={() => onShare?.('share')} className={classNames(button, size)} title="Share">
            <ShareIcon size={compact ? IconSize.XSmall : IconSize.Small} />
            {compact ? '' : 'Share'}
          </button>
        </>
      )}
    </div>
  );
};
