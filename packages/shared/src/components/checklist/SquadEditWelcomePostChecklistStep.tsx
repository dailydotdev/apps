import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import EditIcon from '../icons/Edit';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useFindSquadWelcomePost } from '../../hooks/useFindSquadWelcomePost';
import { Squad } from '../../graphql/sources';
import usePostById from '../../hooks/usePostById';

const SquadEditWelcomePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepProps & { squad: Squad }): ReactElement => {
  const { openModal } = useLazyModal();
  const welcomePostId = useFindSquadWelcomePost(squad)?.id;
  const { post: welcomePost } = usePostById({
    id: welcomePostId,
  });

  return (
    <ChecklistStep {...props}>
      <Button
        className="btn-primary"
        disabled={!welcomePost}
        icon={<EditIcon />}
        onClick={() => {
          // TODO WT-1313-squad-welcome-post-checklist-steps we might need to open article
          // modal here first

          openModal({
            type: LazyModal.EditWelcomePost,
            props: { post: welcomePost },
          });
        }}
      >
        Customize
      </Button>
    </ChecklistStep>
  );
};

export { SquadEditWelcomePostChecklistStep };
