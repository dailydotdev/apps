import type { ReactElement, ReactNode } from 'react';
import { useRoute } from '../../real/providers';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  coresDocsLink,
  creatorsTermsOfService,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  ArrowIcon,
  CoreIcon,
  CreditCardIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { Origin, TargetId } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import {
  getTransactionLabel,
  getTransactionType,
} from '@dailydotdev/shared/src/lib/transaction';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type { UserTransaction } from '@dailydotdev/shared/src/graphql/njord';
import {
  coresPricesQueryOptions,
  getTransactions,
  getTransactionSummary,
  ProductType,
  UserTransactionStatus,
  UserTransactionType,
} from '@dailydotdev/shared/src/graphql/njord';
import { NotificationSayThanksButton } from '@dailydotdev/shared/src/components/notifications/NotificationSayThanksButton';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { UpgradeToPlus } from '@dailydotdev/shared/src/components/UpgradeToPlus';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmReadLater } from '@dailydotdev/shared/src/lib/image';
import type { CoresUse } from './UseYourCores';
import { UseYourCoresTiles } from './UseYourCores';
import { TransactionRow } from './TransactionRow';
import { CardSection, friendshipArt, SquadFrame } from './frame';

// The wallet in the squads hub layout. Same content as the Flows wallet:
// balance and the four totals (with their tooltips), Use your Cores, the
// transaction history, Buy Cores in the header, the 100/300/600 packs and
// See more options, the Plus giveback, Docs and Terms. The page now reads as
// one card (balance → uses → history) with the buying and help as widgets.

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

const coresLink = (params: Record<string, string>): string =>
  getPathnameWithQuery(
    `${webappUrl}cores`,
    new URLSearchParams({ next: '/wallet', ...params }),
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
  <div
    className={classNames(
      'flex min-w-0 flex-col gap-1 bg-background-default px-4 py-3',
    )}
  >
    <Tooltip content={total.description}>
      <span className="flex w-fit items-center gap-1.5 text-text-tertiary typo-footnote">
        {total.icon}
        {total.title}
        <InfoIcon size={IconSize.Size16} className="text-text-quaternary" />
      </span>
    </Tooltip>
    {isLoading ? (
      <span className="my-1.5 h-4 w-14 rounded-8 bg-surface-float" />
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

const dot = (className: string, icon: ReactNode): ReactNode => (
  <span
    className={classNames(
      'flex size-4 items-center justify-center rounded-6',
      className,
    )}
  >
    {icon}
  </span>
);

/** Balance hero: the number first, the four totals in one strip under it */
const BalanceHero = ({
  balance,
  totals,
  isLoading,
}: {
  balance: number;
  totals: Total[];
  isLoading: boolean;
}): ReactElement => (
  <section className="flex flex-col gap-4 border-b border-border-subtlest-tertiary px-4 py-5 tablet:px-6">
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
        src={friendshipArt}
        alt="Friends sharing a Core with Patchy"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-3/5 object-cover object-[50%_35%] tablet:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 45%)',
        }}
      />
    </div>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-border-subtlest-tertiary tablet:grid-cols-4">
      {totals.map((total) => (
        <TotalCell key={total.key} total={total} isLoading={isLoading} />
      ))}
    </div>
  </section>
);

