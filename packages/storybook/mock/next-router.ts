import { fn } from '@storybook/test';

export const useRouter = fn().mockReturnValue({
  replace: fn(),
  push: fn(),
  pathname: '/',
});
