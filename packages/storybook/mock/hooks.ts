import { fn } from 'storybook/test';

export const useConditionalFeature = fn()
  .mockName('useConditionalFeature')
  .mockReturnValue({ value: 'control', isLoading: false });

export const usePostById = fn()
  .mockName('usePostById')
  .mockReturnValue({ 
    post: null, 
    relatedCollectionPosts: null, 
    isError: false, 
    isLoading: false 
  });

export * from '@dailydotdev/shared/src/hooks/utils'
export * from '@dailydotdev/shared/src/hooks';
