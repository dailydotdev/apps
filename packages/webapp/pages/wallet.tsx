import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  coresDocsLink,
  creatorsTermsOfService,
  onboardingUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { CreditCardIcon } from '@dailydotdev/shared/src/components/icons/CreditCard';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { FeedbackIcon } from '@dailydotdev/shared/src/components/icons/Feedback';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import classNames from 'classnames';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
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
import {
  coresPricesQueryOptions,
  getTransactions,
  getTransactionSummary,
} from '@dailydotdev/shared/src/graphql/njord';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { LogStartBuyingCreditsProps } from '@dailydotdev/shared/src/types';
import { TransactionItem } from '@dailydotdev/shared/src/components/cores/TransactionItem';
import { CoresDeals } from '@dailydotdev/shared/src/components/cores/CoresDeals';
import { UseYourCoresTiles } from '@dailydotdev/shared/src/components/cores/UseYourCores';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { StartupsPromoSpot } from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import {
  BodyTextPlaceholder,
  TextPlaceholder,
} from '@dailydotdev/shared/src/components/widgets/common';
import { useRouter } from 'next/router';
import {
  useCanPurchaseCores,
  useHasAccessToCores,
} from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  useIsPhone,
  useViewSizeClient,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { coresFriendshipImage } from '@dailydotdev/shared/src/lib/image';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import { getPageSeoTitles } from '../components/layouts/utils';

/** What the Buy Cores pop-up opened for, and the pack it starts on */
interface BuyingCores {
  origin: Origin;
  priceId?: string;
}

/**
 * The squads hub frame: the main column is one bordered card and, from
 * laptop, a column of widgets beside it. Below laptop the widgets follow it.
 */
const WalletFrame = ({
  children,
  widgets,
}: {
  children: ReactNode;
  widgets?: ReactNode;
}): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  return (
    <div className="mx-auto flex w-full flex-col pb-12 tablet:pb-0 laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <main className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
        {children}
      </main>
      {widgets && isLaptop && (
        <aside className="flex w-80 shrink-0 flex-col gap-4">{widgets}</aside>
      )}
      {widgets && isLaptop === false && (
        <div className="flex flex-col gap-4 px-4 pb-6 tablet:px-6">
          {widgets}
        </div>
      )}
    </div>
  );
};

const CardSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4 border-b border-border-subtlest-tertiary px-4 py-5 last:border-b-0 tablet:px-6">
    {title && (
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        {title}
      </Typography>
    )}
    {children}
  </section>
);

interface Total {
  key: string;
  title: string;
  description: string;
  icon: ReactNode;
  value: number;
  change?: number;
}

const TotalCell = ({
  total,
  isLoading,
}: {
  total: Total;
  isLoading?: boolean;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-1 bg-background-default p-3 tablet:px-4">
    <Tooltip content={total.description}>
      <span className="flex w-fit items-center gap-1.5 text-text-tertiary typo-footnote">
        {total.icon}
        {total.title}
        <InfoIcon
          size={IconSize.Size16}
          className="hidden text-text-quaternary tablet:block"
        />
      </span>
    </Tooltip>
    {isLoading ? (
      <BodyTextPlaceholder className="my-1.5 w-14" />
    ) : (
      <span className="flex items-baseline gap-1.5">
        <strong className="tabular-nums typo-title3">
          {formatCoresCurrency(total.value)}
        </strong>
        {!!total.change && (
          <strong className="text-accent-avocado-default typo-caption1">
            +{formatCoresCurrency(total.change)}
          </strong>
        )}
      </span>
    )}
  </div>
);

const TotalIcon = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex size-4 items-center justify-center rounded-6',
      className,
    )}
  >
    {children}
  </span>
);

/** The balance first, the totals in one strip under it */
const BalanceHero = ({
  balance,
  totals,
  isLoading,
}: {
  balance: number;
  totals: Total[];
  isLoading: boolean;
}): ReactElement => (
  <CardSection>
    <div className="relative flex min-h-32 overflow-hidden rounded-16 bg-surface-float">
      <div className="z-1 flex flex-col justify-center gap-1 p-5">
        <Tooltip content="Your current balance">
          <span className="flex w-fit items-center gap-1.5 text-text-secondary typo-callout">
            Balance
            <InfoIcon size={IconSize.Size16} className="text-text-tertiary" />
          </span>
        </Tooltip>
        <span className="flex items-center gap-2">
          <CoreIcon size={IconSize.Large} />
          <strong className="tabular-nums typo-large-title">
            {formatCoresCurrency(balance)}
          </strong>
        </span>
      </div>
      <img
        src={coresFriendshipImage}
        alt="Friends sharing a Core with Patchy"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-3/5 object-cover object-[50%_35%] tablet:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 45%)',
        }}
      />
    </div>
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-border-subtlest-tertiary">
      {totals.map((total) => (
        <TotalCell key={total.key} total={total} isLoading={isLoading} />
      ))}
    </div>
  </CardSection>
);

