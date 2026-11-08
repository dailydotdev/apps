import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import type { ModalProps } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CoreIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { usePostImage } from '@dailydotdev/shared/src/hooks/post/usePostImage';
import { useCampaignMutation } from '@dailydotdev/shared/src/features/boost/useCampaignMutation';
import { useBoostWallet } from '@dailydotdev/shared/src/features/boost/useBoostWallet';
import { BoostWalletPicker } from '@dailydotdev/shared/src/features/boost/BoostWalletPicker';
import {
  boostDocsLink,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  CampaignType,
  CampaignWallet,
} from '@dailydotdev/shared/src/graphql/campaigns';
import { usePostBoostEstimation } from '@dailydotdev/shared/src/features/boost/usePostBoostEstimation';
import { updatePostCache } from '@dailydotdev/shared/src/lib/query';
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { boostSettingsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  getBoostErrorExtra,
  useBoostLogging,
} from '@dailydotdev/shared/src/features/boost/useBoostLogging';
import { BeforeIcon } from '@dailydotdev/shared/src/components/icons/Before';
import stripArt from '../../assets/boost-strip-patchy-v2.png';

// The fixed flow's Boost again modal (flows/after-boost) as is, with the
// redesign's success screen carrying the Patchy art.

const Slider = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/fields/Slider').then(
      (mod) => mod.Slider,
    ),
  { ssr: false },
);

export interface LastBoost {
  coresPerDay: number;
  days: number;
}

interface BoostPostModalProps extends ModalProps {
  post: Post;
  origin?: Origin;
  lastBoost: LastBoost;
  /** The success screen links to the boost's page on /boosts */
  onSeeBoost?: () => void;
  /** Opens on a later screen, so a story can show the success */
  initialScreen?: Screens;
}

const SCREENS = {
  FORM: 'FORM',
  BUY_CORES: 'BUY_CORES',
  SUCCESS: 'SUCCESS',
} as const;

export type Screens = keyof typeof SCREENS;

