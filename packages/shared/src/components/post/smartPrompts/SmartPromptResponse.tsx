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
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { CopyIcon } from '../../icons';
import { useCopyText } from '../../../hooks/useCopy';

type SmartPromptResponseProps = {
  post: Post;
  activePrompt: string;
};

export const SmartPromptResponse = ({
  post,
  activePrompt,
}: SmartPromptResponseProps): ReactElement => {
  const [copying, copy] = useCopyText();
  const { data: prompts } = usePromptsQuery();
  const prompt = useMemo(
    () => prompts?.find((p) => p.id === activePrompt),
    [activePrompt, prompts],
  );

  const { executePrompt, data, isPending } = useSmartPrompt({ post, prompt });

  useEffect(() => {
    if (!prompt.prompt || data) {
      return;
    }

    executePrompt(prompt.prompt);
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
        isLoading={isPending}
        content={data?.chunks?.[0]?.response || ''}
      />
      <div className="mt-3 flex gap-2">
        <Button
          icon={<CopyIcon />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          color={copying ? ButtonColor.Avocado : undefined}
          onClick={() => copy({ textToCopy: data?.chunks?.[0]?.response })}
        />
      </div>
    </div>
  );
};
