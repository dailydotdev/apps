import type { ReactElement, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { Button, ButtonVariant } from '../../components/buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { CoreIcon } from '../../components/icons';
import { largeNumberFormat } from '../../lib';
import { IconSize } from '../../components/Icon';
import { LogEvent, Origin } from '../../lib/log';
import { BuyCoresModal } from '../../components/modals/award/BuyCoresModal';
import { useBoostWallet } from './useBoostWallet';
import { BoostWalletPicker } from './BoostWalletPicker';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { ActionSuccessModal } from '../../components/modals/utils/ActionSuccessModal';
import { boostSuccessCover } from '../../lib/image';
import { boostDocsLink } from '../../lib/constants';
import useDebounceFn from '../../hooks/useDebounceFn';
import { Loader } from '../../components/Loader';
import type {
  EstimatedReach,
  StartCampaignProps,
} from '../../graphql/campaigns';
import { CampaignType, CampaignWallet } from '../../graphql/campaigns';
import type { TransactionCreated } from '../../graphql/njord';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import { boostSettingsFeature } from '../../lib/featureManagement';
import { getBoostErrorExtra, useBoostLogging } from './useBoostLogging';
import { useCampaignMutation } from './useCampaignMutation';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';

const Slider = dynamic(
  () => import('../../components/fields/Slider').then((mod) => mod.Slider),
  { ssr: false },
);

export const BOOST_MAX_DAYS = 30;

export const useBoostSettings = () => {
  const { getFeatureValue } = useFeaturesReadyContext();

  return (
    getFeatureValue(boostSettingsFeature) ?? boostSettingsFeature.defaultValue
  );
};

export interface BoostEstimate {
  estimatedReach: EstimatedReach;
  isLoading: boolean;
  /** False while the target can't be boosted yet, e.g. a post still being processed. */
  canBoost: boolean;
}

export interface BoostModalProps extends ModalProps {
  type: CampaignType;
  /** The post or Squad id the boost is for. */
  referenceId: string;
  /** Pays with the squad wallet when the user holds a paid seat in it. */
  walletSourceId?: string;
  origin?: Origin;
  /** What is being boosted, shown at the top. */
  target: ReactNode;
  /** Estimated reach for the budget last passed to `onEstimateBudget`. */
  estimate: BoostEstimate;
  /** The daily budget settled on the slider, to estimate the reach for. */
  onEstimateBudget: (budget: number) => void;
  onBoostSuccess?: (data: TransactionCreated, vars: StartCampaignProps) => void;
}

const SCREENS = {
  FORM: 'FORM',
  BUY_CORES: 'BUY_CORES',
  SUCCESS: 'SUCCESS',
} as const;

type Screen = keyof typeof SCREENS;

const copy: Record<
  CampaignType,
  { noun: string; title: string; pitch: string; live: string }
> = {
  [CampaignType.Post]: {
    noun: 'post',
    title: 'Boost post',
    pitch: 'Shown in the feed of the developers most likely to care.',
    live: 'Your post is now reaching more developers.',
  },
  [CampaignType.Squad]: {
    noun: 'Squad',
    title: 'Boost Squad',
    pitch: 'Recommended to the developers most likely to join.',
    live: 'Your Squad is now reaching more developers.',
  },
};

const Label = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const Hint = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Caption1}
    color={TypographyColor.Quaternary}
  >
    {children}
  </Typography>
);

interface SettingProps {
  label: string;
  value: ReactNode;
  min: number;
  max: number;
  step: number;
  current: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}

const Setting = ({
  label,
  value,
  min,
  max,
  step,
  current,
  minLabel,
  maxLabel,
  onChange,
}: SettingProps): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="flex items-center justify-between gap-2">
      <Label>{label}</Label>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        className="flex items-center gap-1 tabular-nums"
        bold
      >
        {value}
      </Typography>
    </span>
    <Slider
      className="w-full"
      min={min}
      max={max}
      step={step}
      defaultValue={[current]}
      thumbLabel={label}
      onValueChange={([next]) => onChange(next)}
    />
    <span className="flex justify-between">
      <Hint>{minLabel}</Hint>
      <Hint>{maxLabel}</Hint>
    </span>
  </div>
);

