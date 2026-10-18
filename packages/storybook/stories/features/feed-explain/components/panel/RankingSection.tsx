import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import type { ParamKey } from '../../policy/params';
import {
  defaultParams,
  ParamGroup,
  paramGroups,
  paramMeta,
} from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { ParamSlider, ToggleRow } from '../controls';
import { PanelCard, PanelSection } from './Section';

export const RankingSection = (): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const [isAdvanced, setIsAdvanced] = useState(false);
  const changedCount =
    (Object.keys(state.params) as ParamKey[]).filter(
      (key) => state.params[key] !== defaultParams[key],
    ).length + (state.isFillingWithPopular ? 0 : 1);

  return (
    <PanelSection
      section={ControlSection.Ranking}
      description="Each post starts from how other readers liked it. Your topics and follows boost it, and it drops as it gets older or as you scroll past it. These settings apply to every post."
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
              Reset all
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {paramGroups.map(({ group, title, description }) => {
          const settings = paramMeta.filter(
            (meta) => meta.group === group && (isAdvanced || !meta.isAdvanced),
          );
          return (
            <PanelCard key={group} className="flex flex-col gap-5 p-4">
              <header className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary typo-body">
                  {title}
                </h3>
                <p className="text-text-tertiary typo-footnote">
                  {description}
                </p>
              </header>
              {group === ParamGroup.Scope && (
                <ToggleRow
                  id="ranking-fill"
                  label="Fill a short feed with popular posts"
                  description="When your topics and follows don't find enough posts for a page."
                  checked={state.isFillingWithPopular}
                  onToggle={() => store.setFilling(!state.isFillingWithPopular)}
                />
              )}
              {settings.map(({ key }) => (
                <ParamSlider key={key} paramKey={key} />
              ))}
            </PanelCard>
          );
        })}
      </div>
    </PanelSection>
  );
};
