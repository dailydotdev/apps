import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import type { ParamKey } from '../../policy/params';
import {
  defaultParams,
  ParamGroup,
  paramGroups,
  paramMeta,
  policyVersion,
  toRetrieverConfig,
} from '../../policy/params';
import { challengerRetrieverConfig } from '../../policy/challengerConfig';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { ParamSlider, ToggleRow } from '../controls';
import { PanelCard, PanelSection } from './Section';

const fixedKnobs = [
  {
    title: 'Placement coin',
    text: 'Two nearly tied cards swap places on a fair coin, so the team can measure how much position alone matters. It only reorders cards already picked.',
  },
  {
    title: 'Reader response math',
    text: "How a post's upvotes, comments, saves and shares per view become its base score, and when a post is disliked enough to drop. It is about other readers, not you.",
  },
  {
    title: 'Title rules',
    text: 'Posts with unusable titles, like "Untitled" or cookie banners, never show.',
  },
];

const ConfigView = (): ReactElement => {
  const { state } = usePersonalization();
  const changed = (Object.keys(state.params) as ParamKey[]).filter(
    (key) => state.params[key] !== defaultParams[key],
  );
  const json = JSON.stringify(
    toRetrieverConfig(state.params, challengerRetrieverConfig),
    null,
    2,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-text-tertiary typo-footnote">
          {changed.length
            ? `Changed: ${changed.join(', ')}`
            : 'Everything is at the default.'}
        </span>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<CopyIcon />}
          onClick={() => navigator.clipboard?.writeText(json)}
        >
          Copy
        </Button>
      </div>
      <pre className="max-h-[28rem] overflow-auto rounded-12 bg-surface-float p-4 text-text-secondary typo-caption1">
        <code>{json}</code>
      </pre>
    </div>
  );
};

export const RankingSection = (): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const changedCount =
    (Object.keys(state.params) as ParamKey[]).filter(
      (key) => state.params[key] !== defaultParams[key],
    ).length +
    (state.isLearning ? 0 : 1) +
    (state.isFillingWithPopular ? 0 : 1);

  return (
    <PanelSection
      section={ControlSection.Ranking}
      title="How your feed is ranked"
      description={
        <>
          The knobs of <code>{policyVersion}</code>, the For You policy. A
          post&apos;s score is reader response × topic match × follow ×
          freshness × seen before; each page then mixes topics and sources and
          gives waiting interests a turn.
        </>
      }
      actions={
        <div className="flex items-center gap-3">
          <Switch
            inputId="ranking-advanced"
            name="ranking-advanced"
            checked={isAdvanced}
            onToggle={() => setIsAdvanced(!isAdvanced)}
          >
            Advanced
          </Switch>
          {changedCount > 0 && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={store.resetParams}
            >
              Reset {changedCount}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 laptopL:grid-cols-2">
        {paramGroups.map(({ group, title, description }) => {
          const knobs = paramMeta.filter(
            (meta) => meta.group === group && (isAdvanced || !meta.isAdvanced),
          );
          return (
            <PanelCard key={group} className="flex flex-col gap-5 p-4">
              <header className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary typo-body">
                  {title}
                </h3>
                <p className="text-text-tertiary typo-footnote">{description}</p>
              </header>
              {group === ParamGroup.Learning && (
                <ToggleRow
                  id="ranking-learning"
                  label="Learn from my reading"
                  description="Off means only topics you follow count."
                  checked={state.isLearning}
                  onToggle={() => store.setLearning(!state.isLearning)}
                />
              )}
              {group === ParamGroup.Scope && (
                <ToggleRow
                  id="ranking-fill"
                  label="Fill a short feed with popular posts"
                  description="When your topics and follows find less than a page."
                  checked={state.isFillingWithPopular}
                  onToggle={() => store.setFilling(!state.isFillingWithPopular)}
                />
              )}
              {knobs.map(({ key }) => (
                <ParamSlider key={key} paramKey={key} />
              ))}
            </PanelCard>
          );
        })}
      </div>
      <PanelCard className="flex flex-col gap-3 p-4">
        <button
          type="button"
          aria-expanded={isConfigOpen}
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="flex items-center justify-between gap-3 text-left"
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-body">
              Your config
            </span>
            <span className="text-text-tertiary typo-footnote">
              The <code>retriever_config</code> your settings would send with
              each For You request.
            </span>
          </span>
          <span
            className={classNames(
              'shrink-0 font-bold typo-footnote',
              isConfigOpen ? 'text-text-tertiary' : 'text-text-link',
            )}
          >
            {isConfigOpen ? 'Hide' : 'Show'}
          </span>
        </button>
        {isConfigOpen && <ConfigView />}
      </PanelCard>
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-text-tertiary typo-footnote">
          Not adjustable
        </h3>
        <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
          {fixedKnobs.map(({ title, text }) => (
            <li
              key={title}
              className="flex flex-col gap-1 rounded-12 border border-dashed border-border-subtlest-secondary p-3"
            >
              <span className="font-bold text-text-secondary typo-footnote">
                {title}
              </span>
              <span className="text-text-tertiary typo-caption1">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </PanelSection>
  );
};
