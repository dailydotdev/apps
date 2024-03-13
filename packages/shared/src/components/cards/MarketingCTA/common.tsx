import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon } from '../../icons';
import { CardTitle } from '../Card';
import classed from '../../../lib/classed';
import { anchorDefaultRel } from '../../../lib/strings';
import { Pill, PillSize } from '../../Pill';

export interface MarketingCTA {
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

type HeaderProps = Pick<MarketingCTA['flags'], 'tagText' | 'tagColor'>;
const tagColorMap: Record<string, string> = {
  avocado: 'bg-action-upvote-float text-action-upvote-default',
};
export const Header = ({ tagText, tagColor }: HeaderProps): ReactElement => (
  <div className="flex w-full flex-row items-center">
    <Pill
      label={tagText}
      className={tagColorMap[tagColor || 'avocado']}
      size={PillSize.Small}
      alignment={null}
    />
    <Button
      className="ml-auto"
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      icon={<MiniCloseIcon />}
      aria-label="Close post"
    />
  </div>
);

export const Title = classed(CardTitle, 'my-2');

export const Description = classed(
  'p',
  'text-theme-label-secondary typo-callout',
);

type CTAButtonType = Pick<MarketingCTA['flags'], 'ctaText' | 'ctaUrl'> & {
  className?: string;
};
export const CTAButton = ({
  ctaUrl,
  ctaText,
  className = 'mt-auto w-full',
}: CTAButtonType): ReactElement => (
  <Button
    tag="a"
    rel={anchorDefaultRel}
    href={ctaUrl}
    className={className}
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
  >
    {ctaText}
  </Button>
);
