import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { SocialShareList } from '../widgets/SocialShareList';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, CopyIcon, ShareIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { Typography, TypographyType } from '../typography/Typography';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ShareProvider } from '../../lib/share';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import { SnapshotButton } from './SnapshotButton';

/**
 * Which action a surface leads with. Decided per surface in the Sharing map:
 * a link where the destination carries more than an image can, a snapshot
 * where the payload is the value and there is often no page to visit.
 */
export type SnapshotShareLead = 'link' | 'share' | 'snapshot';

export interface SnapshotShareActionsProps {
  lead: SnapshotShareLead;
  link: string;
  text: string;
  target: CaptureTarget;
  filename: string;
  captureOptions?: CaptureShareImageOptions;
  onCapture?: (blob: Blob) => void;
  onShare?: (provider: ShareProvider) => void;
  size?: ButtonSize;
  className?: string;
}

export function SnapshotShareActions({
  lead,
  link,
  text,
  target,
  filename,
  captureOptions,
  onCapture,
  onShare,
  size = ButtonSize.Small,
  className,
}: SnapshotShareActionsProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [copying, shareOrCopy] = useShareOrCopyLink({ link, text });

  const onCopy = () => {
    onShare?.(ShareProvider.CopyLink);
    shareOrCopy();
  };

  const snapshot = (
    <SnapshotButton
      captureOptions={captureOptions}
      filename={filename}
      onCapture={onCapture}
      showLabel={lead === 'snapshot'}
      size={size}
      target={target}
      variant={
        lead === 'snapshot' ? ButtonVariant.Secondary : ButtonVariant.Tertiary
      }
    />
  );

  const primary = {
    link: (
      <Button
        icon={<CopyIcon secondary={copying} />}
        onClick={onCopy}
        size={size}
        type="button"
        variant={ButtonVariant.Secondary}
      >
        Copy link
      </Button>
    ),
    share: (
      <Button
        icon={<ShareIcon />}
        onClick={() => {
          onShare?.(ShareProvider.Native);
          shareOrCopy();
        }}
        size={size}
        type="button"
        variant={ButtonVariant.Secondary}
      >
        Share
      </Button>
    ),
    snapshot,
  }[lead];

  return (
    <div className={classNames('flex items-center gap-1', className)}>
      {primary}

      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip content="More share options" visible={!open}>
          <PopoverTrigger asChild>
            <Button
              aria-label="More share options"
              icon={<ArrowIcon className="rotate-180" size={IconSize.Small} />}
              pressed={open}
              size={size}
              type="button"
              variant={ButtonVariant.Tertiary}
            />
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          align="end"
          avoidCollisions
          className="flex w-80 flex-wrap justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2"
          side="bottom"
        >
          <Typography bold className="w-full" type={TypographyType.Callout}>
            Share
          </Typography>
          {/* The lead is already outside, so the tray carries what is left. */}
          {lead !== 'snapshot' && (
            <div className="flex w-full flex-col gap-2">{snapshot}</div>
          )}
          <SocialShareList
            description={text}
            isCopying={copying}
            link={link}
            onClickSocial={(provider) => onShare?.(provider)}
            onCopy={onCopy}
            onNativeShare={() => {
              onShare?.(ShareProvider.Native);
              shareOrCopy();
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
