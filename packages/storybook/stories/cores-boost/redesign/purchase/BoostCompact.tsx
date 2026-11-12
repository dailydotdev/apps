import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { BoostWalletPicker } from '@dailydotdev/shared/src/features/boost/BoostWalletPicker';
import { StartupsBoostPromo } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import { useBoostWallet } from '@dailydotdev/shared/src/features/boost/useBoostWallet';
import { usePostBoostEstimation } from '@dailydotdev/shared/src/features/boost/usePostBoostEstimation';
import { BoostAudience } from '@dailydotdev/shared/src/features/boost/BoostAudience';
import { useAudience } from '../../flows/purchase/useAudience';
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { boostSettingsFeature } from '@dailydotdev/shared/src/lib/featureManagement';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CampaignWallet } from '@dailydotdev/shared/src/graphql/campaigns';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import {
  boostDocsLink,
  walletUrl,
} from '@dailydotdev/shared/src/lib/constants';
import type { BoostPostFixedModalProps } from '../../flows/purchase/BoostFixed';
import { starterBoost } from '../../flows/purchase/BoostFixed';

const Slider = dynamic(
  () =>
    import('@dailydotdev/shared/src/components/fields/Slider').then(
      (mod) => mod.Slider,
    ),
  { ssr: false },
);

// The Boost your post form, compact: the description moves into an info
// tooltip, the post and its numbers share one row, and Budget is a two-way
// switch. The Startups offer stays, as production shows it.

type BudgetMode = 'starter' | 'custom';

const daysLabel = (days: number): string =>
  `${days} ${days === 1 ? 'day' : 'days'}`;

const Segment = ({
  isSelected,
  children,
  onClick,
}: {
  isSelected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onClick}
    className={classNames(
      'flex h-8 flex-1 items-center justify-center rounded-10 typo-callout',
      isSelected
        ? 'bg-background-default font-bold text-text-primary shadow-2'
        : 'text-text-tertiary',
    )}
  >
    {children}
  </button>
);

/** The modal's frame drawn in place, so several states fit on one page */
const InlineFrame = ({
  children,
  onRequestClose,
}: {
  children: React.ReactNode;
  onRequestClose: () => void;
}): ReactElement => (
  <ModalPropsContext.Provider
    value={{
      onRequestClose,
      kind: ModalKind.FixedCenter,
      size: ModalSize.Small,
    }}
  >
    <div className="relative flex w-full max-w-[26.25rem] flex-col rounded-16 border border-border-subtlest-secondary bg-accent-pepper-subtlest antialiased shadow-2">
      {children}
    </div>
  </ModalPropsContext.Provider>
);

export const BoostPostCompactModal = ({
  post,
  initialMode = 'starter',
  onBuyCores,
  onBoost,
  onRequestClose,
  isInline,
  isInfoOpen,
}: BoostPostFixedModalProps & {
  /** Draw the form in place instead of over the page */
  isInline?: boolean;
  /** Keep the info tooltip open, to review it */
  isInfoOpen?: boolean;
}): ReactElement => {
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
  const { postTags, audience, setAudience, campaignAudience } =
    useAudience(post);
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate, audience: campaignAudience },
  });
  const missing = totalSpendInt - balance;

  useEffect(() => {
    updateEstimate(budget.coresPerDay);
  }, [budget.coresPerDay, updateEstimate]);

  const reach = (() => {
    if (!canBoost) {
      return (
        <span className="flex items-center gap-1">
          <Loader className="!size-3" />
          Reading your post…
        </span>
      );
    }
    if (isLoading) {
      return <Loader className="!size-3" />;
    }

    const min = largeNumberFormat(estimatedReach.min);
    const max = largeNumberFormat(
      Math.max(estimatedReach.min, estimatedReach.max),
    );

    return `${min}–${max} devs a day`;
  })();

  const onButtonClick = () => {
    if (missing > 0) {
      return wallet === CampaignWallet.User ? onBuyCores(budget) : undefined;
    }

    return onBoost(budget);
  };

  const content = (
    <>
      <Modal.Header className="items-center">
        <Typography type={TypographyType.Title3} bold>
          Boost your post
        </Typography>
        <Tooltip
          open={isInfoOpen || undefined}
          className="max-w-64"
          content={
            <>
              We start with the developers who read about your post&apos;s tags,
              anywhere in the world. Fine-tune who sees it below.{' '}
              <a
                href={boostDocsLink}
                className="text-text-link"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
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
        <div className="ml-auto mr-6 flex flex-row rounded-10 bg-surface-float">
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
      <Modal.Body className="flex flex-col !gap-4">
        <div className="flex items-center gap-3 rounded-16 bg-surface-float p-2">
          {post.image && (
            <Image
              className="h-10 w-14 shrink-0 rounded-10 object-cover"
              src={post.image}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Callout} bold truncate>
              {post.title}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex min-h-5 items-center gap-1"
            >
              <CoreIcon size={IconSize.Size16} />
              {totalSpend} · {daysLabel(budget.totalDays)} · {reach}
            </Typography>
          </div>
        </div>
        <BoostAudience
          postTags={postTags}
          value={audience}
          onChange={setAudience}
        />
        <div
          className="flex gap-1 rounded-12 bg-surface-float p-1"
          role="radiogroup"
          aria-label="Budget"
        >
          <Segment
            isSelected={mode === 'starter'}
            onClick={() => setMode('starter')}
          >
            Starter
          </Segment>
          <Segment
            isSelected={mode === 'custom'}
            onClick={() => setMode('custom')}
          >
            Custom
          </Segment>
        </div>
        {mode === 'custom' && (
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
                min={boostSettings.min}
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
    </>
  );

  if (isInline) {
    return <InlineFrame onRequestClose={onRequestClose}>{content}</InlineFrame>;
  }

  return (
    <Modal
      onRequestClose={onRequestClose}
      isOpen
      shouldCloseOnOverlayClick={false}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      {content}
    </Modal>
  );
};
