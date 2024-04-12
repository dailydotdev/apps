import { useState } from 'react';
import {
  NotifyOptionalProps,
  useToastNotification,
} from './useToastNotification';
import { useGetShortUrl } from './utils/useGetShortUrl';

type CopyNotifyFunctionProps = NotifyOptionalProps & {
  link?: string;
  message?: string;
  textToCopy?: string;
  shorten?: boolean;
};

const defaultMessage = '✅ Copied to clipboard';
const defaultLinkMessage = '✅ Copied link to clipboard';
const noLinkErrorMessage = '❌ Could not copy, link is missing';

export type CopyNotifyFunction =
  | ((props?: CopyNotifyFunctionProps) => void)
  | ((props?: CopyNotifyFunctionProps) => Promise<void>);

export function useCopyLink(
  getLink?: () => string,
  shorten = false,
): [boolean, CopyNotifyFunction] {
  const [copying, setCopying] = useState(false);
  const { displayToast } = useToastNotification();
  const { getShortUrl } = useGetShortUrl();

  const copy: CopyNotifyFunction = async (props = {}) => {
    const link = props.link || getLink();
    const shortenLink = props.shorten || shorten;

    if (link) {
      // write the link to clipboard
      await navigator.clipboard.writeText(link);

      // try with a shortened link as well, if requested
      if (shortenLink) {
        try {
          const clipBoardItem = new ClipboardItem({
            'text/plain': getShortUrl(link).then((shortenedLink) => {
              return new Blob([shortenedLink], { type: 'text/plain' });
            }),
          });
          await navigator.clipboard.write([clipBoardItem]);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Error copying to clipboard', e);
        }
      }
      displayToast(props.message || defaultLinkMessage, props);
    } else {
      displayToast(noLinkErrorMessage, props);
    }

    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}

export function useCopyText(text?: string): [boolean, CopyNotifyFunction] {
  const [copying, setCopying] = useState(false);
  const { displayToast } = useToastNotification();

  const copy: CopyNotifyFunction = async (props = {}) => {
    await navigator.clipboard.writeText(props.textToCopy || text);
    displayToast(props.message || defaultMessage, props);

    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
