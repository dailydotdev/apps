export default function Storage(): void {
  const inMemoryStorage: { [key: string]: string } = {};

  function isLocalStorageEnabled() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function getItem(key: string) {
    if (isLocalStorageEnabled()) {
      return localStorage.getItem(key);
    }
    return inMemoryStorage[key];
  }

  function setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  return {
    getItem,
    setItem,
  };
}
export const storageWrapper = Storage();
