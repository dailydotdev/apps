import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import PostSummary from '../../cards/common/PostSummary';
import { Tab, TabContainer } from '../../tabs/TabContainer';
import { usePlusSubscription } from '../../../hooks';
import { PromptButtons } from './PromptButtons';

export enum PromptDisplay {
  TLDR = 'tldr',
  UpgradeToPlus = 'upgrade-to-plus',
  ActionableSteps = 'actionable-steps',
  ChallengeThis = 'challenge-this',
  CompareAlternatives = 'compare-alternatives',
  CustomPrompt = 'custom-prompt',
  ExtractCode = 'extract-code',
  PracticalExamples = 'practical-examples',
  RemoveFluff = 'remove-fluff',
  SimplifyIt = 'simplify-it',
  SkillsNeeded = 'skills-needed',
}

export const CustomPrompt = ({ post }: { post: Post }): ReactElement => {
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const [activeDisplay, setActiveDisplay] = useState<PromptDisplay>(
    PromptDisplay.TLDR,
  );
  const onSetActiveDisplay = (display: PromptDisplay) => {
    if (!isPlus && display !== PromptDisplay.TLDR) {
      setActiveDisplay(PromptDisplay.UpgradeToPlus);
      return;
    }
    setActiveDisplay(display);
  };

  if (!showPlusSubscription) {
    return <PostSummary className="mb-6" summary={post.summary} />;
  }

  return (
    <div className="mb-6 flex flex-col gap-3">
      <PromptButtons
        activeDisplay={activeDisplay}
        setActiveDisplay={onSetActiveDisplay}
      />
      <TabContainer<PromptDisplay>
        controlledActive={activeDisplay}
        showHeader={false}
      >
        <Tab label={PromptDisplay.TLDR}>
          <PostSummary summary={post.summary} />
        </Tab>
        <Tab label={PromptDisplay.SimplifyIt}>simplify</Tab>
        <Tab label={PromptDisplay.RemoveFluff}>Remove fluff</Tab>
        <Tab label={PromptDisplay.ChallengeThis}>Challenge this</Tab>
        <Tab label={PromptDisplay.PracticalExamples}>Practical examples</Tab>
        <Tab label={PromptDisplay.ActionableSteps}>Actionable steps</Tab>
        <Tab label={PromptDisplay.SkillsNeeded}>Skills needed</Tab>
        <Tab label={PromptDisplay.CompareAlternatives}>
          Compare alternatives
        </Tab>
        <Tab label={PromptDisplay.ExtractCode}>Extract code</Tab>
        <Tab label={PromptDisplay.CustomPrompt}>Custom prompt</Tab>

        <Tab label={PromptDisplay.UpgradeToPlus}>Upgrade to plus</Tab>
      </TabContainer>
    </div>
  );
};
