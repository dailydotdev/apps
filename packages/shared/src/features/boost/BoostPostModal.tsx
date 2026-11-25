import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { Button, ButtonVariant } from '../../components/buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { CoreIcon } from '../../components/icons';
import { InfoIcon } from '../../components/icons/Info';
import { BeforeIcon } from '../../components/icons/Before';
import { Tooltip } from '../../components/tooltip/Tooltip';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import { Image } from '../../components/image/Image';
import { largeNumberFormat } from '../../lib';
import { IconSize } from '../../components/Icon';
import { LogEvent, Origin } from '../../lib/log';
import { BuyCoresModal } from '../../components/modals/award/BuyCoresModal';
import { usePostImage } from '../../hooks/post/usePostImage';
import { useCampaignMutation } from './useCampaignMutation';
import { useBoostWallet } from './useBoostWallet';
import { BoostWalletPicker } from './BoostWalletPicker';
import { BoostWalletBalance } from './BoostWalletBalance';
import { StartupsBoostPromo } from '../squads/components/promos/StartupsPromo';
import { StartupsPromoSpot } from '../squads/hooks/useStartupsPromo';
import { CoresDeals } from '../../components/cores/CoresDeals';
import { boostDocsLink } from '../../lib/constants';
import { formatCoresCurrency } from '../../lib/utils';
import { BoostLiveModal } from './BoostLiveModal';
import type { LastBoost } from './common';
import { BoostBudgetMode, daysLabel, quickBoost } from './common';
import useDebounceFn from '../../hooks/useDebounceFn';
import { Loader } from '../../components/Loader';
import { CampaignType } from '../../graphql/campaigns';
import { usePostBoostEstimation } from './usePostBoostEstimation';
import { updatePostCache } from '../../lib/query';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import { boostSettingsFeature } from '../../lib/featureManagement';
import { getBoostErrorExtra, useBoostLogging } from './useBoostLogging';
import type { BoostAudienceValue } from './BoostAudience';
import {
  BoostAudience,
  BoostLocation,
  toCampaignAudience,
} from './BoostAudience';
import type { CampaignAudience } from '../../graphql/campaigns';

const Slider = dynamic(
  () => import('../../components/fields/Slider').then((mod) => mod.Slider),
  { ssr: false },
);

interface BoostPostModalProps extends ModalProps {
  post: Post;
  origin?: Origin;
  /** Boost again: the form opens on Custom, with the last boost's budget */
  lastBoost?: LastBoost;
}

const SCREENS = {
  FORM: 'FORM',
  BUY_CORES: 'BUY_CORES',
  SUCCESS: 'SUCCESS',
} as const;

export type Screens = keyof typeof SCREENS;

