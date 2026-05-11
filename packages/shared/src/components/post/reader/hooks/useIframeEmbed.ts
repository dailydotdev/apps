import { useMemo, useState } from 'react';
import { isEmbeddableSiteTarget } from '../../../../features/extensionEmbed/common';
import { getBrowserExtensionInstallId } from '../../../../features/extensionEmbed/getBrowserExtensionInstallId';
import { isExtensionCapableBrowser } from '../../../../lib/func';

export type IframeEmbedState = {
  extensionId: string | null;
  targetUrl: string | null;
  isEmbeddable: boolean;
};

export function useIframeEmbed(
  permalink: string | undefined,
): IframeEmbedState {
  // The id can change mid-session when the extension's content script stamps
  // the html marker after install, so seed once and let the boot probe push
  // updates through a separate effect upstream.
  const [extensionId] = useState(() => getBrowserExtensionInstallId());
  const isBrowserSupported = isExtensionCapableBrowser();

  return useMemo(() => {
    if (!permalink || !isBrowserSupported) {
      return {
        extensionId,
        targetUrl: permalink ?? null,
        isEmbeddable: false,
      };
    }

    return {
      extensionId,
      targetUrl: permalink,
      isEmbeddable: isEmbeddableSiteTarget(permalink),
    };
  }, [extensionId, isBrowserSupported, permalink]);
}
