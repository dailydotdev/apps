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
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { maxNoteLength } from '@dailydotdev/shared/src/contexts/GiveAwardModalContext';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { gtaViAward, productionAwards, receiver } from '../data';

/*
 * GiveAwardModal's three screens (components/modals/award) drawn inline, so
 * they sit side by side for review. The markup is production's; the GTA VI
 * branch is the event award first in the grid, drawn like every other award,
 * and a free event award's footer, which says until when it's free. Every
 * state the modal can be in is a prop, so a review page can pin each one.
 */

export type AwardStep = 'INTRO' | 'COMMENT' | 'SUCCESS';

/** Where the send stands: production's mutation, plus the event's window. */
export type SendState = 'idle' | 'sending' | 'error' | 'expired';

/**
 * Phone is production's bottom sheet (ModalKind.FlexibleTop below 656px),
 * the rest the centered XSmall modal; auto picks by the window, for device
 * frames.
 */
export type ModalLayout = 'phone' | 'desktop' | 'auto';

const PHONE_BELOW = 656;

const isPhoneLayout = (layout: ModalLayout): boolean =>
  layout === 'phone' ||
  (layout === 'auto' &&
    typeof window !== 'undefined' &&
    window.innerWidth < PHONE_BELOW);

export interface AwardScenario {
  /** The viewer's Core balance. */
  balance?: number;
  /** The products query hasn't answered yet. */
  isLoading?: boolean;
  /** Launch week: Nov 19 through Nov 25. */
  isEventLive?: boolean;
  receiverName?: string;
  receiverUsername?: string;
  /** Awards the post or comment already has. */
  numAwards?: number;
  sendState?: SendState;
  note?: string;
}

