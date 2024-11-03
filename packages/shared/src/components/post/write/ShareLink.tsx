import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Squad } from '../../../graphql/sources';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteFooter } from './WriteFooter';
import { SubmitExternalLink } from './SubmitExternalLink';
import { usePostToSquad } from '../../../hooks';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Post, PostType } from '../../../graphql/posts';
import { WriteLinkPreview } from './WriteLinkPreview';
import { generateDefaultSquad } from './SquadsDropdown';
import { useSquadCreate } from '../../../hooks/squads/useSquadCreate';
import { useAuthContext } from '../../../contexts/AuthContext';
import useSourcePostModeration from '../../../hooks/source/useSourcePostModeration';
import { DEFAULT_ERROR } from '../../../graphql/common';
import { isPrivilegedMember } from '../../squads/utils';

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
  const { onCreatePostModeration, isSuccess: isCreatingPostModeration } =
    useSourcePostModeration({
      onSuccess: () => {
        // TODO: Will implement moderation modal popup in MI-583
      },
      onError: () => {
        displayToast(DEFAULT_ERROR);
      },
    });
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

    if (isPosting || isLoading || isCreatingPostModeration) {
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
      if (squad.moderationRequired && !isPrivilegedMember(squad)) {
        return onCreatePostModeration({
          title: preview.title || '',
          type: preview?.id ? PostType.Share : PostType.Article,
          imageUrl: preview.image,
          sourceId: squad.id,
          sharedPostId: preview.id,
          url: preview?.url,
          commentary,
        });
      }
      onSubmitPost(e, squad.id, commentary);
      return push(squad.permalink);
    }

    return onCreateSquad(generateDefaultSquad(user.username));
  };

  return (
    <form
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={onSubmit}
      id="write-post-link"
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
