/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import type { IubendaBannerLang } from '@dailydotdev/shared/src/lib/iubenda';

/**
 * Behavioral companion to styles/iubenda.css, ported from the marketing
 * sites' embed (recruiter-landing, custom-scripts/head.html): accessible
 * names for the icon-only Customize and the redrawn close button, the
 * press-again counter reveal, and the show-more clamp that layers the
 * TCF-mandated copy without removing text.
 */

type IubendaLangWindow = typeof globalThis & {
  _iub?: { cs?: { options?: { lang?: string } } };
};

interface BannerLabels {
  showMore: string;
  showLess: string;
  // closeButtonRejects makes the × a consent decision, and CSS redraws it as
  // pseudo-elements that carry no accessible name
  close: string;
  // the caption is visually hidden (icon-only, font-size: 0), so this is the
  // control's entire accessible surface; customizeButtonCaption in the config
  // is a single global string that would put an English name inside a
  // localized banner
  customize: string;
}

// Keyed by the shared policy table so adding a banner language without its
// labels fails to compile.
const BANNER_LOCALES: Record<IubendaBannerLang, BannerLabels> = {
  en: {
    showMore: 'Show more',
    showLess: 'Show less',
    close: 'Reject all and close',
    customize: 'Customize',
  },
  es: {
    showMore: 'Mostrar más',
    showLess: 'Mostrar menos',
    close: 'Rechazar todo y cerrar',
    customize: 'Personalizar',
  },
  de: {
    showMore: 'Mehr anzeigen',
    showLess: 'Weniger anzeigen',
    close: 'Alle ablehnen und schließen',
    customize: 'Anpassen',
  },
  it: {
    showMore: 'Mostra di più',
    showLess: 'Mostra di meno',
    close: 'Rifiuta tutto e chiudi',
    customize: 'Personalizza',
  },
};

// csLangConfiguration localizes the banner from the browser, so the
// document's lang (always "en" here) is the wrong source.
const resolveBannerLabels = (): BannerLabels => {
  const lang = (
    (globalThis as IubendaLangWindow)._iub?.cs?.options?.lang ||
    globalThis.navigator?.language ||
    'en'
  )
    .slice(0, 2)
    .toLowerCase();

  return BANNER_LOCALES[lang as IubendaBannerLang] || BANNER_LOCALES.en;
};

const labelControls = (banner: Element, labels: BannerLabels): void => {
  const customize = banner.querySelector('.iubenda-cs-customize-btn');
  customize?.setAttribute('aria-label', labels.customize);
  customize?.setAttribute('title', labels.customize);

  banner
    .querySelector('.iubenda-cs-close-btn')
    ?.setAttribute('aria-label', labels.close);
};