/** One boost flow for posts and Squads: settings, wallet, buy, success. */
export function BoostModal({
  type,
  referenceId,
  walletSourceId,
  origin,
  target,
  estimate,
  onEstimateBudget,
  onBoostSuccess,
  ...props
}: BoostModalProps): ReactElement {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const canPurchaseCores = useCanPurchaseCores();
  const boostSettings = useBoostSettings();
  const [screen, setScreen] = useState<Screen>(SCREENS.FORM);
  const [campaignId, setCampaignId] = useState<string>();
  const [coresPerDay, setCoresPerDay] = useState(boostSettings.default_cores);
  const [totalDays, setTotalDays] = useState(boostSettings.default_days);
  const [updateEstimateBudget] = useDebounceFn<number>(
    (budget) => budget && onEstimateBudget(budget),
    400,
  );
  const totalSpend = coresPerDay * totalDays;
  const userBalance = user?.balance.amount ?? 0;
  const { squadWallet, wallet, setWallet, balance } =
    useBoostWallet(walletSourceId);
  const { estimatedReach, canBoost, isLoading } = estimate;
  const text = copy[type];
  const { logBoostEvent, logBuyCores } = useBoostLogging({
    type,
    referenceId,
    origin,
  });
  const { onStartBoost } = useCampaignMutation({
    onBoostSuccess: (data, vars) => {
      logBoostEvent(LogEvent.CompleteBoost, vars, {
        campaign_id: data.referenceId,
      });
      onBoostSuccess?.(data, vars);
      setCampaignId(data.referenceId);
      setScreen(SCREENS.SUCCESS);
    },
    onBoostError: (error, vars) =>
      logBoostEvent(LogEvent.ErrorBoost, vars, getBoostErrorExtra(error)),
  });

  const hasEnoughBalance = balance >= totalSpend;
  const isPayingWithSquad = wallet === CampaignWallet.Squad;
  // Cores are bought for the user, never for the squad wallet
  const needsCores = !hasEnoughBalance && !isPayingWithSquad;

  const onBuyCores = () => {
    logBuyCores();
    setScreen(SCREENS.BUY_CORES);
  };

  const onSubmit = () => {
    logBoostEvent(
      LogEvent.StartBoost,
      { budget: coresPerDay, duration: totalDays },
      { has_enough_balance: hasEnoughBalance },
    );

    if (!hasEnoughBalance) {
      return needsCores ? onBuyCores() : undefined;
    }

    return onStartBoost({
      duration: totalDays,
      budget: coresPerDay,
      value: referenceId,
      type,
      wallet,
    });
  };

  if (screen === SCREENS.BUY_CORES) {
    const missingCores = Math.max(0, totalSpend - userBalance);

    return (
      <BuyCoresModal
        isOpen
        minCoresToBuy={missingCores || undefined}
        onCompletion={() => setScreen(SCREENS.FORM)}
        onRequestClose={() => setScreen(SCREENS.FORM)}
        amountNeededCopy={
          missingCores > 0 ? (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              You need{' '}
              <strong>{missingCores.toLocaleString('en-US')} more Cores</strong>{' '}
              to boost the {text.noun}.
            </Typography>
          ) : undefined
        }
        origin={
          type === CampaignType.Post ? Origin.BoostPost : Origin.SquadBoost
        }
      />
    );
  }

  if (screen === SCREENS.SUCCESS) {
    return (
      <ActionSuccessModal
        {...props}
        cta={{
          copy: 'View boost',
          onClick: () =>
            campaignId
              ? openModal({
                  type: LazyModal.FetchBoostedPostView,
                  props: { campaignId },
                })
              : openModal({ type: LazyModal.AdsDashboard }),
        }}
        secondaryCta={{
          copy: 'How boosting works',
          tag: 'a',
          href: boostDocsLink,
          target: '_blank',
        }}
        content={{
          title: 'Your boost is live',
          description: text.live,
          cover: boostSuccessCover,
        }}
        modalCloseButtonProps={{ variant: ButtonVariant.Tertiary }}
      />
    );
  }

  // just to avoid any edge case where the min, for some reason is greater than max
  const maxReach = Math.max(estimatedReach.min, estimatedReach.max);
  const isEstimating = isLoading || !canBoost;

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
      <Modal.Header title={text.title} />
      <Modal.Body className="flex flex-col !gap-6">
        {target}
        <div className="flex flex-col gap-1 rounded-16 bg-surface-float p-4">
          <Label>Estimated reach</Label>
          <div className="flex min-h-8 items-center">
            {isEstimating ? (
              <Loader data-testid="loader" />
            ) : (
              <Typography type={TypographyType.Title2} bold>
                {largeNumberFormat(estimatedReach.min)} -{' '}
                {largeNumberFormat(maxReach)}
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                  className="ml-1 font-normal"
                >
                  developers a day
                </Typography>
              </Typography>
            )}
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {text.pitch}{' '}
            <a
              href={boostDocsLink}
              className="text-text-link"
              target="_blank"
              rel="noopener"
            >
              How boosting works
            </a>
          </Typography>
        </div>
        <div className="flex flex-col gap-5">
          <Setting
            label="Daily budget"
            value={
              <>
                <CoreIcon size={IconSize.Size16} />
                {largeNumberFormat(coresPerDay || 0)} a day
              </>
            }
            min={boostSettings.min}
            max={boostSettings.max}
            step={boostSettings.step}
            current={coresPerDay}
            minLabel={largeNumberFormat(boostSettings.min) ?? ''}
            maxLabel={largeNumberFormat(boostSettings.max) ?? ''}
            onChange={(value) => {
              updateEstimateBudget(value);
              setCoresPerDay(value);
            }}
          />
          <Setting
            label="Duration"
            value={`${totalDays} ${totalDays === 1 ? 'day' : 'days'}`}
            min={1}
            max={BOOST_MAX_DAYS}
            step={1}
            current={totalDays}
            minLabel="1 day"
            maxLabel={`${BOOST_MAX_DAYS} days`}
            onChange={setTotalDays}
          />
        </div>
        <BoostWalletPicker
          squadWallet={squadWallet}
          userBalance={userBalance}
          wallet={wallet}
          onChange={setWallet}
          totalSpend={totalSpend}
          onBuyCores={canPurchaseCores ? onBuyCores : undefined}
        />
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col !gap-2">
        {needsCores && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="w-full text-center"
          >
            You need {largeNumberFormat(totalSpend - userBalance)} more Cores
            for {largeNumberFormat(totalSpend)} over{' '}
            {totalDays === 1 ? '1 day' : `${totalDays} days`}
          </Typography>
        )}
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onSubmit}
          disabled={
            !canBoost ||
            isLoading ||
            (isPayingWithSquad && !hasEnoughBalance) ||
            (needsCores && !canPurchaseCores)
          }
        >
          {needsCores ? (
            'Buy Cores to boost'
          ) : (
            <>
              Boost {text.noun} for{' '}
              <CoreIcon className="mx-1" size={IconSize.Small} />
              {largeNumberFormat(totalSpend)}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
