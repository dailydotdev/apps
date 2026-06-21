import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import { useReaderModalEligibility } from '../components/post/reader/hooks/useReaderModalEligibility';
import { useSettingsContext } from '../contexts/SettingsContext';

const READER_GATE_ELIGIBLE_TYPES = new Set<PostType>([
  PostType.Article,
  PostType.Digest,
  PostType.VideoYouTube,
]);

interface UseReaderInstallPromptGateOptions {
  /**
   * Optional close handler for the modal/page that owns the Read post
   * button (e.g. the classic post modal). Fired alongside the install
   * prompt's own close paths (X dismiss, "Don't ask again") so closing
   * the prompt also tears down the surface that opened it instead of
   * silently reverting to it.
   */
  onCloseParent?: () => void;
}

interface UseReaderInstallPromptGateResult {
  isGated: boolean;
  /**
   * Returns `true` when the gate intercepted the click and opened the
   * install prompt. Callers should skip their default behavior in that
   * case.
   */
  onReadClick: (event: MouseEvent) => boolean;
}

export function useReaderInstallPromptGate(
  post: Post | undefined,
  { onCloseParent }: UseReaderInstallPromptGateOptions = {},
): UseReaderInstallPromptGateResult {
  const { openModal } = useLazyModal();
  const { isEligible, isReaderEnabled, isReaderModalNudgeEnabled } =
    useReaderModalEligibility();
  const { flags, updateFlag } = useSettingsContext();
  const isInstallPromptSeen = flags?.readerInstallPromptSeen ?? false;

  // The reader_modal_v3 nudge surfaces the intermediate install prompt at most
  // once ever. After it has been seen we stop intercepting reads for users who
  // never enabled the reader and fall back to the default new-tab navigation.
  const canShowNudge = isReaderModalNudgeEnabled && !isInstallPromptSeen;

  const isGated =
    !!post &&
    isEligible &&
    READER_GATE_ELIGIBLE_TYPES.has(post.type) &&
    (isReaderEnabled || canShowNudge);

  const onReadClick = useCallback(
    (event: MouseEvent): boolean => {
      if (!isGated || !post) {
        return false;
      }
      // Preserve cmd/ctrl/shift/middle-click escape hatches so power users
      // can still open the article in a new tab without the prompt.
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
      // Users who already enabled the reader go straight to it. Everyone else
      // is here via the v3 nudge: show the intermediate prompt exactly once and
      // persist that it was seen so it never auto-opens again.
      if (isReaderEnabled) {
        openModal({
          type: LazyModal.ReaderPreview,
          props: { post, onCloseParent },
        });
      } else {
        updateFlag('readerInstallPromptSeen', true);
        openModal({
          type: LazyModal.ReaderInstallPrompt,
          props: { post, onCloseParent },
        });
      }
      return true;
    },
    [isGated, isReaderEnabled, onCloseParent, openModal, post, updateFlag],
  );

  return { isGated, onReadClick };
}
