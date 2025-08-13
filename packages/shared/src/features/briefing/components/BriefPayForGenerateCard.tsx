import React, { useCallback } from 'react';
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
import { Radio } from '../../../components/fields/Radio';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';

const briefPricesByType = {
  [BriefingType.Daily]: 300,
  [BriefingType.Weekly]: 500,
};

export const BriefPayForGenerateCard = () => {
  const { user } = useAuthContext();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [selected, setSelected] = React.useState<BriefingType>(
    BriefingType.Daily,
  );
  const price = briefPricesByType[selected];
  const isFirstBrief =
    isActionsFetched && !checkHasCompleted(ActionType.GeneratedBrief);

  const { isGenerating, generateBrief } = useGenerateBrief({
    onSuccess: async () => {
      displayToast(`Your Presidential's Briefing is being generated ✅`);
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

  const onClickGenerate = useCallback(() => {
    // Logic to generate the briefing
    if (isFirstBrief && !isGenerating) {
      generateBrief({ type: selected });
      return;
    }

    // If it's not the first brief, should check if the user has enough cores
    const amount = user?.balance?.amount || 0;
    const hasEnoughCores = amount >= price;

    if (hasEnoughCores && !isGenerating) {
      generateBrief({ type: selected });
    } else {
      // Handle insufficient cores case, e.g., show a message or redirect to purchase
    }
  }, [
    generateBrief,
    isFirstBrief,
    isGenerating,
    price,
    selected,
    user?.balance?.amount,
  ]);

  return (
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
          onChange={(value) => setSelected(value)}
          options={[
            { value: BriefingType.Daily, label: 'Daily - last 24 hours' },
            { value: BriefingType.Weekly, label: 'Weekly - last 7 days' },
          ]}
          value={selected}
        />
      </div>
      <Button
        disabled={!isActionsFetched}
        onClick={() => onClickGenerate()}
        size={ButtonSize.Medium}
        variant={ButtonVariant.Secondary}
      >
        Generate for
        {isFirstBrief ? (
          ' free'
        ) : (
          <>
            <CoreIcon className="mx-1" aria-hidden /> {price}
          </>
        )}
      </Button>
    </ClickableCard>
  );
};