export function BoostPostModal({
  post,
  origin,
  lastBoost,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { getFeatureValue } = useFeaturesReadyContext();
  const [activeScreen, setActiveScreen] = useState<Screens>(SCREENS.FORM);
  const boostSettings = getFeatureValue(boostSettingsFeature);
  const [mode, setMode] = useState(
    lastBoost ? BoostBudgetMode.Custom : BoostBudgetMode.Quick,
  );
  const [custom, setCustom] = useState({
    coresPerDay: lastBoost?.coresPerDay ?? boostSettings.default_cores,
    totalDays: lastBoost?.totalDays ?? boostSettings.default_days,
  });
  const { coresPerDay, totalDays } =
    mode === BoostBudgetMode.Quick ? quickBoost : custom;
  const postTags = post.tags?.length
    ? post.tags
    : (post.sharedPost?.tags ?? []);
  const [audience, setAudience] = useState<BoostAudienceValue>({
    tags: postTags,
    location: BoostLocation.Worldwide,
    countries: [],
  });
  const campaignAudience = toCampaignAudience(audience, postTags);
  const [estimate, setEstimate] = useState<{
    coresPerDay: number;
    audience?: CampaignAudience;
  }>({ coresPerDay });
  const [updateEstimate] = useDebounceFn(setEstimate, 400);
  const totalSpendInt = coresPerDay * totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const squadId =
    post.source?.type === SourceType.Squad ? post.source.id : undefined;
  const {
    squadWallet,
    wallet,
    setWallet,
    balance,
    selectedSquadWallet,
    canBuyCores,
  } = useBoostWallet(squadId);
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate.coresPerDay, audience: estimate.audience },
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
  const missingCores = Math.max(0, totalSpendInt - balance);

  useEffect(() => {
    updateEstimate((state) => ({ ...state, coresPerDay }));
  }, [coresPerDay, updateEstimate]);

  const onBuyCores = () => {
    logBuyCores();
    setActiveScreen(SCREENS.BUY_CORES);
  };

  const onButtonClick = () => {
    const hasEnoughBalance = balance >= totalSpendInt;

    logBoostEvent(
      LogEvent.StartBoost,
      { budget: coresPerDay, duration: totalDays },
      { has_enough_balance: hasEnoughBalance, boost_mode: mode },
    );

    if (!hasEnoughBalance) {
      // Cores are bought into the wallet that pays for the boost
      return canBuyCores ? onBuyCores() : undefined;
    }

    return onBoostPost({
      duration: totalDays,
      budget: coresPerDay,
      value: post.id,
      type: CampaignType.Post,
      wallet,
      audience: campaignAudience,
    });
  };

  if (activeScreen === SCREENS.BUY_CORES) {
    return (
      <BuyCoresModal
        isOpen
        product={null}
        squadWallet={selectedSquadWallet ?? undefined}
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
        promo={
          <CoresDeals
            spot={StartupsPromoSpot.BuyCores}
            sourceId={squadId}
            withStartups
          />
        }
        origin={Origin.BoostPost}
      />
    );
  }

  if (activeScreen === SCREENS.SUCCESS) {
    return (
      <BoostLiveModal
        {...props}
        description="Your post is now reaching more developers. Find it any time in Boost manager."
      />
    );
  }

  // just to avoid any edge case where the min, for some reason is greater than max
  const maxReach = Math.max(estimatedReach.min, estimatedReach.max);

  const potentialReach = (() => {
    if (isLoading || !canBoost) {
      return <Loader className="!size-3" data-testid="loader" />;
    }

    const min = largeNumberFormat(estimatedReach.min);
    const max = largeNumberFormat(maxReach);

    return `${min} - ${max}`;
  })();

  const stats = [
    {
      label: 'Total',
      value: (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <CoreIcon size={IconSize.Size16} />
          {formatCoresCurrency(totalSpendInt)}
        </span>
      ),
    },
    { label: 'Duration', value: daysLabel(totalDays) },
    { label: 'Daily reach', value: potentialReach },
  ];
  const isBuyingCores = missingCores > 0 && canBuyCores;

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
        <Tooltip
          className="max-w-64"
          content={
            <>
              We start with the developers who read about your post&apos;s tags,
              anywhere in the world. Fine-tune who sees it below.
            </>
          }
        >
          <a
            href={boostDocsLink}
            target="_blank"
            rel="noreferrer"
            aria-label="How boosting works"
            className="ml-1 flex text-text-tertiary hover:text-text-primary"
          >
            <InfoIcon size={IconSize.Small} />
          </a>
        </Tooltip>
        <span className="ml-auto mr-6 flex">
          <BoostWalletBalance
            squadWallet={selectedSquadWallet}
            balance={balance}
            onBuyCores={canBuyCores ? onBuyCores : undefined}
          />
        </span>
      </Modal.Header>
      <Modal.Body className="flex flex-col !gap-4">
        <div className="flex flex-col rounded-16 bg-surface-float">
          <div className="flex items-center gap-3 p-2">
            {image && (
              <Image
                className="h-10 w-14 shrink-0 rounded-10 object-cover"
                src={image}
              />
            )}
            <Typography
              type={TypographyType.Callout}
              className="min-w-0 flex-1"
              bold
              truncate
            >
              {post.title ?? post.sharedPost?.title}
            </Typography>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border-subtlest-tertiary border-t border-border-subtlest-tertiary">
            {stats.map(({ label, value }) => (
              <span key={label} className="flex flex-col gap-0.5 px-3 py-2">
                <span className="text-text-tertiary typo-caption1">
                  {label}
                </span>
                <strong className="flex items-center typo-callout">
                  {value}
                </strong>
              </span>
            ))}
          </div>
        </div>
        {lastBoost && (
          <div className="flex flex-row items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
            <BeforeIcon secondary className="text-text-tertiary" />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Last boost:{' '}
              {formatCoresCurrency(lastBoost.coresPerDay * lastBoost.totalDays)}{' '}
              Cores over {daysLabel(lastBoost.totalDays)}
            </Typography>
          </div>
        )}
        <BoostAudience
          postTags={postTags}
          value={audience}
          onChange={(value) => {
            setAudience(value);
            updateEstimate((state) => ({
              ...state,
              audience: toCampaignAudience(value, postTags),
            }));
          }}
        />
        <div
          className="flex gap-1 rounded-12 bg-surface-float p-1"
          role="radiogroup"
          aria-label="Budget"
        >
          {[
            { value: BoostBudgetMode.Quick, label: 'Quick' },
            { value: BoostBudgetMode.Custom, label: 'Custom' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={classNames(
                'flex h-8 flex-1 items-center justify-center rounded-10 typo-callout',
                mode === value
                  ? 'bg-background-default font-bold text-text-primary shadow-2'
                  : 'text-text-tertiary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === BoostBudgetMode.Custom && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="flex justify-between">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Cores per day
                </Typography>
                <Typography type={TypographyType.Footnote} bold>
                  {largeNumberFormat(custom.coresPerDay || 0)}
                </Typography>
              </span>
              <Slider
                className="w-full"
                min={Math.min(boostSettings.min, custom.coresPerDay)}
                max={boostSettings.max}
                step={boostSettings.step}
                defaultValue={[custom.coresPerDay]}
                onValueChange={([value]) =>
                  setCustom((state) => ({ ...state, coresPerDay: value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex justify-between">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Duration
                </Typography>
                <Typography type={TypographyType.Footnote} bold>
                  {daysLabel(custom.totalDays)}
                </Typography>
              </span>
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
        {squadWallet && (
          <BoostWalletPicker
            squadWallet={squadWallet}
            userBalance={user.balance.amount}
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
            !canBoost || isLoading || (!canBuyCores && missingCores > 0)
          }
        >
          {isBuyingCores ? (
            <>
              Get <CoreIcon className="mx-1" size={IconSize.Small} />
              {formatCoresCurrency(missingCores)} Cores and boost
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
}

export default BoostPostModal;
