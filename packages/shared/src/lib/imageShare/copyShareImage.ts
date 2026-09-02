/**
 * Puts the PNG on the clipboard so it can be pasted straight into a chat or a
 * composer, with the post's link beside it as text: a rich composer takes the
 * image, a plain one takes the link, and neither leaves the reader having to
 * go back for the other half.
 *
 * Safari only honours a clipboard write inside the task that handled the
 * gesture, so the blob is handed over as a promise rather than awaited first —
 * `ClipboardItem` resolves it without losing the gesture.
 */
export async function copyShareImage(
  blob: Promise<Blob>,
  link?: string,
): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }

  const write = async (item: ClipboardItem): Promise<boolean> => {
    try {
      await navigator.clipboard.write([item]);

      return true;
    } catch {
      return false;
    }
  };

  if (link) {
    const copied = await write(
      new ClipboardItem({
        'image/png': blob,
        'text/plain': new Blob([link], { type: 'text/plain' }),
      }),
    );

    if (copied) {
      return true;
    }
  }

  // Not every browser accepts two representations in one item, and the image
  // is the half worth keeping when one of them has to go.
  return write(new ClipboardItem({ 'image/png': blob }));
}
