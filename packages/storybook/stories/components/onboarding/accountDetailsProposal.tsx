import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { FunnelProfileForm } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelProfileForm';
import type { FunnelStepProfileForm } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

/**
 * Account details the way the identity steps need it, built around the
 * production step so the shared funnel code stays as it is. Engineering ports
 * both behaviours into `FunnelProfileForm` / `RegistrationFieldsForm`:
 *
 * - the experience dropdown is gone when the level is already on file, because
 *   the user-role step asked it (validation passes on the stored value)
 * - with `skipWhenComplete`, the step drops out when it has nothing left to ask
 *
 * Both are decided when the step is shown, so the user's own answers on the
 * form can't pull the dropdown or the whole step away mid-submit.
 */

export type ProposedProfileFormStep = FunnelStepProfileForm & {
  parameters: FunnelStepProfileForm['parameters'] & {
    skipWhenComplete?: boolean;
  };
};

const SCOPE = 'proposed-account-details';
const HIDE_EXPERIENCE_DROPDOWN = `.${SCOPE} div:has(> input[name="experienceLevel"]) { display: none; }`;

export const useDecidedOnArrival = (
  isActive: boolean | undefined,
  value: boolean,
): boolean => {
  const decisionRef = useRef<boolean>();

  if (isActive && decisionRef.current === undefined) {
    decisionRef.current = value;
  }

  return decisionRef.current ?? value;
};

export const ProposedFunnelProfileForm = (
  props: ProposedProfileFormStep,
): ReactElement | null => {
  const { isActive, type, onRegisterStepToSkip, parameters } = props;
  const { user } = useAuthContext();
  const callbackRef = useRef(onRegisterStepToSkip);
  callbackRef.current = onRegisterStepToSkip;
  const isComplete =
    !!user?.email &&
    !!user?.name &&
    !!user?.username &&
    !!user?.experienceLevel;
  const shouldSkip = useDecidedOnArrival(
    isActive,
    !!parameters.skipWhenComplete && isComplete,
  );
  const hidesExperience = useDecidedOnArrival(
    isActive,
    !!user?.experienceLevel,
  );

  useEffect(() => {
    callbackRef.current?.(type, shouldSkip);
  }, [shouldSkip, type]);

  if (shouldSkip) {
    return null;
  }

  return (
    <div className={hidesExperience ? `contents ${SCOPE}` : 'contents'}>
      {hidesExperience && <style>{HIDE_EXPERIENCE_DROPDOWN}</style>}
      <FunnelProfileForm {...props} />
    </div>
  );
};
