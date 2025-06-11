import type { Squad } from '../../graphql/sources';
import type { Action } from '../../graphql/actions';
import { ActionType } from '../../graphql/actions';
import { cloudinarySquadsImageFallback } from '../../lib/image';

export const getEditActions = (squad: Squad): Action[] => {
  const isComplete =
    !!squad.name &&
    !!squad.description &&
    !!squad.image &&
    squad.image !== cloudinarySquadsImageFallback;
  return isComplete
    ? [{ type: ActionType.EditSquad, completedAt: new Date() }]
    : [];
};
