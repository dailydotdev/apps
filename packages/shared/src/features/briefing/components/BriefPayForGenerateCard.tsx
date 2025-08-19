import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useActions, useToastNotification } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { CoreIcon } from '../../../components/icons';
import { BriefingType } from '../../../graphql/posts';
import { ActionType } from '../../../graphql/actions';
import { useGenerateBrief } from '../hooks/useGenerateBrief';
import { ClickableCard } from '../../../components/cards/common/Card';
import { Radio, type RadioProps } from '../../../components/fields/Radio';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BuyCoresModal } from '../../../components/modals/award/BuyCoresModal';
import { useToggle } from '../../../hooks/useToggle';
import { Origin } from '../../../lib/log';
import type { Product } from '../../../graphql/njord';
import { useFeature } from '../../../components/GrowthBookProvider';
import { briefGeneratePricing } from '../../../lib/featureManagement';

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

  const [selected, setSelected] = React.useState<BriefingType>(
    BriefingType.Daily,
  );
  const [isBuyOpen, setBuyOpen] = useToggle(false);

  const prices = useFeature(briefGeneratePricing);
  const price = prices[selected];

  const isFirstBrief =
    isActionsFetched && !checkHasCompleted(ActionType.GeneratedBrief);
  const amount = user?.balance?.amount ?? 0;

  const { isGenerating, generateBrief } = useGenerateBrief({
    onSuccess: async () => {
      displayToast('Your Presidential Briefing is being generated ✅');
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

  const isFree = isFirstBrief || user.isPlus;
  const hasEnoughCores = amount >= price;
  const canGenerateNow = (isFree || hasEnoughCores) && !isGenerating;

  const triggerGenerate = useCallback(() => {
    if (!isGenerating) {
      generateBrief({ type: selected });
    }
  }, [generateBrief, isGenerating, selected]);

  const onClickGenerate = useCallback(() => {
    if (canGenerateNow) {
      triggerGenerate();
    } else {
      setBuyOpen(true);
    }
  }, [canGenerateNow, setBuyOpen, triggerGenerate]);

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
            value={selected}
            onChange={(value) => setSelected(value)}
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
        type={selected}
        onPurchased={() => triggerGenerate()}
      />
    </>
  );
};
