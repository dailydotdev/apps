import type { ReactElement } from 'react';
import React from 'react';
import type { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { FlexRow } from '../utilities';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

const SharePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const { openModal } = useLazyModal();

  return (
    <ChecklistStep {...props}>
      <FlexRow className="gap-4">
        <Button
          variant={ButtonVariant.Primary}
          onClick={() => {
            openModal({
              type: LazyModal.CreateSharedPost,
              props: {
                squad,
                preview: { url: '' },
              },
            });
          }}
        >
          Create a post
        </Button>
      </FlexRow>
    </ChecklistStep>
  );
};

export { SharePostChecklistStep };
