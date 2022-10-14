import usePersistentContext from './usePersistentContext';

export default function useDefaultFeed(): [
  string,
  (value: string) => Promise<void>,
] {
  const [defaultFeed, updateDefaultFeed] = usePersistentContext(
    'defaultFeed',
    'my-feed',
    ['my-feed', 'popular', 'upvoted', 'discussed'],
  );

  return [defaultFeed, updateDefaultFeed];
}
