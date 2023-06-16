import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import EditIcon from '../icons/Edit';
import { useFindSquadWelcomePost } from '../../hooks/useFindSquadWelcomePost';
import { Squad } from '../../graphql/sources';
import usePostById from '../../hooks/usePostById';

const SquadEditWelcomePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepProps & { squad: Squad }): ReactElement => {
  const welcomePostId = useFindSquadWelcomePost(squad)?.id;
  const { post: welcomePost } = usePostById({
    id: welcomePostId,
  });

  return (
    <ChecklistStep {...props}>
      <div className="flex">
        <Button
          tag="a"
          className="btn-primary"
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