// Reveal the press-again counter only once it counts something. Match on
// digits rather than words so it holds in every banner language.
const watchPressAgainCounter = (banner: Element): (() => void) => {
  const counter = banner.querySelector('.iubenda-cs-counter');

  if (!counter) {
    return () => {};
  }

  const syncCounter = () => {
    const match = /(\d+)\s*\/\s*\d+/.exec(counter.textContent || '');
    banner.classList.toggle('dd-cs-counting', !!match && Number(match[1]) > 0);
  };

  syncCounter();
  const observer = new MutationObserver(syncCounter);
  observer.observe(counter, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  return () => observer.disconnect();
};

// One width fits both labels, so toggling cannot reflow the strip. Measured,
// not hardcoded: the wider string differs by language. The result covers the
// padding too (border-box), or the shorter label still renders a narrower
// box.
const measureWidestLabelWidth = (
  btn: HTMLButtonElement,
  labels: [string, string],
): number => {
  const styles = globalThis.getComputedStyle(btn);
  const probe = document.createElement('span');
  probe.style.cssText =
    'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px';
  probe.style.fontFamily = styles.fontFamily;
  probe.style.fontSize = styles.fontSize;
  probe.style.fontWeight = styles.fontWeight;
  document.body.appendChild(probe);

  const widest = labels.reduce((width, label) => {
    probe.textContent = label;
    return Math.max(width, probe.getBoundingClientRect().width);
  }, 0);
  probe.remove();

  if (!widest) {
    return 0;
  }

  const padding =
    (parseFloat(styles.paddingLeft) || 0) +
    (parseFloat(styles.paddingRight) || 0);
  return Math.ceil(widest + padding);
};

type Enhanced = {
  banner: Element;
  remeasure: () => void;
  dispose: () => void;
};

const buildShowMoreToggle = (
  banner: Element,
  paragraph: Element,
  row: Element,
  labels: BannerLabels,
  onDisposed: () => void,
): Enhanced => {
  let pinned = false; // set once the reader has expressed a preference

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd-cs-more';
  btn.textContent = labels.showMore;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'iubenda-cs-paragraph');

  btn.addEventListener('click', () => {
    pinned = true;
    const collapsed = banner.classList.toggle('dd-cs-collapsed');
    btn.textContent = collapsed ? labels.showMore : labels.showLess;
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });
  row.insertBefore(btn, row.firstChild);

  const pinWidth = () => {
    const minWidth = measureWidestLabelWidth(btn, [
      labels.showMore,
      labels.showLess,
    ]);
    if (minWidth) {
      btn.style.minWidth = `${minWidth}px`;
    }
  };
  pinWidth();

  const disposers: Array<() => void> = [];
  const dispose = () => {
    disposers.splice(0).forEach((teardown) => teardown());
    onDisposed();
  };

  const measure = () => {
    // iubenda removes the banner once a preference lands; keeping the
    // listeners alive would retain the detached subtree for the page's life
    if (!banner.isConnected) {
      dispose();
      return;
    }

    if (pinned) {
      return;
    }

    banner.classList.add('dd-cs-collapsed');
    const hides = paragraph.scrollHeight > paragraph.clientHeight + 1;
    banner.classList.toggle('dd-cs-has-more', hides);
    btn.hidden = !hides;

    if (!hides) {
      banner.classList.remove('dd-cs-collapsed');
    }
  };

  measure();
  // webfonts can land after the banner: both the clamp verdict and the
  // pinned width change with the real font metrics
  document.fonts?.ready
    ?.then(() => {
      pinWidth();
      measure();
    })
    .catch(() => {});

  let debounce: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(debounce);
    debounce = setTimeout(measure, 150);
  };
  globalThis.addEventListener('resize', onResize);
  disposers.push(() => {
    clearTimeout(debounce);
    globalThis.removeEventListener('resize', onResize);
  });
  disposers.push(watchPressAgainCounter(banner));

  return { banner, remeasure: measure, dispose };
};

let enhanced: Enhanced | null = null;

const enhanceBanner = (banner: Element): boolean => {
  const existingToggle = banner.querySelector('.dd-cs-more');

  if (existingToggle && enhanced?.banner === banner) {
    return true;
  }

  // an orphaned toggle survives a disposed enhancement; rebuild from scratch
  existingToggle?.remove();

  const content = banner.querySelector('.iubenda-banner-content');
  const paragraph = banner.querySelector('#iubenda-cs-paragraph');
  const row = banner.querySelector('.iubenda-cs-opt-group');

  if (!content || !paragraph || !row) {
    return false; // banner shell without its copy yet
  }

  enhanced?.dispose();

  const labels = resolveBannerLabels();
  labelControls(banner, labels);
  // self-disposal (banner removed from the DOM) must clear the module state
  // too, or a re-shown banner passes the dedupe above with dead listeners
  let instance: Enhanced | null = null;
  instance = buildShowMoreToggle(banner, paragraph, row, labels, () => {
    if (enhanced === instance) {
      enhanced = null;
    }
  });
  enhanced = instance;

  return true;
};

const attempt = (): boolean => {
  const banner = document.querySelector('#iubenda-cs-banner');
  return banner ? enhanceBanner(banner) : false;
};

/**
 * Called from iubenda's onBannerShown callback: enhances a banner the
 * observer missed (rendered after its 20s cap, or re-shown on a policy
 * update) and re-measures one it enhanced while the banner was still hidden,
 * where the clamp heights read 0.
 */
export const enhanceIubendaBannerNow = (): void => {
  if (attempt()) {
    enhanced?.remeasure();
  }
};

export const watchIubendaBanner = (): (() => void) => {
  const stopEnhancements = () => {
    enhanced?.dispose();
  };

  if (attempt()) {
    return stopEnhancements;
  }

  const observer = new MutationObserver(() => {
    if (attempt()) {
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  // cost cap on the document-wide observer, not a functional deadline:
  // onBannerShown re-enters via enhanceIubendaBannerNow for late banners
  const timeout = setTimeout(() => observer.disconnect(), 20000);

  return () => {
    observer.disconnect();
    clearTimeout(timeout);
    stopEnhancements();
  };
};
