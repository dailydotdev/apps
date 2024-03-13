import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon } from '../../icons';
import { CardTitle } from '../Card';
import classed from '../../../lib/classed';
import { anchorDefaultRel } from '../../../lib/strings';
import { Pill, PillSize } from '../../Pill';

export interface MarketingCta {
  campaignId: string;
  createdAt: Date;
  variant: 'card' | 'popover';
  flags: {
    image?: string;
    title: string;
    ctaUrl: string;
    ctaText: string;
    tagText?: string;
    tagColor?: string;
    description?: string;
  };
}

type HeaderProps = Pick<MarketingCta['flags'], 'tagText' | 'tagColor'> & {
  onClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  buttonSize?: ButtonSize;
};
const tagColorMap: Record<string, string> = {
  avocado: 'bg-action-upvote-float text-action-upvote-default',
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

export const Description = classed(
  'p',
  'text-theme-label-secondary typo-callout',
);

type CTAButtonType = Pick<MarketingCta['flags'], 'ctaText' | 'ctaUrl'> & {
  onClick?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
  buttonSize?: ButtonSize;
};
export const CTAButton = ({
  ctaUrl,
  ctaText,
  onClick,
  className = 'mt-auto w-full',
  buttonSize = ButtonSize.Small,
}: CTAButtonType): ReactElement => (
  <Button
    tag="a"
    rel={anchorDefaultRel}
    href={ctaUrl}
    className={className}
    variant={ButtonVariant.Primary}
    onClick={onClick}
    size={buttonSize}
  >
    {ctaText}
  </Button>
);
