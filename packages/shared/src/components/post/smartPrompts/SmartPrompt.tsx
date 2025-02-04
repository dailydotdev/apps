import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import { Tab, TabContainer } from '../../tabs/TabContainer';
import { useActions, usePlusSubscription } from '../../../hooks';
import { PromptButtons } from './PromptButtons';
import { PromptDisplay } from '../../../graphql/prompt';
import { PostUpgradeToPlus } from '../../plus/PostUpgradeToPlus';
import { TargetId } from '../../../lib/log';
import ShowMoreContent from '../../cards/common/ShowMoreContent';
import { SmartPromptResponse } from './SmartPromptResponse';
import { CustomPrompt } from './CustomPrompt';
import { ActionType } from '../../../graphql/actions';

export const SmartPrompt = ({ post }: { post: Post }): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { completeAction, checkHasCompleted } = useActions();
  const [activeDisplay, setActiveDisplay] = useState<PromptDisplay>(
    PromptDisplay.TLDR,
  );
  const [activePrompt, setActivePrompt] = useState<string>(PromptDisplay.TLDR);
  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;
  const triedSmartPrompts = checkHasCompleted(ActionType.SmartPrompt);

  const onSetActivePrompt = (prompt: string) => {
    setActivePrompt(prompt);

    if (!isPlus && prompt !== PromptDisplay.TLDR && triedSmartPrompts) {
      setActiveDisplay(PromptDisplay.UpgradeToPlus);
      return;
    }

    if (!triedSmartPrompts && prompt !== PromptDisplay.TLDR) {
      completeAction(ActionType.SmartPrompt);
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
          <SmartPromptResponse post={post} activePrompt={activePrompt} />
        </Tab>

        <Tab label={PromptDisplay.CustomPrompt}>
          <CustomPrompt post={post} />
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
