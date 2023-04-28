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
import { useNotificationContext } from '../../contexts/NotificationsContext';
import { NotificationPromptSource } from '../../lib/analytics';

export interface PostToSquadModalProps
  extends LazyModalCommonProps,
    Partial<Pick<SquadForm, 'preview'>> {
  squad: Squad;
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
  preview,
  squad,
  requestMethod = request,
  ...props
}: PostToSquadModalProps): ReactElement {
  const notificationState = useState(true);
  const [shouldEnableNotification] = notificationState;
  const shouldSkipHistory = !!preview;
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const { onTogglePermission } = useNotificationContext();
  const { displayToast } = useToastNotification();
  const [form, setForm] = useState<Partial<SquadForm>>({
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
    preview,
  });

  const onPostSuccess = async (squadPost?: Post) => {
    if (squadPost) onSharedSuccessfully?.(squadPost);
    if (shouldEnableNotification) {
      onTogglePermission(NotificationPromptSource.SquadPostCommentary);
    }

    displayToast('This post has been shared to your Squad');
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

  const onSubmit: SubmitSharePostFunc = async (e, commentary) => {
    e?.preventDefault();

    if (isLoading) return null;

    if (form.preview.id) {
      return onPost({
        id: form.preview.id,
        sourceId: squad.id,
        commentary: commentary ?? e?.target[0].value,
      });
    }

    const { title, image, url } = form.preview;

    if (!title) {
      return displayToast('Invalid link');
    }

    return onSubmitLink({
      url,
      title,
      image,
      sourceId: squad.id,
      commentary,
    });
  };

  const onNext = async (squadForm?: SquadForm) => {
    if (squadForm) setForm(squadForm);
    if (!squadForm.commentary) return;
    onSubmit(undefined, squadForm.commentary);
  };

  const stateProps: SquadStateProps = {
    form,
    onUpdateForm: setForm,
    onNext,
    onRequestClose,
  };

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      steps={preview?.id ? undefined : modalSteps}
      {...props}
    >
      <Modal.Header title={shouldSkipHistory ? 'Post article' : 'Share post'} />
      {shouldSkipHistory ? (
        <SquadComment
          {...stateProps}
          onSubmit={onSubmit}
          notificationState={notificationState}
          isLoading={isLoading || isLinkLoading}
        />
      ) : (
        <>
          <SquadSelectArticle {...stateProps} />
          <SteppedSquadComment
            {...stateProps}
            isLoading={isLoading}
            notificationState={notificationState}
          />
        </>
      )}
    </Modal>
  );
}

export default PostToSquadModal;