const ModalFrame = ({
  isPhone,
  isFluid,
  header,
  footer,
  children,
}: {
  isPhone: boolean;
  isFluid: boolean;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div
    role="dialog"
    aria-modal
    aria-label="Give an Award"
    className={classNames(
      'relative flex flex-col overflow-hidden border border-border-subtlest-tertiary bg-background-default shadow-2',
      isPhone && isFluid && 'h-[85vh] w-full rounded-t-24',
      isPhone && !isFluid && 'h-[40rem] w-[23.4375rem] rounded-t-24',
      !isPhone && 'max-h-[85vh] w-[26.25rem] rounded-16',
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
const Balance = ({ amount }: { amount: number }): ReactElement => (
  <span className="flex h-8 items-center rounded-10 bg-surface-float">
    <span className="flex items-center gap-1 px-2 font-bold text-text-primary typo-callout">
      <CoreIcon size={IconSize.Size16} aria-hidden />
      <span className="sr-only">Balance:</span>
      {largeNumberFormat(amount)}
      <span className="sr-only">Cores</span>
    </span>
    <span className="h-5 w-px bg-border-subtlest-tertiary" />
    <button
      type="button"
      aria-label="Buy Cores"
      className="flex size-8 items-center justify-center text-text-primary"
    >
      <PlusIcon size={IconSize.Size16} />
    </button>
  </span>
);

const priceLabel = (product: Product): string =>
  product.value === 0 ? 'Free' : formatCoresCurrency(product.value);

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
    aria-label={
      item.value === 0
        ? `${item.name}, free`
        : `${item.name}, ${formatCoresCurrency(item.value)} Cores`
    }
    onClick={onClick}
  >
    <img src={item.image} alt="" className="size-20 object-contain" />
    <div className="flex items-center justify-center gap-1">
      <CoreIcon size={IconSize.Size16} aria-hidden />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        tag={TypographyTag.Span}
      >
        {priceLabel(item)}
      </Typography>
    </div>
  </Button>
);

/** Proposed: production paints an empty grid until the products load. */
const AwardItemPlaceholder = (): ReactElement => (
  <ElementPlaceholder className="flex h-[6.5rem] flex-col items-center justify-center gap-1 rounded-14 p-1">
    <ElementPlaceholder className="size-16 rounded-12" />
    <ElementPlaceholder className="h-3 w-8 rounded-4" />
  </ElementPlaceholder>
);

const ReceiverName = ({
  scenario,
}: {
  scenario: AwardScenario;
}): ReactElement => (
  <Typography
    type={TypographyType.Callout}
    color={TypographyColor.Primary}
    tag={TypographyTag.Span}
    bold
    className="break-words"
  >
    {scenario.receiverName || `@${scenario.receiverUsername}`}
  </Typography>
);

const IntroScreen = ({
  isPhone,
  isFluid,
  scenario,
  onPick,
}: {
  isPhone: boolean;
  isFluid: boolean;
  scenario: Required<AwardScenario>;
  onPick: (product: Product) => void;
}): ReactElement => {
  const [buyFor, setBuyFor] = useState<Product | null>(null);
  const hasAwards = scenario.numAwards > 0;
  const awards = scenario.isEventLive
    ? [gtaViAward, ...productionAwards]
    : productionAwards;

  return (
    <ModalFrame
      isPhone={isPhone}
      isFluid={isFluid}
      header={
        <div className="flex flex-1 items-center justify-between">
          <Balance amount={scenario.balance} />
          {isPhone ? (
            <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
              Close
            </Button>
          ) : (
            <CloseButton size={ButtonSize.Small} />
          )}
        </div>
      }
      footer={
        buyFor && (
          <>
            <Button className="w-full" variant={ButtonVariant.Primary}>
              Buy Cores <CoreIcon /> {priceLabel(buyFor)}
            </Button>
            <AwardFeesNote />
          </>
        )
      }
    >
      <div className="flex flex-col items-center justify-center gap-2 px-4">
        <img
          src={hasAwards ? featuredAwardImage : fallbackImages.avatar}
          alt=""
          className={hasAwards ? 'size-[7.5rem]' : 'size-16 rounded-18'}
        />
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
        >
          {hasAwards
            ? `${largeNumberFormat(scenario.numAwards)} Award${
                scenario.numAwards === 1 ? '' : 's'
              } given`
            : 'Give an Award'}
        </Typography>
      </div>
      {hasAwards && (
        <Button
          className="mx-auto max-w-28"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        >
          Show all →
        </Button>
      )}
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="text-center"
      >
        Show your appreciation! Pick an Award to send to{' '}
        <ReceiverName scenario={scenario} />!
      </Typography>
      <div
        className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4"
        aria-busy={scenario.isLoading || undefined}
      >
        {scenario.isLoading
          ? Array.from({ length: 12 }, (_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <AwardItemPlaceholder key={index} />
            ))
          : awards.map((item) => (
              <AwardItem
                key={item.id}
                item={item}
                onClick={() => {
                  // Production: an Award the balance can't cover stays on
                  // this screen and offers Cores in the footer.
                  if (item.value > scenario.balance) {
                    setBuyFor(item);
                    return;
                  }
                  setBuyFor(null);
                  onPick(item);
                }}
              />
            ))}
      </div>
    </ModalFrame>
  );
};

/** Production's error toast (useTransactionError), pinned to the modal. */
const Toast = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    role="alert"
    className="absolute inset-x-4 bottom-4 z-1 rounded-12 bg-text-primary px-4 py-3 text-surface-invert shadow-2 typo-callout"
  >
    {children}
  </div>
);

const CommentScreen = ({
  isPhone,
  isFluid,
  scenario,
  product,
  onBack,
  onSend,
}: {
  isPhone: boolean;
  isFluid: boolean;
  scenario: Required<AwardScenario>;
  product: Product;
  onBack: () => void;
  onSend: () => void;
}): ReactElement => {
  const isEvent = product.id === gtaViAward.id;
  const isExpired = isEvent && scenario.sendState === 'expired';
  const hasAwards = scenario.numAwards > 0;

  return (
    <>
      <ModalFrame
        isPhone={isPhone}
        isFluid={isFluid}
        header={
          <>
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={onBack}
              size={ButtonSize.Small}
              className="mr-2 flex -rotate-90"
              icon={<ArrowIcon />}
              aria-label="Back to Awards"
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
              loading={scenario.sendState === 'sending'}
              disabled={isExpired}
              onClick={onSend}
            >
              Send Award for <CoreIcon /> {priceLabel(product)}
            </Button>
            {isExpired && (
              // Proposed: the free window closed while the modal was open.
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.StatusError}
                className="text-center"
                role="alert"
              >
                The Vice City award stopped being free on Nov 25. Go back to
                pick another Award.
              </Typography>
            )}
            {isEvent && !isExpired && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="text-center"
              >
                Free to send through Nov 25, as many times as you like.
              </Typography>
            )}
            {!isEvent && <AwardFeesNote />}
          </>
        }
      >
        <div className="mb-4 flex flex-col items-center justify-center gap-2">
          <img
            src={hasAwards ? product.image : fallbackImages.avatar}
            alt=""
            className={
              hasAwards ? 'size-[7.5rem] object-contain' : 'size-16 rounded-18'
            }
          />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            Awesome choice! We&apos;re sure that{' '}
            <ReceiverName scenario={scenario} /> will appreciate this award!
          </Typography>
        </div>
        <label className="sr-only" htmlFor="gta-vi-award-note">
          Note to the receiver (optional)
        </label>
        <textarea
          id="gta-vi-award-note"
          rows={6}
          maxLength={maxNoteLength}
          defaultValue={scenario.note}
          placeholder="Share a few words about why this Award is well deserved (optional)"
          className="w-full resize-none rounded-12 bg-surface-float p-3 text-text-primary typo-callout placeholder:text-text-quaternary"
        />
      </ModalFrame>
      {scenario.sendState === 'error' && <Toast>{labels.error.generic}</Toast>}
    </>
  );
};

