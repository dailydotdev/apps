// jsdom's Blob cannot be structured-cloned into fake-indexeddb, so a spec that
// stores one swaps idb-keyval for a Map:
// jest.mock('idb-keyval', () => jest.requireActual('<helpers>/idbKeyval').idbKeyvalMock());
export const mockIdbStore = new Map<string, unknown>();

export const idbKeyvalMock = (): Record<string, unknown> => ({
  ...jest.requireActual('idb-keyval'),
  get: async (key: string) => mockIdbStore.get(key),
  set: async (key: string, value: unknown) => {
    mockIdbStore.set(key, value);
  },
  del: async (key: string) => {
    mockIdbStore.delete(key);
  },
});
