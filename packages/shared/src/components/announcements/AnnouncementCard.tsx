import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { Image } from '../image/Image';
import { Pill, PillSize } from '../Pill';
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

// Clean, low-dominance surface: a hairline border over the sidebar background
// rather than a filled card. Interactive variants add a subtle hover fill.
const cardBaseClasses =
  'border border-border-subtlest-tertiary transition-colors';

const renderBadge = (badge?: AnnouncementBadge): ReactElement | null => {
  if (!badge) {
    return null;
  }

  return (
    <Pill
      label={badge.label}
      size={PillSize.XSmall}
      className={classNames(
        'uppercase tracking-wide',
        badge.className ?? 'bg-surface-float text-text-secondary',
      )}
    />
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
          'hover:border-border-subtlest-secondary hover:bg-surface-float',
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
      {(icon || badge) && (
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex text-text-primary" aria-hidden>
              {icon}
            </span>
          )}
          {renderBadge(badge)}
        </div>
      )}
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
            // Float is invisible over imagery — use a solid Primary close.
            <CloseButton
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
              className="absolute right-2 top-2"
              onClick={onClose}
            />
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
