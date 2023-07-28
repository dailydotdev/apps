import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { Squad } from '../../graphql/sources';
import { useFindSquadWelcomePost } from '../../hooks/useFindSquadWelcomePost';
import { useAuthContext } from '../../contexts/AuthContext';

const SquadFirstCommentChecklistStep = ({
  squad,
  ...props
}: ChecklistStepProps & { squad: Squad }): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const welcomePost = useFindSquadWelcomePost(squad);

  return (
    <ChecklistStep {...props}>
      <Button
        className="btn-primary"
        disabled={!welcomePost}
        onClick={() => {
          router.push(
            `/posts/${welcomePost.id}?comment=Hi my name is ${
              user?.name || user.username
            } happy to be here! I joined ${squad.name} because…`,
          );
        }}
      >
        Say hi 👋
      </Button>
    </ChecklistStep>
  );
};

export { SquadFirstCommentChecklistStep };
