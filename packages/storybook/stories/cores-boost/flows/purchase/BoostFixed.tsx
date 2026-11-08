import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ownArticle, PostPage } from '../../real/pages';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
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
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { TooltipArrow } from '@dailydotdev/shared/src/svg/TooltipArrow';
import { ActionSuccessModal } from '@dailydotdev/shared/src/components/modals/utils/ActionSuccessModal';
import { BoostWalletPicker } from '@dailydotdev/shared/src/features/boost/BoostWalletPicker';
import { StartupsBoostPromo } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
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
import { boostSuccessCover } from '@dailydotdev/shared/src/lib/image';
import {
  boostDocsLink,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';

const Slider = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/fields/Slider').then(
      (mod) => mod.Slider,
    ),
  { ssr: false },
);

// Fixed copies of the first-boost screens: the post page entries
// (PostHeaderActions, BoostNewPostStrip), BoostPostModal, and its success
// modal. Changed: the strip has its own Boost button and a "taking off"
// variant, the form offers a starter preset, the CTA names the purchase, and
// the boost starts by itself once the Cores land.

/** The starter preset under test. Below today's 5,000 a day minimum, so the
 * lower minimum ships in the same experiment (boost_settings). */
export const starterBoost = { coresPerDay: 2000, totalDays: 1 };

const Strip = ({
  children,
  onBoost,
  onDismiss,
  className,
}: {
  children: React.ReactNode;
  onBoost: () => void;
  onDismiss?: () => void;
  className?: string;
}): ReactElement => {
  return (
    <div
      className={classNames(
        'relative flex min-h-10 w-full flex-row rounded-8 border border-accent-blueCheese-default p-2',
        className,
      )}
    >
      {/* New art: kept to the left so it never sits behind the copy */}
      <img
        src={stripArt}
        alt=""
        className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden h-full w-auto max-w-none rounded-l-8 tablet:block"
      />
      <div className="z-1 flex w-full flex-row items-center gap-1 tablet:pl-24">
        <TooltipArrow className="absolute -top-2 right-18 fill-accent-blueCheese-default" />
        <TrendingIcon size={IconSize.Medium} className="shrink-0" />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          className="min-w-0 flex-1"
        >
          {children}
        </Typography>
        <Button
          className="ml-auto shrink-0"
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
            size={ButtonSize.Small}
            icon={<MiniCloseIcon />}
            onClick={onDismiss}
            aria-label="Dismiss"
          />
        )}
      </div>
    </div>
  );
};

export type OwnPostState = 'new' | 'takingOff';

