import { LoggedUser } from './user';

export type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;

export const generateQueryKey = (
  name: string | RequestKey,
  user: Pick<LoggedUser, 'id'> | null,
  ...additional: unknown[]
): unknown[] => {
  return [name, user?.id ?? 'anonymous', ...additional];
};

export enum RequestKey {
  Bookmarks = 'bookmarks',
}
