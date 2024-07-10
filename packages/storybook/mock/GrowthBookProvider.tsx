import { fn } from '@storybook/test';
import * as actual from '@dailydotdev/shared/src/components/GrowthBookProvider';

export * from '@dailydotdev/shared/src/components/GrowthBookProvider';

export const useFeature = fn(actual.useFeature)
  .mockName('useFeature')
  .mockReturnValue('control');
