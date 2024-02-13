import { useMutation, MutationOptions } from '@tanstack/react-query';

interface DownloadProps {
  filename: string;
  url: string;
}

export const useDownloadUrl = (
  options?: MutationOptions<void, void, DownloadProps>,
): ReturnType<typeof useMutation> =>
  useMutation(async ({ filename, url }: DownloadProps) => {
    const file = await fetch(url);
    const imageBlog = await file.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, options);
