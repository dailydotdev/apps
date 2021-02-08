export default function onPageLoad(
  readyState: DocumentReadyState = 'interactive',
): Promise<void> {
  return new Promise((resolve) => {
    if (
      document.readyState === readyState ||
      document.readyState === 'complete'
    ) {
      return resolve();
    }

    window.addEventListener('load', () => resolve());
  });
}
