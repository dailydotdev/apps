import {
  extensionSiteEmbedFrameEvent,
  extensionSiteEmbedParentOriginQueryParam,
  extensionSiteEmbedTargetQueryParam,
} from '@dailydotdev/shared/src/features/extensionEmbed/common';
import { createFrameCleanupController, initializeFrame } from './controller';
import {
  isDisableFrameMessage,
  resolveFrameParentOrigin,
  sendFrameMessageToParent,
} from './parentMessaging';
import { renderMessage } from './render';
import { parseFrameTarget } from './target';

const root = document.querySelector<HTMLDivElement>('#root');

if (!root) {
  throw new Error('Expected #root container for extension site embed frame');
}

const params = new URLSearchParams(window.location.search);
const rawTarget = params.get(extensionSiteEmbedTargetQueryParam);
const rawParentOrigin = params.get(extensionSiteEmbedParentOriginQueryParam);
const parentOrigin = resolveFrameParentOrigin(rawParentOrigin);
const frameCleanup = createFrameCleanupController();
const sendParentMessage = (type: string, detail: Record<string, string>) =>
  sendFrameMessageToParent({ parentOrigin, type, detail });

window.addEventListener('message', (event: MessageEvent) => {
  if (!isDisableFrameMessage(event, parentOrigin)) {
    return;
  }

  frameCleanup.disableEmbeddingForTab().catch(() => undefined);
});

window.addEventListener('pagehide', () => {
  frameCleanup.disableEmbeddingForTab().catch(() => undefined);
});

if (!rawTarget) {
  renderMessage(
    root,
    'Missing target URL',
    'Pass a target website in the query string, for example ?target=https%3A%2F%2Fexample.com.',
  );
  sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
    reason: 'missing-target',
  });
} else {
  const parsedTarget = parseFrameTarget(rawTarget);

  if (!parentOrigin) {
    renderMessage(
      root,
      'Unsupported host page',
      'This embedded browsing flow is only available on daily.dev surfaces.',
    );
    throw new Error('Unsupported parent origin for frame embedding');
  }

  if (parsedTarget.ok) {
    initializeFrame({
      root,
      target: parsedTarget.target,
      sendParentMessage,
      onEmbeddingEnabled: () => {
        frameCleanup.markEmbeddingEnabled();
      },
    }).catch(() => {
      renderMessage(
        root,
        'Failed to initialize',
        'Could not check extension permissions.',
      );
      sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
        reason: 'initialization-failed',
        target: parsedTarget.target.href,
      });
    });
  } else {
    const { reason } = parsedTarget as {
      reason: 'invalid-target' | 'unsupported-target-protocol';
    };

    renderMessage(
      root,
      reason === 'invalid-target'
        ? 'Invalid target URL'
        : 'Unsupported target URL',
      reason === 'invalid-target'
        ? 'The target value could not be parsed as a valid URL.'
        : 'Only HTTP and HTTPS targets can be embedded.',
    );
    sendParentMessage(extensionSiteEmbedFrameEvent.Error, {
      reason,
      target: rawTarget,
    });
    throw new Error(
      'Invalid target URL supplied to extension site embed frame',
    );
  }
}
