import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  coresDocsLink,
  creatorsTermsOfService,
  onboardingUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  CoreIcon,
  CreditCardIcon,
  DevPlusIcon,
  DocsIcon,
  ShieldIcon,
} from '@dailydotdev/shared/src/components/icons';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';

import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import type { TransactionItemType } from '@dailydotdev/shared/src/lib/transaction';
import {
  getTransactionType,
  getTransactionLabel,
  getTransactionNote,
} from '@dailydotdev/shared/src/lib/transaction';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  UserTransaction,
  UserTransactionSummary,
} from '@dailydotdev/shared/src/graphql/njord';
import {
  getTransactions,
  getTransactionSummary,
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { LogStartBuyingCreditsProps } from '@dailydotdev/shared/src/types';
import { FeaturedCoresWidget } from '@dailydotdev/shared/src/components/cores/FeaturedCoresWidget';
import { PlusCoresGivebackWidget } from '@dailydotdev/shared/src/components/cores/PlusCoresGivebackWidget';
import type { TransactionItemProps } from '@dailydotdev/shared/src/components/cores/TransactionItem';
import { TransactionItem } from '@dailydotdev/shared/src/components/cores/TransactionItem';
import { SquadWallets } from '@dailydotdev/shared/src/components/cores/SquadWallets';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  BodyTextPlaceholder,
  TextPlaceholder,
  WidgetContainer,
} from '@dailydotdev/shared/src/components/widgets/common';
import { useRouter } from 'next/router';
import {
  useCanPurchaseCores,
  useHasAccessToCores,
} from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { getPageSeoTitles } from '../components/layouts/utils';

const BalanceStat = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number;
  isLoading: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    {isLoading ? (
      <span className="flex h-6 items-center">
        <TextPlaceholder className="w-10" />
      </span>
    ) : (
      <Typography type={TypographyType.Callout} className="tabular-nums" bold>
        {formatCoresCurrency(value)}
      </Typography>
    )}
  </div>
);

const BalanceCard = ({
  balance,
  summary,
  isLoading,
}: {
  balance: number;
  summary?: UserTransactionSummary;
  isLoading: boolean;
}): ReactElement => (
  <section className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-6">
    <div className="flex flex-col gap-1">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        bold
      >
        Balance
      </Typography>
      <Typography
        type={TypographyType.LargeTitle}
        className="flex items-center gap-2 tabular-nums"
        bold
      >
        <CoreIcon size={IconSize.Large} />
        {formatCoresCurrency(balance)}
      </Typography>
    </div>
    <div className="flex gap-6 border-t border-border-subtlest-tertiary pt-4">
      <BalanceStat
        label="Purchased"
        value={summary?.purchased ?? 0}
        isLoading={isLoading}
      />
      <BalanceStat
        label="Received"
        value={summary?.received ?? 0}
        isLoading={isLoading}
      />
      <BalanceStat
        label="Spent"
        value={summary?.spent ?? 0}
        isLoading={isLoading}
      />
    </div>
  </section>
);

const getTransactionVisual = (
  transaction: UserTransaction,
  type: TransactionItemType,
): Pick<TransactionItemProps, 'icon' | 'title'> => {
  if (type === 'purchase') {
    return { icon: <CreditCardIcon />, title: 'Bought Cores' };
  }

  if (transaction.referenceType === UserTransactionType.PostBoost) {
    return { icon: <BoostIcon />, title: 'Boost' };
  }

  if (transaction.referenceType === UserTransactionType.PlusCoresGiveback) {
    return { icon: <DevPlusIcon />, title: 'Plus giveback' };
  }

  return {};
};

// A finished purchase needs no "Purchased" label under "Bought Cores"
const isSettledPurchase = (
  transaction: UserTransaction,
  type: TransactionItemType,
): boolean =>
  type === 'purchase' &&
  transaction.status === UserTransactionStatus.Success &&
  !transaction.flags.error;

