import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { ArrowIcon, MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { AnnouncementBadge, AnnouncementCta } from './types';
import { AnnouncementCardVariant } from './types';

export interface AnnouncementCardProps {
  variant?: AnnouncementCardVariant;
  title: string;
  description?: string;
  badge?: AnnouncementBadge;
  // Leading icon for the Compact variant (Default/Cover lead with the badge).
  icon?: ReactNode;
  // Cover image, only rendered by the Cover variant.
  image?: string;
  cta?: AnnouncementCta;
  // Whole-card link target, used by the Compact variant.
  href?: string;
  // Whole-card click handler (analytics / navigation) for the Compact variant.
  onClick?: () => void;
  // When provided, a dismiss (×) control is rendered.
  onClose?: () => void;
  className?: string;
}

// Subtle, defined surface (the canonical card background) so cards read as a
// clean stack and a card behind is properly occluded.
const cardBaseClasses =
  'border border-border-subtlest-tertiary bg-background-subtle transition-colors';

// Small, flush-left brand label — visible via the brand color but kept light so
// it never competes with the title (no filled chip).
const renderBadge = (badge?: AnnouncementBadge): ReactElement | null => {
  if (!badge) {
    return null;
  }

  return (
    <span
      className={classNames(
        'font-bold uppercase typo-caption2',
        badge.className ?? 'text-brand-default',
      )}
    >
      {badge.label}
    </span>
  );
};

const renderCta = (cta?: AnnouncementCta): ReactElement | null => {
  if (!cta) {
    return null;
  }

  return (
    <Button
      className="mt-1 self-start"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      tag={cta.href ? 'a' : undefined}
      href={cta.href}
      onClick={cta.onClick}
    >
      {cta.text}
    </Button>
  );
};

export function AnnouncementCard({
  variant = AnnouncementCardVariant.Default,
  title,
  description,
  badge,
  icon,
  image,
  cta,
  href,
  onClick,
  onClose,
  className,
}: AnnouncementCardProps): ReactElement {
  if (variant === AnnouncementCardVariant.Compact) {
    const Tag = href ? 'a' : 'button';

    return (
      <Tag
        href={href}
        type={href ? undefined : 'button'}
        onClick={onClick}
        className={classNames(
          'focus-outline group flex w-full items-center gap-3 rounded-12 p-3 text-left',
          cardBaseClasses,
          'hover:border-border-subtlest-secondary',
          className,
        )}
      >
        {icon && (
          <span className="flex text-text-primary" aria-hidden>
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
            truncate
          >
            {title}
          </Typography>
          {description && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              truncate
            >
              {description}
            </Typography>
          )}
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className="rotate-90 text-text-tertiary transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Tag>
    );
  }

  // reserveCloseSpace keeps the title clear of an inline (top-right) close.
  // The Cover variant overlays its close on the image, so it passes false.
  const renderBody = (reserveCloseSpace: boolean): ReactElement => (
    <div
      className={classNames('flex flex-col gap-2', reserveCloseSpace && 'pr-5')}
    >
      {renderBadge(badge)}
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      {description && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {description}
        </Typography>
      )}
      {renderCta(cta)}
    </div>
  );

  if (variant === AnnouncementCardVariant.Cover) {
    return (
      <div
        className={classNames(
          'relative flex flex-col overflow-hidden rounded-16',
          cardBaseClasses,
          className,
        )}
      >
        <div className="relative">
          {image && (
            <Image src={image} alt="" className="h-28 w-full object-cover" />
          )}
          {onClose && (
            // Frosted glass close over imagery — translucent + backdrop blur so
            // the image reads through, matching the floating-control idiom in
            // ArticleFeaturedWideGridCard.
            <button
              type="button"
              aria-label="Dismiss"
              title="Close"
              onClick={onClose}
              className="focus-outline absolute right-2 top-2 z-1 flex size-7 items-center justify-center rounded-10 border border-white/24 bg-overlay-secondary-pepper text-white backdrop-blur-md transition-colors hover:bg-overlay-primary-pepper"
            >
              <MiniCloseIcon size={IconSize.Size16} aria-hidden />
            </button>
          )}
        </div>
        <div className="p-3">{renderBody(false)}</div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'relative flex flex-col rounded-16 p-3',
        cardBaseClasses,
        className,
      )}
    >
      {onClose && (
        <CloseButton
          type="button"
          size={ButtonSize.XSmall}
          className="absolute right-2 top-2"
          onClick={onClose}
        />
      )}
      {renderBody(Boolean(onClose))}
    </div>
  );
}

export default AnnouncementCard;
