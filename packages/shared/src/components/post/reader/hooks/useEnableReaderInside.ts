import { useCallback } from 'react';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../modals/common/types';
import { LogEvent, TargetId } from '../../../../lib/log';
import { isBrowserExtensionInstalled } from '../../../../features/extensionEmbed/useIsBrowserExtensionInstalled';
import { requestFrameEmbeddingPermissionFromPage } from '../../../../features/extensionEmbed/pagePermissionBridge';

/**
 * Drives the "turn the reader on" flow from a user gesture (e.g. the settings
 * toggle). The embedded reader needs the extension installed AND the frame-
 * embedding permission granted, so enabling is never a plain flag write:
 *
 * - No extension → open the install modal (the user can't grant permission yet).
 * - Extension present → request the permission inline. `acknowledged` is only
 *   persisted once the grant actually lands, so a denied prompt leaves the
 *   reader off instead of stuck "enabled" without the access it needs.
 */
export function useEnableReaderInside(): { enable: () => void } {
  const { updateFlags } = useSettingsContext();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();

  const enable = useCallback(() => {
    if (!isBrowserExtensionInstalled()) {
      openModal({ type: LazyModal.ReaderExtensionInstall });
      return;
    }

    // Must run synchronously within the click so the content-script bridge
    // still has the click's transient user activation when it forwards the
    // permission request to the background.
    requestFrameEmbeddingPermissionFromPage().then(({ granted }) => {
      if (!granted) {
        return;
      }
      updateFlags({
        legacyPostLayoutOptOut: false,
        readerInstallPromptAcknowledged: true,
      });
      logEvent({
        event_name: LogEvent.ToggleEmbeddedReader,
        target_id: TargetId.On,
      });
    });
  }, [logEvent, openModal, updateFlags]);

  return { enable };
}
