export const getCompanionWrapper = (): HTMLElement =>
  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper');
