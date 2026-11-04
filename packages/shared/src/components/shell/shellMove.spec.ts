import type { NextRouter } from 'next/router';
import { moveShell, ShellMove } from './shellMove';

type Handler = (...args: unknown[]) => void;

const createRouter = () => {
  const handlers = new Map<string, Set<Handler>>();
  const events = {
    on: (name: string, handler: Handler) => {
      handlers.set(name, (handlers.get(name) ?? new Set()).add(handler));
    },
    off: (name: string, handler: Handler) => {
      handlers.get(name)?.delete(handler);
    },
    emit: (name: string, ...args: unknown[]) => {
      Array.from(handlers.get(name) ?? []).forEach((handler) =>
        handler(...args),
      );
    },
  };
  return { events } as unknown as NextRouter & { events: typeof events };
};

const mockMatchMedia = (reduced: () => boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduced-motion') ? reduced() : true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const ghost = () => document.querySelector('.shell-ghost');

beforeEach(() => {
  jest.useFakeTimers();
  mockMatchMedia(() => false);
  document.body.innerHTML =
    '<div class="shell-layout"><header class="shell-block fixed"></header><main><div>Feed</div><nav class="shell-cluster fixed"></nav></main></div>';
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  document.body.innerHTML = '';
  delete document.documentElement.dataset.shellMove;
});

it('cuts under reduced motion', () => {
  mockMatchMedia(() => true);
  const navigate = jest.fn();

  moveShell(createRouter(), ShellMove.Pop, navigate);

  expect(navigate).toHaveBeenCalled();
  expect(ghost()).toBeNull();
});

it('keeps a still copy of the page, without its bar, until the next has arrived', () => {
  const router = createRouter();
  const navigate = jest.fn();

  moveShell(router, ShellMove.Pop, navigate);

  expect(navigate).toHaveBeenCalled();
  expect(document.documentElement.dataset.shellMove).toBe(ShellMove.Pop);
  expect(ghost()).not.toBeNull();
  expect(ghost()?.querySelector('.shell-cluster')).toBeNull();
  expect(ghost()?.textContent).toContain('Feed');

  router.events.emit('routeChangeComplete', '/posts');
  jest.advanceTimersByTime(100);
  expect(ghost()).not.toBeNull();

  jest.advanceTimersByTime(400);
  expect(ghost()).toBeNull();
  expect(document.documentElement.dataset.shellMove).toBeUndefined();
});

it('drops the copy when the next page is slow, never the navigation', () => {
  const navigate = jest.fn();

  moveShell(createRouter(), ShellMove.Pop, navigate);
  jest.advanceTimersByTime(1200);

  expect(navigate).toHaveBeenCalled();
  expect(ghost()).toBeNull();
});

it('drops the copy when the route fails', () => {
  const router = createRouter();

  moveShell(router, ShellMove.Pop, jest.fn());
  router.events.emit('routeChangeError', new Error('no'), '/x');

  expect(ghost()).toBeNull();
  expect(document.documentElement.dataset.shellMove).toBeUndefined();
});
