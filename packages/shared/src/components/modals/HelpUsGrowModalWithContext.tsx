import React, { ReactElement, useContext, useMemo } from 'react';
import OnboardingContext from '../../contexts/OnboardingContext';
import dynamic from 'next/dynamic';

const HelpUsGrowModal = dynamic(() => import('./HelpUsGrowModal'));

export default function HelpUsGrowModalWithContext(): ReactElement {
  const { showReferral, closeReferral } = useContext(OnboardingContext);

  return useMemo(
    () => (
      <>
        {showReferral && (
          <HelpUsGrowModal isOpen={true} onRequestClose={closeReferral} />
        )}
      </>
    ),
    [showReferral, closeReferral],
  );
}
