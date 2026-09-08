export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);
  });

interface DownloadBlobProps {
  filename: string;
  blob: Blob;
}

export const downloadBlob = ({ filename, blob }: DownloadBlobProps): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

interface DownloadProps {
  filename: string;
  url: string;
}

export const downloadUrl = async ({
  filename,
  url,
}: DownloadProps): Promise<void> => {
  const file = await fetch(url);
  const blob = await file.blob();

  downloadBlob({ filename, blob });
};
