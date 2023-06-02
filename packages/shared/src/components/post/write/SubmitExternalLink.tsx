import React, { FormEventHandler, ReactElement, useState } from 'react';
import { ExternalLinkPreview, ReadHistoryPost } from '../../../graphql/posts';
import { TextField } from '../../fields/TextField';
import { Loader } from '../../Loader';
import LinkIcon from '../../icons/Link';
import { ClickableText } from '../../buttons/ClickableText';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import useDebounce from '../../../hooks/useDebounce';
import { isValidHttpUrl } from '../../../lib/links';
import { Image } from '../../image/Image';
import { Button } from '../../buttons/Button';
import OpenLinkIcon from '../../icons/OpenLink';
import { SourceAvatar } from '../../profile/source';
import { ElementPlaceholder } from '../../ElementPlaceholder';

interface SubmitExternalLinkProps {
  preview: ExternalLinkPreview;
  isLoadingPreview: boolean;
  getLinkPreview: (value: string) => void;
  onSelectedHistory: (post: ReadHistoryPost) => void;
}

export function SubmitExternalLink({
  onSelectedHistory,
  isLoadingPreview,
  getLinkPreview,
  preview,
}: SubmitExternalLinkProps): ReactElement {
  const { openModal } = useLazyModal();
  const [url, setUrl] = useState<string>(undefined);
  const label = `Enter URL${url === undefined ? ' / Choose from' : ''}`;
  const [checkUrl] = useDebounce((value: string) => {
    if (!isValidHttpUrl(value) || value === preview?.url) return null;

    return getLinkPreview(value);
  }, 1000);

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget;
    setUrl(value);
    checkUrl(value);
  };

  const imageClass = 'w-28 h-16 rounded-12 bg-theme-label-disabled';
  const link = preview?.url ?? preview?.permalink ?? url;

  if (preview || isLoadingPreview) {
    return (
      <div className="flex flex-col rounded-16 border border-theme-divider-tertiary">
        <TextField
          leftIcon={
            isLoadingPreview ? <Loader className="mr-2" /> : <LinkIcon />
          }
          label="URL"
          type="url"
          inputId="preview_url"
          fieldType="tertiary"
          className={{ container: 'w-full' }}
          value={link}
        />
        <div className="flex relative flex-row gap-3 items-center py-5 px-4">
          {isLoadingPreview && (
            <span className="absolute top-2 left-2 typo-caption1 text-theme-label-quaternary">
              Fetching preview, please hold...
            </span>
          )}
          <div className="flex flex-col flex-1 typo-footnote">
            {isLoadingPreview ? (
              <div className="relative flex-flex-col">
                <ElementPlaceholder className="w-5/6 h-2 rounded-12" />
                <ElementPlaceholder className="mt-3 w-1/2 h-2 rounded-12" />
              </div>
            ) : (
              <>
                <span className="font-bold line-clamp-2">{preview.title}</span>
                {preview.source && (
                  <span className="flex flex-row items-center mt-1">
                    <SourceAvatar size="small" source={preview.source} />
                    <span className="text-theme-label-tertiary">
                      {preview.source.name}
                    </span>
                  </span>
                )}
              </>
            )}
          </div>
          {isLoadingPreview ? (
            <div className={imageClass} />
          ) : (
            <Image className={imageClass} src={preview.image} />
          )}
          <Button
            icon={<OpenLinkIcon />}
            className="btn-tertiary"
            disabled={isLoadingPreview}
            type="button"
            tag="a"
            target="_blank"
            rel="noopener noreferrer"
            href={link}
          />
        </div>
      </div>
    );
  }

  return (
    <span className="flex relative flex-row items-center">
      <TextField
        className={{ container: 'flex-1 w-full' }}
        inputId="url"
        type="url"
        label={label}
        fieldType="tertiary"
        leftIcon={<LinkIcon />}
        onBlur={() => !url?.length && setUrl(undefined)}
        onInput={onInput}
        onFocus={() => !url?.length && setUrl('')}
      />
      {url === undefined && (
        <ClickableText
          className="hidden tablet:flex absolute left-56 ml-3 font-bold reading-history hover:text-theme-label-primary"
          inverseUnderline
          onClick={() =>
            openModal({
              type: LazyModal.ReadingHistory,
              props: {
                onArticleSelected: ({ post }) => onSelectedHistory(post),
              },
            })
          } // open history and select
          type="button"
        >
          reading history
        </ClickableText>
      )}
    </span>
  );
}