const PacksWidget = ({
  onBuy,
}: {
  onBuy: (props: LogStartBuyingCreditsProps & { priceId?: string }) => void;
}): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices, isPending } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const packs = (prices ?? []).filter((item) =>
    [100, 300, 600].includes(item.metadata.coresValue ?? 0),
  );
  const origin = Origin.WalletPagePackage;

  return (
    <SquadWidget title="Buy Cores">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        Stock up on Cores to engage, reward, and unlock more on daily.dev
      </Typography>
      <ul className="mt-3 flex flex-col">
        {isPending &&
          [0, 1, 2].map((placeholder) => (
            <li key={placeholder} className="flex h-12 items-center gap-3">
              <ElementPlaceholder className="size-6 rounded-full" />
              <BodyTextPlaceholder className="w-24" />
            </li>
          ))}
        {packs.map((item) => {
          const amount = item.metadata.coresValue ?? 0;

          return (
            <li key={item.priceId}>
              <button
                type="button"
                onClick={() => onBuy({ origin, amount, priceId: item.priceId })}
                className="-mx-2 flex h-12 w-[calc(100%+1rem)] items-center gap-3 rounded-12 px-2 text-left transition-colors hover:bg-surface-hover"
              >
                <CoreIcon size={IconSize.Medium} />
                <span className="flex-1 font-bold tabular-nums typo-subhead">
                  {formatCoresCurrency(amount)} Cores
                </span>
                <span className="rounded-8 bg-surface-float px-2 py-1 font-bold tabular-nums typo-footnote">
                  {item.price.formatted}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        className="mt-3"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        onClick={() => onBuy({ origin, target_id: 'See more options' })}
      >
        See more options
      </Button>
    </SquadWidget>
  );
};

const HelpLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}): ReactElement => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="-mx-2 flex h-10 items-center gap-3 rounded-12 px-2 text-text-secondary transition-colors typo-callout hover:bg-surface-hover hover:text-text-primary"
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ArrowIcon size={IconSize.Size16} className="rotate-90" />
    </a>
  </li>
);

const HelpWidget = (): ReactElement => (
  <SquadWidget title="About Cores">
    <ul className="mt-2 flex flex-col">
      <HelpLink
        href={coresDocsLink}
        icon={<FeedbackIcon size={IconSize.Small} />}
        label="Docs"
      />
      <HelpLink
        href={creatorsTermsOfService}
        icon={<DocsIcon size={IconSize.Small} />}
        label="Terms"
      />
    </ul>
  </SquadWidget>
);

