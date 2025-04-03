import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ModalKind } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { useViewSizeClient, ViewSize } from '../../../hooks';
import { ModalBody } from '../common/ModalBody';
import {
  BuyCoresContextProvider,
  useBuyCoresContext,
} from '../../../contexts/BuyCoresContext';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { CoreIcon } from '../../icons';
import { useGiveAwardModalContext } from '../../../contexts/GiveAwardModalContext';
import { IconSize } from '../../Icon';
import { CoreOptionList } from '../../cores/CoreOptionList';
import { CoreAmountNeeded } from '../../cores/CoreAmountNeeded';
import type { Product, UserTransaction } from '../../../graphql/njord';
import {
  getTransactionByProvider,
  transactionRefetchIntervalMs,
  UserTransactionStatus,
} from '../../../graphql/njord';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { oneMinute } from '../../../lib/dateFormat';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  purchaseCoinsCheckoutVideoPoster,
  purchaseCoinsCheckoutVideo,
} from '../../../lib/image';
import { walletUrl } from '../../../lib/constants';
import { Loader } from '../../Loader';
import { useIsLightTheme } from '../../../hooks/utils';
import type { Origin } from '../../../lib/log';
import { formatCoresCurrency } from '../../../lib/utils';

export const CoreOptions = ({
  className,
  title,
  showCoresAtCheckout,
}: {
  className?: string;
  title?: ReactNode;
  showCoresAtCheckout?: boolean;
}): ReactElement => {
  return (
    <div className={classNames('flex-1', className)}>
      {title}
      <div className="flex flex-1 items-center justify-between gap-4">
        <CoreAmountNeeded />
        {!!showCoresAtCheckout && <BuyCreditsButton hideBuyButton />}
      </div>
      <CoreOptionList />
    </div>
  );
};

export const BuyCoresCheckout = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const isLightTheme = useIsLightTheme();

  return (
    <div
      className={classNames('flex-1', isLightTheme && 'bg-black', className)}
    >
      <div className="checkout-container" />
    </div>
  );
};

const statusToMessageMap: Partial<Record<UserTransactionStatus, ReactNode>> = {
  [UserTransactionStatus.Created]: 'Checking your data...',
  [UserTransactionStatus.Processing]: 'Processing your payment...',
  [UserTransactionStatus.Success]: 'Almost done...',
  [UserTransactionStatus.ErrorRecoverable]: 'There was an issue, retrying...',
  [UserTransactionStatus.Error]: (
    <>
      Something went wrong!
      <br />
      <Link href={walletUrl}>
        <Typography type={TypographyType.Footnote}>
          <u>check status here</u>
        </Typography>
      </Link>
    </>
  ),
};

const ProcessingLoading = ({
  transaction,
}: {
  transaction?: UserTransaction;
}) => {
  const statusMessage =
    statusToMessageMap[transaction?.status] ||
    statusToMessageMap[UserTransactionStatus.Processing];
  const isError = transaction?.status === UserTransactionStatus.Error;

  return (
    <>
      <CoreIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Title3} bold>
        {statusMessage}
      </Typography>
      {!isError && <Loader className="hidden tablet:block" />}
    </>
  );
};

