import { Squad } from '../../graphql/sources';
import { Action, ActionType } from '../../graphql/actions';

// taken from DB default value
const placeholderImage =
  'https://daily-now-res.cloudinary.com/image/upload/s--LrHsyt2T--/f_auto/v1692632054/squad_placeholder_sfwkmj';

export const getEditActions = (squad: Squad): Action[] => {
  const isComplete =
    !!squad.name &&
    !!squad.description &&
    !!squad.image &&
    squad.image !== placeholderImage;
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
