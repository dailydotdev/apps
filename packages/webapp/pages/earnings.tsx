import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import type { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
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
  onboardingUrl,
  termsOfService,
  webappUrl,
  withdrawLink,
} from '@dailydotdev/shared/src/lib/constants';
import {
  CoinIcon,
  CreditCardIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';

import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  formatCoresCurrency,
  formatCurrency,
} from '@dailydotdev/shared/src/lib/utils';
import {
  getTransactionType,
  getTransactionLabel,
  coreApproxValueUSD,
  minCoresEarningsThreshold,
} from '@dailydotdev/shared/src/lib/transaction';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import {
  getTransactions,
  getTransactionSummary,
} from '@dailydotdev/shared/src/graphql/njord';
import InfiniteScrolling from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { LogStartBuyingCreditsProps } from '@dailydotdev/shared/src/types';
import { FeaturedCoresWidget } from '@dailydotdev/shared/src/components/cores/FeaturedCoresWidget';
import { TransactionItem } from '@dailydotdev/shared/src/components/cores/TransactionItem';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { useRouter } from 'next/router';
import { hasAccessToCores } from '@dailydotdev/shared/src/lib/cores';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

type BalanceBlockProps = {
  Icon: ReactElement;
  title: string;
  description: string;
  balance: number;
} & WithClassNameProps;
const BalanceBlock = ({
  Icon,
  balance,
  title,
  description,
  className,
}: BalanceBlockProps): ReactElement => {
  return (
    <div
      className={classNames('flex flex-1 flex-col rounded-14 p-4', className)}
    >
      {Icon}
      <SimpleTooltip content={description} appendTo="parent">
        <div className="mt-4 flex gap-1">
          <Typography type={TypographyType.Callout}>{title}</Typography>
          <InfoIcon />
        </div>
      </SimpleTooltip>
      <Typography type={TypographyType.Title2} bold>
        {formatCoresCurrency(balance)}
      </Typography>
    </div>
  );
};

const Divider = classed('div', 'h-px w-full bg-border-subtlest-tertiary');

