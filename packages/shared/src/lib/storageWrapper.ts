export default function Storage(): Partial<Storage> {
  const inMemoryStorage: { [key: string]: string } = {};

  function isLocalStorageEnabled() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function getItem(key: string): string | null {
    if (isLocalStorageEnabled()) {
      return localStorage.getItem(key);
    }
    return inMemoryStorage[key];
  }

  function setItem(key: string, value: string): void {
    if (isLocalStorageEnabled()) {
      localStorage.setItem(key, value);
    } else {
      inMemoryStorage[key] = value;
    }
  }

  return {
    getItem,
    setItem,
  };
}
export const storageWrapper = Storage();
