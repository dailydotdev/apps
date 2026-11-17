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
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Justify } from '@dailydotdev/shared/src/components/utilities/common';
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
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';

// Fixed copies of the GiveAwardModal screens
// (components/modals/award/GiveAwardModal.tsx). Changed: each award shows what
// the balance is missing, the CTA names the next step, old iOS builds link to
// the App Store, and after a purchase the note step opens with the award kept.

export const awardReceiver = {
  id: 'sb-sam',
  name: 'Sam Rivera',
  username: 'samrivera',
  image: fallbackImages.avatar,
};

const receiverName = awardReceiver.name;

const AwardItem = ({
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
    <Button
      variant={ButtonVariant.Float}
      className={classNames(
        'flex !h-auto flex-col items-center justify-center rounded-14 bg-surface-float !p-1',
        isSelected && 'border-action-cores-default bg-action-cores-float',
      )}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <Image
        src={item.image}
        alt={item.name}
        className="size-20 object-contain"
      />
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
      {missing > 0 && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          tag={TypographyTag.Span}
          className="mb-1"
        >
          +{formatCoresCurrency(missing)} needed
        </Typography>
      )}
    </Button>
  );
};

export interface AwardPickerFixedProps {
  /** Preselect an award, e.g. the one the user tapped before buying */
  initialAward?: string;
  /** Old iOS builds without in-app purchase */
  canPurchaseCores?: boolean;
  onBuyCores: (product: Product) => void;
  onPicked: (product: Product) => void;
  onRequestClose: () => void;
}

export const AwardPickerFixed = ({
  initialAward,
  canPurchaseCores = true,
  onBuyCores,
  onPicked,
  onRequestClose,
}: AwardPickerFixedProps): ReactElement => {
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
      <Modal.Body className="gap-2 bg-gradient-to-t from-theme-overlay-to to-transparent tablet:rounded-b-16">
        <div className="flex flex-col items-center justify-center gap-2 px-4">
          <Image
            src={awardReceiver.image}
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
            {receiverName}
          </Typography>
          !
        </Typography>
        <div className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4">
          {awards?.edges?.map(({ node: item }) => (
            <AwardItem
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
        <Modal.Footer className="!h-auto flex-col" justify={Justify.Center}>
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
          <CoresBalanceNote price={product.value} />
          <AwardFeesNote />
        </Modal.Footer>
      )}
    </Modal>
  );
};

export const AwardNoteFixed = ({
  product,
  coresAdded,
  onBack,
  onSent,
  onRequestClose,
}: {
  product: Product;
  /** Cores the purchase just added, confirmed above the note */
  coresAdded?: number;
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
      <Modal.Body>
        {!!coresAdded && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            className="mb-4 flex items-center justify-center gap-1 rounded-10 bg-action-cores-float px-3 py-2"
          >
            <CoreIcon size={IconSize.Size16} />
            {formatCoresCurrency(coresAdded)} Cores added. Your {product.name}{' '}
            is ready to send.
          </Typography>
        )}
        <div className="mb-4 flex flex-col items-center justify-center gap-2">
          <Image
            src={product.image}
            alt={product.name}
            className="size-[7.5rem]"
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
              {receiverName}
            </Typography>{' '}
            will appreciate this award!
          </Typography>
        </div>
        <form action="#" className="flex flex-1 flex-col">
          <MarkdownInput
            allowPreview={false}
            textareaProps={{
              name: 'content',
              rows: 6,
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
      <Modal.Footer className="!h-auto flex-col" justify={Justify.Center}>
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

/** Production SuccessScreen, unchanged, so the walkthrough has an end */
export const AwardSent = ({
  product,
  onRequestClose,
}: {
  product: Product;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    onRequestClose={onRequestClose}
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    isDrawerOnMobile
  >
    <Modal.Body>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-2">
          <Image
            src={product.flags?.imageGlow || product.image}
            alt={product.name}
            className="size-20"
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
              {formatCoresCurrency(product.value)}
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
            Congrats! Your Award has been sent to {receiverName}
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