export function BoostAgainModal({
  post,
  origin = Origin.BoostAgain,
  lastBoost,
  onSeeBoost,
  initialScreen = SCREENS.FORM,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { getFeatureValue } = useFeaturesReadyContext();
  const [activeScreen, setActiveScreen] = useState<Screens>(initialScreen);
  const boostSettings = getFeatureValue(boostSettingsFeature);
  const [coresPerDay, setCoresPerDay] = React.useState(lastBoost.coresPerDay);
  const [totalDays, setTotalDays] = React.useState(lastBoost.days);
  const minCoresPerDay = Math.min(boostSettings.min, lastBoost.coresPerDay);
  const [estimate, setEstimate] = useState({ coresPerDay, totalDays });
  const [updateEstimate] = useDebounceFn(setEstimate, 400);
  const totalSpendInt = coresPerDay * totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const { squadWallet, wallet, setWallet, balance } = useBoostWallet(
    post.source?.type === SourceType.Squad ? post.source.id : undefined,
  );
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate.coresPerDay },
  });
  const { logBoostEvent, logBuyCores } = useBoostLogging({
    type: CampaignType.Post,
    referenceId: post.id,
    origin,
  });
  const { onStartBoost: onBoostPost } = useCampaignMutation({
    onBoostSuccess: (data, vars) => {
      logBoostEvent(LogEvent.CompleteBoost, vars, {
        campaign_id: data.referenceId,
      });

      if (data.referenceId) {
        updatePostCache(client, vars.value, (old) => ({
          flags: { ...old.flags, campaignId: data.referenceId },
        }));
      }

      setActiveScreen(SCREENS.SUCCESS);
    },
    onBoostError: (error, vars) =>
      logBoostEvent(LogEvent.ErrorBoost, vars, getBoostErrorExtra(error)),
  });
  const image = usePostImage(post);

  const onBuyCores = () => {
    logBuyCores();
    setActiveScreen(SCREENS.BUY_CORES);
  };

  const onButtonClick = () => {
    const hasEnoughBalance = balance >= totalSpendInt;

    logBoostEvent(
      LogEvent.StartBoost,
      { budget: coresPerDay, duration: totalDays },
      { has_enough_balance: hasEnoughBalance },
    );

    if (!hasEnoughBalance) {
      // Cores are bought for the user, not for the squad wallet
      return wallet === CampaignWallet.User ? onBuyCores() : undefined;
    }

    return onBoostPost({
      duration: totalDays,
      budget: coresPerDay,
      value: post.id,
      type: CampaignType.Post,
      wallet,
    });
  };

  if (activeScreen === SCREENS.BUY_CORES) {
    const missingCores = Math.max(
      0,
      totalSpendInt - (user?.balance.amount ?? 0),
    );

    return (
      <BuyCoresModal
        isOpen
        product={null}
        minCoresToBuy={missingCores || undefined}
        onCompletion={() => setActiveScreen(SCREENS.FORM)}
        onRequestClose={() => setActiveScreen(SCREENS.FORM)}
        amountNeededCopy={
          missingCores > 0 ? (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              You need{' '}
              <strong>{missingCores.toLocaleString()} more Cores</strong> to
              boost the post.
            </Typography>
          ) : undefined
        }
        origin={Origin.BoostPost}
      />
    );
  }

  if (activeScreen === SCREENS.SUCCESS) {
    return (
      <Modal
        {...props}
        isOpen
        kind={Modal.Kind.FixedCenter}
        size={Modal.Size.Small}
      >
        <Modal.Body className="flex flex-col items-center !gap-0 !p-4 text-center">
          <div className="h-32 w-full overflow-hidden rounded-16 bg-surface-float">
            <img
              src={stripArt}
              alt=""
              className="h-32 w-full object-cover object-left"
            />
          </div>
          <Typography type={TypographyType.Title2} bold className="mt-5">
            Boost is live!
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="mt-1 max-w-80"
          >
            Your post is now live and reaching more developers!
          </Typography>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button
              variant={ButtonVariant.Primary}
              className="w-full"
              onClick={onSeeBoost}
            >
              See your boost
            </Button>
            <Button
              tag="a"
              href={boostDocsLink}
              target="_blank"
              variant={ButtonVariant.Tertiary}
              className="w-full"
            >
              Learn more about boosting
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  // just to avoid any edge case where the min, for some reason is greater than max
  const maxReach = Math.max(estimatedReach.min, estimatedReach.max);

  const potentialReach = (() => {
    if (isLoading || !canBoost) {
      return <Loader data-testid="loader" />;
    }

    const min = largeNumberFormat(estimatedReach.min);
    const max = largeNumberFormat(maxReach);

    return `${min} - ${max}`;
  })();

  const onRequestClose: ModalProps['onRequestClose'] = (event) => {
    logBoostEvent(LogEvent.CloseBoost, {
      budget: coresPerDay,
      duration: totalDays,
    });
    props.onRequestClose?.(event);
  };

  return (
    <Modal
      {...props}
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
            {largeNumberFormat(user.balance.amount)}
          </Button>
          <div className="my-1 border-l border-border-subtlest-tertiary" />
          <Button
            icon={<PlusIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onBuyCores}
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
              {post.title ?? post.sharedPost?.title}
            </Typography>
            {image && <Image className="h-12 w-18 rounded-12" src={image} />}
          </div>
          <div className="flex flex-col items-center rounded-16 bg-surface-float p-3">
            <Typography type={TypographyType.Title3} bold>
              {totalSpend} Cores over {totalDays}{' '}
              {totalDays === 1 ? 'day' : 'days'}
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
        <div className="flex flex-row items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
          <BeforeIcon secondary className="text-text-tertiary" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Last boost:{' '}
            {(lastBoost.coresPerDay * lastBoost.days).toLocaleString('en-US')}{' '}
            Cores over {lastBoost.days} {lastBoost.days === 1 ? 'day' : 'days'}
          </Typography>
        </div>
        <div className="flex flex-col">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Budget
          </Typography>
          <span className="flex items-center gap-2">
            <CoreIcon />
            <Typography
              type={TypographyType.Body}
              className="flex items-center"
              bold
            >
              {largeNumberFormat(coresPerDay || 0)} Cores per day
            </Typography>
          </span>
          <Slider
            className="mt-2 w-full"
            min={minCoresPerDay}
            max={boostSettings.max}
            step={boostSettings.step}
            defaultValue={[coresPerDay]}
            onValueChange={([value]) => {
              updateEstimate((state) => ({ ...state, coresPerDay: value }));
              setCoresPerDay(value);
            }}
          />
          <Typography
            className="mt-4"
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Duration
          </Typography>
          <Typography type={TypographyType.Body} bold>
            {totalDays} {totalDays === 1 ? 'day' : 'days'}
          </Typography>
          <Slider
            className="mt-2 w-full"
            min={1}
            max={30}
            step={1}
            defaultValue={[totalDays]}
            onValueChange={([value]) => setTotalDays(value)}
          />
        </div>
        {squadWallet && (
          <BoostWalletPicker
            squadWallet={squadWallet}
            userBalance={user.balance.amount}
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
            (wallet === CampaignWallet.Squad && balance < totalSpendInt)
          }
        >
          Boost post for <CoreIcon className="mx-1" size={IconSize.Small} />
          {totalSpend}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BoostAgainModal;
