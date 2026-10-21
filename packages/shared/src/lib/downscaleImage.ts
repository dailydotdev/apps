// Phone cameras produce covers of 5 to 20 MB that go up inside the post
// mutation itself; on a mobile connection that upload can drop halfway and
// the post is lost. Nothing shown on the site needs more than this.
export const DOWNSCALE_MAX_DIMENSION = 2048;
export const DOWNSCALE_MIN_BYTES = 1024 * 1024;
const QUALITY = 0.85;

const outputTypes: Record<string, string> = {
  'image/jpeg': 'image/jpeg',
  'image/webp': 'image/webp',
  // A PNG may be transparent; WebP keeps that and is far smaller.
  'image/png': 'image/webp',
};

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const toBlob = (
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, QUALITY);
  });

// Returns a smaller copy of an image file, or the file itself when it is
// already small, of a type this does not re-encode, or cannot be decoded here.
export const downscaleImage = async (file: File): Promise<File> => {
  const type = outputTypes[file.type];
  if (
    !type ||
    file.size <= DOWNSCALE_MIN_BYTES ||
    typeof createImageBitmap !== 'function'
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    const scale = Math.min(
      1,
      DOWNSCALE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await toBlob(canvas, type);
    // A browser that cannot encode the type falls back to PNG.
    if (!blob || blob.type !== type || blob.size >= file.size) {
      return file;
    }

    const name = file.name.replace(/\.[^.]+$/, '') || 'cover';
    return new File([blob], `${name}.${extensions[type]}`, {
      type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
};
