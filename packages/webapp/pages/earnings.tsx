import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { NextSeoProps } from 'next-seo';
import type { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import {
  DateFormat,
  PageWidgets,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonColor,
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
  docs,
  searchDocs,
  webappUrl,
  withdrawLink,
} from '@dailydotdev/shared/src/lib/constants';
import {
  CoinIcon,
  DevPlusIcon,
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
import type { UserImageProps } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  formatCoresCurrency,
  formatCurrency,
} from '@dailydotdev/shared/src/lib/utils';
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
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

type LogStartBuyingCreditsProps = {
  origin: Origin;
  target_id?: string;
  amount?: number;
};

type BuyCoreProps = {
  onBuyCoresClick: (props: LogStartBuyingCreditsProps) => void;
  amount: number;
  price: number;
};
const BuyCore = ({
  onBuyCoresClick,
  amount,
  price,
}: BuyCoreProps): ReactElement => {
  return (
    <Link href={`${webappUrl}cores`}>
      <a
        href={`${webappUrl}cores`}
        className="flex flex-1 flex-col items-center rounded-14 bg-surface-float p-2"
        onClick={() =>
          onBuyCoresClick({ amount, origin: Origin.EarningsPagePackage })
        }
      >
        <CoinIcon size={IconSize.XLarge} className="mb-1" />
        <Typography type={TypographyType.Title3} bold>
          {amount}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          ${price}
        </Typography>
      </a>
    </Link>
  );
};

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

type TransactionItemProps = {
  type: 'receive' | 'send' | 'purchase';
  user: UserImageProps;
  date: Date;
  amount: number;
};

const TransactionTypeToIcon: Record<
  TransactionItemProps['type'],
  ReactElement
> = {
  receive: (
    <div className="size-4 rounded-10 bg-action-upvote-float text-accent-avocado-default">
      <PlusIcon size={IconSize.Size16} />
    </div>
  ),
  send: (
    <div className="size-4 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
      <MinusIcon size={IconSize.Size16} />
    </div>
  ),
  purchase: (
    <div className="size-4 rounded-10 bg-action-bookmark-float text-accent-bun-default">
      <CoinIcon size={IconSize.Size16} />
    </div>
  ),
};

const TransactionItem = ({
  type,
  user,
  date,
  amount,
}: TransactionItemProps): ReactElement => {
  return (
    <li className="flex">
      <div className="flex flex-1 items-center gap-2">
        {TransactionTypeToIcon[type]}
        <ProfilePicture size={ProfileImageSize.Medium} user={user} />{' '}
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Subhead} bold>
            {user.name}
          </Typography>
          <div className="flex text-text-tertiary typo-footnote">
            <Typography type={TypographyType.Footnote}>{type}</Typography>
            <Separator />
            <DateFormat date={date} type={TimeFormatType.Post} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CoinIcon />
        <Typography type={TypographyType.Callout} bold>
          {amount}
        </Typography>
      </div>
    </li>
  );
};

const Earnings = (): ReactElement => {
  const { isLoggedIn, user } = useAuthContext();
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

  const { data: transactions } = transactionsQuery;

  if (!user) {
    return null;
  }

  const minEarningsThreshold = 10_000;
  const earningsProgressPercentage =
    user.balance.amount / (minEarningsThreshold / 100);

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
                Icon={<CoinIcon size={IconSize.Small} />}
                title="Balance"
                description="Your current balance"
                balance={user.balance.amount}
                className="bg-surface-float"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-bookmark-float text-accent-bun-default">
                    <CoinIcon size={IconSize.Small} />
                  </div>
                }
                title="Purchased"
                description="Amount of cores you have purchased"
                balance={transactionSummary?.purchased}
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
                  others. Once you reach {formatCurrency(minEarningsThreshold)}{' '}
                  Cores, you can request a withdrawal. Monetization is still in
                  beta, so additional eligibility steps and requirements may
                  apply.
                </Typography>
              </div>
              <div className="flex gap-2">
                <CoinIcon />
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
                    {formatCoresCurrency(user.balance.amount)} /{' '}
                    <strong>{formatCurrency(minEarningsThreshold)}</strong>{' '}
                    Cores (≈ USD $100)
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
              <InfiniteScrolling
                isFetchingNextPage={transactionsQuery.isFetchingNextPage}
                canFetchMore={transactionsQuery.hasNextPage}
                fetchNextPage={transactionsQuery.fetchNextPage}
              >
                <ul className="flex flex-col gap-4">
                  {transactions?.pages.map((page) => {
                    return page.edges.map((edge) => {
                      const { node } = edge;

                      if (!node.sender && !node.product) {
                        return (
                          <TransactionItem
                            key={node.id}
                            type="purchase"
                            user={{
                              id: node.receiver.id,
                              name: node.receiver.name,
                              username: node.receiver.username,
                              image: node.receiver.image,
                            }}
                            amount={node.value}
                            date={new Date(node.createdAt)}
                          />
                        );
                      }

                      const type =
                        user.id === node.receiver.id ? 'receive' : 'send';

                      return (
                        <TransactionItem
                          key={node.id}
                          type={type}
                          user={{
                            id: node.sender.id,
                            name: node.sender.name,
                            username: node.sender.username,
                            image: node.sender.image,
                          }}
                          amount={type === 'receive' ? node.value : -node.value}
                          date={new Date(node.createdAt)}
                        />
                      );
                    });
                  })}
                </ul>
              </InfiniteScrolling>
            </section>
          </div>
        </main>
        <PageWidgets className="flex gap-4 py-6">
          <WidgetContainer className="hidden flex-col gap-4 p-6 laptop:flex">
            <div className="gap-1">
              <Typography type={TypographyType.Body} bold>
                Buy Cores
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                Stock up on Cores to engage, reward, and unlock more on
                daily.dev
              </Typography>
            </div>
            <div className="flex gap-3">
              <BuyCore
                onBuyCoresClick={onBuyCoresClick}
                amount={100}
                price={3.99}
              />
              <BuyCore
                onBuyCoresClick={onBuyCoresClick}
                amount={500}
                price={50}
              />
              <BuyCore
                onBuyCoresClick={onBuyCoresClick}
                amount={1000}
                price={100}
              />
            </div>
            <Button
              variant={ButtonVariant.Float}
              onClick={() => onBuyCoresClick({ target_id: 'See more options' })}
              tag="a"
              href={`${webappUrl}cores`}
            >
              See more options
            </Button>
          </WidgetContainer>
          <WidgetContainer className="flex flex-col gap-4 p-6">
            <div className="flex justify-between">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
                className="flex gap-1"
                color={TypographyColor.Plus}
              >
                <DevPlusIcon size={IconSize.XSmall} /> Plus
              </Typography>
              🎁
            </div>
            <Typography type={TypographyType.Body} bold>
              {/* TODO feat/transactions replace with real data */}
              Get {'{X}'} Cores every month with daily.dev Plus and access pro
              features to fast-track your growth.
            </Typography>
            <Button
              className="mt-2"
              variant={ButtonVariant.Primary}
              color={ButtonColor.Bacon}
            >
              Upgrade to Plus
            </Button>
          </WidgetContainer>
          <WidgetContainer className="flex flex-col">
            <div className="flex justify-around p-4">
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={docs}
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
                href={searchDocs}
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
