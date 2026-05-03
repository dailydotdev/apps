import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useSmartComposerEnabled } from '../../hooks/post/useSmartComposerEnabled';
import { useViewSize, ViewSize } from '../../hooks';
import { LazyModal } from '../modals/common/types';

/**
 * Global `c` keyboard shortcut to open the Smart Composer popup.
 * Mounted near the root of the app — only active when:
 *  - the user is logged in
 *  - we are on a desktop viewport
 *  - the feature flag is enabled
 *  - the user is not currently typing in another input
 */
export const SmartComposerHotkey = (): null => {
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { value: isEnabled } = useSmartComposerEnabled({
    shouldEvaluate: !!user && isLaptop,
  });

  const events = useMemo<[string, () => void][]>(() => {
    if (!isEnabled || !isLaptop || !user) {
      return [];
    }
    return [
      [
        'c',
        () => {
          const initialSquadHandle =
            router.route === '/squads/[handle]'
              ? (router.query.handle as string)
              : undefined;
          openModal({
            type: LazyModal.SmartComposer,
            props: { initialSquadHandle },
          });
        },
      ],
    ];
  }, [isEnabled, isLaptop, openModal, router.query.handle, router.route, user]);

  useKeyboardNavigation(typeof window === 'undefined' ? null : window, events, {
    disableOnTags: ['input', 'textarea', 'select'],
    disabledModalOpened: true,
  });

  return null;
};

export default SmartComposerHotkey;
