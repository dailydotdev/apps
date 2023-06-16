import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
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
        onClick={() => router.push(`/posts/${welcomePostId}/edit`)}
      >
        Customize
      </Button>
    </ChecklistStep>
  );
};

export { SquadEditWelcomePostChecklistStep };
