import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  CopyIcon,
  MiniCloseIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DEAL_AFFILIATE_DISCLOSURE } from '@dailydotdev/shared/src/features/deals/dealsFormat';
import type { SidecarOffer, SidecarStore } from './sidecarMocks';

const OfferRow = ({
  offer,
  isCopied,
  onCopy,
}: {
  offer: SidecarOffer;
  isCopied: boolean;
  onCopy: () => void;
}): ReactElement => {
  const actionLabels =
    offer.kind === 'credit'
      ? { idle: 'Activate', done: 'Active' }
      : { idle: 'Copy', done: 'Copied' };

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          className={classNames(
            'shrink-0 rounded-8 px-2 py-1 font-bold typo-caption1',
            offer.kind === 'credit'
              ? 'bg-action-plus-float text-action-plus-default'
              : 'bg-surface-float text-text-primary',
          )}
        >
          {offer.valueLabel}
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          className="flex-1"
        >
          {offer.title}
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          icon={
            isCopied ? (
              <VIcon size={IconSize.Size16} />
            ) : (
              <CopyIcon size={IconSize.Size16} />
            )
          }
          onClick={onCopy}
          className="shrink-0"
        >
          {isCopied ? actionLabels.done : actionLabels.idle}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1">
        <span className="flex items-center gap-1 text-status-success">
          <VIcon size={IconSize.Size16} />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.StatusSuccess}
          >
            worked {offer.verified.count} times this week
          </Typography>
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          last {offer.verified.lastAgo}
        </Typography>
        {offer.code ? (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="ml-auto font-bold tracking-wider"
          >
            {offer.code}
          </Typography>
        ) : null}
      </div>
    </li>
  );
};

interface SidecarPanelProps {
  store: SidecarStore;
  totalDeals?: number;
  onClose: () => void;
  onSeeAllDeals?: () => void;
}

export const SidecarPanel = ({
  store,
  totalDeals = 240,
  onClose,
  onSeeAllDeals,
}: SidecarPanelProps): ReactElement => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const copyTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const copyOffer = (offer: SidecarOffer) => {
    setCopiedId(offer.id);

    if (copyTimeout.current) {
      window.clearTimeout(copyTimeout.current);
    }

    copyTimeout.current = window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="fixed right-0 top-[7.5rem] z-popup flex max-h-[calc(100vh-11rem)] w-[22.5rem] flex-col rounded-bl-16 rounded-tl-16 border border-r-0 border-border-subtlest-quaternary bg-background-default shadow-2">
      <header className="flex items-start gap-3 border-b border-border-subtlest-tertiary p-4">
        <LogoIcon className={{ container: 'mt-0.5 w-7 rounded-8' }} />
        <div className="flex flex-1 flex-col">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
          >
            {store.offers.length} deals on {store.domain}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {store.followersOnDaily.toLocaleString('en-US')} devs on daily.dev
            follow this brand
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<MiniCloseIcon size={IconSize.Size16} />}
          onClick={onClose}
          aria-label="Close deals panel"
        />
      </header>

      <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border-subtlest-tertiary overflow-y-auto">
        {store.offers.map((offer) => (
          <OfferRow
            key={offer.id}
            offer={offer}
            isCopied={copiedId === offer.id}
            onCopy={() => copyOffer(offer)}
          />
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtlest-tertiary px-4 py-3">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Mute deals on {store.domain}
        </Typography>
        <Switch
          inputId={`mute-${store.id}`}
          name={`mute-${store.id}`}
          checked={isMuted}
          onToggle={() => setIsMuted((muted) => !muted)}
          aria-label={`${isMuted ? 'Unmute' : 'Mute'} deals on ${store.domain}`}
        />
      </div>

      <footer className="flex flex-col gap-3 border-t border-border-subtlest-tertiary p-4">
        <button
          type="button"
          onClick={onSeeAllDeals}
          className="flex items-center justify-between rounded-10 bg-surface-float px-3 py-2 text-left hover:bg-surface-hover"
        >
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
          >
            See all {totalDeals} dev deals
          </Typography>
          <ArrowIcon size={IconSize.Size16} className="rotate-90" />
        </button>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          {DEAL_AFFILIATE_DISCLOSURE}
        </Typography>
      </footer>
    </aside>
  );
};
