export const toPngFile = (blob: Blob, filename: string): File =>
  new File([blob], `${filename}.png`, { type: 'image/png' });
