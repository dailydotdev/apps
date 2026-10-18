import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ParamKey } from '../../policy/params';
import { defaultParams } from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PanelCard, PanelSection } from './Section';

const ResetRow = ({
  title,
  description,
  isDisabled,
  onReset,
  isDanger,
}: {
  title: string;
  description: string;
  isDisabled?: boolean;
  onReset: () => void;
  isDanger?: boolean;
}): ReactElement => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-center gap-3 p-4">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span className="text-text-tertiary typo-footnote">{description}</span>
      </span>
      {isConfirming ? (
        <span className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setIsConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Small}
            onClick={() => {
              onReset();
              setIsConfirming(false);
            }}
          >
            Yes, reset
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant={isDanger ? ButtonVariant.Secondary : ButtonVariant.Float}
          color={isDanger ? ButtonColor.Ketchup : undefined}
          size={ButtonSize.Small}
          disabled={isDisabled}
          onClick={() => setIsConfirming(true)}
        >
          Reset
        </Button>
      )}
    </li>
  );
};

export const ResetSection = (): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const learned = state.evidence.filter(
    ({ topic }) => !state.followedTags.includes(topic),
  ).length;
  const adjusted = new Set([
    ...Object.keys(state.controls),
    ...Object.keys(state.sourceControls),
    ...Object.keys(state.sourceWeights ?? {}),
  ]).size;
  const changedSettings =
    (Object.keys(state.params) as ParamKey[]).filter(
      (key) => state.params[key] !== defaultParams[key],
    ).length + (state.isFillingWithPopular ? 0 : 1);
  const seen = Object.keys(state.impressions).length;

  return (
    <PanelSection
      section={ControlSection.Reset}
      title="Start over"
      description="Each reset is separate. None of them touch your follows, blocks or filters."
    >
      <PanelCard>
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          <ResetRow
            title="Forget my reading"
            description={
              learned
                ? `${learned} ${
                    learned === 1 ? 'topic' : 'topics'
                  } from your reading go away, and topics you follow lose what reading added. What you read next starts fresh.`
                : 'Nothing learned from your reading yet.'
            }
            isDisabled={!state.evidence.length}
            onReset={store.resetLearned}
          />
          <ResetRow
            title="Clear the boosts I set"
            description={
              adjusted
                ? `${adjusted} ${
                    adjusted === 1
                      ? 'topic or source goes'
                      : 'topics and sources go'
                  } back to automatic.`
                : "You haven't set any boosts."
            }
            isDisabled={!adjusted}
            onReset={store.resetControls}
          />
          <ResetRow
            title="Reset ranking settings"
            description={
              changedSettings
                ? `${changedSettings} changed ${
                    changedSettings === 1 ? 'setting goes' : 'settings go'
                  } back to the default.`
                : 'Every setting is at its default.'
            }
            isDisabled={!changedSettings && state.isLearning}
            onReset={store.resetParams}
          />
          <ResetRow
            title="Forget what I scrolled past"
            description={
              seen
                ? `${seen} ${
                    seen === 1
                      ? 'post you scrolled past gets'
                      : 'posts you scrolled past get'
                  } a fresh chance.`
                : "You haven't scrolled past anything yet."
            }
            isDisabled={!seen}
            onReset={store.clearSeen}
          />
          <ResetRow
            title="Reset everything"
            description="All of the above, plus posts you asked to see less of."
            onReset={store.resetAll}
            isDanger
          />
        </ul>
      </PanelCard>
    </PanelSection>
  );
};