/** Your own article on the real post page, the strip where production puts it */
export const OwnPostFixed = ({
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

export interface BoostPostFixedModalProps {
  post: Post;
  initialMode?: BudgetMode;
  onBuyCores: (budget: typeof starterBoost) => void;
  onBoost: (budget: typeof starterBoost) => void;
  onRequestClose: () => void;
}

const PresetOption = ({
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
      'flex flex-1 flex-col items-start rounded-14 border p-3 text-left',
      isSelected
        ? 'border-accent-blueCheese-default bg-surface-float'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </button>
);

export const BoostPostFixedModal = ({
  post,
  initialMode = 'starter',
  onBuyCores,
  onBoost,
  onRequestClose,
}: BoostPostFixedModalProps): ReactElement => {
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
  const squadId =
    post.source?.type === SourceType.Squad ? post.source.id : undefined;
  const { squadWallet, wallet, setWallet, balance } = useBoostWallet(squadId);
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate },
  });
  const missing = totalSpendInt - balance;

  useEffect(() => {
    updateEstimate(budget.coresPerDay);
  }, [budget.coresPerDay, updateEstimate]);

  const potentialReach = (() => {
    if (!canBoost) {
      return (
        <span className="flex items-center gap-2">
          <Loader data-testid="loader" />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Reading your post to estimate reach…
          </Typography>
        </span>
      );
    }
    if (isLoading) {
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
      <Modal.Body className="flex flex-col !gap-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Give your content the spotlight it deserves. Our auto-targeting engine
          ensures your post gets shown to the developers most likely to care.
          <a
            href={boostDocsLink}
            className="ml-1 text-text-link"
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
        </Typography>
        <div className="rounded-16 bg-surface-float">
          <div className="flex flex-row items-center gap-5 p-2">
            <Typography
              type={TypographyType.Callout}
              className="ml-2 line-clamp-2 flex-1"
            >
              {post.title}
            </Typography>
            {post.image && (
              <Image className="h-12 w-18 rounded-12" src={post.image} />
            )}
          </div>
          <div className="flex flex-col items-center rounded-16 bg-surface-float p-3">
            <Typography type={TypographyType.Title3} bold>
              {totalSpend} Cores over {budget.totalDays}{' '}
              {budget.totalDays === 1 ? 'day' : 'days'}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Total spend
            </Typography>
            <Typography
              className="mt-2 min-h-[1.375rem]"
              type={TypographyType.Body}
            >
              {potentialReach}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Estimated daily reach
            </Typography>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Budget
          </Typography>
          <div className="flex gap-2" role="radiogroup">
            <PresetOption
              isSelected={mode === 'starter'}
              title="Starter"
              description={`1 day · ${starterBoost.coresPerDay.toLocaleString()} Cores`}
              onClick={() => setMode('starter')}
            />
            <PresetOption
              isSelected={mode === 'custom'}
              title="Custom"
              description="Pick a budget and duration"
              onClick={() => setMode('custom')}
            />
          </div>
          {mode === 'custom' && (
            <div className="mt-2 flex flex-col">
              <span className="flex items-center gap-2">
                <CoreIcon />
                <Typography
                  type={TypographyType.Body}
                  className="flex items-center"
                  bold
                >
                  {largeNumberFormat(custom.coresPerDay || 0)} Cores per day
                </Typography>
              </span>
              <Slider
                className="mt-2 w-full"
                min={boostSettings.min}
                max={boostSettings.max}
                step={boostSettings.step}
                defaultValue={[custom.coresPerDay]}
                onValueChange={([value]) =>
                  setCustom((state) => ({ ...state, coresPerDay: value }))
                }
              />
              <Typography
                className="mt-4"
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Duration
              </Typography>
              <Typography type={TypographyType.Body} bold>
                {custom.totalDays} days
              </Typography>
              <Slider
                className="mt-2 w-full"
                min={1}
                max={30}
                step={1}
                defaultValue={[custom.totalDays]}
                onValueChange={([value]) =>
                  setCustom((state) => ({ ...state, totalDays: value }))
                }
              />
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
        <StartupsBoostPromo sourceId={squadId} />
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

/** New: the boost the user set up starts by itself once the Cores land */
export const BoostLaunchingModal = ({
  post,
  budget,
  onLaunched,
  onChange,
  onRequestClose,
  isPaused,
}: {
  post: Post;
  budget: typeof starterBoost;
  onLaunched: () => void;
  onChange: () => void;
  onRequestClose: () => void;
  /** Hold the countdown, to review the screen */
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

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="flex items-center justify-center gap-4 text-center">
        <CoreIcon size={IconSize.XXXLarge} />
        <Typography type={TypographyType.Title3} bold>
          Your Cores are in. Starting your boost…
        </Typography>
        <div className="flex w-full items-center gap-3 rounded-16 bg-surface-float p-2 text-left">
          {post.image && (
            <Image className="h-12 w-18 rounded-12" src={post.image} />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Callout} bold>
              Boosting for {budget.totalDays}{' '}
              {budget.totalDays === 1 ? 'day' : 'days'} ·{' '}
              {total.toLocaleString()} Cores
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              truncate
            >
              {post.title}
            </Typography>
          </div>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onChange}
          >
            Change
          </Button>
        </div>
        <span className="flex items-center gap-2">
          <Loader />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Starts in {secondsLeft}s
          </Typography>
        </span>
      </Modal.Body>
    </Modal>
  );
};

/** Production success modal; changed: it points to the Boosts page */
export const BoostLiveFixedModal = ({
  onSeeBoost,
  onRequestClose,
}: {
  onSeeBoost: () => void;
  onRequestClose: () => void;
}): ReactElement => (
  <ActionSuccessModal
    onRequestClose={onRequestClose}
    cta={{ copy: 'See your boost', onClick: onSeeBoost }}
    secondaryCta={{
      copy: 'Learn more about boosting',
      tag: 'a',
      href: boostDocsLink,
      target: '_blank',
    }}
    content={{
      title: 'Boost is live!',
      description:
        'Your post is now reaching more developers. Find it any time in Boosts.',
      cover: boostSuccessCover,
    }}
    modalCloseButtonProps={{ variant: ButtonVariant.Tertiary }}
  />
);
