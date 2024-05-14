import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { useFindSquadWelcomePost } from '../../hooks/useFindSquadWelcomePost';
import { useAuthContext } from '../../contexts/AuthContext';

const SquadFirstCommentChecklistStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const welcomePost = useFindSquadWelcomePost(squad);

  return (
    <ChecklistStep {...props}>
      <Button
        variant={ButtonVariant.Primary}
        disabled={!welcomePost}
        onClick={() => {
          router.push(
            `/posts/${welcomePost.id}?comment=${encodeURIComponent(
              `Hi my name is ${
                user?.name || user.username
              } happy to be here! I joined ${squad.name} because…`,
            )}`,
          );
        }}
      >
        Say hi 👋
      </Button>
    </ChecklistStep>
  );
};

export { SquadFirstCommentChecklistStep };
