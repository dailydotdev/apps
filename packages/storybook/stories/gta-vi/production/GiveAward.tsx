import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  ArrowIcon,
  CoreIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AwardFeesNote } from '@dailydotdev/shared/src/components/cores/AwardFeesNote';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { gtaViAward, productionAwards, receiver } from '../data';

/*
 * GiveAwardModal's three screens (components/modals/award) drawn inline, so
 * they sit side by side for review. The markup is production's; the GTA VI
 * branch is the event award first in the grid, drawn like every other award,
 * and a free event award's footer, which says until when it's free.
 */

export type AwardStep = 'INTRO' | 'COMMENT' | 'SUCCESS';

const balance = 8100;

/** The modal's shell: production's XSmall-wide panel, header and body. */
const ModalFrame = ({
  isPhone,
  header,
  footer,
  children,
}: {
  isPhone?: boolean;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col overflow-hidden border border-border-subtlest-tertiary bg-background-default shadow-2',
      isPhone
        ? 'h-[40rem] w-[23.4375rem] rounded-t-24'
        : 'w-[26.25rem] rounded-16',
    )}
  >
    <header className="flex h-14 shrink-0 items-center border-b border-border-subtlest-tertiary px-4">
      {header}
    </header>
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-gradient-to-t from-theme-overlay-to to-transparent p-4">
      {children}
    </div>
    {footer && (
      <footer className="flex flex-col items-center gap-2 border-t border-border-subtlest-tertiary p-4">
        {footer}
      </footer>
    )}
  </div>
);

/** BuyCreditsButton: the balance and the + to buy more. */
const Balance = (): ReactElement => (
  <span className="flex h-8 items-center rounded-10 bg-surface-float">
    <span className="flex items-center gap-1 px-2 font-bold text-text-primary typo-callout">
      <CoreIcon size={IconSize.Size16} />
      {largeNumberFormat(balance)}
    </span>
    <span className="h-5 w-px bg-border-subtlest-tertiary" />
    <span className="flex size-8 items-center justify-center text-text-primary">
      <PlusIcon size={IconSize.Size16} />
    </span>
  </span>
);

const AwardItem = ({
  item,
  onClick,
}: {
  item: Product;
  onClick: () => void;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    className="flex !h-auto flex-col items-center justify-center rounded-14 bg-surface-float !p-1"
    onClick={onClick}
  >
    <img src={item.image} alt={item.name} className="size-20 object-contain" />
    <div className="flex items-center justify-center gap-1">
      <CoreIcon size={IconSize.Size16} />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        tag={TypographyTag.Span}
      >
        {item.value === 0 ? 'Free' : formatCoresCurrency(item.value)}
      </Typography>
    </div>
  </Button>
);

const IntroScreen = ({
  isPhone,
  isEventLive,
  onPick,
}: {
  isPhone?: boolean;
  isEventLive: boolean;
  onPick: (product: Product) => void;
}): ReactElement => (
  <ModalFrame
    isPhone={isPhone}
    header={
      <div className="flex flex-1 items-center justify-between">
        <Balance />
        {isPhone ? (
          <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
            Close
          </Button>
        ) : (
          <CloseButton size={ButtonSize.Small} />
        )}
      </div>
    }
  >
    <div className="flex flex-col items-center justify-center gap-2 px-4">
      <img
        src={fallbackImages.avatar}
        alt="Award user"
        className="size-16 rounded-18"
      />
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Primary}
      >
        Give an Award
      </Typography>
    </div>
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="text-center"
    >
      Show your appreciation! Pick an Award to send to{' '}
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        tag={TypographyTag.Span}
        bold
      >
        {receiver.name}
      </Typography>
      !
    </Typography>
    <div className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4">
      {isEventLive && (
        <AwardItem item={gtaViAward} onClick={() => onPick(gtaViAward)} />
      )}
      {productionAwards.map((item) => (
        <AwardItem key={item.id} item={item} onClick={() => onPick(item)} />
      ))}
    </div>
  </ModalFrame>
);

