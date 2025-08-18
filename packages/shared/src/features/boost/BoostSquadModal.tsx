import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { CoreIcon, PlusIcon } from '../../components/icons';

import { Image } from '../../components/image/Image';
import { largeNumberFormat } from '../../lib';
import { IconSize } from '../../components/Icon';
import { Origin } from '../../lib/log';
import { BuyCoresModal } from '../../components/modals/award/BuyCoresModal';
import { useCampaignMutation } from './useCampaignMutation';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { ActionSuccessModal } from '../../components/modals/utils/ActionSuccessModal';
import { boostSuccessCover } from '../../lib/image';
import { boostDocsLink, walletUrl } from '../../lib/constants';
import useDebounceFn from '../../hooks/useDebounceFn';
import { Loader } from '../../components/Loader';
import {
  CampaignType,
  DEFAULT_CORES_PER_DAY,
  DEFAULT_DURATION_DAYS,
} from '../../graphql/campaigns';
import { useCampaignEstimation } from './useCampaignEstimation';
import type { Squad } from '../../graphql/sources';
import { Separator } from '../../components/cards/common/common';
import { generateQueryKey, RequestKey } from '../../lib/query';

const Slider = dynamic(
  () => import('../../components/fields/Slider').then((mod) => mod.Slider),
  { ssr: false },
);

interface BoostSquadModalProps extends ModalProps {
  squad: Squad;
}

const SCREENS = {
  FORM: 'FORM',
  BUY_CORES: 'BUY_CORES',
  SUCCESS: 'SUCCESS',
} as const;

export type Screens = keyof typeof SCREENS;

export function BoostSquadModal({
  squad,
  ...props
}: BoostSquadModalProps): ReactElement {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { openModal } = useLazyModal();
  const [activeScreen, setActiveScreen] = useState<Screens>(SCREENS.FORM);
  const [coresPerDay, setCoresPerDay] = React.useState(DEFAULT_CORES_PER_DAY);
  const [totalDays, setTotalDays] = React.useState(DEFAULT_DURATION_DAYS);
  const [estimate, setEstimate] = useState({ coresPerDay, totalDays });
  const [updateEstimate] = useDebounceFn(setEstimate, 400);
  const totalSpendInt = coresPerDay * totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const canBoost = !!squad.image && !!squad.headerImage && !!squad.description;
  const { estimatedReach, isLoading, isFetched } = useCampaignEstimation({
    type: CampaignType.Source,
    query: { budget: estimate.coresPerDay, duration: estimate.totalDays },
    referenceId: squad.id,
    enabled: canBoost,
  });
  const { onStartBoost } = useCampaignMutation({
    onBoostSuccess: (data) => {
      if (data.referenceId) {
        client.setQueryData<Squad>(
          generateQueryKey(RequestKey.Squad, user, squad.handle),
          (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              flags: { ...old.flags, campaignId: data.referenceId },
            };
          },
        );
      }

      setActiveScreen(SCREENS.SUCCESS);
    },
  });

  const onButtonClick = () => {
    if (user.balance.amount < totalSpendInt) {
      return setActiveScreen(SCREENS.BUY_CORES);
    }

    return onStartBoost({
      duration: totalDays,
      budget: coresPerDay,
      value: squad.id,
      type: CampaignType.Source,
    });
  };

  if (activeScreen === SCREENS.BUY_CORES) {
    return (
      <BuyCoresModal
        isOpen
        product={null}
        onCompletion={() => setActiveScreen(SCREENS.FORM)}
        onRequestClose={() => setActiveScreen(SCREENS.FORM)}
        amountNeededCopy={
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            You need{' '}
            <strong>
              {Math.abs(user.balance.amount - totalSpendInt).toLocaleString()}{' '}
              more Cores
            </strong>{' '}
            to boost the Squad.
          </Typography>
        }
        origin={Origin.SquadBoost}
      />
    );
  }

  if (activeScreen === SCREENS.SUCCESS) {
    return (
      <ActionSuccessModal
        {...props}
        cta={{
          copy: 'Ads dashboard',
          onClick: () => openModal({ type: LazyModal.AdsDashboard }),
        }}
        secondaryCta={{
          copy: 'Learn more about boosting',
          tag: 'a',
          href: boostDocsLink,
          target: '_blank',
        }}
        content={{
          title: 'Squad boosted successfully!',
          description:
            'Your Squad is now being promoted and will start reaching more developers shortly. You can track its performance anytime from the ads dashboard.',
          cover: boostSuccessCover,
        }}
      />
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

  return (
    <Modal
      {...props}
      isOpen
      shouldCloseOnOverlayClick={false}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header className="items-center">
        <Typography type={TypographyType.Title3} bold>
          Boost your Squad
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
            onClick={() => setActiveScreen('BUY_CORES')}
          />
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col !gap-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {isFetched
            ? `Our auto-targeting engine finds developers most likely to join your Squad, so that it grows faster, stronger, and with the right people.`
            : `Give your content the spotlight it deserves. Our auto-targeting engine ensures your Squad gets shown to the developers most likely to care.`}
          {!isFetched && (
            <a
              href={boostDocsLink}
              className="ml-1 text-text-link"
              target="_blank"
            >
              Learn more
            </a>
          )}
        </Typography>
        <div className="rounded-16 bg-surface-float">
          <div className="flex flex-row items-center gap-5 p-2">
            <div className="ml-2">
              <Typography
                type={TypographyType.Callout}
                className="line-clamp-1 flex-1"
                bold
              >
                {squad.name}
              </Typography>
              <Typography
                type={TypographyType.Subhead}
                className="line-clamp-1 flex-1"
                color={TypographyColor.Tertiary}
              >
                Squad <Separator /> @{squad.handle}
              </Typography>
            </div>
            <Image
              className="ml-auto h-12 w-12 rounded-max"
              src={squad.image}
            />
          </div>
          <div className="flex flex-col items-center rounded-16 bg-surface-float p-3">
            <Typography type={TypographyType.Title3} bold>
              {totalSpend} Cores over {totalDays} days
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
            min={1000}
            max={100000}
            step={1000}
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
            {totalDays} days
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onButtonClick}
          disabled={!canBoost || isLoading}
        >
          Boost Squad for <CoreIcon className="mx-1" size={IconSize.Small} />
          {totalSpend}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BoostSquadModal;
