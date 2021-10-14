import usePersistentState from './usePersistentState';

export function useRedDot(
  key: string,
  emptyValue?: boolean | string | null,
): [boolean | string | null, (value) => Promise<void>] {
  const [shouldShowRedDot, setShouldShowRedDot] = usePersistentState(
    key,
    null,
    emptyValue,
  );

  return [shouldShowRedDot, setShouldShowRedDot];
}
