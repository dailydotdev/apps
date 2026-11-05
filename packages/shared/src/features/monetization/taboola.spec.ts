import type * as TaboolaModule from './taboola';
import type { TaboolaResult } from './taboola';
import { taboolaQueueKey } from './taboola';

// Fresh per test: the module keeps the loader and page view for the page's
// lifetime.
let taboola: typeof TaboolaModule;

beforeEach(async () => {
  jest.useFakeTimers();
  jest.resetModules();
  taboola = await import('./taboola');
  delete window[taboolaQueueKey];
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

afterEach(() => jest.useRealTimers());

const request = (placement: number) => {
  const onResult = jest.fn<void, [TaboolaResult]>();
  const container = document.createElement('div');
  document.body.appendChild(container);
  taboola.requestTaboolaPlacement({ placement, container, onResult });
  return { container, onResult };
};

const loadScript = (id: string, event: 'load' | 'error') =>
  document.getElementById(id)?.dispatchEvent(new Event(event));

const commands = () => window[taboolaQueueKey] ?? [];

it('should batch the placements mounted together into one request', () => {
  request(1);
  request(2);
  jest.runOnlyPendingTimers();

  expect(commands()).toEqual([
    { homepage: 'auto', url: window.location.href },
    expect.objectContaining({
      container: 'taboola-mid-article-thumbnails-1-1',
      placement: 'Mid Article Thumbnails 1',
    }),
    expect.objectContaining({
      container: 'taboola-mid-article-thumbnails-2-2',
      placement: 'Mid Article Thumbnails 2',
    }),
    { flush: true },
  ]);
  expect(document.querySelectorAll('script')).toHaveLength(1);
});

it('should report a placement filled as soon as Taboola draws its item', async () => {
  const { container, onResult } = request(1);
  jest.runOnlyPendingTimers();
  container.innerHTML = '<div class="videoCube"></div>';
  await Promise.resolve();

  expect(onResult).toHaveBeenCalledWith('filled');
});

it('should report a placement empty once the loaded Taboola left it empty', async () => {
  const { onResult } = request(1);
  jest.runOnlyPendingTimers();
  loadScript('tb_loader_script', 'load');
  await jest.advanceTimersByTimeAsync(3_000);
  expect(onResult).not.toHaveBeenCalled();

  await jest.advanceTimersByTimeAsync(1_000);
  expect(onResult).toHaveBeenCalledWith('empty');
});

it('should refill a remounted card without clearing the page view', () => {
  const first = request(1).container;
  first.remove();
  jest.runOnlyPendingTimers();
  const second = request(1).container;

  expect(commands()).not.toContainEqual({ notify: 'newPageLoad' });
  expect(second.id).not.toBe(first.id);
});

it('should start a new page view when the URL changes', () => {
  request(1);
  window.history.replaceState(null, '', '/popular');
  request(2);

  expect(commands()).toContainEqual({ notify: 'newPageLoad' });
  window.history.replaceState(null, '', '/');
});

it('should keep the simulated domain once in-app navigation drops it', () => {
  window.history.replaceState(null, '', '/?taboola_sim_domain=daily.dev');
  request(1);
  window.history.replaceState(null, '', '/popular');
  request(2);

  expect(commands()).toContainEqual({
    homepage: 'auto',
    url: 'http://localhost/popular?taboola_sim_domain=daily.dev',
  });
  window.history.replaceState(null, '', '/');
});

it('should fall back when neither loader can load', async () => {
  const { onResult } = request(1);
  jest.runOnlyPendingTimers();
  loadScript('tb_loader_script', 'error');
  loadScript('tb_loader_script_fb', 'error');
  await jest.runAllTimersAsync();

  expect(onResult).toHaveBeenCalledWith('empty');
});
