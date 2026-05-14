import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import type { Post } from '../graphql/posts';
import { useReaderModalEligibility } from '../components/post/reader/hooks/useReaderModalEligibility';
import { PostType } from '../graphql/posts';
import { useLegacyPostLayoutOptOut } from '../components/post/reader/hooks/useLegacyPostLayoutOptOut';

const READER_GATE_ELIGIBLE_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.Digest,
  PostType.VideoYouTube,
]);

interface UseReaderInstallPromptGateResult {
  isGated: boolean;
  /**
   * Returns `true` when the gate has intercepted the click and opened the
   * install prompt; the caller should then skip its default click behavior.
   * Returns `false` otherwise (gate inactive, modifier keys, non-eligible
   * post) so the caller can fall through to its normal handler.
   */
  onReadClick: (event: MouseEvent) => boolean;
}

/**
 * DEMO ONLY: gate the "Read post" click on eligible posts behind the new
 * install-extension prompt. Replaces the default browser navigation with the
 * `LazyModal.ReaderInstallPrompt` flow so the user can preview the next-step
 * UX without installing.
 *
 * The hook never swallows modifier-key clicks (cmd / ctrl / middle-click)
 * so users can still open the article in a new tab if they want to.
 */
export function useReaderInstallPromptGate(
  post: Post | undefined,
): UseReaderInstallPromptGateResult {
  const { openModal } = useLazyModal();
  const { isEligible, isReaderModalEnabled } = useReaderModalEligibility();
  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();

  const isGated =
    !!post &&
    isEligible &&
    isReaderModalEnabled &&
    !isLegacyLayoutOptedOut &&
    READER_GATE_ELIGIBLE_TYPES.has(post.type);

  const onReadClick = useCallback(
    (event: MouseEvent): boolean => {
      if (!isGated || !post) {
        return false;
      }
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.button > 0
      ) {
        return false;
      }
      event.preventDefault();
      event.stopPropagation();
      openModal({
        type: LazyModal.ReaderInstallPrompt,
        props: { post },
      });
      return true;
    },
    [isGated, openModal, post],
  );

  return { isGated, onReadClick };
}
