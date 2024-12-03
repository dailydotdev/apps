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
import { SourcePostModeration } from '../../../graphql/squads';

interface ShareLinkProps {
  squad: Squad;
  post?: Post;
  moderated?: SourcePostModeration;
  className?: string;
  onPostSuccess: (post: Post, url: string) => void;
}

export function ShareLink({
  squad,
  className,
  onPostSuccess,
  post,
  moderated,
}: ShareLinkProps): ReactElement {
  const fetchedPost = post || moderated;
  const { displayToast } = useToastNotification();
  const [commentary, setCommentary] = useState(
    fetchedPost?.sharedPost ? fetchedPost?.title : fetchedPost?.content,
  );
  const { squads, user } = useAuthContext();
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
    onSubmitPost,
    onUpdateSharePost,
    onUpdatePreview,
  } = usePostToSquad({
    onPostSuccess,
    initialPreview:
      fetchedPost?.sharedPost ||
      (moderated && {
        url: moderated.externalLink,
        title: moderated.title,
        image: moderated.image,
      }),
  });
  const { push } = useRouter();
  const { onUpdatePostModeration, isPending: isPostingModeration } =
    useSourcePostModeration({
      onSuccess: async () => push(squad.permalink),
    });

  const { onCreateSquad, isLoading: isCreatingSquad } = useSquadCreate({
    onSuccess: (newSquad) => {
      onSubmitPost(null, newSquad, commentary);
      return push(newSquad.permalink);
    },
    retryWithRandomizedHandle: true,
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (isPosting || isPostingModeration || isCreatingSquad) {
      return null;
    }

    if (!squad) {
      return displayToast('You must select a Squad to post to!');
    }

    if (fetchedPost?.id) {
      if (
        commentary === fetchedPost?.title ||
        commentary === moderated?.content
      ) {
        return push(squad.permalink);
      }

      if (moderated) {
        return onUpdatePostModeration({
          type: PostType.Share,
          sourceId: squad.id,
          id: moderated.id,
          title: moderated.sharedPost ? commentary : preview.title,
          content: moderated.sharedPost ? null : commentary,
          imageUrl: moderated.sharedPost ? null : preview.image,
          externalLink: moderated.sharedPost ? null : preview.url,
        });
      }

      return onUpdateSharePost(e, fetchedPost.id, commentary, squad);
    }

    if (squads.some(({ id }) => squad.id === id)) {
      onSubmitPost(e, squad, commentary);
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
      {fetchedPost?.sharedPost ? (
        <WriteLinkPreview
          link={fetchedPost.sharedPost.permalink}
          preview={fetchedPost.sharedPost}
          showPreviewLink={false}
        />
      ) : (
        <SubmitExternalLink
          preview={preview || fetchedPost?.sharedPost}
          getLinkPreview={getLinkPreview}
          isLoadingPreview={isLoadingPreview}
          onSelectedHistory={onUpdatePreview}
        />
      )}

      <MarkdownInput
        initialContent={commentary || fetchedPost?.title || ''}
        enabledCommand={{ mention: true }}
        showMarkdownGuide={false}
        onValueUpdate={setCommentary}
      />
      <WriteFooter isLoading={isPosting} />
    </form>
  );
}
