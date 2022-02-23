interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  trackEvent?: () => void;
  copyLink?: () => Promise<void>;
}
export function useShareOrCopyLink({
  link,
  text,
  trackEvent,
  copyLink,
}: UseShareOrCopyLinkProps): () => Promise<void> {
  const onShareOrCopy = async () => {
    trackEvent?.();
    if ('share' in navigator) {
      try {
        await navigator.share({
          text,
          url: link,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      copyLink?.();
    }
  };

  return onShareOrCopy;
}
