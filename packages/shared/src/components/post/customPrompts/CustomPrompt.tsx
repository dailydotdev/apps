import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import PostSummary from '../../cards/common/PostSummary';
import { Tab, TabContainer } from '../../tabs/TabContainer';
import { usePlusSubscription } from '../../../hooks';
import { PromptButtons } from './PromptButtons';
import { TargetId } from '../../../lib/log';
import { PostUpgradeToPlus } from '../../plus/PostUpgradeToPlus';
import ShowMoreContent from '../../cards/common/ShowMoreContent';

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
  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;

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
    <div
      className="mb-6 flex flex-col gap-3 text-text-secondary"
      ref={elementRef}
    >
      <PromptButtons
        activeDisplay={activeDisplay}
        setActiveDisplay={onSetActiveDisplay}
        width={width}
      />
      <TabContainer<PromptDisplay>
        controlledActive={activeDisplay}
        showHeader={false}
      >
        <Tab label={PromptDisplay.TLDR}>
          <ShowMoreContent
            className="overflow-hidden"
            content={post.summary}
            charactersLimit={330}
            threshold={50}
          />
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

        <Tab label={PromptDisplay.UpgradeToPlus}>
          <PostUpgradeToPlus
            title="Want unlimited access to smart prompts for every post?"
            targetId={TargetId.SmartPrompt}
            onClose={() => {
              setActiveDisplay(PromptDisplay.TLDR);
            }}
          >
            Level up how you interact with posts using AI-powered prompts.
            Extract insights, refine content, or run custom instructions to get
            more out of every post in one click.
          </PostUpgradeToPlus>
        </Tab>
      </TabContainer>
    </div>
  );
};
