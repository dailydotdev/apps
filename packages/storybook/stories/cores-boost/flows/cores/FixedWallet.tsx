import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  coresDocsLink,
  creatorsTermsOfService,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  CoreIcon,
  CreditCardIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import classed from '@dailydotdev/shared/src/lib/classed';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import {
  getTransactionLabel,
  getTransactionType,
} from '@dailydotdev/shared/src/lib/transaction';
import { useQuery } from '@tanstack/react-query';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import {
  getTransactions,
  getTransactionSummary,
  ProductType,
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import { FeaturedCoresWidget } from '@dailydotdev/shared/src/components/cores/FeaturedCoresWidget';
import { PlusCoresGivebackWidget } from '@dailydotdev/shared/src/components/cores/PlusCoresGivebackWidget';
import { NotificationSayThanksButton } from '@dailydotdev/shared/src/components/notifications/NotificationSayThanksButton';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import type { CoresUse } from './UseYourCores';
import { UseYourCores } from './UseYourCores';
import { FixedTransactionItem } from './FixedTransactionItem';

// Copy of the production wallet page (webapp/pages/wallet.tsx), changed only
// where the fixed flows need it:
// - a Fees total, so Received + Fees adds up to what people gave
// - "Use your Cores" under the totals
// - fee breakdown, the note and Say thanks on received award rows
// - pending purchases explain themselves, and link to support after 10 minutes
// - Buy Cores passes next=/wallet, so a purchase comes back here
// Data still comes from the production queries (TransactionSummary,
// transactions), answered by the story's MSW handlers.

type BalanceBlockProps = {
  Icon: ReactElement;
  title: string;
  description: string;
  balance: number;
  isLoading?: boolean;
  change?: number;
} & WithClassNameProps;

const BalanceBlock = ({
  Icon,
  balance,
  title,
  description,
  className,
  isLoading,
  change,
}: BalanceBlockProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 flex-col rounded-14 border p-4',
        change
          ? 'border-accent-avocado-default'
          : 'border-border-subtlest-tertiary',
        className,
      )}
    >
      {Icon}
      <Tooltip content={description}>
        <div className="mt-4 flex gap-1">
          <Typography type={TypographyType.Callout}>{title}</Typography>
          <InfoIcon />
        </div>
      </Tooltip>
      {isLoading ? (
        <span className="flex h-[1.875rem] items-center">
          <span className="h-3 w-16 rounded-12 bg-surface-float" />
        </span>
      ) : (
        <div className="flex items-baseline gap-2">
          <Typography type={TypographyType.Title2} bold>
            {formatCoresCurrency(balance)}
          </Typography>
          {!!change && (
            <Typography
              type={TypographyType.Footnote}
              className="text-accent-avocado-default"
              bold
            >
              +{formatCoresCurrency(change)}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

const Divider = classed('div', 'h-px w-full bg-border-subtlest-tertiary');

const PENDING_SUPPORT_MS = 10 * 60 * 1000;

const isAwardFromPerson = (transaction: UserTransaction): boolean =>
  !!transaction.sender &&
  transaction.sender.id !== 'system' &&
  transaction.product?.type !== ProductType.StreakFreeze &&
  !!transaction.product;

const getDetails = (
  transaction: UserTransaction,
  type: ReturnType<typeof getTransactionType>,
): ReactNode => {
  if (transaction.status === UserTransactionStatus.Processing) {
    const age = Date.now() - new Date(transaction.createdAt).getTime();

    if (age < PENDING_SUPPORT_MS) {
      return 'Payment received. Your Cores usually land in under a minute.';
    }

    return (
      <>
        Taking longer than usual.{' '}
        <a
          href="mailto:support@daily.dev?subject=My Cores purchase is still pending"
          className="font-bold underline"
        >
          Contact support
        </a>
      </>
    );
  }

  if (type === 'receive' && isAwardFromPerson(transaction)) {
    const fee = transaction.value - transaction.valueIncFees;

    return `${formatCoresCurrency(transaction.value)} Cores award · ${formatCoresCurrency(fee)} Cores fee`;
  }

  return undefined;
};

const getNote = (transaction: UserTransaction): string | undefined => {
  const { note } = transaction.flags;

  if (
    !note ||
    !isAwardFromPerson(transaction) ||
    transaction.referenceType === UserTransactionType.PostBoost
  ) {
    return undefined;
  }

  return `“${note}”`;
};

export interface FixedWalletProps {
  /** Transaction a notification or a purchase points at */
  highlightId?: string;
  /** Cores a purchase just added, shown on the Purchased total */
  purchasedChange?: number;
  onBuyCores?: () => void;
  onUse?: (use: CoresUse) => void;
}

export const FixedWallet = ({
  highlightId,
  purchasedChange,
  onBuyCores,
  onUse,
}: FixedWalletProps): ReactElement | null => {
  const { user, isLoggedIn } = useAuthContext();
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  const { data: transactionSummary, isPending: isPendingSummary } = useQuery({
    queryKey: generateQueryKey(RequestKey.Transactions, user, 'summary'),
    queryFn: getTransactionSummary,
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });
  const summary = transactionSummary as
    | (typeof transactionSummary & { fees?: number })
    | undefined;

  const { data: transactions, isPending: isPendingTransactions } = useQuery({
    queryKey: generateQueryKey(RequestKey.Transactions, user, 'list', {
      first: 20,
    }),
    queryFn: () => getTransactions({ first: 20 }),
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });

  // Every /cores link on the page (header, featured packs) leads to the
  // story's /cores step instead of leaving Storybook
  const onLinkClick = useCallback(
    (event: React.MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a');

      if (!/cores(\?|$)/.test(link?.getAttribute('href') ?? '')) {
        return;
      }
      event.preventDefault();
      onBuyCores?.();
    },
    [onBuyCores],
  );

  if (!user) {
    return null;
  }

  const buyCoresButton = (
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      tag="a"
      href={getPathnameWithQuery(
        `${webappUrl}cores`,
        new URLSearchParams({
          origin: Origin.WalletPageCTA,
          next: '/wallet',
        }),
      )}
    >
      Buy Cores
    </Button>
  );

  const desktopHeader = !isLaptopLayout && !isPhone && (
    <header className="hidden items-center justify-between border-b border-border-subtlest-tertiary px-4 py-2 tablet:flex">
      <Typography type={TypographyType.Title3} bold>
        Core wallet
      </Typography>
      {buyCoresButton}
    </header>
  );

  const edges = transactions?.edges ?? [];

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div className="contents" onClickCapture={onLinkClick}>
      {isLaptopLayout && (
        <PageHeader title="Core wallet">{buyCoresButton}</PageHeader>
      )}
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          {isPhone && (
            <ShellPage
              title="Core wallet"
              actions={React.cloneElement(buyCoresButton, {
                className: '!h-[2.375rem] !rounded-14',
              })}
            />
          )}
          {desktopHeader}
          <div className="flex flex-col gap-6 p-4 tablet:p-6">
            <section className="flex w-full flex-wrap gap-4">
              <BalanceBlock
                Icon={<CoreIcon size={IconSize.Small} />}
                title="Balance"
                description="Your current balance"
                balance={user.balance.amount}
                className="basis-[calc(50%-0.5rem)] tablet:basis-0"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-bookmark-float text-accent-bun-default">
                    <CreditCardIcon size={IconSize.Small} />
                  </div>
                }
                title="Purchased"
                description="Amount of cores you have purchased"
                balance={summary?.purchased || 0}
                isLoading={isPendingSummary}
                change={purchasedChange}
                className="basis-[calc(50%-0.5rem)] tablet:basis-0"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-upvote-float text-accent-avocado-default">
                    <PlusIcon size={IconSize.Small} />
                  </div>
                }
                title="Received"
                description="Cores you have received, after fees"
                balance={summary?.received || 0}
                isLoading={isPendingSummary}
                className="basis-[calc(50%-0.5rem)] tablet:basis-0"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-surface-float text-text-tertiary">
                    <InfoIcon size={IconSize.Small} />
                  </div>
                }
                title="Fees"
                description="The share of awards you received that daily.dev keeps"
                balance={summary?.fees || 0}
                isLoading={isPendingSummary}
                className="basis-[calc(50%-0.5rem)] tablet:basis-0"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
                    <MinusIcon size={IconSize.Small} />
                  </div>
                }
                title="Spent"
                description="Cores you have spent on awards, boosts and streak restores"
                balance={summary?.spent || 0}
                isLoading={isPendingSummary}
                className="basis-full tablet:basis-0"
              />
            </section>
            <UseYourCores balance={user.balance.amount} onUse={onUse} />
            <PlusCoresGivebackWidget className="laptop:hidden" />
            <Divider />
            <section className="flex w-full flex-col gap-6">
              <Typography type={TypographyType.Body} bold>
                Transaction history
              </Typography>
              {!isPendingTransactions && !edges.length && (
                <Typography type={TypographyType.Callout}>
                  You have no transactions yet.
                </Typography>
              )}
              <ul className="flex flex-col gap-4">
                {edges.map(({ node: transaction }) => {
                  const type = getTransactionType({ transaction, user });
                  const transactionUser =
                    type === 'receive'
                      ? (transaction.sender ?? transaction.receiver)
                      : transaction.receiver;
                  const canThank =
                    type === 'receive' && isAwardFromPerson(transaction);

                  return (
                    <FixedTransactionItem
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
                      details={getDetails(transaction, type)}
                      note={getNote(transaction)}
                      action={
                        canThank && (
                          <NotificationSayThanksButton
                            referenceId={transaction.id}
                            hasThanks={!!transaction.flags.thanksAt}
                          />
                        )
                      }
                      isHighlighted={transaction.id === highlightId}
                    />
                  );
                })}
              </ul>
            </section>
          </div>
        </main>
        <PageWidgets className="flex gap-4 py-4">
          <FeaturedCoresWidget
            className="hidden laptop:flex"
            origin={Origin.WalletPagePackage}
            onClick={() => undefined}
            amounts={[100, 300, 600]}
          />
          <PlusCoresGivebackWidget className="hidden laptop:flex" />
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
                href={creatorsTermsOfService}
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
    </div>
  );
};
