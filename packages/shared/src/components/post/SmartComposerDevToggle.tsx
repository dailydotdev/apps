import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import usePersistentContext from '../../hooks/usePersistentContext';
import { FORCE_SMART_COMPOSER_KEY } from '../../hooks/post/useSmartComposerEnabled';
import { isProductionAPI } from '../../lib/constants';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Tiny floating toggle (bottom-right) for QA/internal testing of the Smart
 * Composer experiment.
 *
 * - Only renders against non-production APIs (staging, local, preview).
 * - Persists its state in IndexedDB via `usePersistentContext`, shared with
 *   `useSmartComposerEnabled` so all entry points pick up the override.
 * - Never rendered for logged-out users (matches the experiment surface).
 */
export const SmartComposerDevToggle = (): ReactElement | null => {
  const { user } = useAuthContext();
  const [forceEnabled, setForceEnabled, isFetched] =
    usePersistentContext<boolean>(FORCE_SMART_COMPOSER_KEY, false);

  if (isProductionAPI || !user || !isFetched) {
    return null;
  }

  const isOn = !!forceEnabled;

  return (
    <button
      type="button"
      onClick={() => setForceEnabled(!isOn)}
      aria-pressed={isOn}
      title={
        isOn
          ? 'Smart Composer override is ON for this browser. Click to disable.'
          : 'Force-enable Smart Composer for this browser (internal only).'
      }
      className={classNames(
        'fixed bottom-4 right-4 z-popup flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-2 transition-colors typo-caption1',
        isOn
          ? 'border-accent-avocado-default bg-accent-avocado-default text-white hover:bg-accent-avocado-bolder'
          : 'border-border-subtlest-tertiary bg-surface-float text-text-tertiary hover:bg-surface-hover',
      )}
    >
      <span
        aria-hidden
        className={classNames(
          'h-2 w-2 rounded-full',
          isOn ? 'bg-white' : 'bg-text-tertiary',
        )}
      />
      Smart Composer · {isOn ? 'Forced ON' : 'Force OFF'}
    </button>
  );
};

export default SmartComposerDevToggle;
