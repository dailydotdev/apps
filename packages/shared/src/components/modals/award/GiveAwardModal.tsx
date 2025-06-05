import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { ArrowIcon, CoreIcon } from '../../icons';
import { Image } from '../../image/Image';
import { featuredAwardImage } from '../../../lib/image';
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
import { useToastNotification, useViewSize, ViewSize } from '../../../hooks';
import { LazyModal, ModalKind } from '../common/types';
import { IconSize } from '../../Icon';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { BuyCoresModal } from './BuyCoresModal';
import type { Product } from '../../../graphql/njord';
import {
  award,
  getProductsQueryOptions,
  UserTransactionStatus,
} from '../../../graphql/njord';
import { labels, largeNumberFormat } from '../../../lib';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiUserTransactionErrorExtension,
} from '../../../graphql/common';
import { ApiError } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { AwardFeesNote } from '../../cores/AwardFeesNote';
import { formatCoresCurrency } from '../../../lib/utils';
import { useCanPurchaseCores } from '../../../hooks/useCoresFeature';
import { AnimatedAward } from '../../AnimatedAward';
import { useLazyModal } from '../../../hooks/useLazyModal';

const AwardItem = ({
  item,
  onClick: handleClick,
}: {
  item: Product;
  onClick: (props: { product: Product; event?: MouseEvent }) => void;
}) => {
  const { logAwardEvent } = useGiveAwardModalContext();

  return (
    <Button
      variant={ButtonVariant.Float}
      className="flex !h-auto flex-col items-center justify-center rounded-14 bg-surface-float !p-1"
      onClick={(event) => {
        logAwardEvent({ awardEvent: 'PICK', extra: { award: item.value } });

        return handleClick({ product: item, event });
      }}
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
    </Button>
  );
};

const IntroScreen = () => {
  const { openModal } = useLazyModal();
  const [showBuyCores, setShowBuyCores] = useState(false);
  const { user } = useAuthContext();
  const {
    onRequestClose,
    entity,
    type,
    setActiveModal,
    setActiveStep,
    product,
    post,
  } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const canPurchaseCores = useCanPurchaseCores();

  const { data: awards } = useQuery(getProductsQueryOptions());

  const onBuyCores = () => {
    setShowBuyCores(false);
    setActiveModal('BUY_CORES');
  };

  const hasAwards = !!entity.numAwards;

  return (
    <>
      <Modal.Header
        showCloseButton={!isMobile}
        className={classNames(
          isMobile ? 'flex-row-reverse justify-between' : undefined,
        )}
      >
        <BuyCreditsButton
          hideBuyButton={!canPurchaseCores}
          onPlusClick={onBuyCores}
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
            src={hasAwards ? featuredAwardImage : entity.receiver.image}
            alt="Award user"
            className={hasAwards ? 'size-[7.5rem]' : 'size-16 rounded-18'}
          />
          <Typography
            type={TypographyType.Title3}
            bold
            color={TypographyColor.Primary}
          >
            {hasAwards ? (
              <>
                {largeNumberFormat(entity.numAwards)} Award
                {entity.numAwards === 1 ? '' : 's'} given
              </>
            ) : (
              <>Give an Award</>
            )}
          </Typography>
        </div>
        {hasAwards && (
          <Button
            className="mx-auto max-w-28"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            onClick={() => {
              openModal({
                type: LazyModal.ListAwards,
                props: {
                  onBack: () => {
                    openModal({
                      type: LazyModal.GiveAward,
                      props: {
                        type,
                        entity,
                        post,
                      },
                    });
                  },
                  queryProps: {
                    id: entity.id,
                    type,
                  },
                },
              });
            }}
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
          {canPurchaseCores && (
            <Button
              className="w-full"
              variant={ButtonVariant.Primary}
              onClick={onBuyCores}
            >
              Buy Cores <CoreIcon />{' '}
              {product.value === 0
                ? 'Free'
                : formatCoresCurrency(product.value)}
            </Button>
          )}
          {!canPurchaseCores && (
            <Button className="w-full" variant={ButtonVariant.Primary} disabled>
              <span className="inline-flex gap-1">
                {' '}
                Insufficient Cores
                <CoreIcon secondary />{' '}
              </span>
              {product.value === 0
                ? 'Free'
                : formatCoresCurrency(product.value)}
            </Button>
          )}
          <AwardFeesNote />
        </Modal.Footer>
      )}
    </>
  );
};

