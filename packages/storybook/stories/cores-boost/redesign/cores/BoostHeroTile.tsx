import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CoreIcon,
  TimerIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { bunPost, realArticle } from '../../real/pages';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { BuyCoresRedesignModal } from '../purchase/BuyCoresRedesign';

// The wallet's Boost box: today's boost deal, its discount on a corner
// ribbon and a countdown to midnight. The deal starts by picking one of your
// recent posts and boosts it at the deal price.

const DEAL_DAYS = 3;
const DEAL_CORES_PER_DAY = 5000;
const DEAL_DISCOUNT = 0.3;
const dealFullPrice = DEAL_DAYS * DEAL_CORES_PER_DAY;
const dealPrice = dealFullPrice * (1 - DEAL_DISCOUNT);

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const recentPosts: Post[] = [
  bunPost,
  realArticle({
    id: 'sb-own-turborepo',
    title: 'Remote caching cut our CI time in half',
    titleHtml: undefined,
    image: cloudinaryPostImageCoverPlaceholder,
    createdAt: hoursAgo(4 * 24),
    numUpvotes: 128,
  } as Partial<Post>),
  realArticle({
    id: 'sb-own-postgres',
    title: 'Postgres indexes I wish I knew about sooner',
    titleHtml: undefined,
    image: cloudinaryPostImageCoverPlaceholder,
    createdAt: hoursAgo(9 * 24),
    numUpvotes: 312,
  } as Partial<Post>),
  realArticle({
    id: 'sb-own-rsc',
    title: 'A year of React Server Components in production',
    titleHtml: undefined,
    image: cloudinaryPostImageCoverPlaceholder,
    createdAt: hoursAgo(17 * 24),
    numUpvotes: 87,
  } as Partial<Post>),
];

const untilMidnight = (): number => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - Date.now();
};

const pad = (value: number): string => String(value).padStart(2, '0');

