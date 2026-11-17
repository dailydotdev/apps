import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks/useActions';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureGtaViTheme } from '../../lib/featureManagement';
import { cloudinaryViceCityCover } from '../../lib/image';
import { viceCityCoverOverlay } from '../../styles/custom';

export const useIsViceCityCoverActive = (): boolean => {
  const { isLoggedIn } = useAuthContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const isEligible =
    isLoggedIn &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.GtaViThemeDismissed);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureGtaViTheme,
    shouldEvaluate: isEligible,
  });

  return isEligible && isEnabled;
};

export const ViceCityCover = (): ReactElement | null => {
  const [isBroken, setIsBroken] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsFocused(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (isBroken) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={classNames(
        'pointer-events-none absolute inset-x-0 top-0 -z-1 transition-[opacity,filter,transform] duration-500 ease-out motion-reduce:transition-none',
        isFocused
          ? 'scale-100 opacity-100 blur-0'
          : 'scale-105 opacity-0 blur-md',
      )}
    >
      <img
        src={cloudinaryViceCityCover}
        alt=""
        onError={() => setIsBroken(true)}
        className="h-4 w-full object-cover object-[center_65%] tablet:h-64"
      />
      <span
        className="absolute inset-0"
        style={{ background: viceCityCoverOverlay }}
      />
      <span className="absolute inset-0 hidden bg-gradient-to-b from-transparent from-30% to-background-default to-90% tablet:block" />
    </div>
  );
};
