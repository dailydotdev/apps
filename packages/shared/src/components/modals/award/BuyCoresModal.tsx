import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
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
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { CoreIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { CoreOptionList } from '../../cores/CoreOptionList';
import { CoreAmountNeeded } from '../../cores/CoreAmountNeeded';
import type { Product, UserTransaction } from '../../../graphql/njord';
import {
  coresPricesQueryOptions,
  getTransactionByProvider,
  transactionRefetchIntervalMs,
  UserTransactionStatus,
} from '../../../graphql/njord';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { oneMinute } from '../../../lib/dateFormat';
import { useAuthContext } from '../../../contexts/AuthContext';
import { coresFriendshipImage } from '../../../lib/image';
import { walletUrl } from '../../../lib/constants';
import { Loader } from '../../Loader';
import { useIsLightTheme } from '../../../hooks/utils';
import type { Origin } from '../../../lib/log';
import { formatCoresCurrency } from '../../../lib/utils';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { labels } from '../../../lib';
import { BuyCoresContextProvider } from '../../../contexts/BuyCoresContext/BuyCoresContext';
import { iOSSupportsCoresPurchase } from '../../../lib/ios';
import type { SquadWallet } from '../../../graphql/squadWallet';
import { CoresMomentModal } from '../../cores/CoresMomentModal';
import { CoresDeals } from '../../cores/CoresDeals';
import { StartupsPromoSpot } from '../../../features/squads/hooks/useStartupsPromo';

export type CoreOptionsProps = {
  className?: string;
  title?: ReactNode;
  amountNeededCopy?: ReactNode;
  /** Shown above the Cores packages, see `CoresDeals` */
  promo?: ReactNode;
};

type ModalHeaderProps = Pick<CoreOptionsProps, 'amountNeededCopy' | 'promo'>;

export const CoreOptions = ({
  className,
  title,
  amountNeededCopy,
  promo,
}: CoreOptionsProps): ReactElement => {
  const isText = typeof amountNeededCopy === 'string';

  return (
    <div className={classNames('flex-1', className)}>
      {title}
      {!amountNeededCopy || isText ? (
        <CoreAmountNeeded title={isText ? amountNeededCopy : undefined} />
      ) : (
        amountNeededCopy
      )}
      {promo && <div className="mt-4 first:mt-0">{promo}</div>}
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Callout}
        className="mt-4 first:mt-0"
        bold
      >
        Packages
      </Typography>
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

const ProcessingCompleted = ({
  onRequestClose,
}: Pick<ModalProps, 'onRequestClose'>): ReactElement => {
  const { onCompletion, selectedProduct, squadWallet } = useBuyCoresContext();

  return (
    <CoresMomentModal
      amount={formatCoresCurrency(selectedProduct?.value ?? 0)}
      title="You got your Cores!"
      body={
        squadWallet
          ? `Success! Your Cores are now in the ${squadWallet.name} wallet.`
          : 'Success! Your Cores are now available in your balance.'
      }
      onRequestClose={onRequestClose}
    >
      <Button
        onClick={onCompletion}
        variant={ButtonVariant.Primary}
        className="w-full"
      >
        Got it
      </Button>
    </CoresMomentModal>
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

  const { providerTransactionId, squadWallet } = useBuyCoresContext();

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

      if (squadWallet) {
        [RequestKey.SquadWallet, RequestKey.SquadSubscription].forEach((key) =>
          queryClient.invalidateQueries({
            queryKey: generateQueryKey(key, user, squadWallet.sourceId),
          }),
        );
      }

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

  if (activeStep === 'COMPLETED') {
    return <ProcessingCompleted onRequestClose={() => onCompletion?.()} />;
  }

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
        {activeStep === 'PROCESSING_ERROR' && <ProcessingError />}
      </Modal.Body>
    </Modal>
  );
};

type BuyCoresProps = Pick<CoreOptionsProps, 'amountNeededCopy' | 'promo'>;

const BuyCoresMobile = ({ amountNeededCopy, promo }: BuyCoresProps) => {
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
      <ModalBody>
        <CoreOptions amountNeededCopy={amountNeededCopy} promo={promo} />
      </ModalBody>
    );
  }

  return (
    <ModalBody className="gap-4">
      {selectedProduct ? (
        <>
          <img
            src={coresFriendshipImage}
            alt="Friends passing a Core"
            className="h-40 w-full rounded-16 object-cover object-[50%_35%]"
          />
          <BuyCoresCheckout />
        </>
      ) : (
        <CoreOptions amountNeededCopy={amountNeededCopy} promo={promo} />
      )}
    </ModalBody>
  );
};

