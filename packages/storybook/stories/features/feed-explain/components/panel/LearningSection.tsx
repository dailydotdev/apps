import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PanelSection } from './Section';

export const LearningSection = (): ReactElement => {
  const store = usePersonalization();
  const { isLearning } = store.state;

  return (
    <PanelSection
      section={ControlSection.Learning}
      title="Learn from your reading"
      description="Topics you read about count, even ones you don't follow. Turn it off and only your follows count."
    >
      <Switch
        inputId="personalization-learning"
        name="personalization-learning"
        compact={false}
        checked={isLearning}
        onToggle={() => store.setLearning(!isLearning)}
      >
        Learn from my reading
      </Switch>
    </PanelSection>
  );
};
