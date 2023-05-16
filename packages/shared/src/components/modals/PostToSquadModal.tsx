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
import { NotificationPromptSource } from '../../lib/analytics';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useEnableNotification } from '../../hooks/useEnableNotification';

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
  const { displayToast } = useToastNotification();
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source: NotificationPromptSource.SquadPostCommentary,
  });
  const [form, setForm] = useState<Partial<SquadForm>>({
    name: squad.name,
    file: squad.image,
    handle: squad.handle,
    buttonText: 'Done',
    preview,
  });
  const { completeAction } = useActions();

  const onPostSuccess = async (squadPost?: Post) => {
    if (squadPost) onSharedSuccessfully?.(squadPost);
    if (shouldShowCta) {
      const command = shouldEnableNotification ? onEnable : onDismiss;
      command();
    }

    displayToast('This post has been shared to your Squad');
    await client.invalidateQueries(['sourceFeed', user.id]);

    // this optimistically updates the action from the client
    // to make sure correct action state is shown to the user immediately
    // this is also done on the API side in postAdded worker to catch
    // all other cases of post being created by user
    completeAction(ActionType.SquadFirstPost);

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
  const commentCommonProps = {
    ...stateProps,
    notificationState,
    shouldShowToggle: shouldShowCta,
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
          {...commentCommonProps}
          onSubmit={onSubmit}
          isLoading={isLoading || isLinkLoading}
        />
      ) : (
        <>
          <SquadSelectArticle {...stateProps} />
          <SteppedSquadComment {...commentCommonProps} isLoading={isLoading} />
        </>
      )}
    </Modal>
  );
}

export default PostToSquadModal;
