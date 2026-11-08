import type { ReactElement, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ownArticle, PostPage } from '../../real/pages';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { BoostWalletPicker } from '@dailydotdev/shared/src/features/boost/BoostWalletPicker';
import { useBoostWallet } from '@dailydotdev/shared/src/features/boost/useBoostWallet';
import { usePostBoostEstimation } from '@dailydotdev/shared/src/features/boost/usePostBoostEstimation';
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { boostSettingsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CampaignWallet } from '@dailydotdev/shared/src/graphql/campaigns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import {
  boostDocsLink,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';
import type { OwnPostState } from '../../flows/purchase/BoostFixed';
import { starterBoost } from '../../flows/purchase/BoostFixed';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
import { Row } from './kit';

const Slider = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/fields/Slider').then(
      (mod) => mod.Slider,
    ),
  { ssr: false },
);

// The first-boost screens of flows/purchase/BoostFixed.tsx in the redesign's
// line. Same entries, presets, sliders, copy and actions; new: the strip is a
// card with the Patchy art on its left, the form reads as stat tiles and
// radio cards, and the launch and live screens share the rocket art.

type Budget = typeof starterBoost;

/** The Patchy rocket, cropped to its left side where the art lives */
const RocketArt = ({ className }: { className?: string }) => (
  <div
    className={classNames(
      'relative overflow-hidden bg-gradient-to-r from-accent-cabbage-subtler to-transparent',
      className,
    )}
  >
    <img
      src={stripArt}
      alt=""
      className="pointer-events-none absolute inset-y-0 left-0 h-full w-auto max-w-none"
    />
  </div>
);

const Strip = ({
  children,
  onBoost,
  onDismiss,
}: {
  children: ReactNode;
  onBoost: () => void;
  onDismiss?: () => void;
}): ReactElement => (
  <div className="relative flex w-full items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2 pr-3">
    <RocketArt className="hidden h-12 w-24 shrink-0 rounded-12 tablet:block" />
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-blueCheese-flat text-accent-blueCheese-default tablet:hidden">
      <TrendingIcon size={IconSize.Small} />
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Callout}
      className="min-w-0 flex-1"
    >
      {children}
    </Typography>
    <Button
      className="shrink-0"
      variant={ButtonVariant.Primary}
      color={ButtonColor.BlueCheese}
      size={ButtonSize.XSmall}
      onClick={onBoost}
    >
      Boost
    </Button>
    {onDismiss && (
      <Button
        className="shrink-0"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<MiniCloseIcon />}
        onClick={onDismiss}
        aria-label="Dismiss"
      />
    )}
  </div>
);

/** Your own article on the real post page, the strip where production puts it */
export const OwnPostRedesign = ({
  post,
  state,
  onBoost,
}: {
  post: Post;
  state: OwnPostState;
  onBoost: () => void;
}): ReactElement => {
  const [isDismissed, setDismissed] = useState(false);

  return (
    <PostPage
      post={ownArticle(post, state === 'new')}
      banner={
        !isDismissed &&
        (state === 'new' ? (
          <Strip onBoost={onBoost} onDismiss={() => setDismissed(true)}>
            <span>Boost to reach</span>
            <strong className="mx-1">10k more devs</strong>
            <span>now!</span>
          </Strip>
        ) : (
          <Strip onBoost={onBoost} onDismiss={() => setDismissed(true)}>
            <strong className="mr-1">This post is taking off.</strong>
            <span>Boost it while developers are paying attention.</span>
          </Strip>
        ))
      }
    />
  );
};

type BudgetMode = 'starter' | 'custom';

const BudgetCard = ({
  isSelected,
  title,
  description,
  onClick,
}: {
  isSelected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onClick}
    className={classNames(
      'relative flex flex-1 flex-col items-start gap-0.5 rounded-16 border p-3 text-left transition-colors',
      isSelected
        ? 'border-accent-blueCheese-default bg-accent-blueCheese-flat'
        : 'border-border-subtlest-tertiary hover:bg-surface-hover',
    )}
  >
    <span
      className={classNames(
        'absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border',
        isSelected
          ? 'border-accent-blueCheese-default bg-accent-blueCheese-default text-surface-invert'
          : 'border-border-subtlest-secondary',
      )}
    >
      {isSelected && <VIcon size={IconSize.Size16} />}
    </span>
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </button>
);

const StatTile = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-3">
    <span className="text-text-tertiary">{icon}</span>
    <Typography
      type={TypographyType.Callout}
      bold
      className="flex min-h-6 items-center"
    >
      {value}
    </Typography>
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
  </div>
);

