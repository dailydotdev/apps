import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActions, useToastNotification } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { CoreIcon } from '../../../components/icons';
import {
  BriefingType,
  getGenerateBriefingMutationOptions,
} from '../../../graphql/posts';
import { ActionType } from '../../../graphql/actions';
import { ClickableCard } from '../../../components/cards/common/Card';
import { Radio, type RadioProps } from '../../../components/fields/Radio';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BuyCoresModal } from '../../../components/modals/award/BuyCoresModal';
import { useToggle } from '../../../hooks/useToggle';
import { LogEvent, Origin } from '../../../lib/log';
import type { Product } from '../../../graphql/njord';
import { useFeature } from '../../../components/GrowthBookProvider';
import { briefGeneratePricing } from '../../../lib/featureManagement';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useLogContext } from '../../../contexts/LogContext';

const OPTIONS = [
  { value: BriefingType.Daily, label: 'Daily - last 24 hours' },
  { value: BriefingType.Weekly, label: 'Weekly - last 7 days' },
] as const satisfies RadioProps['options'];

function createCoresProduct(id: string, name: string, value: number): Product {
  // Minimal shape required by BuyCoresModal; value is what matters.
  return { id, name, value } as unknown as Product;
}

function BuyCores({
  isOpen,
  onClose,
  price,
  type,
  onPurchased,
}: {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  type: BriefingType;
  onPurchased: () => void;
}) {
  const product = useMemo(
    () => createCoresProduct(`brief-${type}`, 'Briefing', price),
    [price, type],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <BuyCoresModal
      isOpen={isOpen}
      onRequestClose={onClose}
      onCompletion={() => {
        onClose();
        onPurchased();
      }}
      product={product}
      origin={Origin.BriefPage}
    />
  );
}

export const BriefPayForGenerateCard = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();

  const [briefingType, setBriefingType] = React.useState<BriefingType>(
    BriefingType.Daily,
  );
  const [isBuyOpen, setBuyOpen] = useToggle(false);

  const prices = useFeature(briefGeneratePricing);
  const price = prices[briefingType];

  const isFirstBrief =
    isActionsFetched && !checkHasCompleted(ActionType.GeneratedBrief);
  const amount = user?.balance?.amount ?? 0;

  const queryClient = useQueryClient();
  const { isPending: isGenerating, mutateAsync: generateBrief } = useMutation({
    ...getGenerateBriefingMutationOptions(),
    onSuccess: async () => {
      displayToast('Your Presidential Briefing is being generated ✅');

      queryClient.removeQueries({
        queryKey: generateQueryKey(RequestKey.Feeds, user, 'briefing'),
      });

      await Promise.all([
        completeAction(ActionType.GeneratedBrief),
        router.push('/briefing'),
      ]);
    },
    onError: () => {
      displayToast(
        'There was an error generating your Presidential Briefing. Please try again later.',
      );
    },
  });

  const isFree = isFirstBrief || user?.isPlus;
  const hasEnoughCores = amount >= price;
  const canGenerateNow = (isFree || hasEnoughCores) && !isGenerating;

  const { logEvent } = useLogContext();
  const impressionRef = React.useRef(false);

  const triggerGenerate = useCallback(() => {
    if (!isGenerating) {
      generateBrief({ type: briefingType });
    }
  }, [generateBrief, isGenerating, briefingType]);

  const onClickGenerate = useCallback(() => {
    if (!isFree) {
      logEvent({
        event_name: LogEvent.StartBriefPurchase,
        extra: JSON.stringify({
          time_range: briefingType,
        }),
      });
    }

    if (canGenerateNow) {
      triggerGenerate();
    } else {
      setBuyOpen(true);
    }
  }, [
    briefingType,
    canGenerateNow,
    isFree,
    logEvent,
    setBuyOpen,
    triggerGenerate,
  ]);

  useEffect(() => {
    if (!isFree && !impressionRef.current) {
      impressionRef.current = true;
      logEvent({
        event_name: LogEvent.BriefPaywall,
      });
    }
  }, [isFree, logEvent]);

  return (
    <>
      <ClickableCard className="flex flex-col gap-3 p-4">
        <div>
          <Typography type={TypographyType.Callout} bold>
            Want just this one?
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mt-2 text-balance"
          >
            Generate a one-off Presidential Briefing based on the past day or
            week. No commitment. Yours now.
          </Typography>
        </div>

        <div className="flex-1">
          <Radio
            name="brief-type"
            value={briefingType}
            onChange={(value) => setBriefingType(value)}
            options={OPTIONS}
          />
        </div>

        <Button
          disabled={!isActionsFetched}
          onClick={onClickGenerate}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
        >
          Generate for
          {!isFree && <CoreIcon className="mx-1" aria-hidden />}
          {` ${isFree ? 'free' : price}`}
        </Button>
      </ClickableCard>

      <BuyCores
        isOpen={isBuyOpen}
        onClose={() => setBuyOpen(false)}
        price={price}
        type={briefingType}
        onPurchased={() => triggerGenerate()}
      />
    </>
  );
};
