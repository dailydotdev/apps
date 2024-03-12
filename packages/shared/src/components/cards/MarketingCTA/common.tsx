import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon } from '../../icons';
import { CardTitle } from '../Card';
import classed from '../../../lib/classed';
import { anchorDefaultRel } from '../../../lib/strings';

export interface MarketingCTA {
  variant: 'card' | 'popover';
  tagText?: string;
  tagColor?: string;
  title: string;
  description?: string;
  image?: string;
  ctaUrl: string;
  ctaText: string;
}

type HeaderProps = Pick<MarketingCTA, 'tagText' | 'tagColor'> & {
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
    <span
      className={classNames(
        'rounded-8  p-1 px-2 font-bold  typo-footnote',
        tagColorMap[tagColor],
      )}
    >
      {tagText}
    </span>
    <Button
      className="ml-auto"
      size={buttonSize}
      variant={ButtonVariant.Tertiary}
      icon={<MiniCloseIcon />}
      aria-label="Close acquisition form"
      onClick={onClose}
    />
  </div>
);

export const Title = classed(CardTitle, 'my-2');

export const Description = classed(
  'p',
  'text-theme-label-secondary typo-callout',
);

type CTAButtonType = Pick<MarketingCTA, 'ctaText' | 'ctaUrl'> & {
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
