import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { OnboardingHeadline } from '../../../components/onboarding/common';
import type { RegistrationFieldsFormValues } from '../../../components/auth/RegistrationFieldsForm';
import RegistrationFieldsForm from '../../../components/auth/RegistrationFieldsForm';
import type { FunnelStepProfileForm } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import useProfileForm from '../../../hooks/useProfileForm';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  funnelStepRail,
  FunnelStepCtaWrapper,
  sanitizeMessage,
} from '../shared';

const PROFILE_FORM_ID = 'funnel-profile-form';

function InnerFunnelProfileForm({
  parameters: { headline, extraFields },
  onTransition,
}: FunnelStepProfileForm): ReactElement | null {
  const headlineHtml = useMemo(() => sanitizeMessage(headline), [headline]);
  const { user, refetchBoot } = useAuthContext();
  const { updateUserProfile, hint, onUpdateHint } = useProfileForm({
    onSuccess: async () => {
      await refetchBoot?.();
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
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: 'Sign up' }}
      form={PROFILE_FORM_ID}
      type="submit"
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        {headline && (
          <OnboardingHeadline
            dangerouslySetInnerHTML={{ __html: headlineHtml }}
          />
        )}
        <RegistrationFieldsForm
          formId={PROFILE_FORM_ID}
          // Everything from the user except the avatar: the form renders a
          // read-only image preview whenever `image` is set, and this step is
          // a field form like the signup wall, which shows no avatar. The
          // picture isn't editable here, so it was decoration taking the space
          // above the fields.
          initialValues={{ ...user, image: undefined }}
          onSubmit={handleSubmit}
          errors={hint}
          onResetErrors={handleResetErrors}
          extraFields={extraFields}
        />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelProfileForm = withIsActiveGuard(InnerFunnelProfileForm);
