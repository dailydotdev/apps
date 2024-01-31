import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import { ChecklistStep } from './ChecklistStep';
import { EditIcon } from '../icons';
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
