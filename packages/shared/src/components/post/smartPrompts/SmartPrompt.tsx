import React, { useCallback, useRef, useState } from 'react';
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
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { SmartPromptResponse } from './SmartPromptResponse';

export const SmartPrompt = ({ post }: { post: Post }): ReactElement => {
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const [activeDisplay, setActiveDisplay] = useState<PromptDisplay>(
    PromptDisplay.TLDR,
  );
  const [activePrompt, setActivePrompt] = useState<string>(PromptDisplay.TLDR);
  const elementRef = useRef<HTMLDivElement>(null);
  const width = elementRef?.current?.getBoundingClientRect()?.width || 0;

  const onSubmitCustomPrompt = useCallback((e) => {
    e.preventDefault();
  }, []);

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
          <SmartPromptResponse post={post} activePrompt={activePrompt} />
        </Tab>

        <Tab label={PromptDisplay.CustomPrompt}>
          <form
            className="rounded-14 bg-surface-float"
            onSubmit={onSubmitCustomPrompt}
          >
            <textarea
              className="min-h-[9.5rem] w-full bg-transparent p-3"
              placeholder="Write your custom instruction to tailor the post to your needs."
            />
            <div className="flex border-t border-t-border-subtlest-tertiary px-4 py-2">
              <Button
                className="ml-auto"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
              >
                Run prompt
              </Button>
            </div>
          </form>
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
