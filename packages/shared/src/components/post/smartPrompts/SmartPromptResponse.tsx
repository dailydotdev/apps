import React, { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import type { Post } from '../../../graphql/posts';
import { RenderMarkdown } from '../../RenderMarkdown';
import { SearchProgressBar } from '../../search';
import Alert, { AlertType } from '../../widgets/Alert';
import { isNullOrUndefined } from '../../../lib/func';
import { labels } from '../../../lib';
import { usePromptsQuery } from '../../../hooks/prompt/usePromptsQuery';
import { useSmartPrompt } from '../../../hooks/prompt/useSmartPrompt';

type SmartPromptResponseProps = {
  post: Post;
  activePrompt: string;
};

export const SmartPromptResponse = ({
  post,
  activePrompt,
}: SmartPromptResponseProps): ReactElement => {
  const { data: prompts } = usePromptsQuery();
  const prompt = useMemo(
    () => prompts?.find((p) => p.id === activePrompt),
    [activePrompt, prompts],
  );

  const {
    executePrompt,
    data,
    isPending: isChatLoading,
  } = useSmartPrompt({ post, prompt });

  useEffect(() => {
    if (!prompt.prompt || data) {
      return;
    }

    executePrompt(prompt.prompt + new Date().getTime());
  }, [prompt, executePrompt, data]);

  return (
    <div>
      {!!data?.chunks?.[0]?.steps && (
        <div className="mb-4">
          <SearchProgressBar
            max={data?.chunks?.[0]?.steps}
            progress={data?.chunks?.[0]?.progress}
          />
          {!!data?.chunks?.[0]?.status && (
            <div className="mt-2 text-text-tertiary typo-callout">
              {data?.chunks?.[0]?.status}
            </div>
          )}
        </div>
      )}
      {!isNullOrUndefined(data?.chunks?.[0]?.error?.code) && (
        <Alert
          className="mb-4"
          type={AlertType.Error}
          title={data?.chunks?.[0]?.error?.message || labels.error.generic}
        />
      )}
      <RenderMarkdown
        isLoading={isChatLoading}
        content={data?.chunks?.[0]?.response || ''}
      />
    </div>
  );
};
