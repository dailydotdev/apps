import React, { ReactElement, useContext } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { FlexRow } from '../utilities';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import OnboardingContext from '../../contexts/OnboardingContext';

const SharePostChecklistStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const { openModal } = useLazyModal();
  const { onInitializeOnboarding, showArticleOnboarding } =
    useContext(OnboardingContext);

  return (
    <ChecklistStep {...props}>
      <FlexRow className="gap-4">
        <Button
          variant={
            showArticleOnboarding
              ? ButtonVariant.Secondary
              : ButtonVariant.Primary
          }
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
        {showArticleOnboarding && (
          <Button
            variant={ButtonVariant.Primary}
            onClick={() => {
              onInitializeOnboarding();
            }}
          >
            Explore
          </Button>
        )}
      </FlexRow>
    </ChecklistStep>
  );
};

export { SharePostChecklistStep };
