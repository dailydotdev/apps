import type { LoggedUser } from './user';
import { CoresRole } from './user';

export const verifyCoresRole = (
  user: LoggedUser,
  coresRole: CoresRole,
): boolean => user?.coresRole === coresRole;

export const checkCoresRoleNotNone = (user: LoggedUser): boolean =>
  !verifyCoresRole(user, CoresRole.None);
