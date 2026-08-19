/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import { nextTick } from '@dailydotdev/shared/src/lib/func';
import {
  enhanceIubendaBannerNow,
  watchIubendaBanner,
} from '../components/iubendaBanner';

type IubendaLangWindow = typeof globalThis & {
  _iub?: { cs?: { options?: { lang?: string } } };
};

const query = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`expected element for selector: ${selector}`);
  }

  return element;
};

const mountBanner = (): HTMLElement => {
  const banner = document.createElement('div');
  banner.id = 'iubenda-cs-banner';
  banner.innerHTML = `
    <div class="iubenda-cs-container">
      <div class="iubenda-cs-content">
        <div class="iubenda-banner-content">
          <h2 id="iubenda-cs-title">We value your privacy</h2>
          <div id="iubenda-cs-paragraph">Mandated copy<br>More mandated copy <a href="#">Cookie Policy</a></div>
        </div>
        <button class="iubenda-cs-close-btn"><span>×</span></button>
        <div class="iubenda-cs-counter">Press again to continue 0/2</div>
        <div class="iubenda-cs-opt-group">
          <div class="iubenda-cs-opt-group-custom">
            <button class="iubenda-cs-customize-btn">Customize</button>
            <button class="iubenda-cs-reject-btn">Reject</button>
          </div>
          <div class="iubenda-cs-opt-group-consent">
            <button class="iubenda-cs-accept-btn">Accept</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  return banner;
};

const setClamped = (clamped: boolean): void => {
  const paragraph = document.querySelector('#iubenda-cs-paragraph');
  Object.defineProperty(paragraph, 'scrollHeight', {
    configurable: true,
    value: clamped ? 100 : 50,
  });
  Object.defineProperty(paragraph, 'clientHeight', {
    configurable: true,
    value: 50,
  });
};

let cleanup: () => void = () => {};

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  delete (globalThis as IubendaLangWindow)._iub;
});

it('labels the icon-only customize button from its own caption', () => {
  mountBanner();
  cleanup = watchIubendaBanner();

  const customize = document.querySelector('.iubenda-cs-customize-btn');
  expect(customize).toHaveAttribute('aria-label', 'Customize');
  expect(customize).toHaveAttribute('title', 'Customize');
});

it('names the redrawn close button as the refusal it performs', () => {
  mountBanner();
  cleanup = watchIubendaBanner();

  expect(document.querySelector('.iubenda-cs-close-btn')).toHaveAttribute(
    'aria-label',
    'Reject all and close',
  );
});

it('localizes the labels from the language iubenda resolved', () => {
  (globalThis as IubendaLangWindow)._iub = { cs: { options: { lang: 'de' } } };
  mountBanner();
  setClamped(true);
  cleanup = watchIubendaBanner();

  expect(document.querySelector('.iubenda-cs-close-btn')).toHaveAttribute(
    'aria-label',
    'Alle ablehnen und schließen',
  );
  expect(document.querySelector('.dd-cs-more')).toHaveTextContent(
    'Mehr anzeigen',
  );
  expect(document.querySelector('.iubenda-cs-customize-btn')).toHaveAttribute(
    'aria-label',
    'Anpassen',
  );
});

it('collapses copy taller than the clamp and expands it on demand', () => {
  const banner = mountBanner();
  setClamped(true);
  cleanup = watchIubendaBanner();

  const toggle = query<HTMLButtonElement>('.dd-cs-more');
  expect(banner).toHaveClass('dd-cs-collapsed', 'dd-cs-has-more');
  expect(toggle.hidden).toBe(false);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveAttribute('aria-controls', 'iubenda-cs-paragraph');

  toggle.click();
  expect(banner).not.toHaveClass('dd-cs-collapsed');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(toggle).toHaveTextContent('Show less');

  toggle.click();
  expect(banner).toHaveClass('dd-cs-collapsed');
  expect(toggle).toHaveTextContent('Show more');
});

it('hides the toggle when the copy already fits', () => {
  const banner = mountBanner();
  setClamped(false);
  cleanup = watchIubendaBanner();

  expect(banner).not.toHaveClass('dd-cs-collapsed');
  expect(banner).not.toHaveClass('dd-cs-has-more');
  expect(query<HTMLButtonElement>('.dd-cs-more').hidden).toBe(true);
});

it('reveals the press-again counter only once it counts something', async () => {
  const banner = mountBanner();
  cleanup = watchIubendaBanner();

  expect(banner).not.toHaveClass('dd-cs-counting');

  const counter = query('.iubenda-cs-counter');
  counter.textContent = 'Press again to continue 1/2';
  await nextTick();

  expect(banner).toHaveClass('dd-cs-counting');
});

it('enhances a banner iubenda renders after the watch starts', async () => {
  cleanup = watchIubendaBanner();
  expect(document.querySelector('.dd-cs-more')).toBeNull();

  mountBanner();
  await nextTick();

  expect(document.querySelector('.dd-cs-more')).not.toBeNull();
});

it('stops watching once cleaned up', async () => {
  const stop = watchIubendaBanner();
  stop();
  cleanup = stop;

  mountBanner();
  await nextTick();

  expect(document.querySelector('.dd-cs-more')).toBeNull();
});

it('enhances a late banner when iubenda reports it shown', () => {
  const stop = watchIubendaBanner();
  stop(); // the watcher's cost cap elapsed before the banner rendered

  mountBanner();
  setClamped(true);
  enhanceIubendaBannerNow();
  cleanup = watchIubendaBanner();

  expect(document.querySelector('.dd-cs-more')).not.toBeNull();
});

it('re-measures an already-enhanced banner when it is shown', () => {
  const banner = mountBanner();
  cleanup = watchIubendaBanner();
  expect(query<HTMLButtonElement>('.dd-cs-more').hidden).toBe(true);

  setClamped(true);
  enhanceIubendaBannerNow();

  expect(banner).toHaveClass('dd-cs-collapsed', 'dd-cs-has-more');
  expect(query<HTMLButtonElement>('.dd-cs-more').hidden).toBe(false);
});

it('disposes the counter observer with the rest of the enhancement', async () => {
  const banner = mountBanner();
  const stop = watchIubendaBanner();
  stop();
  cleanup = stop;

  query('.iubenda-cs-counter').textContent = 'Press again to continue 1/2';
  await nextTick();

  expect(banner).not.toHaveClass('dd-cs-counting');
});

it('falls back to English for a language it has no labels for', () => {
  (globalThis as IubendaLangWindow)._iub = {
    cs: { options: { lang: 'pt' } },
  };
  mountBanner();
  setClamped(true);
  cleanup = watchIubendaBanner();

  expect(query('.iubenda-cs-close-btn')).toHaveAttribute(
    'aria-label',
    'Reject all and close',
  );
  expect(query('.dd-cs-more')).toHaveTextContent('Show more');
});

it('replaces an orphaned toggle instead of rendering a second one', () => {
  const banner = mountBanner();
  const orphan = document.createElement('button');
  orphan.className = 'dd-cs-more';
  query('.iubenda-cs-opt-group').appendChild(orphan);

  cleanup = watchIubendaBanner();

  expect(banner.querySelectorAll('.dd-cs-more')).toHaveLength(1);
});

it('disposes itself once iubenda removes the banner, and rebuilds for the next one', async () => {
  jest.useFakeTimers();
  try {
    const banner = mountBanner();
    setClamped(true);
    cleanup = watchIubendaBanner();
    expect(query('.dd-cs-more')).toBeInTheDocument();

    // consent given: iubenda drops the banner, and the next resize must not
    // keep measuring a detached subtree
    banner.remove();
    globalThis.dispatchEvent(new Event('resize'));
    jest.advanceTimersByTime(200);

    mountBanner();
    setClamped(true);
    enhanceIubendaBannerNow();

    expect(document.querySelectorAll('.dd-cs-more')).toHaveLength(1);
    expect(query('.dd-cs-more')).toBeInTheDocument();
  } finally {
    jest.useRealTimers();
  }
});
