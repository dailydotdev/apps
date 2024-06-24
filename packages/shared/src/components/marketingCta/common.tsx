import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import { CardTitle } from '../cards/Card';
import classed from '../../lib/classed';
import { anchorDefaultRel } from '../../lib/strings';
import { Pill, PillSize } from '../Pill';

export type MarketingCtaFlags = {
  title: string;
  description?: string;
  image?: string;
  tagText?: string;
  tagColor?: string;
  ctaUrl: string;
  ctaText: string;
};

export enum MarketingCtaVariant {
  Card = 'card',
  Popover = 'popover',
  PopoverSmall = 'popover_small',
}

export interface MarketingCta {
  campaignId: string;
  createdAt: Date;
  variant: MarketingCtaVariant;
  flags: MarketingCtaFlags;
}

type HeaderProps = Pick<MarketingCtaFlags, 'tagText' | 'tagColor'> & {
  onClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  buttonSize?: ButtonSize;
};
const tagColorMap: Record<string, string> = {
  avocado: 'bg-action-upvote-float text-action-upvote-default',
  cabbage: 'bg-theme-overlay-float-cabbage text-brand-default',
};
export const Header = ({
  tagText,
  tagColor,
  onClose,
  buttonSize = ButtonSize.Small,
}: HeaderProps): ReactElement => (
  <div className="flex w-full flex-row items-center">
    <Pill
      label={tagText}
      className={tagColorMap[tagColor || 'avocado']}
      size={PillSize.Small}
      alignment={null}
    />
    <Button
      className="ml-auto"
      size={buttonSize}
      variant={ButtonVariant.Tertiary}
      icon={<MiniCloseIcon />}
      aria-label="Close post"
      onClick={onClose}
    />
  </div>
);

export const Title = classed(CardTitle, 'my-2');

export const Description = classed('p', 'text-text-secondary typo-callout');

type CTAButtonType = Pick<MarketingCtaFlags, 'ctaText' | 'ctaUrl'> & {
  onClick?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
  buttonSize?: ButtonSize;
  buttonVariant?: ButtonVariant;
};
export const CTAButton = ({
  ctaUrl,
  ctaText,
  onClick,
  className = 'mt-auto w-full',
  buttonSize = ButtonSize.Small,
  buttonVariant = ButtonVariant.Primary,
}: CTAButtonType): ReactElement => (
  <Button
    tag="a"
    rel={anchorDefaultRel}
    href={ctaUrl}
    className={className}
    variant={buttonVariant}
    onClick={onClick}
    size={buttonSize}
    target="_blank"
  >
    {ctaText}
  </Button>
);
