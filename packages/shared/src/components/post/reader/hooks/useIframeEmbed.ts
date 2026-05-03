import { useMemo, useState } from 'react';
import { isEmbeddableSiteTarget } from '../../../../features/extensionEmbed/common';
import { getBrowserExtensionInstallId } from '../../../../features/extensionEmbed/getBrowserExtensionInstallId';

export type IframeEmbedState = {
  extensionId: string | null;
  targetUrl: string | null;
  isEmbeddable: boolean;
};

export function useIframeEmbed(
  permalink: string | undefined,
): IframeEmbedState {
  const [extensionId] = useState(() => getBrowserExtensionInstallId());

  return useMemo(() => {
    if (!permalink) {
      return {
        extensionId,
        targetUrl: null,
        isEmbeddable: false,
      };
    }

    return {
      extensionId,
      targetUrl: permalink,
      isEmbeddable: isEmbeddableSiteTarget(permalink),
    };
  }, [extensionId, permalink]);
}
