import type { NextRouter } from 'next/router';
import mitt from 'next/dist/shared/lib/mitt';
import { mockMatchMedia } from '../../../__tests__/helpers/media';
import { moveShell, ShellMove } from './shellMove';

const reducedMotion = '(prefers-reduced-motion: reduce)';

const createRouter = () => ({ events: mitt() } as unknown as NextRouter);

const mockViewTransition = () => {
  const skipTransition = jest.fn();
  let update: () => Promise<void> = () => Promise.resolve();
  let finish: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  document.startViewTransition = jest.fn((callback) => {
    update = callback as () => Promise<void>;
    return { skipTransition, finished } as unknown as ViewTransition;
  });

  return {
    skipTransition,
    run: () => update(),
    finish,
  };
};

beforeEach(() => {
  jest.useFakeTimers();
  mockMatchMedia((query) => query !== reducedMotion);
});

afterEach(() => {
  jest.useRealTimers();
  delete (document as Partial<Document>).startViewTransition;
  delete document.documentElement.dataset.shellMove;
});

it('navigates at once without view transitions', () => {
  const navigate = jest.fn();

  moveShell(createRouter(), ShellMove.Pop, navigate);

  expect(navigate).toHaveBeenCalled();
});

it('cuts under reduced motion', () => {
  const transition = mockViewTransition();
  mockMatchMedia(() => true);
  const navigate = jest.fn();

  moveShell(createRouter(), ShellMove.Pop, navigate);

  expect(navigate).toHaveBeenCalled();
  expect(document.startViewTransition).not.toHaveBeenCalled();
  expect(transition.skipTransition).not.toHaveBeenCalled();
});

it('navigates after the page is captured and holds it until the next arrives', async () => {
  const transition = mockViewTransition();
  const router = createRouter();
  const navigate = jest.fn();

  moveShell(router, ShellMove.Switch, navigate);

  expect(navigate).not.toHaveBeenCalled();
  expect(document.documentElement.dataset.shellMove).toBe(ShellMove.Switch);

  const arrived = jest.fn();
  transition.run().then(arrived);
  expect(navigate).toHaveBeenCalled();
  await Promise.resolve();
  expect(arrived).not.toHaveBeenCalled();

  router.events.emit('routeChangeComplete', '/posts');
  await Promise.resolve();
  expect(arrived).toHaveBeenCalled();
  expect(transition.skipTransition).not.toHaveBeenCalled();

  transition.finish();
  await Promise.resolve();
  await Promise.resolve();
  expect(document.documentElement.dataset.shellMove).toBeUndefined();
});

it('drops the move when the next page is slow, never the navigation', async () => {
  const transition = mockViewTransition();
  const navigate = jest.fn();

  moveShell(createRouter(), ShellMove.Pop, navigate);
  const arrived = jest.fn();
  transition.run().then(arrived);
  jest.advanceTimersByTime(300);
  await Promise.resolve();

  expect(navigate).toHaveBeenCalled();
  expect(transition.skipTransition).toHaveBeenCalled();
  expect(arrived).toHaveBeenCalled();
});
