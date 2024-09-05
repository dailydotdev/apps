import React, { ReactElement } from 'react';

import { useFindSquadWelcomePost } from '../../hooks/useFindSquadWelcomePost';
import usePostById from '../../hooks/usePostById';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { EditIcon } from '../icons';
import { ChecklistStep } from './ChecklistStep';

const SquadEditWelcomePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const welcomePostId = useFindSquadWelcomePost(squad)?.id;
  const { post: welcomePost } = usePostById({
    id: welcomePostId,
  });

  return (
    <ChecklistStep {...props}>
      <div className="flex">
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          disabled={!welcomePost}
          icon={<EditIcon />}
          href={`/posts/${welcomePost?.id}/edit`}
        >
          Customize
        </Button>
      </div>
    </ChecklistStep>
  );
};

export { SquadEditWelcomePostChecklistStep };
