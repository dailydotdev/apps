/**
 * Puts the PNG on the clipboard so it can be pasted straight into a chat or a
 * composer. Safari only honours a clipboard write inside the task that handled
 * the gesture, so the blob is handed over as a promise rather than awaited
 * first — `ClipboardItem` resolves it without losing the gesture.
 */
export async function copyShareImage(blob: Promise<Blob>): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }

  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

    return true;
  } catch {
    return false;
  }
}
