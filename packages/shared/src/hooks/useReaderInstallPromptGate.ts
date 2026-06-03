import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import { useReaderModalEligibility } from '../components/post/reader/hooks/useReaderModalEligibility';
import { useLegacyPostLayoutOptOut } from '../components/post/reader/hooks/useLegacyPostLayoutOptOut';
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
  const { isEligible, isReaderModalEnabled } = useReaderModalEligibility();
  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();
  const { flags } = useSettingsContext();
  const isInstallPromptAcknowledged =
    flags?.readerInstallPromptAcknowledged ?? false;

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
      // Once the user has accepted the install prompt, skip it on future reads
      // and route straight to the reader modal. The prompt only reappears if
      // the user dismissed it without picking an option.
      openModal({
        type: isInstallPromptAcknowledged
          ? LazyModal.ReaderPreview
          : LazyModal.ReaderInstallPrompt,
        props: { post, onCloseParent },
      });
      return true;
    },
    [isGated, isInstallPromptAcknowledged, onCloseParent, openModal, post],
  );

  return { isGated, onReadClick };
}
