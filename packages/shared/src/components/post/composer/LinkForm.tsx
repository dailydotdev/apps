import type { FormEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDebouncedUrl } from '../../../hooks/input';
import { WriteLinkPreview } from '../write/WriteLinkPreview';
import { WritePreviewSkeleton } from '../write/WritePreviewSkeleton';
import type { ExternalLinkPreview } from '../../../graphql/posts';
import { TITLE_MAX_LENGTH, type LinkFormState } from './types';
import { isPreviewForComposerUrl, normalizeComposerUrl } from './utils';

const looksLikeRealUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    return url.hostname === 'localhost' || url.hostname.includes('.');
  } catch {
    return false;
  }
};

interface LinkFormProps {
  value: LinkFormState;
  onChange: (next: LinkFormState) => void;
  preview?: ExternalLinkPreview;
  isLoadingPreview?: boolean;
  fetchPreview: (url?: string) => void;
}

export const LinkForm = ({
  value,
  onChange,
  preview,
  isLoadingPreview,
  fetchPreview,
}: LinkFormProps): ReactElement => {
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    urlRef.current?.focus();
  }, []);

  const hasPreviewForUrl = useCallback(
    (next?: string): boolean => {
      if (!next || !looksLikeRealUrl(next)) {
        return false;
      }
      return !isPreviewForComposerUrl(preview, next);
    },
    [preview],
  );

  const [checkUrl] = useDebouncedUrl(fetchPreview, hasPreviewForUrl);

  const onUrlChange = (event: FormEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value;
    onChange({ ...value, url: next });
    checkUrl(normalizeComposerUrl(next));
  };

  const normalizedUrl = normalizeComposerUrl(value.url);
  const showPreview = isPreviewForComposerUrl(preview, value.url);

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
        onInput={onUrlChange}
        aria-label="Link URL"
        className="w-full bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary"
      />
      <textarea
        name="commentary"
        placeholder="Add a comment (optional)"
        maxLength={TITLE_MAX_LENGTH}
        rows={1}
        value={value.commentary}
        onChange={(event) =>
          onChange({
            ...value,
            commentary: event.currentTarget.value.replace(/\n/g, ''),
          })
        }
        aria-label="Post commentary"
        className="w-full resize-none overflow-hidden break-words bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
      />
      {isLoadingPreview && (
        <WritePreviewSkeleton
          link={normalizedUrl || value.url}
          className="flex-col-reverse"
        />
      )}
      {!isLoadingPreview && preview && showPreview && (
        <WriteLinkPreview
          className="!w-auto flex-col-reverse"
          preview={preview}
          link={normalizedUrl}
          showPreviewLink={false}
        />
      )}
    </div>
  );
};
