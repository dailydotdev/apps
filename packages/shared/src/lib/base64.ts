export async function base64ToFile(
  dataUrl: string,
  fileName: string,
): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  const type = dataUrl.substring(
    dataUrl.indexOf(':') + 1,
    dataUrl.indexOf(';'),
  );
  return new File([blob], fileName, { type });
}
