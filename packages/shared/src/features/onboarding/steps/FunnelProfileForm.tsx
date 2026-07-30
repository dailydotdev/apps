import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
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

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: 'Sign up' }}
      // Only the onboarding arm docks the submit in the CTA rail; leaving the
      // form id off keeps the paid funnel's own submit button inside the form.
      {...(isOnboarding && { form: PROFILE_FORM_ID, type: 'submit' as const })}
      containerClassName={
        isOnboarding
          ? 'flex w-full flex-1 flex-col items-center overflow-hidden'
          : 'flex w-full flex-1 flex-col items-center justify-center overflow-hidden'
      }
    >
      <div
        className={
          isOnboarding
            ? classNames(
                funnelStepRail,
                'z-1 flex flex-col items-center gap-6 py-6 pt-3',
              )
            : 'z-1 flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96'
        }
      >
        {headline &&
          (isOnboarding ? (
            <OnboardingHeadline
              dangerouslySetInnerHTML={{ __html: headlineHtml }}
            />
          ) : (
            <Typography
              type={TypographyType.Title2}
              className="text-center"
              dangerouslySetInnerHTML={{ __html: headlineHtml }}
            />
          ))}
        <RegistrationFieldsForm
          formId={isOnboarding ? PROFILE_FORM_ID : undefined}
          // Everything from the user except the avatar: the form renders a
          // read-only image preview whenever `image` is set, and this step is
          // a field form like the signup wall, which shows no avatar. The
          // picture isn't editable here, so it was decoration taking the space
          // above the fields.
          initialValues={isOnboarding ? { ...user, image: undefined } : user}
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