const Earnings = (): ReactElement => {
  const router = useRouter();
  const { isLoggedIn, user, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const onBuyCoresClick = useCallback(
    ({
      origin = Origin.EarningsPageCTA,
      amount,
      target_id,
    }: Partial<LogStartBuyingCreditsProps>) => {
      logEvent({
        event_name: LogEvent.StartBuyingCredits,
        target_id,
        extra: JSON.stringify({ origin, amount }),
      });
    },
    [logEvent],
  );

  const { data: transactionSummary } = useQuery({
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
    if (hasAccessToCores(user)) {
      return;
    }

    router.push(user ? webappUrl : onboardingUrl);
  }, [isPageReady, router, user]);

  if (!user || !isPageReady || !hasAccessToCores(user)) {
    return null;
  }

  const earningsProgressPercentage =
    user.balance.amount / (minCoresEarningsThreshold / 100);
  const coresValueUSD = minCoresEarningsThreshold / coreApproxValueUSD;

  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-2">
            <Typography type={TypographyType.Title3} bold>
              Core wallet
            </Typography>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => onBuyCoresClick({ target_id: 'Buy Cores' })}
              tag="a"
              href={`${webappUrl}cores`}
            >
              Buy Cores
            </Button>
          </header>
          <div className="flex flex-col gap-6 p-6">
            <section className="flex w-full flex-wrap gap-4">
              <BalanceBlock
                Icon={
                  <CoinIcon
                    size={IconSize.Small}
                    className="text-accent-bun-default"
                  />
                }
                title="Balance"
                description="Your current balance"
                balance={user.balance.amount}
                className="bg-surface-float"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-bookmark-float text-accent-bun-default">
                    <CreditCardIcon size={IconSize.Small} />
                  </div>
                }
                title="Purchased"
                description="Amount of cores you have purchased"
                balance={transactionSummary?.purchased || 0}
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-upvote-float text-accent-avocado-default">
                    <PlusIcon size={IconSize.Small} />
                  </div>
                }
                title="Received"
                description="Amount of cores you have received"
                balance={transactionSummary?.received || 0}
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
                    <MinusIcon size={IconSize.Small} />
                  </div>
                }
                title="Spent"
                description="Amount of cores you have spent"
                balance={transactionSummary?.spent || 0}
              />
            </section>
            <Divider />
            <section className="flex w-full flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Typography type={TypographyType.Body}>
                  <strong>Earn with daily.dev</strong> (beta)
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Earn income by engaging with the daily.dev community,
                  contributing valuable content, and receiving Cores from
                  others. Once you reach{' '}
                  {formatCurrency(minCoresEarningsThreshold, {
                    minimumFractionDigits: 0,
                  })}{' '}
                  Cores, you can request a withdrawal. Monetization is still in
                  beta, so additional eligibility steps and requirements may
                  apply.
                </Typography>
              </div>
              <div className="flex gap-2">
                <CoinIcon className="text-accent-bun-default" />
                <div className="flex flex-col gap-1.5">
                  <ProgressBar
                    shouldShowBg
                    percentage={earningsProgressPercentage}
                    className={{
                      wrapper: 'h-2 rounded-8',
                      bar: 'h-full rounded-8',
                      barColor: 'bg-accent-bun-default',
                    }}
                  />
                  <Typography type={TypographyType.Callout}>
                    {formatCurrency(user.balance.amount, {
                      minimumFractionDigits: 0,
                    })}{' '}
                    /{' '}
                    <strong>
                      {formatCurrency(minCoresEarningsThreshold, {
                        minimumFractionDigits: 0,
                      })}
                    </strong>{' '}
                    Cores (≈ USD $
                    {formatCurrency(coresValueUSD, {
                      minimumFractionDigits: 0,
                    })}
                    )
                  </Typography>
                </div>
              </div>
              <Button
                tag="a"
                variant={
                  earningsProgressPercentage < 100
                    ? ButtonVariant.Secondary
                    : ButtonVariant.Primary
                }
                className="mr-auto"
                disabled={earningsProgressPercentage < 100}
                href={withdrawLink}
                target="_blank"
                rel={anchorDefaultRel}
              >
                Withdraw
              </Button>
            </section>
            <Divider />
            <section className="flex w-full flex-col gap-6">
              <Typography type={TypographyType.Body} bold>
                Transaction history
              </Typography>
              {isPendingTransactions && (
                <div className="flex flex-1 flex-col gap-4">
                  {new Array(5).fill(null).map((_, index) => {
                    return (
                      <ElementPlaceholder
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className="h-10 w-full rounded-10"
                      />
                    );
                  })}
                </div>
              )}
              {!isPendingTransactions && (
                <>
                  {!hasTransactions && (
                    <Typography type={TypographyType.Callout}>
                      You have no transactions yet.
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

                            return (
                              <TransactionItem
                                key={transaction.id}
                                type={type}
                                user={
                                  type === 'receive'
                                    ? transaction.sender
                                    : transaction.receiver
                                }
                                amount={
                                  type === 'send'
                                    ? -transaction.value
                                    : transaction.value
                                }
                                date={new Date(transaction.createdAt)}
                                label={getTransactionLabel({
                                  transaction,
                                  user,
                                })}
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
        <PageWidgets className="flex gap-4 py-6">
          <FeaturedCoresWidget
            className="hidden laptop:flex"
            origin={Origin.EarningsPagePackage}
            onClick={onBuyCoresClick}
            amounts={[100, 300, 600]}
          />
          <WidgetContainer className="flex flex-col">
            <div className="flex justify-around p-4">
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={coresDocsLink}
                icon={<FeedbackIcon />}
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
                href={termsOfService}
                icon={<DocsIcon />}
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

const getEarningsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = { title: 'Earnings', nofollow: true, noindex: true };

Earnings.getLayout = getEarningsLayout;
Earnings.layoutProps = { seo, screenCentered: false };

export default Earnings;
