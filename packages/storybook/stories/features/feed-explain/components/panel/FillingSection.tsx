import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PanelSection } from './Section';

export const FillingSection = (): ReactElement => {
  const store = usePersonalization();
  const { isFillingWithPopular } = store.state;

  return (
    <PanelSection
      section={ControlSection.Filling}
      title="Popular posts"
      description="When your topics and follows don't find enough posts for a page, popular posts fill the rest. Turn it off and a short feed stays short."
    >
      <Switch
        inputId="personalization-filling"
        name="personalization-filling"
        compact={false}
        checked={isFillingWithPopular}
        onToggle={() => store.setFilling(!isFillingWithPopular)}
      >
        Fill a short feed with popular posts
      </Switch>
    </PanelSection>
  );
};
