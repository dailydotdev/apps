import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedUrl } from '../../../hooks/input';
import { WriteLinkPreview } from '../write/WriteLinkPreview';
import { WritePreviewSkeleton } from '../write/WritePreviewSkeleton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import { useAutoResizeTextarea } from '../../../hooks/utils/useAutoResizeTextarea';
import { TITLE_MAX_LENGTH, type LinkFormState } from './types';
import {
  isPreviewForComposerUrl,
  normalizeComposerUrl,
  normalizeSingleLineComposerText,
} from './utils';

interface LinkFormProps {
  value: LinkFormState;
  onChange: (next: LinkFormState) => void;
  preview?: ExternalLinkPreview;
  isLoadingPreview?: boolean;
  fetchPreview: (url?: string) => void;
  onDismissPreview?: () => void;
  initialUrl?: string;
}

const COMMENTARY_MAX_HEIGHT = 144;

export const LinkForm = ({
  value,
  onChange,
  preview,
  isLoadingPreview,
  fetchPreview,
  onDismissPreview,
  initialUrl,
}: LinkFormProps): ReactElement => {
  const urlRef = useRef<HTMLInputElement>(null);
  const commentaryRef = useRef<HTMLTextAreaElement>(null);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);

  useEffect(() => {
    urlRef.current?.focus();
  }, []);

  const hasPreviewForUrl = useCallback(
    (next?: string): boolean =>
      !!next && !isPreviewForComposerUrl(preview, next),
    [preview],
  );

  const [checkUrl] = useDebouncedUrl(fetchPreview, hasPreviewForUrl);

  const normalizedUrl = normalizeComposerUrl(value.url);
  const isDismissedForCurrentUrl =
    !!dismissedUrl && normalizedUrl === dismissedUrl;

  const onUrlChange = (next: string) => {
    onChange({ ...value, url: next });
    const nextNormalized = normalizeComposerUrl(next);
    if (dismissedUrl && nextNormalized !== dismissedUrl) {
      setDismissedUrl(null);
    }
    checkUrl(nextNormalized);
  };
  const onUrlChangeRef = useRef(onUrlChange);
  onUrlChangeRef.current = onUrlChange;

  const dismissPreview = () => {
    setDismissedUrl(normalizedUrl || value.url || null);
    onDismissPreview?.();
  };

  const showPreview =
    isPreviewForComposerUrl(preview, value.url) && !isDismissedForCurrentUrl;
  const showSkeleton = isLoadingPreview && !isDismissedForCurrentUrl;

  useAutoResizeTextarea(commentaryRef, value.commentary, {
    maxHeight: COMMENTARY_MAX_HEIGHT,
  });

  const onUrlKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        event.currentTarget.form?.requestSubmit();
        return;
      }

      commentaryRef.current?.focus();
    },
    [],
  );

  const onCommentaryKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.nativeEvent.isComposing ||
        event.key !== 'Enter' ||
        (!event.ctrlKey && !event.metaKey)
      ) {
        return;
      }

      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    },
    [],
  );

  useEffect(() => {
    if (!initialUrl) {
      return;
    }

    onUrlChangeRef.current(initialUrl);
  }, [initialUrl]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <input
        ref={urlRef}
        type="text"
        name="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Paste a link…"
        value={value.url}
        onInput={(event) => {
          onUrlChange(event.currentTarget.value);
        }}
        onKeyDown={onUrlKeyDown}
        aria-label="Link URL"
        className="w-full bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
      />
      <textarea
        ref={commentaryRef}
        name="commentary"
        placeholder="Add a comment (optional)"
        maxLength={TITLE_MAX_LENGTH}
        rows={1}
        value={value.commentary}
        onChange={(event) =>
          onChange({
            ...value,
            commentary: normalizeSingleLineComposerText(
              event.currentTarget.value,
            ),
          })
        }
        onKeyDown={onCommentaryKeyDown}
        aria-label="Post commentary"
        className="w-full resize-none overflow-hidden break-words bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
      />
      {(showSkeleton || (preview && showPreview)) && (
        <div className="relative flex flex-col gap-3">
          {showSkeleton && (
            <WritePreviewSkeleton
              link={normalizedUrl || value.url}
              className="flex-col-reverse"
            />
          )}
          {!showSkeleton && preview && showPreview && (
            <WriteLinkPreview
              className="!w-auto flex-col-reverse"
              preview={preview}
              link={normalizedUrl}
              showPreviewLink={false}
            />
          )}
          <Tooltip content="Remove link preview">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              icon={<MiniCloseIcon />}
              onClick={dismissPreview}
              aria-label="Remove link preview"
              className="absolute right-3 top-3 z-1 !rounded-full !bg-surface-invert !text-text-primary !shadow-3 hover:!bg-text-primary hover:!text-surface-invert"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