const SuccessScreen = ({
  isPhone,
  isFluid,
  scenario,
  product,
  onClose,
}: {
  isPhone: boolean;
  isFluid: boolean;
  scenario: Required<AwardScenario>;
  product: Product;
  onClose: () => void;
}): ReactElement => (
  <ModalFrame
    isPhone={isPhone}
    isFluid={isFluid}
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
            aria-hidden
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
      <div className="flex flex-col gap-2" role="status">
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="break-words text-center"
        >
          Congrats! Your Award has been sent to{' '}
          {scenario.receiverName || `@${scenario.receiverUsername}`}
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

const defaultScenario: Required<AwardScenario> = {
  balance: 8100,
  isLoading: false,
  isEventLive: true,
  receiverName: receiver.name,
  receiverUsername: receiver.username,
  numAwards: 0,
  sendState: 'idle',
  note: '',
};

/** The whole flow, clickable: pick, write a note, send. */
export const GiveAwardFlow = ({
  initialStep = 'INTRO',
  initialProduct = gtaViAward,
  isPhone,
  layout,
  isEventLive,
  ...scenario
}: AwardScenario & {
  initialStep?: AwardStep;
  initialProduct?: Product;
  /** Shorthand for layout="phone". */
  isPhone?: boolean;
  layout?: ModalLayout;
}): ReactElement => {
  const [step, setStep] = useState<AwardStep>(initialStep);
  const [product, setProduct] = useState<Product>(initialProduct);
  const resolvedLayout = layout ?? (isPhone ? 'phone' : 'desktop');
  const phone = isPhoneLayout(resolvedLayout);
  const isFluid = resolvedLayout === 'auto';
  const merged: Required<AwardScenario> = {
    ...defaultScenario,
    ...(isEventLive === undefined ? {} : { isEventLive }),
    ...Object.fromEntries(
      Object.entries(scenario).filter(([, value]) => value !== undefined),
    ),
  };

  if (step === 'COMMENT') {
    return (
      <CommentScreen
        isPhone={phone}
        isFluid={isFluid}
        scenario={merged}
        product={product}
        onBack={() => setStep('INTRO')}
        onSend={() => setStep('SUCCESS')}
      />
    );
  }
  if (step === 'SUCCESS') {
    return (
      <SuccessScreen
        isPhone={phone}
        isFluid={isFluid}
        scenario={merged}
        product={product}
        onClose={() => setStep('INTRO')}
      />
    );
  }
  return (
    <IntroScreen
      isPhone={phone}
      isFluid={isFluid}
      scenario={merged}
      onPick={(picked) => {
        setProduct(picked);
        setStep('COMMENT');
      }}
    />
  );
};
