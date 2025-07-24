import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from '../../utilities/Link';
import { ModalKind } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { useViewSize, ViewSize } from '../../../hooks';
import { ModalBody } from '../common/ModalBody';
import { useBuyCoresContext } from '../../../contexts/BuyCoresContext/types';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { CoreIcon } from '../../icons';
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
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { labels } from '../../../lib';
import { useCanPurchaseCores } from '../../../hooks/useCoresFeature';
import { BuyCoresContextProvider } from '../../../contexts/BuyCoresContext/BuyCoresContext';
import { iOSSupportsCoresPurchase } from '../../../lib/ios';

export type CoreOptionsProps = {
  className?: string;
  title?: ReactNode;
  showCoresAtCheckout?: boolean;
  amountNeededCopy?: ReactNode;
};

interface ModalHeaderProps extends Pick<CoreOptionsProps, 'amountNeededCopy'> {
  onPlusClick?: () => void;
}

export const CoreOptions = ({
  className,
  title,
  showCoresAtCheckout,
  amountNeededCopy,
}: CoreOptionsProps): ReactElement => {
  const isText = typeof amountNeededCopy === 'string';

  return (
    <div className={classNames('flex-1', className)}>
      {title}
      <div className="flex flex-1 items-center justify-between gap-4">
        {!amountNeededCopy || isText ? (
          <CoreAmountNeeded title={isText ? amountNeededCopy : undefined} />
        ) : (
          amountNeededCopy
        )}
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
  [UserTransactionStatus.Processing]: 'Processing your payment, please wait...',
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
      <Typography type={TypographyType.LargeTitle} bold>
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

const ProcessingError = () => {
  const { error } = useBuyCoresContext();
  const { title, description, onRequestClose } = error || {};

  return (
    <>
      <CoreIcon size={IconSize.XXXLarge} />
      <Typography type={TypographyType.Title3} bold>
        {title || 'There was an error processing your transaction.'}
      </Typography>
      {description && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      )}
      <Button
        onClick={() => {
          onRequestClose?.();
        }}
        variant={ButtonVariant.Primary}
        className="w-full"
      >
        Got it
      </Button>
    </>
  );
};

export const BuyCoresProcessing = ({ ...props }: ModalProps): ReactElement => {
  const router = useRouter();
  const { user, updateUser } = useAuthContext();
  const { onCompletion, activeStep, setActiveStep, error } =
    useBuyCoresContext();
  const isProcessing = activeStep === 'PROCESSING';
  const queryClient = useQueryClient();

  const onValidateAction = useCallback(() => {
    return !isProcessing;
  }, [isProcessing]);

  const { onAskConfirmation } = useExitConfirmation({
    message: labels.cores.error.transactionProcessing.description,
    onValidateAction,
  });

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
      const retries = Math.max(
        query.state.dataUpdateCount,
        query.state.fetchFailureCount,
      );

      // transactions are mostly processed withing few seconds
      // so for now we stop retrying after 1 minute
      const maxRetries = (oneMinute * 1000) / transactionRefetchIntervalMs;

      if (retries > maxRetries) {
        // log error for timeout
        onAskConfirmation(false);
        setActiveStep({
          step: 'PROCESSING_ERROR',
          error: {
            title: 'Processing timed out',
            description:
              'Please check the status of your transaction in your Core Wallet.',
            onRequestClose() {
              router.push(walletUrl);
            },
          },
        });

        return false;
      }

      const queryError = query.state.error;

      // in case of query error keep refetching until maxRetries is reached
      if (queryError) {
        return transactionRefetchIntervalMs;
      }

      const transactionStatus = query.state.data?.status;

      if (
        [
          UserTransactionStatus.Created,
          UserTransactionStatus.Processing,
          UserTransactionStatus.ErrorRecoverable,
        ].includes(transactionStatus)
      ) {
        return transactionRefetchIntervalMs;
      }

      if (
        [
          UserTransactionStatus.Error,
          UserTransactionStatus.InternalError,
        ].includes(transactionStatus)
      ) {
        setActiveStep({
          step: 'PROCESSING_ERROR',
          error: {
            title: 'There was an issue processing your transaction.',
            description: 'Please contact support.',
            onRequestClose: () => {
              setActiveStep({ step: 'INTRO' });
            },
          },
        });

        onAskConfirmation(false);
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
        if (activeStep === 'PROCESSING_ERROR') {
          return error?.onRequestClose?.();
        }

        return onCompletion();
      }}
      isDrawerOnMobile
    >
      <Modal.Body className="flex items-center justify-center gap-4 text-center">
        {isProcessing && <ProcessingLoading transaction={transaction} />}
        {activeStep === 'COMPLETED' && <ProcessingCompleted />}
        {activeStep === 'PROCESSING_ERROR' && <ProcessingError />}
      </Modal.Body>
    </Modal>
  );
};

