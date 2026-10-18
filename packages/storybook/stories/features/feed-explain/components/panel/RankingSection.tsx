import type { ReactElement } from 'react';
import React, { Fragment, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Divider } from '@dailydotdev/shared/src/components/utilities/Divider';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
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
import { PanelSection } from './Section';

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
            compact={false}
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
      {paramGroups.map(({ group, title, description }, index) => {
        const settings = paramMeta.filter(
          (meta) => meta.group === group && (isAdvanced || !meta.isAdvanced),
        );
        return (
          <Fragment key={group}>
            {index > 0 && (
              <Divider className="my-1 bg-border-subtlest-tertiary" />
            )}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Typography bold type={TypographyType.Body}>
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {description}
                </Typography>
              </div>
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
            </div>
          </Fragment>
        );
      })}
    </PanelSection>
  );
};
