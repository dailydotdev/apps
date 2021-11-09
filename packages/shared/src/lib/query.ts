import { LoggedUser } from './user';

export const generateQueryKey = (
  name: string,
  user: Pick<LoggedUser, 'id'> | null,
  ...additional: unknown[]
): unknown[] => {
  return [name, user?.id ?? 'anonymous', ...additional];
};
