import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import type { RegistrationFieldsFormValues } from '../../../components/auth/RegistrationFieldsForm';
import RegistrationFieldsForm from '../../../components/auth/RegistrationFieldsForm';
import type { FunnelStepProfileForm } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import useProfileForm from '../../../hooks/useProfileForm';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function InnerFunnelProfileForm({
  parameters: { headline },
  onTransition,
}: FunnelStepProfileForm): ReactElement {
  const { user, refetchBoot } = useAuthContext();
  const { updateUserProfile, hint, onUpdateHint } = useProfileForm({
    onSuccess: async () => {
      await refetchBoot();
      onTransition({ type: FunnelStepTransitionType.Complete });
    },
  });

  // Wrap onUpdateHint to clear only the error for the given field
  const handleResetErrors = (field?: string) => {
    if (field && onUpdateHint) {
      onUpdateHint({ [field]: '' });
    }
  };

  if (!user) {
    return null;
  }

  const handleSubmit = ({
    optOutMarketing,
    ...profile
  }: Omit<RegistrationFieldsFormValues, 'image'>) => {
    updateUserProfile({
      ...profile,
      acceptedMarketing: !optOutMarketing,
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="z-1 flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
        <Typography
          type={TypographyType.Title2}
          className="text-center"
          dangerouslySetInnerHTML={{ __html: headline }}
        />
        <RegistrationFieldsForm
          initialValues={user}
          onSubmit={handleSubmit}
          errors={hint}
          onResetErrors={handleResetErrors}
        />
      </div>
    </div>
  );
}

export const FunnelProfileForm = withIsActiveGuard(InnerFunnelProfileForm);
