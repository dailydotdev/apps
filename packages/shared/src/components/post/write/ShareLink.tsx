import type { FormEventHandler, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { Squad } from '../../../graphql/sources';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteFooter } from './WriteFooter';
import { SubmitExternalLink } from './SubmitExternalLink';
import { usePostToSquad, useToastNotification } from '../../../hooks';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { WriteLinkPreview } from './WriteLinkPreview';
import useSourcePostModeration from '../../../hooks/source/useSourcePostModeration';
import type { SourcePostModeration } from '../../../graphql/squads';
import { usePrompt } from '../../../hooks/usePrompt';
import { useWritePostContext } from '../../../contexts';

interface ShareLinkProps {
  squad?: Squad;
  post?: Post;
  moderated?: SourcePostModeration;
  className?: string;
  onPostSuccess: (post: Post, url: string) => void;
}

const confirmSharingAgainPrompt = {
  title: 'This link has already been shared.',
  description: 'Are you sure you want to repost it?',
  okButton: {
    title: 'Repost',
    className: 'btn-primary-cabbage',
  },
};

export function ShareLink({
  squad,
  className,
  onPostSuccess,
  post,
  moderated,
}: ShareLinkProps): ReactElement {
  const fetchedPost = post || moderated;
  const isCreatingPost = !fetchedPost;

  const { showPrompt } = usePrompt();
  const { push } = useRouter();
  const { displayToast } = useToastNotification();
  const { onSubmitForm, isPosting: isPendingCreation } = useWritePostContext();

  const [commentary, setCommentary] = useState(
    fetchedPost?.sharedPost ? fetchedPost?.title : fetchedPost?.content,
  );
  const {
    getLinkPreview,
    isLoadingPreview,
    preview,
    isPosting,
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
  const { onUpdatePostModeration, isPending: isPostingModeration } =
    useSourcePostModeration({
      onSuccess: async () => push(squad?.permalink),
    });

  const onUpdateSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    if (!fetchedPost?.id || !squad) {
      return null;
    }

    const isSameAsBefore = [fetchedPost?.title, moderated?.content].includes(
      commentary,
    );
    if (isSameAsBefore) {
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
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (isPosting || isPostingModeration || isPendingCreation) {
      return null;
    }

    if (!isCreatingPost) {
      return onUpdateSubmit(e);
    }

    const isLinkAlreadyShared = preview.relatedPublicPosts?.length > 0;
    const proceedSharingLink =
      !isLinkAlreadyShared || (await showPrompt(confirmSharingAgainPrompt));

    if (!proceedSharingLink) {
      return null;
    }

    const { title, image } = preview;
    const externalLink = preview.finalUrl ?? preview.url;

    if (!title) {
      displayToast('Invalid link');
      return null;
    }

    const content = commentary;
    const args = preview.id
      ? { title: commentary, content, sharedPostId: preview.id }
      : { title, content, externalLink, imageUrl: image };

    return onSubmitForm(e, args, PostType.Share);
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
      <WriteFooter
        isLoading={isPosting || isPostingModeration || isPendingCreation}
      />
    </form>
  );
}