const ProcessingCompleted = () => {
  const { onCompletion, selectedProduct } = useBuyCoresContext();

  return (
    <>
      <CoreIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Body} bold>
        {formatCoresCurrency(selectedProduct.value)}
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

export const BuyCoresProcessing = ({ ...props }: ModalProps): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const { onCompletion, activeStep, setActiveStep } = useBuyCoresContext();
  const isProcessing = activeStep === 'PROCESSING';
  const queryClient = useQueryClient();

  const { providerTransactionId } = useBuyCoresContext();

  const { data: transaction } = useQuery({
    queryKey: [RequestKey.Transactions, { providerId: providerTransactionId }],
    queryFn: async () => {
      const result = await getTransactionByProvider({
        providerId: providerTransactionId,
      });

      if (result?.balance) {
        updateUser({
          ...user,
          balance: result.balance,
        });
      }

      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      return result;
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
        // TODO feat/transactions redirect user to /wallet to monitor their transaction there if they want

        return false;
      }

      if (
        [
          UserTransactionStatus.Created,
          UserTransactionStatus.Processing,
          UserTransactionStatus.ErrorRecoverable,
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
        // TODO feat/transactions if processing interupt the modal close, tell user can check transaction in /wallet

        return onCompletion();
      }}
      isDrawerOnMobile
    >
      <Modal.Body className="flex items-center justify-center gap-4 text-center">
        {isProcessing ? (
          <ProcessingLoading transaction={transaction} />
        ) : (
          <ProcessingCompleted />
        )}
      </Modal.Body>
    </Modal>
  );
};

const BuyCoresMobile = () => {
  const { selectedProduct, openCheckout, paddle } = useBuyCoresContext();

  useEffect(() => {
    if (!paddle) {
      return;
    }

    if (selectedProduct) {
      openCheckout({ priceId: selectedProduct.id });
    }
  }, [openCheckout, selectedProduct, paddle]);

  return (
    <ModalBody
      className={classNames(
        'bg-gradient-to-t from-theme-overlay-float-bun to-transparent',
        selectedProduct && '!p-0',
      )}
    >
      {selectedProduct ? <BuyCoresCheckout className="p-6" /> : <CoreOptions />}
    </ModalBody>
  );
};

export const CorePageCheckoutVideo = (): ReactElement => {
  return (
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
  );
};

const BuyCoreDesktop = () => {
  const { selectedProduct } = useBuyCoresContext();

  return (
    <ModalBody
      className={classNames(
        'bg-gradient-to-t from-theme-overlay-float-bun to-transparent !p-0 tablet:rounded-b-16',
      )}
    >
      <div className="flex flex-1 flex-row">
        <CoreOptions className="p-6" />
        <BuyCoresCheckout
          className={classNames(
            !selectedProduct && 'hidden',
            'rounded-br-16 p-6',
          )}
        />
        <div
          className={classNames(
            'flex flex-1 overflow-hidden rounded-br-16',
            selectedProduct && 'hidden',
          )}
        >
          {!selectedProduct && <CorePageCheckoutVideo />}
        </div>
      </div>
    </ModalBody>
  );
};

const BuyFlow = ({ ...props }: ModalProps): ReactElement => {
  const { setActiveModal } = useGiveAwardModalContext();
  const isMobile = useViewSizeClient(ViewSize.MobileL);

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
        showCloseButton={!isMobile}
      >
        <BuyCreditsButton
          hideBuyButton
          onPlusClick={() => setActiveModal('BUY_CORES')}
        />
        {isMobile && (
          <Button
            onClick={props.onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        )}
      </Modal.Header>
      {isMobile ? <BuyCoresMobile /> : <BuyCoreDesktop />}
    </Modal>
  );
};

export const TransactionStatusListener = (props: ModalProps): ReactElement => {
  const { activeStep } = useBuyCoresContext();

  if (['PROCESSING', 'COMPLETED'].includes(activeStep)) {
    return <BuyCoresProcessing {...props} />;
  }

  return null;
};

const ModalRender = ({ ...props }: ModalProps) => {
  const { activeStep } = useBuyCoresContext();

  return (
    <>
      <TransactionStatusListener {...props} />
      {activeStep === 'INTRO' && <BuyFlow {...props} />}
    </>
  );
};

type BuyCoresModalProps = ModalProps & {
  origin: Origin;
  onCompletion?: () => void;
  product: Product;
};
export const BuyCoresModal = ({
  origin,
  onCompletion,
  product,
  ...props
}: BuyCoresModalProps): ReactElement => {
  return (
    <BuyCoresContextProvider
      amountNeeded={product?.value}
      onCompletion={onCompletion}
      origin={origin}
    >
      <ModalRender {...props} />
    </BuyCoresContextProvider>
  );
};
