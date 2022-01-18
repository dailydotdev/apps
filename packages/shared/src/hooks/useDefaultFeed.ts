import usePersistentContext from './usePersistentContext';

export default function useDefaultFeed(
  shouldShowMyFeed: boolean,
): [string, (value: string) => Promise<void>] {
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    shouldShowMyFeed ? 'my-feed' : 'popular',
    ['my-feed', 'popular', 'upvoted', 'discussed'],
  );

  return [defaultFeed, updateDefaultFeed];
}
