import {
  extensionSiteEmbedTargetEvent,
  extensionSiteEmbedTargetMessageSource,
  isDailyDevEmbedAncestor,
} from '@dailydotdev/shared/src/features/extensionEmbed/common';

const hasDailyDevEmbedAncestor = (): boolean => {
  const ancestors = window.location.ancestorOrigins;
  if (ancestors && ancestors.length > 0) {
    return Array.from(ancestors).some(isDailyDevEmbedAncestor);
  }

  if (!document.referrer) {
    return false;
  }

  try {
    return isDailyDevEmbedAncestor(new URL(document.referrer).origin);
  } catch {
    return false;
  }
};

// Runs in every iframe of every page (when the optional host permission is
// granted) and signals back to the parent webapp when the target document
// reaches DOMContentLoaded. This gives the reader modal a real "DOM ready"
// signal for cross-origin iframes — the iframe element's `load` event fires
// even for XFO-blocked navigations, so it can't be trusted on its own.
if (window.top !== window.self) {
  if (hasDailyDevEmbedAncestor()) {
    const post = () => {
      try {
        window.parent.postMessage(
          {
            source: extensionSiteEmbedTargetMessageSource,
            type: extensionSiteEmbedTargetEvent.DomReady,
            target: window.location.href,
          },
          // Parent validates the sender against the target iframe window, with
          // origin validation as a fallback, so a wildcard target is safe here.
          '*',
        );
      } catch {
        // postMessage is best-effort — never throw out of a content script.
      }
    };

    if (document.readyState !== 'loading') {
      post();
    } else {
      document.addEventListener('DOMContentLoaded', post, { once: true });
    }
  }
}
