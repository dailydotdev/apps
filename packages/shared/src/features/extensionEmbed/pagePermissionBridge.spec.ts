import {
  pagePermissionBridgeRequestEvent,
  pagePermissionBridgeResultEvent,
  requestFrameEmbeddingPermissionFromPage,
} from './pagePermissionBridge';
import type { PagePermissionBridgeResult } from './pagePermissionBridge';

const dispatchResult = (detail: PagePermissionBridgeResult): void => {
  window.dispatchEvent(
    new CustomEvent<PagePermissionBridgeResult>(
      pagePermissionBridgeResultEvent,
      { detail },
    ),
  );
};

describe('requestFrameEmbeddingPermissionFromPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dispatches the request event synchronously to preserve user activation', () => {
    const onRequest = jest.fn();
    window.addEventListener(pagePermissionBridgeRequestEvent, onRequest);

    requestFrameEmbeddingPermissionFromPage();

    expect(onRequest).toHaveBeenCalledTimes(1);
    window.removeEventListener(pagePermissionBridgeRequestEvent, onRequest);
  });

  it('resolves with the granted result from the content script', async () => {
    const promise = requestFrameEmbeddingPermissionFromPage();

    dispatchResult({ granted: true });

    await expect(promise).resolves.toEqual({
      granted: true,
      error: undefined,
    });
  });

  it('resolves with a timeout error when no content script answers', async () => {
    const promise = requestFrameEmbeddingPermissionFromPage();

    jest.runAllTimers();

    await expect(promise).resolves.toEqual({
      granted: false,
      error: 'timeout',
    });
  });

  it('ignores late results after the timeout already settled the promise', async () => {
    const promise = requestFrameEmbeddingPermissionFromPage();

    jest.runAllTimers();
    dispatchResult({ granted: true });

    await expect(promise).resolves.toEqual({
      granted: false,
      error: 'timeout',
    });
  });
});
