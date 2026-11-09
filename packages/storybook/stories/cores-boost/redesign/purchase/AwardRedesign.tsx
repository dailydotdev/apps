import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalKind } from '@dailydotdev/shared/src/components/modals/common/types';
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
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import MarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput';
import { BuyCreditsButton } from '@dailydotdev/shared/src/components/credit/BuyCreditsButton';
import { AwardFeesNote } from '@dailydotdev/shared/src/components/cores/AwardFeesNote';
import { CoresBalanceNote } from '@dailydotdev/shared/src/components/cores/CoresBalanceNote';
import { maxNoteLength } from '@dailydotdev/shared/src/contexts/GiveAwardModalContext';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import {
  award,
  getProductsQueryOptions,
} from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { appStoreUrl } from '@dailydotdev/shared/src/lib/constants';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { awardReceiver } from '../../flows/purchase/AwardFixed';
import friendshipArt from '../../assets/cores-checkout-friendship.png';
import { CoreAmount } from './kit';

// The award screens of flows/purchase/AwardFixed.tsx in the redesign's line.
// Same controls, copy and states; new: the receiver leads the sheet, award
// tiles are quiet cards that mark the shortfall in a corner chip, and a
// summary card carries the pick, the balance and the next step.

export type AwardReceiver = Pick<typeof awardReceiver, 'name' | 'image'>;

const AwardTile = ({
  item,
  balance,
  isSelected,
  onClick,
}: {
  item: Product;
  balance: number;
  isSelected: boolean;
  onClick: () => void;
}): ReactElement => {
  const missing = item.value - balance;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={classNames(
        'relative flex flex-col items-center gap-1 rounded-16 border px-1 pb-2 pt-3 transition-colors',
        isSelected
          ? 'border-action-cores-default bg-action-cores-float'
          : 'border-border-subtlest-tertiary hover:bg-surface-hover',
      )}
    >
      {missing > 0 && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="absolute right-1.5 top-1.5 rounded-6 bg-surface-float px-1"
          title={`${formatCoresCurrency(missing)} more Cores needed`}
        >
          +{formatCoresCurrency(missing)}
        </Typography>
      )}
      <Image
        src={isSelected ? item.flags?.imageGlow || item.image : item.image}
        alt={item.name}
        className="size-16 object-contain"
      />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={
          missing > 0 && !isSelected
            ? TypographyColor.Tertiary
            : TypographyColor.Primary
        }
        bold
        className="flex items-center gap-0.5"
      >
        <CoreIcon size={IconSize.Size16} />
        {item.value === 0 ? 'Free' : formatCoresCurrency(item.value)}
      </Typography>
    </button>
  );
};

export interface AwardPickerRedesignProps {
  initialAward?: string;
  canPurchaseCores?: boolean;
  receiver?: AwardReceiver;
  onBuyCores: (product: Product) => void;
  onPicked: (product: Product) => void;
  onRequestClose: () => void;
}

