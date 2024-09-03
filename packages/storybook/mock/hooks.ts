import { fn } from '@storybook/test';

export const useConditionalFeature = fn()
  .mockName('useConditionalFeature')
  .mockReturnValue({ value: 'control', isLoading: false });

export const useSquadNavigation = fn()
  .mockName('useSquadNavigation')
  .mockReturnValue({ openNewSquad: fn() });

export * from '@dailydotdev/shared/src/hooks';
