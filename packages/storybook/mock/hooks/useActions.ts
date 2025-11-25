import { fn } from 'storybook/test';

export const useActions = fn(() => ({
  completeAction: fn((type: string) => {
    console.log('Action completed:', type);
    return Promise.resolve();
  }),
  checkHasCompleted: fn(() => false),
  actions: [],
  isActionsFetched: true,
}));

