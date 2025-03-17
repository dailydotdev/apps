import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon, CoinIcon } from '../../icons';
import { Image } from '../../image/Image';
import { cloudinaryAwardUnicorn } from '../../../lib/image';
import type {
  AwardEntity,
  AwardTypes,
} from '../../../contexts/GiveAwardModalContext';
import {
  GiveAwardModalContextProvider,
  maxNoteLength,
  useGiveAwardModalContext,
} from '../../../contexts/GiveAwardModalContext';
import { Justify } from '../../utilities';
import MarkdownInput from '../../fields/MarkdownInput';
import { termsOfService } from '../../../lib/constants';
import { useToastNotification, useViewSize, ViewSize } from '../../../hooks';
import { ModalKind } from '../common/types';
import { IconSize } from '../../Icon';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { BuyCoresModal } from './BuyCoresModal';
import type { Product } from '../../../graphql/njord';
import { award, getProducts } from '../../../graphql/njord';
import { labels, largeNumberFormat } from '../../../lib';
import type { ApiErrorResult } from '../../../graphql/common';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

const AwardItem = ({
  item,
  onClick,
}: {
  item: Product;
  onClick: (props: { product: Product; event?: MouseEvent }) => void;
}) => {
  return (
    <Button
      variant={ButtonVariant.Float}
      className="flex !h-auto flex-col items-center justify-center gap-2 rounded-14 bg-surface-float !p-1"
      onClick={(event) => {
        return onClick({ product: item, event });
      }}
    >
      <Image src={item.image} alt={item.name} className="size-20" />
      <div className="flex items-center justify-center">
        <CoinIcon size={IconSize.Size16} />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          tag={TypographyTag.Span}
        >
          {item.value === 0 ? 'Free' : item.value}
        </Typography>
      </div>
    </Button>
  );
};

const IntroScreen = () => {
  const [showBuyCores, setShowBuyCores] = useState(false);
  const { user } = useAuthContext();
  const {
    onRequestClose,
    type,
    entity,
    setActiveModal,
    setActiveStep,
    product,
  } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: awards } = useQuery({
    queryKey: generateQueryKey(RequestKey.Products),
    queryFn: () => getProducts(),
    staleTime: StaleTime.Default,
  });

  const onBuyCores = () => {
    setShowBuyCores(false);
    setActiveModal('BUY_CORES');
  };

  return (
    <>
      <Modal.Header title={' '} showCloseButton={!isMobile}>
        <BuyCreditsButton onPlusClick={onBuyCores} />
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
      <Modal.Body className="bg-gradient-to-t from-theme-overlay-to to-transparent">
        {type !== 'USER' && !!entity.numAwards && (
          <div className="mb-4 flex flex-col items-center justify-center gap-2 p-4">
            <Image
              src={cloudinaryAwardUnicorn}
              alt="Award unicorn"
              className="size-[7.5rem]"
            />
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
            >
              {largeNumberFormat(entity.numAwards)} Awards given
            </Typography>
          </div>
        )}
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
            {entity.receiver.name || `@${entity.receiver.username}`}
          </Typography>
          !
        </Typography>
        <div className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4">
          {awards?.edges?.map(({ node: item }) => (
            <AwardItem
              key={item.id}
              item={item}
              onClick={({ product: clickedProduct }) => {
                if (clickedProduct.value > user.balance.amount) {
                  setActiveStep({ screen: 'INTRO', product: clickedProduct });
                  setShowBuyCores(true);

                  return;
                }

                setShowBuyCores(false);
                setActiveStep({ screen: 'COMMENT', product: clickedProduct });
              }}
            />
          ))}
        </div>
      </Modal.Body>
      {showBuyCores && !!product && (
        <Modal.Footer className="!h-auto flex-col" justify={Justify.Center}>
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            onClick={onBuyCores}
          >
            Buy Cores <CoinIcon />{' '}
            {product.value === 0 ? 'Free' : product.value}
          </Button>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            className="text-center"
          >
            Awards may include a revenue share with the recipient and are
            subject to our{' '}
            <a
              href={termsOfService}
              target="_blank"
              rel="noopener"
              className="font-bold underline"
            >
              Terms of Service
            </a>
            .
          </Typography>
        </Modal.Footer>
      )}
    </>
  );
};

const CommentScreen = () => {
  const { updateUser, user } = useAuthContext();
  const { setActiveStep, type, entity, product, onRequestClose } =
    useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { displayToast } = useToastNotification();
  const [note, setNote] = useState('');

  const { mutate: awardMutation, isPending } = useMutation({
    mutationKey: [
      'awards',
      { productId: product?.id, type, entityId: entity.id, note },
    ],
    mutationFn: award,
    onSuccess: (result) => {
      // TODO feat/transactions animation show award
      displayToast('Award sent successfully! ❤️');

      updateUser({
        ...user,
        balance: result.balance,
      });

      onRequestClose(undefined);
    },
    onError: (data: ApiErrorResult) => {
      displayToast(
        data?.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  return (
    <>
      <Modal.Header title="Give an Award" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={() => setActiveStep({ screen: 'INTRO' })}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 flex flex-col items-center justify-center gap-2">
          <Image
            src={product.image}
            alt="Award unicorn"
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
              {entity.receiver.name || `@${entity.receiver.username}`}
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
            className={{
              container: 'flex-1',
            }}
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
          onClick={() => {
            awardMutation({
              productId: product.id,
              type,
              entityId: entity.id,
              note,
            });
          }}
        >
          Send Award for <CoinIcon />{' '}
          {product.value === 0 ? 'Free' : product.value}
        </Button>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="text-center"
        >
          Awards may include a revenue share with the recipient and are subject
          to our{' '}
          <a
            href={termsOfService}
            target="_blank"
            rel="noopener"
            className="font-bold underline"
          >
            Terms of Service
          </a>
          .
        </Typography>
      </Modal.Footer>
    </>
  );
};

const ModalBody = () => {
  const { activeStep } = useGiveAwardModalContext();
  return (
    <>
      {activeStep === 'INTRO' ? <IntroScreen /> : null}
      {activeStep === 'COMMENT' ? <CommentScreen /> : null}
    </>
  );
};

const ModalRender = ({ ...props }: ModalProps) => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { activeModal, setActiveModal, product } = useGiveAwardModalContext();

  const onCompletion = useCallback(() => {
    setActiveModal('AWARD');
  }, [setActiveModal]);

  return (
    <>
      {activeModal === 'AWARD' ? (
        <Modal
          kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
          size={Modal.Size.Small}
          className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
          {...props}
        >
          <ModalBody />
        </Modal>
      ) : null}
      {activeModal === 'BUY_CORES' ? (
        <BuyCoresModal
          {...props}
          onCompletion={onCompletion}
          product={product}
        />
      ) : null}
    </>
  );
};

type GiveAwardModalProps = ModalProps & {
  type: AwardTypes;
  entity: AwardEntity;
};
const GiveAwardModal = (props: GiveAwardModalProps): ReactElement => {
  return (
    <GiveAwardModalContextProvider {...props}>
      <ModalRender {...props} />
    </GiveAwardModalContextProvider>
  );
};

export default GiveAwardModal;