type BuyCoresProps = Pick<CoreOptionsProps, 'amountNeededCopy'>;

const BuyCoresMobile = ({ amountNeededCopy }: BuyCoresProps) => {
  const { selectedProduct, openCheckout, paddle } = useBuyCoresContext();

  useEffect(() => {
    if (!paddle && !iOSSupportsCoresPurchase()) {
      return;
    }

    if (selectedProduct) {
      openCheckout({ priceId: selectedProduct.id });
    }
  }, [openCheckout, selectedProduct, paddle]);

  if (iOSSupportsCoresPurchase()) {
    return (
      <ModalBody
        className={classNames(
          'bg-gradient-to-t from-theme-overlay-float-bun to-transparent',
        )}
      >
        <CoreOptions amountNeededCopy={amountNeededCopy} />
      </ModalBody>
    );
  }

  return (
    <ModalBody
      className={classNames(
        'bg-gradient-to-t from-theme-overlay-float-bun to-transparent',
        selectedProduct && '!p-0',
      )}
    >
      {selectedProduct ? (
        <BuyCoresCheckout className="p-6" />
      ) : (
        <CoreOptions amountNeededCopy={amountNeededCopy} />
      )}
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

const BuyCoreDesktop = ({ amountNeededCopy }: BuyCoresProps) => {
  const { selectedProduct } = useBuyCoresContext();

  return (
    <ModalBody
      className={classNames(
        'bg-gradient-to-t from-theme-overlay-float-bun to-transparent !p-0 tablet:rounded-b-16',
      )}
    >
      <div className="flex flex-1 flex-row">
        <CoreOptions className="p-6" amountNeededCopy={amountNeededCopy} />
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

const BuyFlow = ({
  onPlusClick: onPlusButtonClick,
  amountNeededCopy,
  ...props
}: ModalProps & ModalHeaderProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const canPurchaseCores = useCanPurchaseCores();

  return (
    <Modal
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
      {...props}
    >
      <Modal.Header
        title={!isMobile ? 'Get More Cores' : undefined}
        className="mr-auto flex-row-reverse justify-between gap-4 laptop:justify-end"
        showCloseButton={!isMobile}
      >
        <BuyCreditsButton
          hideBuyButton={!canPurchaseCores}
          onPlusClick={onPlusButtonClick}
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
      {isMobile ? (
        <BuyCoresMobile amountNeededCopy={amountNeededCopy} />
      ) : (
        <BuyCoreDesktop amountNeededCopy={amountNeededCopy} />
      )}
    </Modal>
  );
};

export const TransactionStatusListener = (props: ModalProps): ReactElement => {
  const { activeStep } = useBuyCoresContext();

  if (['PROCESSING', 'COMPLETED', 'PROCESSING_ERROR'].includes(activeStep)) {
    return <BuyCoresProcessing {...props} />;
  }

  return null;
};

const ModalRender = ({ ...props }: ModalProps & ModalHeaderProps) => {
  const { activeStep } = useBuyCoresContext();

  return (
    <>
      <TransactionStatusListener {...props} />
      {activeStep === 'INTRO' && <BuyFlow {...props} />}
    </>
  );
};

type BuyCoresModalProps = ModalProps &
  ModalHeaderProps & {
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
