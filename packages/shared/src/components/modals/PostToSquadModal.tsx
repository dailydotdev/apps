import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { addPostToSquad, Squad, SquadForm } from '../../graphql/squads';
import { SquadComment } from '../squads/Comment';
import { ModalHeaderKind, ModalStep } from './common/types';
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

    displayToast('This post has been shared to your squad');
    await client.invalidateQueries(['sourceFeed', user.id]);
    onRequestClose(null);
  };

  const { mutateAsync: onPost, isLoading } = useMutation(addPostToSquad, {
    onSuccess: onPostSuccess,
  });

  const { mutateAsync: onSubmitLink, isLoading: isLinkLoading } = useMutation(
    submitExternalLink,
    { onSuccess: () => onPostSuccess() },
  );

  const onSubmit = async (
    e?: React.MouseEvent | React.KeyboardEvent,
    commentary?: string,
  ) => {
    e?.preventDefault();

    if (isLoading) return null;

    if (isLink) {
      return onSubmitLink({ url, sourceId: squad.id, commentary });
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
    >
      <Modal.Header
        title={shouldSkipHistory ? 'Post article' : 'Share post'}
        kind={ModalHeaderKind.Tertiary}
      />
      {shouldSkipHistory ? (
        <SquadComment
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading || isLinkLoading}
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
