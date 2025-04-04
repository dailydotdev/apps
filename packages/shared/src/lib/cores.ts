import { isNullOrUndefined } from './func';
import type { LoggedUser } from './user';
import { CoresRole } from './user';

export const verifyCoresRole = (
  user: LoggedUser,
  coresRole: CoresRole,
): boolean => user?.coresRole === coresRole;

export function hasAccessToCores(user: LoggedUser): boolean {
  if (isNullOrUndefined(user?.coresRole)) {
    return false;
  }

  return !verifyCoresRole(user, CoresRole.None);
}

export function canReceiveCores(user: LoggedUser): boolean {
  return verifyCoresRole(user, CoresRole.Creator);
}

export function showAwardButton({
  sendingUser,
  receivingUser,
}: {
  sendingUser: LoggedUser;
  receivingUser: LoggedUser;
}): boolean {
  return hasAccessToCores(sendingUser) && canReceiveCores(receivingUser);
}
