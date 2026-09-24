import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { FunnelStepUserRole, FunnelUserRoleOption } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import type { CheckboxItem } from '../../common/components/FormInputCheckboxGroup';
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
import type { LoggedUser } from '../../../lib/user';
import { RecruiterUserExperienceLevel } from '../../../lib/user';

const DEFAULT_HEADLINE = 'Who are you?';
const DEFAULT_EXPERIENCE_HEADLINE = 'How long have you been doing this?';

const NON_ENGINEER: UserExperienceLevelKey = 'NOT_ENGINEER';

// `value` lands on the profile as the job title, so it is written as one.
const DEFAULT_USER_ROLES: FunnelUserRoleOption[] = [
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

// One set for every role: the level names without the engineering wording,
// and the years set apart so the rows scan by level.
const EXPERIENCE_LEVELS: Array<{
  value: UserExperienceLevelKey;
  label: string;
}> = [
  { value: 'LESS_THAN_1_YEAR', label: 'Aspiring' },
  { value: 'MORE_THAN_1_YEAR', label: 'Entry-level' },
  { value: 'MORE_THAN_2_YEARS', label: 'Mid-level' },
  { value: 'MORE_THAN_4_YEARS', label: 'Experienced' },
  { value: 'MORE_THAN_6_YEARS', label: 'Highly experienced' },
  { value: 'MORE_THAN_10_YEARS', label: "I've suffered enough" },
];

const EXPERIENCE_OPTIONS: CheckboxItem[] = EXPERIENCE_LEVELS.map(
  ({ value, label }) => ({
    value,
    label,
    hint: RecruiterUserExperienceLevel[value],
  }),
);

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
  const { user, updateUser } = useAuthContext();
  const [selectedRole, setSelectedRole] = useState<FunnelUserRoleOption>();
  const [role, setRole] = useState<FunnelUserRoleOption>();
  const [level, setLevel] = useState<UserExperienceLevelKey>();
  const options = roles?.length ? roles : DEFAULT_USER_ROLES;
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );
  const pendingAnswerRef = useRef<{
    profile: Pick<LoggedUser, 'title' | 'experienceLevel'>;
    details: { role: string; experienceLevel: UserExperienceLevelKey };
  }>();
  // The API rejects a profile update from a user with no username or name
  // unless the same request supplies them, which only account details asks
  // for. Keep the answers on the local profile, so that step saves them along
  // with the username, rather than stranding the user here.
  const { updateUserProfile, isLoading } = useProfileForm({
    onError: () => {
      const pending = pendingAnswerRef.current;

      if (!user || !pending) {
        return;
      }

      updateUser({ ...user, ...pending.profile });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: pending.details,
      });
    },
  });
  // Email signups already picked a level on the registration form, so for them
  // the role is the only new question.
  const [levelOnFile] = useState(() => user?.experienceLevel);

  // Each pane is a screen of its own, so it opens where the first one did
  // rather than at whatever offset the roles were scrolled to.
  const showPane = useCallback((nextRole?: FunnelUserRoleOption) => {
    setRole(nextRole);
    setLevel(undefined);
    globalThis.scrollTo?.({ top: 0 });
  }, []);

  const complete = useCallback(
    (picked: FunnelUserRoleOption, pickedLevel: UserExperienceLevelKey) => {
      const profile = {
        title: picked.value,
        ...(!levelOnFile && {
          experienceLevel: getProfileExperienceLevel(picked, pickedLevel),
        }),
      };
      const details = { role: picked.value, experienceLevel: pickedLevel };
      pendingAnswerRef.current = { profile, details };

      updateUserProfile({
        ...profile,
        // No `refetchBoot`: the hook already merges these fields into the boot
        // cache, and a refetch would only delay the transition.
        onUpdateSuccess: () =>
          onTransition({ type: FunnelStepTransitionType.Complete, details }),
      });
    },
    [levelOnFile, onTransition, updateUserProfile],
  );

  const onContinue = useCallback(() => {
    if (role) {
      if (level) {
        complete(role, level);
      }
      return;
    }

    if (!selectedRole) {
      return;
    }

    if (levelOnFile) {
      complete(selectedRole, levelOnFile);
      return;
    }

    showPane(selectedRole);
  }, [complete, level, levelOnFile, role, selectedRole, showPane]);

  if (!user) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      isGlass
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
      cta={{ label: cta }}
      disabled={role ? !level : !selectedRole}
      loading={isLoading}
      onClick={onContinue}
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        {role ? (
          <>
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
                onClick={() => showPane()}
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
                key="experience"
                name={`${id}-experience`}
                onValueChange={(input) =>
                  setLevel(input.at(-1) as UserExperienceLevelKey)
                }
                options={EXPERIENCE_OPTIONS}
              />
            </div>
          </>
        ) : (
          <>
            <OnboardingHeadline
              dangerouslySetInnerHTML={{ __html: headlineHtml }}
            />
            {!!explainer && (
              <OnboardingSubheadline>{explainer}</OnboardingSubheadline>
            )}
            <div className="w-full">
              <FormInputCheckboxGroup
                behaviour={CheckboxGroupBehaviour.Radio}
                defaultValue={selectedRole ? [selectedRole.value] : []}
                key="roles"
                name={id}
                onValueChange={(input) =>
                  setSelectedRole(
                    options.find(({ value }) => value === input.at(-1)),
                  )
                }
                options={options}
              />
            </div>
          </>
        )}
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
