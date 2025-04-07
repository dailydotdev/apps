import { fn } from '@storybook/test';

export const useRouter = () => ({
  replace: fn(),
  push: fn(),
  pathname: '/',
  query: {},
});

export const useSearchParams = () => new URLSearchParams();
