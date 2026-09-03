import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DownloadIcon, ImageIcon, LinkIcon, ShareIcon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { useCopyText } from '../../hooks/useCopy';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from '../../lib/imageShare/captureShareImage';
import { SocialShareList } from '../widgets/SocialShareList';
import { SocialShareContainer } from '../widgets/SocialShareContainer';
import { SplitShareButton } from '../share/SplitShareButton';
import { SnapshotImageSection } from './SnapshotImageSection';
import { Divider } from '../utilities/Divider';
import { useSnapshotCapture } from '../../features/snapshot/useSnapshotCapture';

export const SHARE_LABEL = 'Share';

/**
 * Menu layouts under review in Features/Snapshot/Menu styles. Once one wins,
 * the rest go and this prop goes with them.
 */
export type SnapshotMenuVariant =
  | 'rows'
  | 'rowsCentered'
  | 'overlay'
  | 'compact'
  | 'split';

export interface SnapshotButtonProps {
  /** The designed square card to rasterize. */
  card?: ReactNode;
  /** Captured instead of `card`, for surfaces with no designed card yet. */
  target?: CaptureTarget;
  /** Omitted on surfaces with no shareable URL, which drops the copy-link row. */
  link?: string;
  filename?: string;
  label?: string;
  showLabel?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  captureOptions?: CaptureShareImageOptions;
  onCapture?: (blob: Blob) => void;
  menuVariant?: SnapshotMenuVariant;
  /** `split` only: the share text networks pre-fill. */
  shareText?: string;
  /**
   * `split` only: squad tiles for the "Share with your squad" section. The
   * component has no access to the user's squads, so the caller supplies them.
   */
  squads?: ReactNode;
}

export function SnapshotButton({
  card,
  target,
  link,
  filename = 'daily-share',
  label = SHARE_LABEL,
  showLabel = true,
  captureOptions,
  onCapture,
  menuVariant = 'overlay',
  shareText = '',
  squads,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
  className,
}: SnapshotButtonProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [copying, copyText] = useCopyText();

  if (!card && !target) {
    throw new Error('SnapshotButton needs either a card or a target');
  }

  const {
    status,
    preview,
    width,
    height,
    offScreenCard,
    canShareFile,
    canCopyImage,
    shareImage: onShareImage,
  } = useSnapshotCapture({
    card,
    target,
    filename,
    captureOptions,
    // The split variant delegates to SnapshotImageSection, which runs its own
    // capture — without this the same card would be rasterized twice per open.
    isActive: isOpen && menuVariant !== 'split',
    onCapture,
  });

  // The trigger sits inside clickable cards, rows and links on every placement.
  const onTriggerClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const isCentered = menuVariant === 'rowsCentered';
  // Native sheet or clipboard both read as sharing; only the download differs.
  const canShare = canShareFile || canCopyImage;
  const imageIcon = canShare ? <ImageIcon /> : <DownloadIcon />;
  const imageLabel = canShare ? 'Share as image' : 'Download image';

  const previewBox = (
    <div
      className={classNames(
        'relative w-full overflow-hidden rounded-b-14 bg-surface-float',
        status === 'loading' && 'animate-pulse',
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {status === 'ready' && (
        <img
          src={preview}
          alt="Preview of what will be shared"
          className="size-full object-cover"
        />
      )}
      {status === 'error' && (
        <div className="flex size-full items-center justify-center px-3 text-center text-text-quaternary typo-caption1">
          Preview unavailable
        </div>
      )}
      {status === 'ready' && menuVariant === 'overlay' && (
        // A menu item rather than a Button, so the overlay keeps the menu's
        // roving focus, keyboard select and close-on-select.
        <DropdownMenuItem
          className="!absolute bottom-3 left-1/2 !h-7 -translate-x-1/2 gap-1.5 !bg-white !px-3 font-bold !text-black shadow-2 !typo-caption1"
          onClick={onShareImage}
        >
          {imageIcon}
          {imageLabel}
        </DropdownMenuItem>
      )}
    </div>
  );

  // Tsahi's split control from #6369: the left half copies, the chevron drops
  // the standard tile grid. The image action joins it as one more tile.
  if (menuVariant === 'split') {
    return (
      <SplitShareButton
        className={className}
        copied={copying}
        dropdownLabel="More share options"
        // The same section the modal uses, so the two surfaces show one
        // treatment. It owns its own capture, which is why this branch leaves
        // the button's off-screen card unmounted.
        header={
          <SnapshotImageSection
            captureOptions={captureOptions}
            card={card}
            className="px-2 pt-2"
            compact
            filename={filename}
            onCapture={onCapture}
          />
        }
        label="Copy link"
        menu={
          <div className="flex flex-col gap-3 px-2 pb-2">
            {squads && (
              <SocialShareContainer compact title="Share with your squad">
                {squads}
              </SocialShareContainer>
            )}
            <SocialShareContainer compact title="Share externally">
              <SocialShareList
                link={link ?? ''}
                description={shareText}
                onClickSocial={() => undefined}
                onNativeShare={() => copyText({ textToCopy: link })}
                shortenUrl={false}
                size={ButtonSize.Medium}
              />
            </SocialShareContainer>
          </div>
        }
        // Whole sections rather than a bare tile grid, and the modal's width so
        // SocialShareContainer's five columns fit.
        menuClassName="w-[21rem]"
        menuLayout="plain"
        menuScrollableClassName="max-h-[40rem] overflow-y-auto"
        onCopy={() => copyText({ textToCopy: link })}
        onOpenChange={setIsOpen}
        size={size}
        triggerText={showLabel ? 'Copy link' : undefined}
        variant={variant}
      />
    );
  }

  return (
    <>
      {offScreenCard}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          asChild
          tooltip={showLabel ? undefined : { content: label }}
        >
          <Button
            type="button"
            aria-label={label}
            className={classNames('shrink-0', className)}
            size={size}
            variant={variant}
            icon={<ShareIcon />}
            onClick={onTriggerClick}
          >
            {showLabel ? label : undefined}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-52 !min-w-0 !px-0 !pb-1.5 !pt-0"
        >
          {menuVariant !== 'compact' && previewBox}

          {(menuVariant === 'rows' ||
            menuVariant === 'compact' ||
            isCentered) && (
            <DropdownMenuItem
              onClick={onShareImage}
              disabled={status !== 'ready'}
            >
              <span
                className={classNames(
                  'flex flex-1 items-center gap-2',
                  isCentered && 'justify-center',
                )}
              >
                {menuVariant === 'compact' && status === 'ready' ? (
                  <img
                    src={preview}
                    alt=""
                    className="size-6 shrink-0 rounded-4 object-cover"
                  />
                ) : (
                  imageIcon
                )}
                {imageLabel}
              </span>
            </DropdownMenuItem>
          )}

          {isCentered && (
            <Divider className="my-1 block bg-border-subtlest-tertiary" />
          )}

          {link && (
            <DropdownMenuItem onClick={() => copyText({ textToCopy: link })}>
              <span className="flex flex-1 items-center gap-2">
                <LinkIcon />
                Copy link
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
