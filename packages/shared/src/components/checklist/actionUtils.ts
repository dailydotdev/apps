import { Squad } from '../../graphql/sources';
import { Action, ActionType } from '../../graphql/actions';
import { cloudinary } from '../../lib/image';

export const getEditActions = (squad: Squad): Action[] => {
  const isComplete =
    !!squad.name &&
    !!squad.description &&
    !!squad.image &&
    squad.image !== cloudinary.squads.imageFallback;
  return isComplete
    ? [{ type: ActionType.EditSquad, completedAt: new Date() }]
    : [];
};

export const getPublicActions = (squad: Squad): Action[] => {
  const isComplete = squad.public;
  return isComplete
    ? [{ type: ActionType.MakeSquadPublic, completedAt: new Date() }]
    : [];
};
