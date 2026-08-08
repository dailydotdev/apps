import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonColor } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { CopyIcon, TwitterIcon, WhatsappIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';

export type DealShareChannel = 'copy' | 'x' | 'whatsapp';

interface DealShareBarProps {
  deal: Deal;
  username?: string;
  onShare?: (channel: DealShareChannel) => void;
  compact?: boolean;
  className?: string;
}

export const getDealShareLink = (slug: string, username?: string): string =>
  `https://app.daily.dev/deals/${slug}${
    username ? `?ref=${encodeURIComponent(username)}` : ''
  }`;

export const getDealShareMessage = (deal: Deal, link: string): string =>
  `${deal.brand.name} is ${deal.value.label} for daily.dev members → ${link}`;

const copiedResetMs = 2000;

export const DealShareBar = ({
  deal,
  username,
  onShare,
  compact,
  className,
}: DealShareBarProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const link = getDealShareLink(deal.slug, username);
  const message = getDealShareMessage(deal, link);
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    message,
  )}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = setTimeout(() => setCopied(false), copiedResetMs);

    return () => clearTimeout(timeout);
  }, [copied]);

  const onCopy = async () => {
    try {
      await globalThis?.navigator?.clipboard?.writeText(link);
    } catch {
      setCopyFailed(true);

      return;
    }

    setCopyFailed(false);
    setCopied(true);
    onShare?.('copy');
  };

  const size = compact ? ButtonSize.XSmall : ButtonSize.Small;

  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={size}
          icon={<CopyIcon secondary={copied} />}
          onClick={onCopy}
          className={compact ? undefined : 'flex-1'}
          aria-label={`Copy the ${deal.brand.name} deal link`}
        >
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button
          tag="a"
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Twitter}
          size={size}
          icon={<TwitterIcon />}
          onClick={() => onShare?.('x')}
          aria-label={`Share the ${deal.brand.name} deal on X`}
        />
        <Button
          tag="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant={ButtonVariant.Primary}
          color={ButtonColor.WhatsApp}
          size={size}
          icon={<WhatsappIcon />}
          onClick={() => onShare?.('whatsapp')}
          aria-label={`Share the ${deal.brand.name} deal on WhatsApp`}
        />
      </div>

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Caption1}
        color={
          copyFailed ? TypographyColor.StatusError : TypographyColor.Tertiary
        }
        aria-live="polite"
      >
        {copyFailed && 'Copy failed. Copy the link from the address bar.'}
        {copied && !copyFailed && 'Deal link copied to your clipboard.'}
      </Typography>
    </div>
  );
};
