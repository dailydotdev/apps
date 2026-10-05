export const toPngFile = (blob: Blob, filename: string): File =>
  new File([blob], `${filename}.png`, { type: 'image/png' });

/**
 * The PNG as a file the system share sheet accepts, or nothing where Web Share
 * cannot take files: desktop Firefox, and most desktop Chrome builds.
 */
export function getShareableImageFile(
  blob: Blob,
  filename: string,
): File | undefined {
  if (typeof File === 'undefined' || !globalThis.navigator?.canShare) {
    return undefined;
  }

  const file = toPngFile(blob, filename);

  return navigator.canShare({ files: [file] }) ? file : undefined;
}

/**
 * Must run inside the tap that asked for it: Web Share refuses a call that
 * outlives the gesture, so the file has to be ready before the press.
 * Dismissing the sheet rejects, and is not an error worth reporting.
 */
export async function shareImageFile(file: File, text?: string): Promise<void> {
  try {
    await navigator.share({ files: [file], text });
  } catch {
    // dismissed
  }
}
