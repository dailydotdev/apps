interface DownloadProps {
  filename: string;
  url: string;
}

interface UseDownloadUrl {
  onDownloadUrl: (props: DownloadProps) => Promise<void>;
}

interface UseDownloadUrlProps {
  onError?: (error: Error) => void;
}

export const useDownloadUrl = ({
  onError,
}: UseDownloadUrlProps = {}): UseDownloadUrl => {
  const onDownloadUrl = async ({ filename, url }: DownloadProps) => {
    try {
      const file = await fetch(url);
      const imageBlog = await file.blob();
      const imageURL = URL.createObjectURL(imageBlog);

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      onError(error);
    }
  };

  return { onDownloadUrl };
};
