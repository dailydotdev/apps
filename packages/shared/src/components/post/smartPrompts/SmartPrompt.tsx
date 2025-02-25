import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import { Tab, TabContainer } from '../../tabs/TabContainer';
import { useActions, usePlusSubscription } from '../../../hooks';
import { PromptButtons } from './PromptButtons';
import { PromptDisplay } from '../../../graphql/prompt';
import { PostUpgradeToPlus } from '../../plus/PostUpgradeToPlus';
import { LogEvent, TargetId } from '../../../lib/log';
import ShowMoreContent from '../../cards/common/ShowMoreContent';
import { SmartPromptResponse } from './SmartPromptResponse';
import { CustomPrompt } from './CustomPrompt';
import { ActionType } from '../../../graphql/actions';
import { postLogEvent } from '../../../lib/feed';
import { useLogContext } from '../../../contexts/LogContext';

export const SmartPrompt = ({
  post,
  isContainedView,
}: {
  post: Post;
  isContainedView?: boolean;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { checkHasCompleted } = useActions();
  const [activeDisplay, setActiveDisplay] = useState<PromptDisplay>(
    PromptDisplay.TLDR,
  );
  const [width, setWidth] = useState<number>(0);
  const [activePrompt, setActivePrompt] = useState<string>(PromptDisplay.TLDR);
  const triedSmartPrompts = checkHasCompleted(ActionType.SmartPrompt);

  const onSetActivePrompt = (prompt: string) => {
    setActivePrompt(prompt);

    if (!isPlus && prompt !== PromptDisplay.TLDR && triedSmartPrompts) {
      setActiveDisplay(PromptDisplay.UpgradeToPlus);
      return;
    }

    if (
      prompt !== PromptDisplay.TLDR &&
      prompt !== PromptDisplay.CustomPrompt
    ) {
      logEvent(
        postLogEvent(LogEvent.SmartPrompt, post, {
          extra: { prompt },
        }),
      );
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
      ref={(element) => {
        if (element) {
          setWidth(element.getBoundingClientRect().width);
        }
      }}
    >
      <PromptButtons
        activePrompt={activePrompt}
        setActivePrompt={onSetActivePrompt}
        width={width}
        isContainedView={isContainedView}
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
