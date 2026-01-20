import { useCallback } from 'react';

export interface UseMissingFieldNavigationReturn {
  handleMissingClick: (checkKey: string) => void;
}

const INPUT_SELECTOR =
  'input, textarea, [contenteditable="true"], button[role="combobox"]';

const highlightElement = (el: HTMLElement): void => {
  const { style } = el;
  style.boxShadow = '0 0 0 3px var(--status-warning)';
  style.backgroundColor =
    'color-mix(in srgb, var(--status-warning) 15%, transparent)';
  style.borderRadius = '12px';

  setTimeout(() => {
    style.transition = 'box-shadow 1s ease-out, background-color 1s ease-out';
    style.boxShadow = '0 0 0 0px transparent';
    style.backgroundColor = 'transparent';
  }, 500);

  setTimeout(() => {
    style.transition = '';
    style.boxShadow = '';
    style.backgroundColor = '';
    style.borderRadius = '';
  }, 1600);
};

const focusFirstInput = (container: HTMLElement): void => {
  const input = container.querySelector(INPUT_SELECTOR) as HTMLElement | null;
  input?.focus();
};

const expandSectionIfCollapsed = (element: HTMLElement): void => {
  const sectionContent = element.closest('[id^="section-"]');
  if (!sectionContent) {
    return;
  }

  const sectionButton = document.querySelector(
    `button[aria-controls="${sectionContent.id}"]`,
  ) as HTMLButtonElement | null;

  if (sectionButton?.getAttribute('aria-expanded') === 'false') {
    sectionButton.click();
  }
};

const scrollHighlightAndFocus = (
  element: HTMLElement,
  scrollBlock: ScrollLogicalPosition = 'center',
): void => {
  element.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
  highlightElement(element);
  setTimeout(() => focusFirstInput(element), 100);
};

const navigateToField = (fieldElement: HTMLElement): void => {
  expandSectionIfCollapsed(fieldElement);
  setTimeout(() => scrollHighlightAndFocus(fieldElement, 'center'), 100);
};

const navigateToSection = (checkKey: string): void => {
  const sectionButton = document.querySelector(
    `button[aria-controls="section-${checkKey}"]`,
  ) as HTMLButtonElement | null;

  if (!sectionButton) {
    return;
  }

  sectionButton.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (sectionButton.getAttribute('aria-expanded') === 'false') {
    setTimeout(() => sectionButton.click(), 300);
  }

  setTimeout(() => {
    const sectionContent = document.getElementById(`section-${checkKey}`);
    if (sectionContent) {
      highlightElement(sectionContent);
      focusFirstInput(sectionContent);
    }
  }, 400);
};

export function useMissingFieldNavigation(): UseMissingFieldNavigationReturn {
  const handleMissingClick = useCallback((checkKey: string) => {
    const fieldElement = document.querySelector(
      `[data-field-key="${checkKey}"]`,
    ) as HTMLElement | null;

    if (fieldElement) {
      navigateToField(fieldElement);
      return;
    }

    navigateToSection(checkKey);
  }, []);

  return { handleMissingClick };
}

export default useMissingFieldNavigation;
