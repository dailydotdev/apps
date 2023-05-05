import React, { ReactElement } from 'react';
import { ChecklistStepProps } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { FlexRow } from '../utilities';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

const SharePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepProps & { squad: Squad }): ReactElement => {
  const { openModal } = useLazyModal();
  const { completeAction } = useActions();

  return (
    <ChecklistStep {...props}>
      <FlexRow className="gap-4">
        <Button
          className="btn-secondary"
          onClick={() => {
            openModal({
              type: LazyModal.PostToSquad,
              props: {
                ...props,
                squad,
                preview: { url: '' },
                onSharedSuccessfully: () => {
                  completeAction(ActionType.SquadFirstPost);
                },
              },
            });
          }}
        >
          Create a post
        </Button>
        <Button className="btn-primary">Explore</Button>
      </FlexRow>
    </ChecklistStep>
  );
};

export { SharePostChecklistStep };
