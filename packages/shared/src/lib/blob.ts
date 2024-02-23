export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);
  });

interface DownloadProps {
  filename: string;
  url: string;
}

export const downloadUrl = async ({
  filename,
  url,
}: DownloadProps): Promise<void> => {
  const file = await fetch(url);
  const imageBlog = await file.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement('a');
  link.href = imageURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
