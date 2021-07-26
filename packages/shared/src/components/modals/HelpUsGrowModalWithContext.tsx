import React, { ReactElement, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import OnboardingContext from '../../contexts/OnboardingContext';

const HelpUsGrowModal = dynamic(() => import('./HelpUsGrowModal'));

export default function HelpUsGrowModalWithContext(): ReactElement {
  const { showReferral, closeReferral } = useContext(OnboardingContext);

  return useMemo(
    () => (
      <>
        {showReferral && (
          <HelpUsGrowModal isOpen onRequestClose={closeReferral} />
        )}
      </>
    ),
    [showReferral, closeReferral],
  );
}