export interface BoostPostRedesignModalProps {
  post: Post;
  initialMode?: BudgetMode;
  onBuyCores: (budget: Budget) => void;
  onBoost: (budget: Budget) => void;
  onRequestClose: () => void;
}

export const BoostPostRedesignModal = ({
  post,
  initialMode = 'starter',
  onBuyCores,
  onBoost,
  onRequestClose,
}: BoostPostRedesignModalProps): ReactElement => {
  const { user } = useAuthContext();
  const { getFeatureValue } = useFeaturesReadyContext();
  const boostSettings = getFeatureValue(boostSettingsFeature);
  const [mode, setMode] = useState<BudgetMode>(initialMode);
  const [custom, setCustom] = useState({
    coresPerDay: boostSettings.default_cores,
    totalDays: boostSettings.default_days,
  });
  const budget = mode === 'starter' ? starterBoost : custom;
  const [estimate, setEstimate] = useState(budget.coresPerDay);
  const [updateEstimate] = useDebounceFn(setEstimate, 400);
  const totalSpendInt = budget.coresPerDay * budget.totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const { squadWallet, wallet, setWallet, balance } = useBoostWallet(
    post.source?.type === SourceType.Squad ? post.source.id : undefined,
  );
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate },
  });
  const missing = totalSpendInt - balance;

  useEffect(() => {
    updateEstimate(budget.coresPerDay);
  }, [budget.coresPerDay, updateEstimate]);

  const potentialReach = (() => {
    if (!canBoost || isLoading) {
      return <Loader data-testid="loader" />;
    }

    const min = largeNumberFormat(estimatedReach.min);
    const max = largeNumberFormat(
      Math.max(estimatedReach.min, estimatedReach.max),
    );

    return `${min} - ${max}`;
  })();

  const onButtonClick = () => {
    if (missing > 0) {
      return wallet === CampaignWallet.User ? onBuyCores(budget) : undefined;
    }

    return onBoost(budget);
  };

  return (
    <Modal
      onRequestClose={onRequestClose}
      isOpen
      shouldCloseOnOverlayClick={false}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header className="items-center">
        <Typography type={TypographyType.Title3} bold>
          Boost your post
        </Typography>
        <div className="ml-4 flex flex-row rounded-10 bg-surface-float">
          <Button
            icon={<CoreIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            target="_blank"
            href={walletUrl}
            tag="a"
          >
            {largeNumberFormat(user?.balance.amount ?? 0)}
          </Button>
          <div className="my-1 border-l border-border-subtlest-tertiary" />
          <Button
            icon={<PlusIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={() => onBuyCores(budget)}
            aria-label="Buy Cores"
          />
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col !gap-5">
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
          <Row
            title={post.title}
            meta="Your post"
            trailing={
              post.image && (
                <Image
                  className="h-12 w-18 shrink-0 rounded-12 object-cover"
                  src={post.image}
                />
              )
            }
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Give your content the spotlight it deserves. Our auto-targeting
            engine ensures your post gets shown to the developers most likely to
            care.
            <a
              href={boostDocsLink}
              className="ml-1 text-text-link"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <StatTile
              icon={<CoreIcon size={IconSize.Small} />}
              value={
                <>
                  {totalSpend} Cores over {budget.totalDays}{' '}
                  {budget.totalDays === 1 ? 'day' : 'days'}
                </>
              }
              label="Total spend"
            />
            <StatTile
              icon={<EyeIcon size={IconSize.Small} />}
              value={potentialReach}
              label="Estimated daily reach"
            />
          </div>
          {!canBoost && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2"
            >
              <Loader className="size-4" />
              Reading your post to estimate reach…
            </Typography>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Budget
          </Typography>
          <div className="flex gap-2" role="radiogroup">
            <BudgetCard
              isSelected={mode === 'starter'}
              title="Starter"
              description={`1 day · ${starterBoost.coresPerDay.toLocaleString()} Cores`}
              onClick={() => setMode('starter')}
            />
            <BudgetCard
              isSelected={mode === 'custom'}
              title="Custom"
              description="Pick a budget and duration"
              onClick={() => setMode('custom')}
            />
          </div>
          {mode === 'custom' && (
            <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Budget
                  </Typography>
                  <Typography
                    type={TypographyType.Callout}
                    bold
                    className="flex items-center gap-1"
                  >
                    <CoreIcon size={IconSize.Size16} />
                    {largeNumberFormat(custom.coresPerDay || 0)} Cores per day
                  </Typography>
                </div>
                <Slider
                  className="w-full"
                  min={boostSettings.min}
                  max={boostSettings.max}
                  step={boostSettings.step}
                  defaultValue={[custom.coresPerDay]}
                  onValueChange={([value]) =>
                    setCustom((state) => ({ ...state, coresPerDay: value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Duration
                  </Typography>
                  <Typography
                    type={TypographyType.Callout}
                    bold
                    className="flex items-center gap-1"
                  >
                    <TimerIcon size={IconSize.Size16} />
                    {custom.totalDays} days
                  </Typography>
                </div>
                <Slider
                  className="w-full"
                  min={1}
                  max={30}
                  step={1}
                  defaultValue={[custom.totalDays]}
                  onValueChange={([value]) =>
                    setCustom((state) => ({ ...state, totalDays: value }))
                  }
                />
              </div>
            </div>
          )}
        </div>
        {squadWallet && (
          <BoostWalletPicker
            squadWallet={squadWallet}
            userBalance={user?.balance.amount ?? 0}
            wallet={wallet}
            onChange={setWallet}
            totalSpend={totalSpendInt}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onButtonClick}
          disabled={
            !canBoost ||
            isLoading ||
            (wallet === CampaignWallet.Squad && missing > 0)
          }
        >
          {missing > 0 && wallet === CampaignWallet.User ? (
            <>
              Get <CoreIcon className="mx-1" size={IconSize.Small} />
              {missing.toLocaleString()} Cores and boost
            </>
          ) : (
            <>
              Boost post for <CoreIcon className="mx-1" size={IconSize.Small} />
              {totalSpend}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const launchSeconds = 3;

/** The boost the user set up starts by itself once the Cores land */
export const BoostLaunchingRedesign = ({
  post,
  budget,
  onLaunched,
  onChange,
  onRequestClose,
  isPaused,
}: {
  post: Post;
  budget: Budget;
  onLaunched: () => void;
  onChange: () => void;
  onRequestClose: () => void;
  isPaused?: boolean;
}): ReactElement => {
  const [secondsLeft, setSecondsLeft] = useState(launchSeconds);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }
    if (secondsLeft === 0) {
      onLaunched();
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onLaunched, isPaused]);

  const total = budget.coresPerDay * budget.totalDays;
  const progress = ((launchSeconds - secondsLeft) / launchSeconds) * 100;

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col gap-4 !p-0">
        <RocketArt className="h-32 w-full rounded-t-16" />
        <div className="flex flex-col gap-4 px-5 pb-5">
          <Typography type={TypographyType.Title3} bold className="text-center">
            Your Cores are in. Starting your boost…
          </Typography>
          <Row
            className="rounded-16 border border-border-subtlest-tertiary p-3"
            visual={
              post.image && (
                <Image
                  className="h-12 w-18 rounded-12 object-cover"
                  src={post.image}
                />
              )
            }
            title={
              <>
                Boosting for {budget.totalDays}{' '}
                {budget.totalDays === 1 ? 'day' : 'days'} ·{' '}
                {total.toLocaleString()} Cores
              </>
            }
            meta={<span className="line-clamp-1">{post.title}</span>}
            trailing={
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={onChange}
              >
                Change
              </Button>
            }
          />
          <div className="flex flex-col gap-2">
            <div className="h-1 w-full overflow-hidden rounded-max bg-surface-float">
              <div
                className="h-full rounded-max bg-accent-blueCheese-default transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-center"
            >
              Starts in {secondsLeft}s
            </Typography>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

/** The success modal, with the rocket art in place of the cover image */
export const BoostLiveRedesign = ({
  onSeeBoost,
  onRequestClose,
}: {
  onSeeBoost: () => void;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
  >
    <Modal.Body className="flex flex-col !p-0">
      <div className="relative">
        <RocketArt className="h-32 w-full rounded-t-16" />
        <ModalClose
          className="hidden tablet:flex"
          right="2"
          top="2"
          size={ButtonSize.Small}
          onClick={onRequestClose}
          variant={ButtonVariant.Tertiary}
        />
        <span className="absolute -bottom-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background-default bg-accent-blueCheese-default text-surface-invert">
          <VIcon size={IconSize.Medium} />
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-9 text-center">
        <Typography type={TypographyType.Title3} bold>
          Boost is live!
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Your post is now reaching more developers. Find it any time in Boosts.
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          className="mt-3 w-full"
          onClick={onSeeBoost}
        >
          See your boost
        </Button>
        <Button
          variant={ButtonVariant.Tertiary}
          className="w-full"
          tag="a"
          href={boostDocsLink}
          target="_blank"
        >
          Learn more about boosting
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);
