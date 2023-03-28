import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { addPostToSquad, Squad, SquadForm } from '../../graphql/squads';
import { SquadComment, SubmitSharePostFunc } from '../squads/Comment';
import { ModalStep } from './common/types';
import { Post, submitExternalLink } from '../../graphql/posts';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { ModalState, SquadStateProps } from '../squads/utils';
import AuthContext from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';

export interface PostToSquadModalProps extends LazyModalCommonProps {
  squad: Squad;
  post?: Post;
  url?: string;
  onSharedSuccessfully?: (post: Post) => void;
  requestMethod?: typeof request;
}

const modalSteps: ModalStep[] = [
  {
    key: ModalState.SelectArticle,
  },
  {
    key: ModalState.WriteComment,
  },
];
function PostToSquadModal({
  onSharedSuccessfully,
  onRequestClose,
  isOpen,
  post,
  url,
  squad,
  requestMethod = request,
  ...props
}: PostToSquadModalProps): ReactElement {
  const isLink = !isNullOrUndefined(url);
  const shouldSkipHistory = isLink || post;
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [form, setForm] = useState<Partial<SquadForm>>({
    post: { post },
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
    url,
  });

  const onPostSuccess = async (squadPost?: Post) => {
    if (squadPost) onSharedSuccessfully?.(squadPost);

    if (isLink) {
      displayToast(
        'This post is being processed and will be shared with your Squad shortly',
      );
    }

    await client.invalidateQueries(['sourceFeed', user.id]);
    onRequestClose(null);
  };

  const { mutateAsync: onPost, isLoading } = useMutation(
    addPostToSquad(requestMethod),
    { onSuccess: onPostSuccess },
  );

  const { mutateAsync: onSubmitLink, isLoading: isLinkLoading } = useMutation(
    submitExternalLink,
    {
      onSuccess: (submittedLinkPost) => onPostSuccess(submittedLinkPost),
    },
  );

  const onSubmit: SubmitSharePostFunc = async (e, commentary, postLink) => {
    e?.preventDefault();

    if (isLoading) return null;

    if (isLink) {
      return onSubmitLink({ url: postLink, sourceId: squad.id, commentary });
    }

    return onPost({
      id: form.post.post.id,
      sourceId: squad.id,
      commentary: commentary ?? e?.target[0].value,
    });
  };

  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    onSubmit(undefined, squadForm.commentary);
  };

  const stateProps: SquadStateProps = {
    form,
    setForm,
    onNext,
    onRequestClose,
  };

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      steps={post ? undefined : modalSteps}
      {...props}
    >
      <Modal.Header title={shouldSkipHistory ? 'Post article' : 'Share post'} />
      {shouldSkipHistory ? (
        <SquadComment
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading || isLinkLoading}
          onUpdateForm={(postByUrl) =>
            setForm((value) => ({ ...value, post: { post: postByUrl } }))
          }
        />
      ) : (
        <>
          <SquadSelectArticle {...stateProps} />
          <SteppedSquadComment {...stateProps} />
        </>
      )}
    </Modal>
  );
}

export default PostToSquadModal;