const TransactionHistoryPlaceholder = (): ReactElement => (
  <div className="flex flex-col gap-4" aria-busy>
    {[0, 1, 2, 3, 4].map((placeholder) => (
      <div key={placeholder} className="flex h-[2.625rem] items-center gap-2">
        <ElementPlaceholder className="size-4 shrink-0 rounded-10" />
        <ElementPlaceholder className="size-8 shrink-0 rounded-12" />
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
  <div aria-busy className="flex flex-col">
    <CardSection>
      <ElementPlaceholder className="h-32 rounded-16" />
      <ElementPlaceholder className="h-[4.25rem] rounded-16" />
    </CardSection>
    <CardSection title="Transaction history">
      <TransactionHistoryPlaceholder />
    </CardSection>
  </div>
);

const WalletHeader = ({
  buyCoresButton,
}: {
  buyCoresButton: ReactElement | null;
}): ReactElement | null => {
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  if (isLaptopLayout) {
    return <PageHeader title="Core wallet">{buyCoresButton}</PageHeader>;
  }

  if (isPhone) {
    return (
      <ShellPage
        title="Core wallet"
        actions={
          buyCoresButton &&
          React.cloneElement(buyCoresButton, {
            className: '!h-[2.375rem] !rounded-14',
          })
        }
      />
    );
  }

  return null;
};

const TabletHeader = ({
  buyCoresButton,
}: {
  buyCoresButton: ReactElement | null;
}): ReactElement | null => {
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  if (isLaptopLayout || isPhone) {
    return null;
  }

  return (
    <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-6 py-3">
      <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
        Core wallet
      </Typography>
      {buyCoresButton}
    </header>
  );
};

const Wallet = (): ReactElement | null => {
  const router = useRouter();
  const { isLoggedIn, user, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const hasCoresAccess = useHasAccessToCores();
  const canPurchaseCores = useCanPurchaseCores();
  const [buying, setBuying] = useState<BuyingCores>();
  const [purchased, setPurchased] = useState<number>();
  const balanceAtBuyRef = useRef(0);

  const onBuyCores = useCallback(
    ({
      origin = Origin.WalletPageCTA,
      amount,
      target_id,
      priceId,
    }: Partial<LogStartBuyingCreditsProps> & { priceId?: string }) => {
      logEvent({
        event_name: LogEvent.StartBuyingCredits,
        target_id,
        extra: JSON.stringify({ origin, quantity: amount }),
      });
      balanceAtBuyRef.current = user?.balance?.amount ?? 0;
      setBuying({ origin, priceId });
    },
    [logEvent, user?.balance?.amount],
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
      icon={<CoreIcon />}
      onClick={() =>
        onBuyCores({ origin: Origin.WalletPageCTA, target_id: 'Buy Cores' })
      }
    >
      Buy Cores
    </Button>
  ) : null;

  if (!isPageReady) {
    return (
      <>
        <WalletHeader buyCoresButton={buyCoresButton} />
        <WalletFrame>
          <TabletHeader buyCoresButton={buyCoresButton} />
          <WalletPagePlaceholder />
        </WalletFrame>
      </>
    );
  }

  if (!user || !hasCoresAccess) {
    return null;
  }

  const totals: Total[] = [
    {
      key: 'purchased',
      title: 'Purchased',
      description: 'Amount of cores you have purchased',
      icon: (
        <TotalIcon className="bg-action-bookmark-float text-accent-bun-default">
          <CreditCardIcon size={IconSize.XXSmall} />
        </TotalIcon>
      ),
      value: transactionSummary?.purchased || 0,
      change: purchased,
    },
    {
      key: 'received',
      title: 'Received',
      description: 'Amount of cores you have received',
      icon: (
        <TotalIcon className="bg-action-upvote-float text-accent-avocado-default">
          <PlusIcon size={IconSize.XXSmall} />
        </TotalIcon>
      ),
      value: transactionSummary?.received || 0,
    },
    {
      key: 'spent',
      title: 'Spent',
      description: 'Amount of cores you have spent',
      icon: (
        <TotalIcon className="bg-action-downvote-float text-accent-ketchup-default">
          <MinusIcon size={IconSize.XXSmall} />
        </TotalIcon>
      ),
      value: transactionSummary?.spent || 0,
    },
  ];

  return (
    <ProtectedPage>
      <WalletHeader buyCoresButton={buyCoresButton} />
      <WalletFrame
        widgets={
          <>
            <CoresDeals
              spot={StartupsPromoSpot.Wallet}
              isPersonalAllowed={false}
              withStartups
              isStacked
            />
            {canPurchaseCores && <PacksWidget onBuy={onBuyCores} />}
            <HelpWidget />
          </>
        }
      >
        <TabletHeader buyCoresButton={buyCoresButton} />
        <BalanceHero
          balance={user.balance.amount}
          totals={totals}
          isLoading={isPendingSummary}
        />
        <CardSection title="Use your Cores">
          <UseYourCoresTiles />
        </CardSection>
        <CardSection title="Transaction history">
          {isPendingTransactions && <TransactionHistoryPlaceholder />}
          {!isPendingTransactions && !hasTransactions && (
            <Typography type={TypographyType.Callout}>
              You have no transactions yet.
            </Typography>
          )}
          {!isPendingTransactions && hasTransactions && (
            <InfiniteScrolling
              isFetchingNextPage={transactionsQuery.isFetchingNextPage}
              canFetchMore={transactionsQuery.hasNextPage}
              fetchNextPage={transactionsQuery.fetchNextPage}
            >
              <ul
                aria-label="Transaction history"
                className="flex flex-col gap-4"
              >
                {transactions?.pages.map((page) =>
                  page.edges.map(({ node: transaction }) => {
                    const type = getTransactionType({ transaction, user });
                    const transactionUser =
                      type === 'receive'
                        ? (transaction.sender ?? transaction.receiver)
                        : transaction.receiver;

                    return (
                      <TransactionItem
                        key={transaction.id}
                        type={type}
                        user={transactionUser}
                        profileUser={transactionUser}
                        amount={
                          type === 'send'
                            ? -transaction.value
                            : transaction.valueIncFees
                        }
                        date={new Date(transaction.createdAt)}
                        label={getTransactionLabel({ transaction, user })}
                        extraLabel={
                          transaction?.sourceName
                            ? `${transaction.sourceName} Squad`
                            : undefined
                        }
                        note={getTransactionNote({ transaction })}
                      />
                    );
                  }),
                )}
              </ul>
            </InfiniteScrolling>
          )}
        </CardSection>
      </WalletFrame>
      {buying && (
        <BuyCoresModal
          isOpen
          origin={buying.origin}
          priceId={buying.priceId}
          onCompletion={() => {
            const added = user.balance.amount - balanceAtBuyRef.current;
            setPurchased(added > 0 ? added : undefined);
            setBuying(undefined);
          }}
          onRequestClose={() => setBuying(undefined)}
        />
      )}
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
