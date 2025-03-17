import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModalKind } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { useViewSize, ViewSize } from '../../../hooks';
import { ModalBody } from '../common/ModalBody';
import {
  BuyCoresContextProvider,
  useBuyCoresContext,
} from '../../../contexts/BuyCoresContext';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ModalClose } from '../common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { CoinIcon } from '../../icons';
import { useGiveAwardModalContext } from '../../../contexts/GiveAwardModalContext';
import { IconSize } from '../../Icon';
import { CoreOptionList } from '../../cores/CoreOptionList';
import { CoreAmountNeeded } from '../../cores/CoreAmountNeeded';
import type { Product } from '../../../graphql/njord';
import {
  getTransactionByProvider,
  transactionRefetchIntervalMs,
  UserTransactionStatus,
} from '../../../graphql/njord';
import { RequestKey } from '../../../lib/query';
import { oneMinute } from '../../../lib/dateFormat';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  purchaseCoinsCheckoutVideoPoster,
  purchaseCoinsCheckoutVideo,
} from '../../../lib/image';

const CoreOptions = ({ className }: { className?: string }) => {
  return (
    <div className={classNames('flex-1', className)}>
      <CoreAmountNeeded />
      <CoreOptionList />
    </div>
  );
};

const Checkout = ({ className }: { className?: string }) => {
  return (
    <div className={classNames('flex-1', className)}>
      <div className="checkout-container" />
    </div>
  );
};

const ProcessingLoading = () => {
  return (
    <>
      <CoinIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Title3} bold>
        Processing your payment...
      </Typography>
    </>
  );
};

const ProcessingCompleted = () => {
  const { user, updateUser } = useAuthContext();
  const { onCompletion, selectedProduct, providerTransactionId } =
    useBuyCoresContext();

  const { data: transaction } = useQuery({
    queryKey: [RequestKey.Transactions, { providerId: providerTransactionId }],
    queryFn: () => {
      return getTransactionByProvider({
        providerId: providerTransactionId,
      });
    },
    enabled: !!providerTransactionId,
  });

  useEffect(() => {
    if (transaction?.balance) {
      updateUser({
        ...user,
        balance: transaction.balance,
      });
    }
  }, [transaction.balance, updateUser, user]);

  return (
    <>
      <CoinIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Body} bold>
        {selectedProduct.value}
      </Typography>
      <Typography type={TypographyType.Title3} bold>
        You got your Cores!
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Success! Your Cores are now available in your balance.
      </Typography>
      <Button
        onClick={onCompletion}
        variant={ButtonVariant.Primary}
        className="w-full"
      >
        Got it
      </Button>
    </>
  );
};

const Processing = ({ ...props }: ModalProps): ReactElement => {
  const { onCompletion, activeStep, setActiveStep } = useBuyCoresContext();
  const isProcessing = activeStep === 'PROCESSING';

  const { providerTransactionId } = useBuyCoresContext();

  const { data: transaction } = useQuery({
    queryKey: [RequestKey.Transactions, { providerId: providerTransactionId }],
    queryFn: () => {
      return getTransactionByProvider({
        providerId: providerTransactionId,
      });
    },
    enabled: !!providerTransactionId,
    refetchInterval: (query) => {
      const transactionStatus = query.state.data?.status;

      const retries = Math.max(
        query.state.dataUpdateCount,
        query.state.fetchFailureCount,
      );

      // transactions are mostly processed withing few seconds
      // so for now we stop retrying after 1 minute
      const maxRetries = (oneMinute * 1000) / transactionRefetchIntervalMs;

      if (retries > maxRetries) {
        // TODO feat/transactions redirect user to /earnings to monitor their transaction there if they want

        return false;
      }

      if (
        [
          UserTransactionStatus.Created,
          UserTransactionStatus.Processing,
        ].includes(transactionStatus)
      ) {
        return transactionRefetchIntervalMs;
      }

      if (transactionStatus === UserTransactionStatus.Error) {
        // TODO show error message

        return false;
      }

      return false;
    },
  });

  useEffect(() => {
    if (transaction?.status === UserTransactionStatus.Success) {
      setActiveStep({
        step: 'COMPLETED',
        providerTransactionId,
      });
    }
  }, [transaction?.status, providerTransactionId, setActiveStep]);

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      {...props}
      onRequestClose={() => {
        // TODO feat/transactions if processing interupt the modal close, tell user can check transaction in /earnings

        return onCompletion();
      }}
      isDrawerOnMobile
    >
      <Modal.Body className="flex items-center gap-4 text-center">
        {isProcessing ? <ProcessingLoading /> : <ProcessingCompleted />}
      </Modal.Body>
    </Modal>
  );
};

const BuyCoresMobile = () => {
  const { selectedProduct, openCheckout } = useBuyCoresContext();

  useEffect(() => {
    if (selectedProduct) {
      openCheckout({ priceId: selectedProduct.id });
    }
  }, [openCheckout, selectedProduct]);

  return (
    <ModalBody>{selectedProduct ? <Checkout /> : <CoreOptions />}</ModalBody>
  );
};

const BuyCoreDesktop = () => {
  const { selectedProduct } = useBuyCoresContext();

  return (
    <ModalBody className={classNames(!selectedProduct && '!py-0 !pr-0')}>
      <div className="flex flex-row gap-6">
        <CoreOptions className={classNames(!selectedProduct && 'py-6')} />
        <Checkout className={classNames(!selectedProduct && 'hidden')} />
        <div
          className={classNames(
            'flex flex-1 overflow-hidden rounded-br-16',
            selectedProduct && 'hidden',
          )}
        >
          {!selectedProduct && (
            <div className="relative flex h-[582px] max-h-full flex-1">
              <video
                className="bg-blue-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                poster={purchaseCoinsCheckoutVideoPoster}
                src={purchaseCoinsCheckoutVideo}
                muted
                autoPlay
                loop
                playsInline
                disablePictureInPicture
                controls={false}
              />
            </div>
          )}
        </div>
      </div>
    </ModalBody>
  );
};

const BuyFlow = ({ ...props }: ModalProps): ReactElement => {
  const { setActiveModal } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Modal
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
      {...props}
    >
      <Modal.Header
        title="Get more Cores"
        className="mr-auto flex-row-reverse justify-end gap-4"
      >
        <BuyCreditsButton
          hideBuyButton
          onPlusClick={() => setActiveModal('BUY_CORES')}
        />
        {isMobile ? (
          <Button
            onClick={props.onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        ) : null}
        <ModalClose onClick={props.onRequestClose} top="2" />
      </Modal.Header>
      {isMobile ? <BuyCoresMobile /> : <BuyCoreDesktop />}
    </Modal>
  );
};

const ModalRender = ({ ...props }: ModalProps) => {
  const { activeStep } = useBuyCoresContext();

  if (['PROCESSING', 'COMPLETED'].includes(activeStep)) {
    return <Processing {...props} />;
  }

  if (activeStep === 'INTRO') {
    return <BuyFlow {...props} />;
  }
  return null;
};

type BuyCoresModalProps = ModalProps & {
  onCompletion?: () => void;
  product: Product;
};
export const BuyCoresModal = ({
  onCompletion,
  product,
  ...props
}: BuyCoresModalProps): ReactElement => {
  return (
    <BuyCoresContextProvider
      amountNeeded={product?.value}
      onCompletion={onCompletion}
    >
      <ModalRender {...props} />
    </BuyCoresContextProvider>
  );
};
