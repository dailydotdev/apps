import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import PostSummary from '../../cards/common/PostSummary';
import { Tab, TabContainer } from '../../tabs/TabContainer';
import { usePlusSubscription } from '../../../hooks';
import { PromptButtons } from './PromptButtons';
import { PromptDisplay } from '../../../graphql/prompt';
import { PostUpgradeToPlus } from '../../plus/PostUpgradeToPlus';
import { TargetId } from '../../../lib/log';
import ShowMoreContent from '../../cards/common/ShowMoreContent';

export const SmartPrompt = ({ post }: { post: Post }): ReactElement => {
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const [activeDisplay, setActiveDisplay] = useState<PromptDisplay>(
    PromptDisplay.TLDR,
  );
  const [activePrompt, setActivePrompt] = useState<string>(PromptDisplay.TLDR);
  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;

  const onSetActivePrompt = (prompt: string) => {
    setActivePrompt(prompt);
    if (!isPlus && prompt !== PromptDisplay.TLDR) {
      setActiveDisplay(PromptDisplay.UpgradeToPlus);
      return;
    }

    switch (prompt) {
      case PromptDisplay.TLDR:
        setActiveDisplay(PromptDisplay.TLDR);
        break;
      case PromptDisplay.CustomPrompt:
        setActiveDisplay(PromptDisplay.CustomPrompt);
        break;
      default:
        setActiveDisplay(PromptDisplay.SmartPrompt);
        break;
    }
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
        activePrompt={activePrompt}
        setActivePrompt={onSetActivePrompt}
        width={width}
      />
      <TabContainer controlledActive={activeDisplay} showHeader={false}>
        <Tab label={PromptDisplay.TLDR}>
          <ShowMoreContent
            className="overflow-hidden"
            content={post.summary}
            charactersLimit={330}
            threshold={50}
          />
        </Tab>

        <Tab label={PromptDisplay.SmartPrompt}>
          Smart prompt - {activePrompt}
        </Tab>

        <Tab label={PromptDisplay.CustomPrompt}>
          <input type="text" placeholder="Enter your custom prompt" />
        </Tab>

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