/** Time left on today's deal, as HH:MM:SS */
const useDealTimeLeft = (): { time: string } => {
  const [left, setLeft] = useState(untilMidnight);

  useEffect(() => {
    const interval = setInterval(() => setLeft(untilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = Math.floor(left / 1000);

  return {
    time: `${pad(Math.floor(seconds / 3600))}:${pad(
      Math.floor((seconds % 3600) / 60),
    )}:${pad(seconds % 60)}`,
  };
};

const DealCountdown = (): ReactElement => {
  const { time } = useDealTimeLeft();

  return (
    <span className="flex items-center gap-1 text-accent-bacon-default typo-footnote">
      <TimerIcon size={IconSize.Size16} />
      Ends in{' '}
      <time className="font-bold tabular-nums" aria-live="off">
        {time}
      </time>
    </span>
  );
};

type BoostPick = 'deal' | 'custom';

const RecentPostsPicker = ({
  pick,
  balance,
  onPick,
  onBuyCores,
  onRequestClose,
}: {
  pick: BoostPick;
  balance: number;
  onPick: (post: Post) => void;
  onBuyCores?: () => void;
  onRequestClose: () => void;
}): ReactElement => {
  const [selected, setSelected] = useState<Post>(recentPosts[0]);
  const isDeal = pick === 'deal';
  const missing = dealPrice - balance;

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Header
        title={isDeal ? 'Pick a post for today’s deal' : 'Pick a post to boost'}
      />
      <Modal.Body className="flex flex-col !gap-2">
        {isDeal && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-14 bg-overlay-float-blueCheese px-3 py-2">
            <span className="flex flex-col">
              <strong className="typo-callout">
                {DEAL_DAYS}-day boost · {DEAL_DISCOUNT * 100}% off
              </strong>
              <DealCountdown />
            </span>
            <span className="flex items-center gap-1 typo-callout">
              <CoreIcon size={IconSize.Size16} />
              <strong>{formatCoresCurrency(dealPrice)}</strong>
            </span>
          </div>
        )}
        <ul className="flex flex-col gap-2" role="radiogroup">
          {recentPosts.map((post) => {
            const isSelected = post.id === selected.id;

            return (
              <li key={post.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => (isDeal ? setSelected(post) : onPick(post))}
                  className={classNames(
                    'flex w-full items-center gap-3 rounded-14 border p-2 text-left transition-colors hover:bg-surface-hover',
                    isDeal && isSelected
                      ? 'border-accent-cabbage-default bg-surface-float'
                      : 'border-border-subtlest-tertiary',
                  )}
                >
                  <Image
                    src={post.image}
                    alt=""
                    className="h-12 w-18 shrink-0 rounded-10 object-cover"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="line-clamp-2 font-bold typo-subhead">
                      {post.title}
                    </span>
                    <span className="flex items-center gap-1 text-text-tertiary typo-caption1">
                      {publishTimeRelativeShort(
                        new Date(post.createdAt ?? Date.now()),
                      )}
                      <span aria-hidden>·</span>
                      <UpvoteIcon size={IconSize.Size16} />
                      {post.numUpvotes}
                    </span>
                  </span>
                  {isDeal && isSelected && (
                    <VIcon
                      size={IconSize.Small}
                      className="shrink-0 text-accent-cabbage-default"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      {isDeal && (
        <Modal.Footer>
          {missing > 0 ? (
            <Button
              variant={ButtonVariant.Primary}
              icon={<CoreIcon />}
              className="w-full"
              onClick={onBuyCores}
            >
              Get {formatCoresCurrency(missing)} more Cores
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Primary}
              icon={<BoostIcon />}
              className="w-full"
              onClick={() => onPick(selected)}
            >
              Boost for {formatCoresCurrency(dealPrice)} Cores
            </Button>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export const BoostHeroTile = ({
  balance,
  className,
}: {
  balance: number;
  className?: string;
}): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [pick, setPick] = useState<BoostPick>();
  const { time } = useDealTimeLeft();
  // What the Cores are for while Buy Cores is open, then back to the pick
  const [buyCost, setBuyCost] = useState<number>();

  return (
    <li
      className={classNames(
        'relative flex w-56 shrink-0 snap-start flex-col gap-2 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br from-overlay-float-blueCheese to-transparent p-3 laptop:w-auto',
        className,
      )}
    >
      <span className="absolute -right-7 top-4 w-28 rotate-45 bg-accent-onion-default py-0.5 text-center font-bold typo-caption1">
        -{DEAL_DISCOUNT * 100}%
      </span>
      <span className="flex items-center gap-2 pr-8">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-12 bg-overlay-float-blueCheese">
          <BoostIcon
            size={IconSize.Small}
            className="text-accent-blueCheese-default"
          />
        </span>
        <span className="min-w-0 flex-1 font-bold typo-callout">
          Boost your post
        </span>
      </span>
      <strong className="pt-2 typo-title3">{DEAL_DAYS}-day boost</strong>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="mt-auto w-full"
        onClick={() => setPick('deal')}
      >
        <CoreIcon size={IconSize.Size16} />
        <strong className="ml-1 tabular-nums">
          {formatCoresCurrency(dealPrice)}
        </strong>
        <s className="ml-1 font-normal opacity-64">
          {formatCoresCurrency(dealFullPrice)}
        </s>
      </Button>
      <span className="flex items-center gap-1 self-center rounded-10 bg-surface-float px-2 py-0.5 text-accent-bacon-default typo-caption1">
        <TimerIcon size={IconSize.Size16} />
        <time className="font-bold tabular-nums">{time}</time>
      </span>
      {pick && !buyCost && (
        <RecentPostsPicker
          pick={pick}
          balance={balance}
          onPick={() => setPick(undefined)}
          onBuyCores={() => setBuyCost(dealPrice)}
          onRequestClose={() => setPick(undefined)}
        />
      )}
      {!!buyCost && (
        <BuyCoresRedesignModal
          purpose="boost"
          cost={buyCost}
          onPay={(pack) => {
            if (user) {
              updateUser({
                ...user,
                balance: { amount: user.balance.amount + pack.value },
              });
            }
            setBuyCost(undefined);
          }}
          onRequestClose={() => setBuyCost(undefined)}
        />
      )}
    </li>
  );
};
