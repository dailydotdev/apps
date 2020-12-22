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

    const callback = (event: ProgressEvent<Document>) => {
      if (
        event.target.readyState === readyState ||
        document.readyState === 'complete'
      ) {
        document.removeEventListener('readystatechange', callback);
        return resolve();
      }
    };
    document.addEventListener('readystatechange', callback);
  });
}
