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

// the TCF banner carries iubenda's vendor-list link mid-paragraph, right
// after the vendor count; a banner outside TCF has neither
const mountBanner = ({ tcf = true } = {}): HTMLElement => {
  const partners = tcf
    ? '1233 selected <a href="#" class="iubenda-vendor-list-link">third parties</a>'
    : 'selected third parties';
  const banner = document.createElement('div');
  banner.id = 'iubenda-cs-banner';
  banner.innerHTML = `
    <div class="iubenda-cs-container">
      <div class="iubenda-cs-content">
        <div class="iubenda-banner-content">
          <h2 id="iubenda-cs-title">We value your privacy</h2>
          <div id="iubenda-cs-paragraph">Mandated copy<br>With respect to advertising, we and ${partners} may process personal data. <a href="#">Cookie Policy</a></div>
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
  expect(document.querySelector('.dd-cs-vendors')).toHaveTextContent(
    'Anbieterliste (1233)',
  );
});

it('keeps the vendor list reachable while the copy is clamped', () => {
  mountBanner();
  setClamped(true);
  cleanup = watchIubendaBanner();

  // iubenda's own link is clamped away with the paragraph; ours sits beside
  // Show more, carries the count iubenda printed, and opens the same thing
  const vendors = query<HTMLButtonElement>('.dd-cs-vendors');
  expect(vendors.closest('.dd-cs-links')).toContainElement(
    query<HTMLElement>('.dd-cs-more'),
  );
  expect(vendors).toHaveTextContent('Vendor list (1233)');

  const onOpen = jest.fn((event: Event) => event.preventDefault());
  query('.iubenda-vendor-list-link').addEventListener('click', onOpen);
  vendors.click();
  expect(onOpen).toHaveBeenCalledTimes(1);
});

it('adds no vendor control to a banner without a vendor list', () => {
  mountBanner({ tcf: false });
  cleanup = watchIubendaBanner();

  expect(document.querySelector('.dd-cs-vendors')).toBeNull();
  expect(query('.dd-cs-more')).toBeInTheDocument();
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
  const orphan = document.createElement('span');
  orphan.className = 'dd-cs-links';
  orphan.innerHTML =
    '<button class="dd-cs-more"></button><button class="dd-cs-vendors"></button>';
  query('.iubenda-cs-opt-group').appendChild(orphan);

  cleanup = watchIubendaBanner();

  expect(banner.querySelectorAll('.dd-cs-links')).toHaveLength(1);
  expect(banner.querySelectorAll('.dd-cs-more')).toHaveLength(1);
  expect(banner.querySelectorAll('.dd-cs-vendors')).toHaveLength(1);
});

it('disposes itself once iubenda removes the banner, and rebuilds for the next one', async () => {
  jest.useFakeTimers();
  try {
    const banner = mountBanner();
    setClamped(true);
    cleanup = watchIubendaBanner();
    expect(query('.dd-cs-more')).toBeInTheDocument();

    // consent given: iubenda drops the banner, and the next resize must stop
    // measuring the detached subtree rather than keep it alive
    banner.remove();
    banner.classList.remove('dd-cs-collapsed', 'dd-cs-has-more');
    globalThis.dispatchEvent(new Event('resize'));
    jest.advanceTimersByTime(200);

    // measure() bailed on the disconnected node instead of re-clamping it
    expect(banner).not.toHaveClass('dd-cs-collapsed');

    mountBanner();
    setClamped(true);
    enhanceIubendaBannerNow();

    expect(document.querySelectorAll('.dd-cs-more')).toHaveLength(1);
    expect(query('.dd-cs-more')).toBeInTheDocument();
  } finally {
    jest.useRealTimers();
  }
});
