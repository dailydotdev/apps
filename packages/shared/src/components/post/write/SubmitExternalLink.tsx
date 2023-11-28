import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ExternalLinkPreview, ReadHistoryPost } from '../../../graphql/posts';
import { TextField } from '../../fields/TextField';
import LinkIcon from '../../icons/Link';
import { ClickableText } from '../../buttons/ClickableText';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useViewSize, ViewSize } from '../../../hooks';
import { WritePreviewSkeleton } from './WritePreviewSkeleton';
import { WriteLinkPreview } from './WriteLinkPreview';
import { useDebouncedUrl } from '../../../hooks/input';

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
  const isMobile = useViewSize(ViewSize.MobileL);
  const { openModal } = useLazyModal();
  const [url, setUrl] = useState<string>(undefined);
  const shouldShorten = url !== undefined || isMobile;
  const label = `Enter URL${shouldShorten ? '' : ' / Choose from'}`;
  const [checkUrl] = useDebouncedUrl(
    getLinkPreview,
    (value) => value !== preview?.url,
  );

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget;
    setUrl(value);
    checkUrl(value);
  };

  const link = url ?? preview?.permalink ?? preview?.url;

  if (isLoadingPreview) {
    return <WritePreviewSkeleton link={link} />;
  }

  if (preview) {
    return (
      <WriteLinkPreview link={link} preview={preview} onLinkChange={onInput} />
    );
  }

  return (
    <span
      className={classNames(
        'flex relative flex-col tablet:flex-row items-center',
        isMobile ? 'border border-theme-divider-tertiary rounded-16' : '',
      )}
    >
      <TextField
        className={{ container: 'flex-1 w-full' }}
        inputId="url"
        type="url"
        label={label}
        required
        fieldType="tertiary"
        leftIcon={<LinkIcon />}
        onBlur={() => !url?.length && setUrl(undefined)}
        onInput={onInput}
        onFocus={() => !url?.length && setUrl('')}
      />
      {(url === undefined || isMobile) && (
        <ClickableText
          className={classNames(
            'font-bold reading-history hover:text-theme-label-primary',
            isMobile
              ? 'py-4 w-full justify-center'
              : 'hidden tablet:flex absolute left-56 ml-3',
          )}
          inverseUnderline={!isMobile}
          onClick={() =>
            openModal({
              type: LazyModal.ReadingHistory,
              props: {
                onArticleSelected: ({ post }) => onSelectedHistory(post),
              },
            })
          }
          type="button"
        >
          {isMobile ? 'Choose from reading history' : 'reading history'}
        </ClickableText>
      )}
    </span>
  );
}
