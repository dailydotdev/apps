/* eslint-disable no-underscore-dangle -- __tcfapi is the IAB-mandated global */
import type * as TcfModuleType from './tcf';

type TcfListener = (tcData: Record<string, unknown>, success: boolean) => void;

type TcfModule = typeof TcfModuleType;

describe('tcf store', () => {
  let tcfListener: TcfListener | undefined;

  const loadStore = async (): Promise<TcfModule> => {
    jest.resetModules();
    const store = (await import('./tcf')) as TcfModule;
    store.startTcfSubscription();
    return store;
  };

  beforeEach(() => {
    tcfListener = undefined;
    document.cookie = 'euconsent-v2=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    (globalThis.window as { __tcfapi?: unknown }).__tcfapi = (
      command: string,
      version: number,
      callback: TcfListener,
    ) => {
      tcfListener = callback;
    };
  });

  afterEach(() => {
    delete (globalThis.window as { __tcfapi?: unknown }).__tcfapi;
  });

  it('updates the snapshot and notifies listeners on user action', async () => {
    const store = await loadStore();
    const listener = jest.fn();
    store.subscribeTcf(listener);

    tcfListener?.(
      {
        eventStatus: 'useractioncomplete',
        gdprApplies: true,
        tcString: 'tc-string',
        addtlConsent: '1~1.2',
      },
      true,
    );

    expect(store.getTcfSnapshot()).toEqual({
      gdprApplies: true,
      tcString: 'tc-string',
      addtlConsent: '1~1.2',
    });
    expect(listener).toHaveBeenCalled();
  });

  it('ignores unsuccessful callbacks and irrelevant event statuses', async () => {
    const store = await loadStore();

    tcfListener?.({ eventStatus: 'useractioncomplete', tcString: 'x' }, false);
    tcfListener?.({ eventStatus: 'cmpuishown', tcString: 'y' }, true);

    expect(store.getTcfSnapshot()).toBeUndefined();
  });

  it('does not subscribe when __tcfapi is absent', async () => {
    delete (globalThis.window as { __tcfapi?: unknown }).__tcfapi;
    const store = await loadStore();

    expect(tcfListener).toBeUndefined();
    expect(store.getTcfSnapshot()).toBeUndefined();
  });

  it('reads the stored tc string from the CMP euconsent-v2 cookie', async () => {
    const store = await loadStore();

    expect(store.getStoredTcString()).toBeUndefined();

    document.cookie = 'euconsent-v2=CQoHJkAQoHJkAAfG';
    expect(store.getStoredTcString()).toBe('CQoHJkAQoHJkAAfG');
  });
});