const CommentScreen = () => {
  const { updateUser, user } = useAuthContext();
  const { setActiveStep, type, entity, product, flags, logAwardEvent } =
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
    onSuccess: async (result) => {
      await updateUser({
        ...user,
        balance: result.balance,
      });

      setActiveStep({ screen: 'SUCCESS', product });
    },
    onError: async (data: ApiErrorResult) => {
      if (
        data.response.errors?.[0]?.extensions?.code ===
        ApiError.BalanceTransactionError
      ) {
        const errorExtensions = data.response
          .errors[0] as ApiResponseError<ApiUserTransactionErrorExtension>;

        if (
          errorExtensions.extensions.status ===
            UserTransactionStatus.InsufficientFunds &&
          errorExtensions.extensions.balance
        ) {
          await updateUser({
            ...user,
            balance: errorExtensions.extensions.balance,
          });
        }
      }

      displayToast(
        data?.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  const onAwardClick = useCallback(() => {
    logAwardEvent({ awardEvent: 'AWARD', extra: { award: product.value } });
    awardMutation({
      productId: product.id,
      type,
      entityId: entity.id,
      note,
      flags,
    });
  }, [
    awardMutation,
    entity.id,
    logAwardEvent,
    note,
    product.id,
    product.value,
    type,
    flags,
  ]);

  const hasAwards = !!entity.numAwards;

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
            src={hasAwards ? product.image : entity.receiver.image}
            alt="Award user"
            className={hasAwards ? 'size-[7.5rem]' : 'size-16 rounded-18'}
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
          onClick={onAwardClick}
        >
          Send Award for <CoreIcon />{' '}
          {product.value === 0 ? 'Free' : formatCoresCurrency(product.value)}
        </Button>
        <AwardFeesNote />
      </Modal.Footer>
    </>
  );
};

const SuccessScreen = () => {
  const { entity, product, onRequestClose } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Modal.Body>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-2">
          <Image
            src={product.image}
            alt={product?.flags?.description}
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
              {product.value === 0
                ? 'Free'
                : formatCoresCurrency(product.value)}
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
            Congrats! Your Award has been sent to{' '}
            {entity.receiver.name || `@${entity.receiver.username}`}
          </Typography>

          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            Thanks for supporting the community!
          </Typography>
        </div>

        {!isMobile && (
          <Button
            variant={ButtonVariant.Primary}
            className="w-full"
            onClick={() => {
              onRequestClose(undefined);
            }}
          >
            Close
          </Button>
        )}
      </div>
    </Modal.Body>
  );
};

const ModalBody = () => {
  const { activeStep } = useGiveAwardModalContext();
  return (
    <>
      {activeStep === 'INTRO' ? <IntroScreen /> : null}
      {activeStep === 'COMMENT' ? <CommentScreen /> : null}
      {activeStep === 'SUCCESS' ? <SuccessScreen /> : null}
    </>
  );
};

const ModalRender = ({ ...props }: ModalProps) => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const {
    activeStep,
    activeModal,
    setActiveModal,
    product,
    logAwardEvent,
    onRequestClose: onRequestCloseContext,
  } = useGiveAwardModalContext();

  const trackingRef = useRef(false);

  useEffect(() => {
    if (!trackingRef.current) {
      trackingRef.current = true;
      logAwardEvent({ awardEvent: 'START' });
    }
  }, [logAwardEvent]);

  const onCompletion = useCallback(() => {
    setActiveModal('AWARD');
  }, [setActiveModal]);

  const onRequestClose = useCallback(() => {
    setActiveModal('AWARD');
  }, [setActiveModal]);

  return (
    <>
      {activeModal === 'AWARD_ANIMATION' && (
        <AnimatedAward
          src={product?.flags?.imageGlow || product?.image}
          alt={product?.name}
          onDone={() => {
            props.onRequestClose?.(undefined);
          }}
        />
      )}
      {activeModal === 'AWARD' ? (
        <Modal
          kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
          size={Modal.Size.Small}
          className={classNames(
            !isMobile && activeStep !== 'SUCCESS' ? '!h-[40rem]' : undefined,
          )}
          isDrawerOnMobile={activeStep === 'SUCCESS'}
          drawerProps={{
            instantOpen: true,
          }}
          {...props}
          onRequestClose={onRequestCloseContext}
        >
          <ModalBody />
        </Modal>
      ) : null}
      {activeModal === 'BUY_CORES' ? (
        <BuyCoresModal
          {...props}
          onCompletion={onCompletion}
          onRequestClose={onRequestClose}
          product={product}
          origin={Origin.Award}
        />
      ) : null}
    </>
  );
};

type GiveAwardModalProps = ModalProps & {
  type: AwardTypes;
  entity: AwardEntity;
  post?: Post;
  flags?: Record<string, string>;
};
const GiveAwardModal = (props: GiveAwardModalProps): ReactElement => {
  console.log('props', props);
  return (
    <GiveAwardModalContextProvider {...props}>
      <ModalRender {...props} />
    </GiveAwardModalContextProvider>
  );
};

export default GiveAwardModal;