const TransactionHistoryPlaceholder = (): ReactElement => (
  <div className="flex flex-col gap-4" aria-busy>
    {[0, 1, 2, 3, 4].map((placeholder) => (
      <div key={placeholder} className="flex h-10 items-center gap-3">
        <ElementPlaceholder className="size-10 shrink-0 rounded-12" />
        <div className="flex flex-1 flex-col gap-0.5">
          <BodyTextPlaceholder className="w-2/5" />
          <TextPlaceholder className="w-3/5" />
        </div>
        <BodyTextPlaceholder className="w-12 shrink-0" />
      </div>
    ))}
  </div>
);

const WalletPagePlaceholder = (): ReactElement => (
  <div aria-busy className="flex flex-col gap-6 p-4 tablet:p-6">
    <ElementPlaceholder className="h-44 rounded-16" />
    <section className="flex w-full flex-col gap-6">
      <Typography type={TypographyType.Body} bold>
        Transaction history
      </Typography>
      <TransactionHistoryPlaceholder />
    </section>
  </div>
);

const Wallet = (): ReactElement | null => {
  const router = useRouter();
  const { isLoggedIn, user, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const hasCoresAccess = useHasAccessToCores();
  const canPurchaseCores = useCanPurchaseCores();
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  const onBuyCoresClick = useCallback(
    ({
      origin = Origin.WalletPageCTA,
      amount,
      target_id,
    }: Partial<LogStartBuyingCreditsProps>) => {
      logEvent({
        event_name: LogEvent.StartBuyingCredits,
        target_id,
        extra: JSON.stringify({ origin, quantity: amount }),
      });
    },
    [logEvent],
  );

  const { data: transactionSummary, isPending: isPendingSummary } = useQuery({
    queryKey: generateQueryKey(RequestKey.Transactions, user, 'summary'),
    queryFn: getTransactionSummary,
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });

  const transactionsQuery = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.Transactions, user, 'list', {
      first: 20,
    }),
    queryFn: async ({ queryKey, pageParam }) => {
      const [, , , queryVariables] = queryKey as [
        RequestKey.Transactions,
        string,
        'list',
        { first: number },
      ];

      return getTransactions({ ...queryVariables, after: pageParam });
    },
    initialPageParam: '',
    getNextPageParam: (data, allPages, lastPageParam) => {
      const nextPageparam = getNextPageParam(data?.pageInfo);

      if (lastPageParam === nextPageparam) {
        return null;
      }

      return getNextPageParam(data?.pageInfo);
    },
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });

  const { data: transactions, isPending: isPendingTransactions } =
    transactionsQuery;

  const hasTransactions = (transactions?.pages?.[0]?.edges?.length || 0) > 0;
  const isPageReady = router?.isReady && isAuthReady;

  useEffect(() => {
    if (!isPageReady) {
      return;
    }
    if (hasCoresAccess) {
      return;
    }

    router.push(user ? webappUrl : onboardingUrl);
  }, [isPageReady, router, user, hasCoresAccess]);

  const buyCoresButton = canPurchaseCores ? (
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      onClick={() => onBuyCoresClick({ target_id: 'Buy Cores' })}
      tag="a"
      href={getPathnameWithQuery(
        `${webappUrl}cores`,
        new URLSearchParams({
          origin: Origin.WalletPageCTA,
        }),
      )}
    >
      Buy Cores
    </Button>
  ) : null;

  const desktopHeader = !isLaptopLayout && !isPhone && (
    <header className="hidden items-center justify-between border-b border-border-subtlest-tertiary px-4 py-2 tablet:flex">
      <Typography type={TypographyType.Title3} bold>
        Core wallet
      </Typography>
      {buyCoresButton}
    </header>
  );

  if (!isPageReady) {
    return (
      <>
        {isLaptopLayout && (
          <PageHeader title="Core wallet">{buyCoresButton}</PageHeader>
        )}
        <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
          <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
            {isPhone && <ShellPage title="Core wallet" />}
            {desktopHeader}
            <WalletPagePlaceholder />
          </main>
        </div>
      </>
    );
  }

  if (!user || !hasCoresAccess) {
    return null;
  }

  return (
    <ProtectedPage>
      {isLaptopLayout && (
        <PageHeader title="Core wallet">{buyCoresButton}</PageHeader>
      )}
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          {isPhone && (
            <ShellPage
              title="Core wallet"
              actions={
                buyCoresButton &&
                React.cloneElement(buyCoresButton, {
                  className: '!h-[2.375rem] !rounded-14',
                })
              }
            />
          )}
          {desktopHeader}
          <div className="flex flex-col gap-6 p-4 tablet:p-6">
            <BalanceCard
              balance={user.balance.amount}
              summary={transactionSummary}
              isLoading={isPendingSummary}
            />
            <PlusCoresGivebackWidget className="laptop:hidden" />
            <SquadWallets />
            <section className="flex w-full flex-col gap-4">
              <Typography type={TypographyType.Body} bold>
                Transaction history
              </Typography>
              {isPendingTransactions && <TransactionHistoryPlaceholder />}
              {!isPendingTransactions && (
                <>
                  {!hasTransactions && (
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Tertiary}
                    >
                      Cores you buy, receive or spend show up here.
                    </Typography>
                  )}
                  {hasTransactions && (
                    <InfiniteScrolling
                      isFetchingNextPage={transactionsQuery.isFetchingNextPage}
                      canFetchMore={transactionsQuery.hasNextPage}
                      fetchNextPage={transactionsQuery.fetchNextPage}
                    >
                      <ul className="flex flex-col gap-4">
                        {transactions?.pages.map((page) => {
                          return page.edges.map((edge) => {
                            const { node: transaction } = edge;

                            const type = getTransactionType({
                              transaction,
                              user,
                            });
                            const transactionUser =
                              type === 'receive'
                                ? (transaction.sender ?? transaction.receiver)
                                : transaction.receiver;

                            return (
                              <TransactionItem
                                key={transaction.id}
                                {...getTransactionVisual(transaction, type)}
                                user={transactionUser}
                                profileUser={transactionUser}
                                amount={
                                  type === 'send'
                                    ? -transaction.value
                                    : transaction.valueIncFees
                                }
                                date={new Date(transaction.createdAt)}
                                label={
                                  isSettledPurchase(transaction, type)
                                    ? undefined
                                    : getTransactionLabel({
                                        transaction,
                                        user,
                                      })
                                }
                                extraLabel={
                                  transaction?.sourceName
                                    ? `${transaction.sourceName} Squad`
                                    : undefined
                                }
                                note={getTransactionNote({ transaction })}
                              />
                            );
                          });
                        })}
                      </ul>
                    </InfiniteScrolling>
                  )}
                </>
              )}
            </section>
          </div>
        </main>
        <PageWidgets className="flex gap-4 py-4">
          {canPurchaseCores && (
            <FeaturedCoresWidget
              className="hidden laptop:flex"
              origin={Origin.WalletPagePackage}
              onClick={onBuyCoresClick}
              amounts={[100, 300, 600]}
            />
          )}
          <PlusCoresGivebackWidget className="hidden laptop:flex" />
          <WidgetContainer className="flex flex-col">
            <div className="flex justify-around p-4">
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={coresDocsLink}
                icon={<DocsIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Docs
              </Button>
              <ListCardDivider className="mx-3" />
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={creatorsTermsOfService}
                icon={<ShieldIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Terms
              </Button>
            </div>
          </WidgetContainer>
        </PageWidgets>
      </div>
    </ProtectedPage>
  );
};

const getWalletLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Core Wallet'),
  description:
    'Manage your Core Wallet on daily.dev. Check your balance, track activity, and buy Cores to support developers and power the community.',
  nofollow: true,
  noindex: true,
};

Wallet.getLayout = getWalletLayout;
Wallet.layoutProps = { seo };

export default Wallet;
