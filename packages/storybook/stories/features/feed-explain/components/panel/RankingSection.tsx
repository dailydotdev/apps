import type { ReactElement } from 'react';
import React, { Fragment, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Divider } from '@dailydotdev/shared/src/components/utilities/Divider';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { ParamKey } from '../../policy/params';
import { defaultParams, paramGroups, paramMeta } from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { ParamSlider } from '../controls';
import { PlusBanner } from '../plus';
import { PanelSection } from './Section';

export const RankingSection = (): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const { isPlus } = usePlusSubscription();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const changedCount = (Object.keys(state.params) as ParamKey[]).filter(
    (key) => state.params[key] !== defaultParams[key],
  ).length;

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
      <PlusBanner>Change how For You ranks every post with Plus.</PlusBanner>
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
              {settings.map(({ key }) => (
                <ParamSlider key={key} paramKey={key} isLocked={!isPlus} />
              ))}
            </div>
          </Fragment>
        );
      })}
    </PanelSection>
  );
};
