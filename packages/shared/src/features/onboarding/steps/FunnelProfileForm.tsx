import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { LoggedUser, ProfileExtraField } from '../../../lib/user';
import { OnboardingHeadline } from '../../../components/onboarding/common';
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
import {
  useDecidedOnArrival,
  withShouldSkipStepGuard,
} from '../shared/withShouldSkipStepGuard';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
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
  const isOnboarding = useIsOnboardingFunnel();
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

  const fields = (
    <RegistrationFieldsForm
      formId={isOnboarding ? PROFILE_FORM_ID : undefined}
      // The form renders a read-only image preview whenever `image` is set, and
      // the picture is not editable here.
      initialValues={isOnboarding ? { ...user, image: undefined } : user}
      onSubmit={handleSubmit}
      errors={hint}
      onResetErrors={handleResetErrors}
      extraFields={extraFields}
      withExperienceLevel={!user.experienceLevel}
    />
  );

  // `RegistrationFieldsForm` renders its own submit here, so the CTA wrapper
  // would add a second, inert "Sign up".
  if (!isOnboarding) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
        <div className="z-1 flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
          {headline && (
            <Typography
              type={TypographyType.Title2}
              className="text-center"
              dangerouslySetInnerHTML={{ __html: headlineHtml }}
            />
          )}
          {fields}
        </div>
      </div>
    );
  }

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
        {fields}
      </div>
    </FunnelStepCtaWrapper>
  );
}

// `cloudProvider` is absent on purpose: boot does not carry it back, so a
// funnel that asks for it can never prove the answer is already on file.
const extraFieldToProfileField: Partial<
  Record<ProfileExtraField, keyof LoggedUser>
> = {
  company: 'company',
  jobTitle: 'title',
};

export const FunnelProfileForm = withShouldSkipStepGuard(
  withIsActiveGuard(InnerFunnelProfileForm),
  ({ isActive, parameters: { skipWhenComplete, extraFields = [] } }) => {
    const { user } = useAuthContext();
    const isComplete =
      !!user?.email &&
      !!user?.name &&
      !!user?.username &&
      !!user?.experienceLevel &&
      extraFields.every((field) => {
        const profileField = extraFieldToProfileField[field];

        return !!profileField && !!user?.[profileField];
      });
    // Submitting the form completes the profile, which must not hide the step
    // before its own transition runs.
    const shouldSkip = useDecidedOnArrival(isActive, isComplete);

    return { shouldSkip: !!skipWhenComplete && shouldSkip };
  },
);
