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
import { BoostPostRedesignModal } from '../purchase/BoostRedesign';
import { BuyCoresRedesignModal } from '../purchase/BuyCoresRedesign';
import { minBoost } from '../../flows/cores/fixtures';

// The wallet's main Use your Cores tile: today's boost deal with a countdown
// to midnight, and a custom boost. Both start by picking one of your recent
// posts; the deal boosts it at the deal price, custom opens the boost form.

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

const DealCountdown = (): ReactElement => {
  const [left, setLeft] = useState(untilMidnight);

  useEffect(() => {
    const interval = setInterval(() => setLeft(untilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = Math.floor(left / 1000);
  const time = `${pad(Math.floor(seconds / 3600))}:${pad(
    Math.floor((seconds % 3600) / 60),
  )}:${pad(seconds % 60)}`;

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
  const [customPost, setCustomPost] = useState<Post>();
  // What the Cores are for while Buy Cores is open, then back to the pick
  const [buyCost, setBuyCost] = useState<number>();

  const onPick = (post: Post) => {
    if (pick === 'custom') {
      setCustomPost(post);
    }
    setPick(undefined);
  };

  return (
    <li
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-gradient-to-br from-overlay-float-blueCheese to-transparent p-4',
        className,
      )}
    >
      <span className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-overlay-float-blueCheese">
          <BoostIcon
            size={IconSize.Small}
            className="text-accent-blueCheese-default"
          />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-bold typo-callout">Boost your post</span>
          <span className="text-text-tertiary typo-footnote">
            Show your post to more developers
          </span>
        </span>
      </span>
      <div className="flex flex-1 flex-col justify-between gap-3 rounded-14 border border-border-subtlest-secondary bg-background-default p-3">
        <span className="flex items-center justify-between gap-2">
          <span className="rounded-8 bg-accent-blueCheese-default px-2 py-0.5 font-bold text-surface-invert typo-caption1">
            Today’s deal
          </span>
          <DealCountdown />
        </span>
        <span className="flex flex-col gap-0.5">
          <strong className="typo-title3">
            {DEAL_DAYS}-day boost, {DEAL_DISCOUNT * 100}% off
          </strong>
          <span className="flex items-center gap-1 typo-callout">
            <CoreIcon size={IconSize.Size16} />
            <strong>{formatCoresCurrency(dealPrice)}</strong>
            <s className="text-text-quaternary">
              {formatCoresCurrency(dealFullPrice)}
            </s>
          </span>
        </span>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<BoostIcon />}
          onClick={() => setPick('deal')}
        >
          Get the deal
        </Button>
      </div>
      <button
        type="button"
        onClick={() => setPick('custom')}
        className="flex items-center justify-between gap-3 rounded-14 bg-surface-float px-3 py-2 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="flex flex-col">
          <span className="font-bold typo-subhead">Custom boost</span>
          <span className="text-text-tertiary typo-caption1">
            Pick a post, budget and duration
          </span>
        </span>
        <span className="text-text-tertiary typo-caption1">
          From {formatCoresCurrency(minBoost)}
        </span>
      </button>
      {pick && !buyCost && (
        <RecentPostsPicker
          pick={pick}
          balance={balance}
          onPick={onPick}
          onBuyCores={() => setBuyCost(dealPrice)}
          onRequestClose={() => setPick(undefined)}
        />
      )}
      {customPost && !buyCost && (
        <BoostPostRedesignModal
          post={customPost}
          initialMode="custom"
          onBuyCores={(budget) =>
            setBuyCost(budget.coresPerDay * budget.totalDays)
          }
          onBoost={() => setCustomPost(undefined)}
          onRequestClose={() => setCustomPost(undefined)}
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
