export const getCompanion = (): HTMLElement =>
  globalThis.document
    ?.querySelector('daily-companion-app')
    ?.shadowRoot?.querySelector('#daily-companion-wrapper');
