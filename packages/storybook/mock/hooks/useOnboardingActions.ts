import { fn } from 'storybook/test';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';

const completeAction = fn();

export const useOnboardingActions = fn(() => ({
  shouldShowAuthBanner: false,
  isOnboardingActionsReady: true,
  isOnboardingComplete: false,
  completeStep: (action: ActionType) => completeAction(action),
}));