/** The character art beside the packs, until the checkout takes its place */
export const CoresFriendshipArt = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-1 flex-col overflow-hidden rounded-16',
      className,
    )}
  >
    <img
      src={coresFriendshipImage}
      alt="Friends passing a Core"
      className="absolute inset-0 size-full object-cover object-[50%_70%]"
    />
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background-default to-transparent" />
  </div>
);

const BuyCoreDesktop = ({ amountNeededCopy, promo }: BuyCoresProps) => {
  const { selectedProduct } = useBuyCoresContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    <ModalBody className="!p-0 tablet:rounded-b-16">
      <div className="flex min-h-0 flex-1 flex-row gap-4 p-4">
        <CoreOptions
          className="min-w-0 overflow-y-auto pr-1"
          amountNeededCopy={amountNeededCopy}
          promo={promo}
        />
        <BuyCoresCheckout
          className={classNames(
            !selectedProduct && 'hidden',
            'min-w-0 overflow-y-auto rounded-16 p-4',
          )}
        />
        {!selectedProduct && isLaptop && <CoresFriendshipArt />}
      </div>
    </ModalBody>
  );
};

const BuyFlow = ({
  amountNeededCopy,
  promo,
  ...props
}: ModalProps & ModalHeaderProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { origin, squadWallet } = useBuyCoresContext();
  const deals = promo ?? (
    <CoresDeals
      spot={StartupsPromoSpot.BuyCores}
      isPersonalAllowed={false}
      withStartups
    />
  );

  return (
    <Modal
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.XLarge}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
      {...props}
    >
      <Modal.Header
        title={
          !isMobile
            ? `Get More Cores${squadWallet ? ` for ${squadWallet.name}` : ''}`
            : undefined
        }
        className="mr-auto flex-row-reverse justify-between gap-4 laptop:justify-end"
        showCloseButton={!isMobile}
      >
        <BuyCreditsButton
          hideBuyButton
          origin={origin}
          squadWallet={squadWallet}
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
        <BuyCoresMobile amountNeededCopy={amountNeededCopy} promo={deals} />
      ) : (
        <BuyCoreDesktop amountNeededCopy={amountNeededCopy} promo={deals} />
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

/** Opens the checkout on a pack picked before the pop-up opened */
const usePreselectedPack = (priceId?: string): void => {
  const { user, isLoggedIn } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { paddle, openCheckout, setSelectedProduct } = useBuyCoresContext();
  const { data: prices } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const isDoneRef = useRef(false);

  useEffect(() => {
    if (isDoneRef.current || !priceId) {
      return;
    }

    if (!paddle && !iOSSupportsCoresPurchase()) {
      return;
    }

    const price = prices?.find((item) => item.priceId === priceId);

    if (!price) {
      return;
    }

    isDoneRef.current = true;
    setSelectedProduct({ id: priceId, value: price.metadata.coresValue ?? 0 });

    // Mobile opens the checkout once a pack is selected, see BuyCoresMobile
    if (!isMobile) {
      openCheckout?.({ priceId });
    }
  }, [priceId, paddle, prices, isMobile, openCheckout, setSelectedProduct]);
};

const ModalRender = ({
  priceId,
  ...props
}: ModalProps & ModalHeaderProps & { priceId?: string }) => {
  const { activeStep } = useBuyCoresContext();
  usePreselectedPack(priceId);

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
    product?: Product;
    /** The Cores the user is missing, see `BuyCoresContextData.minCoresToBuy` */
    minCoresToBuy?: number;
    squadWallet?: SquadWallet;
    /** A pack picked before the pop-up opened, which goes straight to checkout */
    priceId?: string;
  };
export const BuyCoresModal = ({
  origin,
  onCompletion,
  product,
  minCoresToBuy,
  squadWallet,
  ...props
}: BuyCoresModalProps): ReactElement => {
  return (
    <BuyCoresContextProvider
      amountNeeded={product?.value}
      minCoresToBuy={minCoresToBuy}
      squadWallet={squadWallet}
      onCompletion={onCompletion}
      origin={origin}
    >
      <ModalRender {...props} />
    </BuyCoresContextProvider>
  );
};
