import { useState } from 'react';
import type { NotifyOptionalProps } from './useToastNotification';
import { useToastNotification } from './useToastNotification';
import { useGetShortUrl } from './utils/useGetShortUrl';

type CopyNotifyFunctionProps = NotifyOptionalProps & {
  link?: string;
  message?: string;
  textToCopy?: string;
  shorten?: boolean;
  disableToast?: boolean;
};

const defaultMessage = '✅ Copied to clipboard';
const defaultLinkMessage = '✅ Copied link to clipboard';
const noLinkErrorMessage = '❌ Could not copy, link is missing';
const copyFailedMessage = '❌ Could not copy, please try again';
const noTextErrorMessage = '❌ Could not copy, there is nothing to copy';

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
    const link = props.link || getLink?.();
    const shortenLink = props.shorten || shorten;

    if (!link) {
      displayToast(noLinkErrorMessage, props);

      return;
    }

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // A refused write used to reject out of here, leaving the caller with no
      // toast and no copied state, so the button read as dead.
      displayToast(copyFailedMessage, props);

      return;
    }

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

    if (!props.disableToast) {
      displayToast(props.message || defaultLinkMessage, props);
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
    const textToCopy = props.textToCopy || text;

    if (!textToCopy) {
      displayToast(noTextErrorMessage, props);

      return;
    }

    await navigator.clipboard.writeText(textToCopy);

    if (!props.disableToast) {
      displayToast(props.message || defaultMessage, props);
    }

    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
