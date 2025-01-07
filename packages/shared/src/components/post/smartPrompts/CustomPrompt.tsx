import React, { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { Post } from '../../../graphql/posts';
import { useSmartPrompt } from '../../../hooks/prompt/useSmartPrompt';
import { usePromptsQuery } from '../../../hooks/prompt/usePromptsQuery';
import { PromptDisplay } from '../../../graphql/prompt';
import { SearchProgressBar } from '../../search';
import { isNullOrUndefined } from '../../../lib/func';
import Alert, { AlertType } from '../../widgets/Alert';
import { labels } from '../../../lib';
import { RenderMarkdown } from '../../RenderMarkdown';

type CustomPromptProps = {
  post: Post;
};

export const CustomPrompt = ({ post }: CustomPromptProps): ReactElement => {
  const { data: prompts } = usePromptsQuery();
  const prompt = useMemo(
    () => prompts?.find((p) => p.id === PromptDisplay.CustomPrompt),
    [prompts],
  );
  const { executePrompt, data, isPending } = useSmartPrompt({ post, prompt });
  const onSubmitCustomPrompt = useCallback(
    (e) => {
      e.preventDefault();

      executePrompt(e.target[0].value);
    },
    [executePrompt],
  );

  if (!data) {
    return (
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
    );
  }

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
        isLoading={isPending}
        content={data?.chunks?.[0]?.response || ''}
      />
    </div>
  );
};