const PacksWidget = (): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices } = useQuery(
    coresPricesQueryOptions({ user, isLoggedIn }),
  );
  const packs = (prices ?? []).filter((item) =>
    [100, 300, 600].includes(item.metadata.coresValue ?? 0),
  );

  return (
    <SquadWidget title="Buy Cores">
      <p className="mt-1 text-text-tertiary typo-footnote">
        Stock up on Cores to engage, reward, and unlock more on daily.dev
      </p>
      <ul className="mt-3 flex flex-col">
        {packs.map((item) => (
          <li key={item.priceId}>
            <a
              href={coresLink({
                origin: Origin.WalletPagePackage,
                pid: item.priceId,
              })}
              className="-mx-2 flex h-12 items-center gap-3 rounded-12 px-2 transition-colors hover:bg-surface-hover"
            >
              <CoreIcon size={IconSize.Medium} />
              <span className="flex-1 font-bold tabular-nums typo-subhead">
                {formatCoresCurrency(item.metadata.coresValue ?? 0)} Cores
              </span>
              <span className="rounded-8 bg-surface-float px-2 py-1 font-bold tabular-nums typo-footnote">
                {item.price.formatted}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Button
        className="mt-3"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        tag="a"
        href={coresLink({ origin: Origin.WalletPagePackage })}
      >
        See more options
      </Button>
    </SquadWidget>
  );
};

const GivebackWidget = (): ReactElement | null => {
  const { isPlus } = usePlusSubscription();

  if (isPlus) {
    return null;
  }

  return (
    <SquadWidget
      title="Get 50% back in Cores with Plus"
      className="bg-[radial-gradient(90%_70%_at_100%_0%,color-mix(in_srgb,var(--theme-accent-cheese-default)_16%,transparent)_0%,transparent_70%)]"
    >
      <p className="mt-1 text-text-secondary typo-footnote">
        Every Plus payment, renewals included, gives you 50% back as Cores.
      </p>
      <UpgradeToPlus
        size={ButtonSize.Small}
        target={TargetId.CoreWallet}
        label="Upgrade to Plus"
        className="mt-3 w-full"
      />
    </SquadWidget>
  );
};

const LinkRow = ({
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
      <LinkRow
        href={coresDocsLink}
        icon={<FeedbackIcon size={IconSize.Small} />}
        label="Docs"
      />
      <LinkRow
        href={creatorsTermsOfService}
        icon={<DocsIcon size={IconSize.Small} />}
        label="Terms"
      />
    </ul>
  </SquadWidget>
);

export interface WalletProps {
  /** Transaction a notification or a purchase points at */
  highlightId?: string;
  /** Cores a purchase just added, shown on the Purchased total */
  purchasedChange?: number;
  onBuyCores?: () => void;
  onUse?: (use: CoresUse) => void;
}

export const Wallet = ({
  highlightId,
  purchasedChange,
  onBuyCores,
  onUse,
}: WalletProps): ReactElement | null => {
  useRoute('/wallet');
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

  // Every /cores link on the page leads to the story's /cores step
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
      icon={<CoreIcon />}
      tag="a"
      href={coresLink({ origin: Origin.WalletPageCTA })}
    >
      Buy Cores
    </Button>
  );

  const totals: Total[] = [
    {
      key: 'purchased',
      title: 'Purchased',
      description: 'Amount of cores you have purchased',
      icon: dot(
        'bg-action-bookmark-float text-accent-bun-default',
        <CreditCardIcon size={IconSize.XXSmall} />,
      ),
      value: summary?.purchased || 0,
      change: purchasedChange,
    },
    {
      key: 'received',
      title: 'Received',
      description: 'Cores you have received, after fees',
      icon: dot(
        'bg-action-upvote-float text-accent-avocado-default',
        <PlusIcon size={IconSize.XXSmall} />,
      ),
      value: summary?.received || 0,
    },
    {
      key: 'fees',
      title: 'Fees',
      description: 'The share of awards you received that daily.dev keeps',
      icon: dot(
        'bg-surface-float text-text-tertiary',
        <InfoIcon size={IconSize.XXSmall} />,
      ),
      value: summary?.fees || 0,
    },
    {
      key: 'spent',
      title: 'Spent',
      description: 'Cores you have spent on awards, boosts and streak restores',
      icon: dot(
        'bg-action-downvote-float text-accent-ketchup-default',
        <MinusIcon size={IconSize.XXSmall} />,
      ),
      value: summary?.spent || 0,
    },
  ];

  const edges = transactions?.edges ?? [];

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div className="contents" onClickCapture={onLinkClick}>
      {isLaptopLayout && (
        <PageHeader title="Core wallet">{buyCoresButton}</PageHeader>
      )}
      {isPhone && (
        <ShellPage
          title="Core wallet"
          actions={React.cloneElement(buyCoresButton, {
            className: '!h-[2.375rem] !rounded-14',
          })}
        />
      )}
      <SquadFrame
        widgets={
          <>
            <PacksWidget />
            <GivebackWidget />
            <HelpWidget />
          </>
        }
      >
        {!isLaptopLayout && !isPhone && (
          <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-6 py-3">
            <h1 className="font-bold typo-title3">Core wallet</h1>
            {buyCoresButton}
          </header>
        )}
        <BalanceHero
          balance={user.balance.amount}
          totals={totals}
          isLoading={isPendingSummary}
        />
        <CardSection title="Use your Cores">
          <UseYourCoresTiles balance={user.balance.amount} onUse={onUse} />
        </CardSection>
        <section className="flex flex-col py-5">
          <h2 className="px-4 pb-2 font-bold typo-body tablet:px-6">
            Transaction history
          </h2>
          {!isPendingTransactions && !edges.length && (
            <CharmEmptyState
              image={cloudinaryCharmReadLater}
              imageAlt="No transactions"
              title="You have no transactions yet."
              placement={CharmEmptyStatePlacement.Inline}
            />
          )}
          <ul className="flex flex-col">
            {edges.map(({ node: transaction }) => {
              const type = getTransactionType({ transaction, user });
              const transactionUser =
                type === 'receive'
                  ? (transaction.sender ?? transaction.receiver)
                  : transaction.receiver;
              const canThank =
                type === 'receive' && isAwardFromPerson(transaction);

              return (
                <TransactionRow
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
                  isPending={
                    transaction.status === UserTransactionStatus.Processing
                  }
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
      </SquadFrame>
    </div>
  );
};
