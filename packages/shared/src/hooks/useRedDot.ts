import usePersistentState from './usePersistentState';

export function useRedDot(key: string): [boolean, () => void] {
  const [showRedDot, setShowRedDot] = usePersistentState(key, null, true);

  const hideRedDot = (): void => {
    setShowRedDot(false);
  };

  return [showRedDot, hideRedDot];
}
