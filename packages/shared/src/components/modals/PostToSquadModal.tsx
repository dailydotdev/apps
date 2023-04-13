import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { addPostToSquad, SquadForm } from '../../graphql/squads';
import { Squad } from '../../graphql/sources';
import { SquadComment, SubmitSharePostFunc } from '../squads/Comment';
import { ModalStep } from './common/types';
import { Post, submitExternalLink } from '../../graphql/posts';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SquadSelectArticle } from '../squads/SelectArticle';
import { SteppedSquadComment } from '../squads/SteppedComment';
import { ModalState, SquadStateProps } from '../squads/utils';
import AuthContext from '../../contexts/AuthContext';

export interface PostToSquadModalProps
  extends LazyModalCommonProps,
    Partial<Pick<SquadForm, 'privateLink'>> {
  squad: Squad;
  post?: Post;
  onSharedSuccessfully?: (post: Post) => void;
  requestMethod?: typeof request;
}

const modalSteps: ModalStep[] = [
  { key: ModalState.SelectArticle },
  { key: ModalState.WriteComment },
];
function PostToSquadModal({
  onSharedSuccessfully,
  onRequestClose,
  isOpen,
  post,
  privateLink,
  squad,
  requestMethod = request,
  ...props
}: PostToSquadModalProps): ReactElement {
  const shouldSkipHistory = !!privateLink || !!post;
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const [form, setForm] = useState<Partial<SquadForm>>({
    post: { post },
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
    privateLink,
  });

  const onPostSuccess = async (squadPost?: Post) => {
    if (squadPost) onSharedSuccessfully?.(squadPost);

    displayToast(
      privateLink
        ? 'This post is being processed and will be shared with your Squad shortly'
        : 'This post has been shared to your Squad',
    );

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

    if (privateLink) {
      const { title, image } = privateLink;
      return onSubmitLink({
        url: postLink,
        title,
        image,
        sourceId: squad.id,
        commentary,
      });
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
          onUpdateForm={(updatedForm) =>
            setForm((value) => ({ ...value, ...updatedForm }))
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
