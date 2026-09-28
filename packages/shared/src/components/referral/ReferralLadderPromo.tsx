import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { GiftIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import { PlusTitle } from '../plus/PlusTitle';
import { PlusList, plusFeatureList } from '../plus/PlusList';
import type { WithClassNameProps } from '../utilities';
import {
  cloudinaryGiftedPlusModalImage,
  plusFeaturesImage,
} from '../../lib/image';
import { referralLadderSteps } from '../../lib/referral';
import { pluralizeFriend } from './ReferralLadderRewards';

export enum ReferralLadderPromoVariant {
  Gift = 'gift',
  Perks = 'perks',
}

export interface ReferralLadderPromoProps extends WithClassNameProps {
  variant: ReferralLadderPromoVariant;
  onInvite: () => void;
  onClose: (event: MouseEvent) => void;
}

const lastStep = referralLadderSteps[referralLadderSteps.length - 1];

const promoPerkLabels = [
  'Ad-free experience',
  'Advanced custom feeds',
  'Bookmark folders',
  'Keyword filters',
];

const promoPerks = plusFeatureList.filter(({ label }) =>
  promoPerkLabels.includes(label),
);

const InviteButton = ({
  onInvite,
}: Pick<ReferralLadderPromoProps, 'onInvite'>) => (
  <Button
    className="w-full"
    variant={ButtonVariant.Primary}
    color={ButtonColor.Bacon}
    icon={<GiftIcon secondary />}
    onClick={onInvite}
  >
    Invite friends
  </Button>
);

const OfferSteps = ({ className }: WithClassNameProps): ReactElement => (
  <ol className={classNames('grid grid-cols-3 gap-2', className)}>
    {referralLadderSteps.map(({ invites, duration }) => (
      <li
        key={invites}
        className="flex flex-col items-center gap-0.5 rounded-12 bg-surface-float px-2 py-3 text-center"
      >
        <Typography type={TypographyType.Callout} bold>
          {duration}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {invites} {pluralizeFriend(invites)}
        </Typography>
        <span aria-hidden className="mt-1 flex gap-0.5 text-text-tertiary">
          {Array.from({ length: invites }, (_, index) => (
            <UserIcon key={index} size={IconSize.Size16} />
          ))}
        </span>
      </li>
    ))}
  </ol>
);

const GiftPromo = ({
  onInvite,
  onClose,
}: Omit<ReferralLadderPromoProps, 'variant'>): ReactElement => (
  <div className="flex flex-col gap-4 p-5">
    <div className="flex items-center justify-between">
      <PlusTitle type={TypographyType.Callout} bold />
      <CloseButton type="button" size={ButtonSize.Small} onClick={onClose} />
    </div>
    <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
      Invite friends, get up to {lastStep.reward}
    </Typography>
    <img
      src={cloudinaryGiftedPlusModalImage}
      alt="Gift box with the daily.dev Plus logo"
      className="h-auto w-full"
    />
    <OfferSteps />
    <InviteButton onInvite={onInvite} />
  </div>
);

const PerksPromo = ({
  onInvite,
  onClose,
}: Omit<ReferralLadderPromoProps, 'variant'>): ReactElement => (
  <div className="flex flex-col">
    <div className="relative">
      <img
        src={plusFeaturesImage}
        alt="daily.dev Plus features"
        className="h-auto w-full"
      />
      <CloseButton
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        className="!absolute right-4 top-4"
        onClick={onClose}
      />
    </div>
    <div className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          Plus is on us when your friends join
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          One friend gets you a month of Plus. Three get you a whole year.
        </Typography>
      </div>
      <PlusList className="!py-0" items={promoPerks} />
      <InviteButton onInvite={onInvite} />
    </div>
  </div>
);

const promoByVariant: Record<
  ReferralLadderPromoVariant,
  (props: Omit<ReferralLadderPromoProps, 'variant'>) => ReactElement
> = {
  [ReferralLadderPromoVariant.Gift]: GiftPromo,
  [ReferralLadderPromoVariant.Perks]: PerksPromo,
};

export const ReferralLadderPromo = ({
  variant,
  className,
  ...props
}: ReferralLadderPromoProps): ReactElement => {
  const Promo = promoByVariant[variant];

  return (
    <div className={className}>
      <Promo {...props} />
    </div>
  );
};
