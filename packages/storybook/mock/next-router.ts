import { fn } from 'storybook/test';

export const useRouter = fn(() => ({
  replace: fn(),
  push: fn(),
  pathname: '/',
  query: {},
  events: { on: fn(), off: fn() },
}));

export const usePathname = () => '/';

export const useSearchParams = () => new URLSearchParams();

// The singleton router, for modules that `import router from 'next/router'`
const router = {
  replace: fn(),
  push: fn(),
  pathname: '/',
  query: {},
  events: { on: fn(), off: fn() },
};

export default router;
