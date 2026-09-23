import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  sanitizeMessage,
} from '../shared';
import { FunnelStepTopBar } from '../shared/FunnelStepTopBar';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  useDecidedOnArrival,
  withShouldSkipStepGuard,
} from '../shared/withShouldSkipStepGuard';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { UserExperienceLevelKey } from '../../../components/auth/RegistrationFieldsForm';
import { useAuthContext } from '../../../contexts/AuthContext';
import useProfileForm from '../../../hooks/useProfileForm';
import {
  RecruiterUserExperienceLevel,
  UserExperienceLevel,
} from '../../../lib/user';

const DEFAULT_HEADLINE = 'Who are you?';
const DEFAULT_EXPERIENCE_HEADLINE = 'How long have you been doing this?';

const NON_ENGINEER: UserExperienceLevelKey = 'NOT_ENGINEER';

// `value` lands on the profile as the job title, so it is written as one.
export const DEFAULT_USER_ROLES: FunnelUserRoleOption[] = [
  { value: 'Developer', label: 'Developer', isTechnical: true },
  {
    value: 'Engineering leader',
    label: 'Engineering leader',
    isTechnical: true,
  },
  { value: 'DevOps engineer', label: 'DevOps & platform', isTechnical: true },
  { value: 'Data scientist', label: 'Data & ML', isTechnical: true },
  { value: 'Student', label: 'Student', isTechnical: true },
  { value: 'Founder', label: 'Founder' },
  { value: 'Product manager', label: 'Product manager' },
  { value: 'Designer', label: 'Designer' },
  { value: 'Other', label: 'Something else' },
];

/**
 * `UserExperienceLevel`'s labels are written for engineers — "Aspiring
 * engineer", "I've suffered enough" — so a designer is asked a question about
 * a job they don't have. Non-engineering roles get the neutral year labels the
 * recruiter platform already uses for the same keys.
 */
const getExperienceOptions = (role: FunnelUserRoleOption) => {
  const labels = role.isTechnical
    ? UserExperienceLevel
    : RecruiterUserExperienceLevel;

  return Object.entries(labels)
    .filter(([value]) => value !== NON_ENGINEER)
    .map(([value, label]) => ({ label, value }));
};

/**
 * `experienceLevel` means *engineering* experience: `NOT_ENGINEER` is what
 * gates the `engineer_signup` conversion events in `PixelsContext`. A
 * non-engineering role has to keep that value, so its years answer travels in
 * the transition details instead of overwriting it.
 */
const getProfileExperienceLevel = (
  role: FunnelUserRoleOption,
  level: UserExperienceLevelKey,
): UserExperienceLevelKey => (role.isTechnical ? level : NON_ENGINEER);

function FunnelUserRoleComponent({
  id,
  parameters: { headline, explainer, cta, roles, experience },
  onTransition,
}: FunnelStepUserRole): ReactElement | null {
  const { user } = useAuthContext();
  const [role, setRole] = useState<FunnelUserRoleOption>();
  const [level, setLevel] = useState<UserExperienceLevelKey>();
  const options = roles?.length ? roles : DEFAULT_USER_ROLES;
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );
  const { updateUserProfile, isLoading } = useProfileForm();

  // Each pane is a screen of its own, so it opens where the first one did
  // rather than at whatever offset the roles were scrolled to.
  useEffect(() => {
    globalThis.scrollTo?.({ top: 0 });
  }, [role]);

  const onPickRole = useCallback(
    (input: string[]) => {
      setRole(options.find(({ value }) => value === input.at(-1)));
      setLevel(undefined);
    },
    [options],
  );

  const onSubmit = useCallback(() => {
    if (!role || !level) {
      return;
    }

    const details = { role: role.value, experienceLevel: level };

    updateUserProfile({
      title: role.value,
      experienceLevel: getProfileExperienceLevel(role, level),
      // No `refetchBoot`: the hook already merges these two fields into the
      // boot cache, and a refetch would only delay the transition.
      onUpdateSuccess: () =>
        onTransition({ type: FunnelStepTransitionType.Complete, details }),
    });
  }, [level, onTransition, role, updateUserProfile]);

  if (!user) {
    return null;
  }

  // Picking a role is the transition, so there is nothing for a CTA to do and
  // the top bar is rendered on its own — the same shape `FunnelQuiz` takes for
  // a single-choice question.
  if (!role) {
    return (
      <div className="relative flex flex-1 flex-col gap-4">
        <FunnelStepTopBar />
        <div
          className={classNames(
            funnelStepRail,
            'z-1 flex flex-1 flex-col items-center gap-6 py-6 pt-3',
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
              onValueChange={onPickRole}
              options={options}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FunnelStepCtaWrapper
      isGlass
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
      cta={{ label: cta }}
      disabled={!level}
      loading={isLoading}
      onClick={onSubmit}
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <OnboardingHeadline>
          {experience?.headline || DEFAULT_EXPERIENCE_HEADLINE}
        </OnboardingHeadline>
        <div className="flex items-center gap-1">
          <Typography
            color={TypographyColor.Secondary}
            type={TypographyType.Body}
          >
            {role.label}
          </Typography>
          <Button
            onClick={() => setRole(undefined)}
            size={ButtonSize.XSmall}
            type="button"
            variant={ButtonVariant.Subtle}
          >
            Change
          </Button>
        </div>
        <div className="w-full">
          <FormInputCheckboxGroup
            behaviour={CheckboxGroupBehaviour.Radio}
            name={`${id}-experience`}
            onValueChange={(input) =>
              setLevel(input.at(-1) as UserExperienceLevelKey)
            }
            options={getExperienceOptions(role)}
          />
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelUserRole = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelUserRoleComponent),
  ({ isActive }) => {
    const { user } = useAuthContext();
    const shouldSkip = useDecidedOnArrival(
      isActive,
      !!user?.experienceLevel && !!user?.title,
    );

    return { shouldSkip };
  },
);