export const AwardPickerRedesign = ({
  initialAward,
  canPurchaseCores = true,
  receiver = awardReceiver,
  onBuyCores,
  onPicked,
  onRequestClose,
}: AwardPickerRedesignProps): ReactElement => {
  const { user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const balance = user?.balance?.amount ?? 0;
  const { data: awards } = useQuery(getProductsQueryOptions());
  const [picked, setPicked] = useState<string | undefined>(initialAward);
  const product = awards?.edges
    .map(({ node }) => node)
    .find(({ name }) => name === picked);
  const missing = product ? product.value - balance : 0;

  return (
    <Modal
      isOpen
      onRequestClose={onRequestClose}
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
    >
      <Modal.Header
        showCloseButton={!isMobile}
        className={classNames(
          isMobile ? 'flex-row-reverse justify-between' : undefined,
        )}
      >
        <BuyCreditsButton
          hideBuyButton={!canPurchaseCores}
          onPlusClick={() => product && onBuyCores(product)}
          origin={Origin.Award}
        />
        {isMobile ? (
          <Button
            onClick={onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        ) : null}
      </Modal.Header>
      <Modal.Body className="gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={receiver.image}
            alt="Award user"
            className="size-12 rounded-16"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Title3} bold>
              Give an Award
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Show your appreciation! Pick an Award to send to{' '}
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Primary}
                tag={TypographyTag.Span}
                bold
              >
                {receiver.name}
              </Typography>
              !
            </Typography>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 tablet:grid-cols-4">
          {awards?.edges?.map(({ node: item }) => (
            <AwardTile
              key={item.id}
              item={item}
              balance={balance}
              isSelected={item.name === picked}
              onClick={() => {
                if (item.value > balance) {
                  setPicked(item.name);
                  return;
                }
                onPicked(item);
              }}
            />
          ))}
        </div>
      </Modal.Body>
      {!!product && missing > 0 && (
        <Modal.Footer className="!h-auto flex-col !gap-3 !py-4">
          {canPurchaseCores ? (
            <Button
              className="w-full"
              variant={ButtonVariant.Primary}
              onClick={() => onBuyCores(product)}
            >
              Get {formatCoresCurrency(missing)} Cores and send
            </Button>
          ) : (
            <Button
              className="w-full"
              variant={ButtonVariant.Primary}
              tag="a"
              href={appStoreUrl}
              target="_blank"
            >
              Update the app to buy Cores
            </Button>
          )}
          <div className="flex w-full flex-col items-center gap-1 border-t border-border-subtlest-tertiary pt-3">
            <CoresBalanceNote price={product.value} />
            <AwardFeesNote />
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export const AwardNoteRedesign = ({
  product,
  coresAdded,
  receiver = awardReceiver,
  onBack,
  onSent,
  onRequestClose,
}: {
  product: Product;
  coresAdded?: number;
  receiver?: AwardReceiver;
  onBack: () => void;
  onSent: () => void;
  onRequestClose: () => void;
}): ReactElement => {
  const { updateUser, user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const [note, setNote] = useState('');
  const { mutate: awardMutation, isPending } = useMutation({
    mutationFn: award,
    onSuccess: async () => {
      if (user) {
        await updateUser({
          ...user,
          balance: { amount: user.balance.amount - product.value },
        });
      }
      onSent();
    },
  });

  return (
    <Modal
      isOpen
      onRequestClose={onRequestClose}
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
    >
      <Modal.Header title="Give an Award" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={onBack}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body className="gap-4">
        {!!coresAdded && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            className="flex items-center gap-2 rounded-12 bg-action-cores-float px-3 py-2"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-action-cores-default text-surface-invert">
              <VIcon size={IconSize.Size16} />
            </span>
            {formatCoresCurrency(coresAdded)} Cores added. Your {product.name}{' '}
            is ready to send.
          </Typography>
        )}
        <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-5">
          <Image
            src={product.flags?.imageGlow || product.image}
            alt={product.name}
            className="size-24 object-contain"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            bold
            className="flex items-center gap-1"
          >
            {product.name} · <CoreAmount value={product.value} />
          </Typography>
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
        <form action="#" className="flex flex-1 flex-col">
          <MarkdownInput
            allowPreview={false}
            textareaProps={{
              name: 'content',
              rows: 5,
              placeholder:
                'Share a few words about why this Award is well deserved (optional)',
              maxLength: maxNoteLength,
            }}
            className={{ container: 'flex-1' }}
            initialContent=""
            enabledCommand={{ upload: false, link: false, mention: false }}
            showMarkdownGuide={false}
            onValueUpdate={(value) => setNote(value)}
          />
        </form>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col !gap-2 !py-4">
        <Button
          loading={isPending}
          className="w-full"
          variant={ButtonVariant.Primary}
          onClick={() =>
            awardMutation({
              productId: product.id,
              type: 'POST',
              entityId: 'sb-post',
              note,
            })
          }
        >
          Send Award for <CoreIcon /> {formatCoresCurrency(product.value)}
        </Button>
        <CoresBalanceNote price={product.value} />
        <AwardFeesNote />
      </Modal.Footer>
    </Modal>
  );
};

/** The success screen, led by the friendship art the award stands for */
export const AwardSentRedesign = ({
  product,
  receiver = awardReceiver,
  onRequestClose,
}: {
  product: Product;
  receiver?: AwardReceiver;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    onRequestClose={onRequestClose}
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    isDrawerOnMobile
  >
    <Modal.Body className="!p-0">
      <div className="relative">
        <img
          src={friendshipArt}
          alt=""
          className="aspect-video w-full rounded-t-16 object-cover object-[50%_20%]"
        />
        <Image
          src={product.flags?.imageGlow || product.image}
          alt={product.name}
          className="absolute -bottom-8 left-1/2 size-20 -translate-x-1/2"
        />
      </div>
      <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-10">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="rounded-8 bg-surface-float px-2 py-0.5"
        >
          <CoreAmount value={product.value} />
        </Typography>
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
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          onClick={onRequestClose}
        >
          Close
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);
