import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { FormEventHandler, ReactElement, useState } from 'react';

import { useAuthContext } from '../../../contexts/AuthContext';
import { Post } from '../../../graphql/posts';
import { Squad } from '../../../graphql/sources';
import { usePostToSquad } from '../../../hooks';
import { useSquadCreate } from '../../../hooks/squads/useSquadCreate';
import { useToastNotification } from '../../../hooks/useToastNotification';
import MarkdownInput from '../../fields/MarkdownInput';
import { generateDefaultSquad } from './SquadsDropdown';
import { SubmitExternalLink } from './SubmitExternalLink';
import { WriteFooter } from './WriteFooter';
import { WriteLinkPreview } from './WriteLinkPreview';

interface ShareLinkProps {
  squad: Squad;
  post?: Post;
  className?: string;
  onPostSuccess: (post: Post, url: string) => void;
}

export function ShareLink({
  squad,
  post,
  className,
  onPostSuccess,
}: ShareLinkProps): ReactElement {
  const { displayToast } = useToastNotification();
  const [commentary, setCommentary] = useState(post?.title ?? '');
  const { squads, user } = useAuthContext();

  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onUpdatePost,
    onUpdatePreview,
  } = usePostToSquad({ onPostSuccess, initialPreview: post?.sharedPost });
  const { push } = useRouter();

  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: (newSquad) => {
      onSubmitPost(null, newSquad.id, commentary);
      return push(newSquad.permalink);
    },
    retryWithRandomizedHandle: true,
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (isPosting || isLoading) {
      return null;
    }

    if (!squad) {
      return displayToast('You must select a Squad to post to!');
    }

    if (post?.id) {
      if (commentary !== post?.title) {
        onUpdatePost(e, post.id, commentary);
      }
      return push(squad.permalink);
    }

    if (squads.some(({ id }) => squad.id === id)) {
      onSubmitPost(e, squad.id, commentary);
      return push(squad.permalink);
    }

    return onCreateSquad(generateDefaultSquad(user.username));
  };

  return (
    <form
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={onSubmit}
      id="write-post"
    >
      {post?.id ? (
        <WriteLinkPreview
          link={post.sharedPost.permalink}
          preview={post.sharedPost}
          showPreviewLink={false}
        />
      ) : (
        <SubmitExternalLink
          preview={preview || post?.sharedPost}
          getLinkPreview={getLinkPreview}
          isLoadingPreview={isLoadingPreview}
          onSelectedHistory={onUpdatePreview}
        />
      )}

      <MarkdownInput
        initialContent={commentary || post?.title || ''}
        enabledCommand={{ mention: true }}
        showMarkdownGuide={false}
        onValueUpdate={setCommentary}
      />
      <WriteFooter isLoading={isPosting} />
    </form>
  );
}
