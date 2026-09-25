import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { FunnelStepUserRole, FunnelUserRoleOption } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '../../common/components/FormInputCheckboxGroup';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '../shared/FunnelStepCtaWrapper';
import { sanitizeMessage } from '../lib/utils';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import useProfileForm from '../../../hooks/useProfileForm';

const DEFAULT_HEADLINE = 'Who are you?';

// Picking it answers the question without putting a job title on the profile.
const OTHER_ROLE = 'Other';

// `value` lands on the profile as the job title, so it is written as one.
const DEFAULT_USER_ROLES: FunnelUserRoleOption[] = [
  { value: 'Software engineer', label: 'Software engineer' },
  { value: 'Engineering manager', label: 'Engineering manager' },
  { value: 'Founder', label: 'Founder' },
  { value: 'DevOps engineer', label: 'DevOps engineer' },
  { value: 'AI engineer', label: 'AI engineer' },
  { value: 'Data engineer', label: 'Data engineer' },
  { value: 'Student', label: 'Student' },
  { value: 'Product manager', label: 'Product manager' },
  { value: 'Designer', label: 'Designer' },
  { value: OTHER_ROLE, label: 'Something else' },
];

function FunnelUserRoleComponent({
  id,
  parameters: { headline, explainer, cta, roles },
  onTransition,
}: FunnelStepUserRole): ReactElement | null {
  const { user } = useAuthContext();
  const [selectedRole, setSelectedRole] = useState<FunnelUserRoleOption>();
  const options = roles?.length ? roles : DEFAULT_USER_ROLES;
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );

  const complete = useCallback(
    (role: string) =>
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { role },
      }),
    [onTransition],
  );

  // The title is a profile nicety, not something the funnel should stall on.
  const { updateUserProfile, isLoading } = useProfileForm({
    onError: () => selectedRole && complete(selectedRole.value),
  });

  const onContinue = useCallback(() => {
    if (!selectedRole) {
      return;
    }

    if (selectedRole.value === OTHER_ROLE) {
      complete(selectedRole.value);
      return;
    }

    updateUserProfile({
      title: selectedRole.value,
      // No `refetchBoot`: the hook already merges the title into the boot
      // cache, and a refetch would only delay the transition.
      onUpdateSuccess: () => complete(selectedRole.value),
    });
  }, [complete, selectedRole, updateUserProfile]);

  if (!user) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      isGlass
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
      cta={{ label: cta }}
      disabled={!selectedRole}
      loading={isLoading}
      onClick={onContinue}
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <OnboardingHeadline
          dangerouslySetInnerHTML={{ __html: headlineHtml }}
        />
        {!!explainer && (
          <OnboardingSubheadline>{explainer}</OnboardingSubheadline>
        )}
        <div className="w-full">
          <FormInputCheckboxGroup
            behaviour={CheckboxGroupBehaviour.Radio}
            name={id}
            onValueChange={(input) =>
              setSelectedRole(
                options.find(({ value }) => value === input.at(-1)),
              )
            }
            options={options}
          />
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
}

// A title already on the profile (e.g. from the signup form's extra fields)
// is kept rather than replaced by a broader role.
export const FunnelUserRole = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelUserRoleComponent),
  () => {
    const { user } = useAuthContext();

    return { shouldSkip: !!user?.title };
  },
);