const priceLabel = (product: Product): string =>
  product.value === 0 ? 'Free' : formatCoresCurrency(product.value);

const CommentScreen = ({
  isPhone,
  product,
  onBack,
  onSend,
}: {
  isPhone?: boolean;
  product: Product;
  onBack: () => void;
  onSend: () => void;
}): ReactElement => {
  const isEvent = product.id === gtaViAward.id;
  return (
    <ModalFrame
      isPhone={isPhone}
      header={
        <>
          <Button
            variant={ButtonVariant.Tertiary}
            onClick={onBack}
            size={ButtonSize.Small}
            className="mr-2 flex -rotate-90"
            icon={<ArrowIcon />}
          />
          <span className="flex-1 font-bold text-text-primary typo-body">
            Give an Award
          </span>
          {!isPhone && <CloseButton size={ButtonSize.Small} />}
        </>
      }
      footer={
        <>
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onSend}
          >
            Send Award for <CoreIcon /> {priceLabel(product)}
          </Button>
          {isEvent ? (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-center"
            >
              Free to send through Nov 25, as many times as you like.
            </Typography>
          ) : (
            <AwardFeesNote />
          )}
        </>
      }
    >
      <div className="mb-4 flex flex-col items-center justify-center gap-2">
        <img
          src={product.image}
          alt={product.name}
          className="size-[7.5rem] object-contain"
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Awesome choice! We&apos;re sure that{' '}
          <Typography
            bold
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            tag={TypographyTag.Span}
          >
            {receiver.name}
          </Typography>{' '}
          will appreciate this award!
        </Typography>
      </div>
      <textarea
        rows={6}
        placeholder="Share a few words about why this Award is well deserved (optional)"
        className="w-full resize-none rounded-12 bg-surface-float p-3 text-text-primary typo-callout placeholder:text-text-quaternary"
      />
    </ModalFrame>
  );
};

const SuccessScreen = ({
  isPhone,
  product,
  onClose,
}: {
  isPhone?: boolean;
  product: Product;
  onClose: () => void;
}): ReactElement => (
  <ModalFrame
    isPhone={isPhone}
    header={
      <span className="flex flex-1 justify-end">
        {!isPhone && <CloseButton size={ButtonSize.Small} onClick={onClose} />}
      </span>
    }
  >
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <div className="flex flex-col gap-2">
        <img
          src={product.flags?.imageGlow || product.image}
          alt={product.name}
          className="size-20 object-contain"
        />
        <div className="flex items-center justify-center gap-1">
          <CoreIcon
            size={IconSize.Size16}
            className="text-accent-bun-default"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            tag={TypographyTag.Span}
          >
            {priceLabel(product)}
          </Typography>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="text-center"
        >
          Congrats! Your Award has been sent to {receiver.name}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Thanks for supporting the community!
        </Typography>
      </div>
      {!isPhone && (
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      )}
    </div>
  </ModalFrame>
);

/** The whole flow, clickable: pick, write a note, send. */
export const GiveAwardFlow = ({
  initialStep = 'INTRO',
  initialProduct = gtaViAward,
  isPhone,
  isEventLive = true,
}: {
  initialStep?: AwardStep;
  initialProduct?: Product;
  isPhone?: boolean;
  /** Launch week: Nov 19 through Nov 25. */
  isEventLive?: boolean;
}): ReactElement => {
  const [step, setStep] = useState<AwardStep>(initialStep);
  const [product, setProduct] = useState<Product>(initialProduct);

  if (step === 'COMMENT') {
    return (
      <CommentScreen
        isPhone={isPhone}
        product={product}
        onBack={() => setStep('INTRO')}
        onSend={() => setStep('SUCCESS')}
      />
    );
  }
  if (step === 'SUCCESS') {
    return (
      <SuccessScreen
        isPhone={isPhone}
        product={product}
        onClose={() => setStep('INTRO')}
      />
    );
  }
  return (
    <IntroScreen
      isPhone={isPhone}
      isEventLive={isEventLive}
      onPick={(picked) => {
        setProduct(picked);
        setStep('COMMENT');
      }}
    />
  );
};
