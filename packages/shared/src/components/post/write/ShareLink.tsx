import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Squad } from '../../../graphql/sources';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteFooter } from './WriteFooter';
import { SubmitExternalLink } from './SubmitExternalLink';
import { usePostToSquad } from '../../../hooks';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Post } from '../../../graphql/posts';

interface ShareLinkProps {
  squad: Squad;
  className?: string;
  onPostSuccess: (post: Post, url: string) => void;
}

export function ShareLink({
  squad,
  className,
  onPostSuccess,
}: ShareLinkProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [commentary, setCommentary] = useState('');
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onUpdatePreview,
  } = usePostToSquad({ onPostSuccess });

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!squad) {
      return displayToast('You must select a Squad to post to!');
    }

    return onSubmitPost(e, squad.id, commentary);
  };

  return (
    <form
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={onSubmit}
    >
      <SubmitExternalLink
        preview={preview}
        getLinkPreview={getLinkPreview}
        isLoadingPreview={isLoadingPreview}
        onSelectedHistory={onUpdatePreview}
      />
      <MarkdownInput
        enabledCommand={{ mention: true }}
        showMarkdownGuide={false}
        onValueUpdate={setCommentary}
      />
      <WriteFooter isLoading={isPosting} />
    </form>
  );
}
