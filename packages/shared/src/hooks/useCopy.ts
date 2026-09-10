import { useState } from 'react';
import type { ReferralCampaignKey } from '../lib/referral';
import type { NotifyOptionalProps } from './useToastNotification';
import { ToastType, useToastNotification } from './useToastNotification';
import { useGetShortUrl } from './utils/useGetShortUrl';

type CopyNotifyFunctionProps = NotifyOptionalProps & {
  link?: string;
  message?: string;
  textToCopy?: string;
  shorten?: boolean;
  /** Campaign carried by the shortened link, so the visit is attributed. */
  cid?: ReferralCampaignKey;
  disableToast?: boolean;
};

const defaultMessage = '✅ Copied to clipboard';
const defaultLinkMessage = '✅ Copied link to clipboard';
const noLinkErrorMessage = '❌ Could not copy, link is missing';
const noTextErrorMessage = '❌ Could not copy, there is nothing to copy';
// The clipboard rejects outright when the document is not focused, when the
// page is not on a secure origin, or when permission is denied. A press that
// reports nothing at all reads as a dead button.
const blockedMessage = '❌ Your browser blocked the clipboard';

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
    // getLink is optional: useCopyPostLink omits it when the link is only
    // known at press time, and those callers pass it in props instead.
    const link = props.link || getLink?.();
    const shortenLink = props.shorten || shorten;

    if (link) {
      try {
        // write the link to clipboard
        await navigator.clipboard.writeText(link);
      } catch {
        displayToast(blockedMessage, { variant: ToastType.Error });

        return;
      }

      // try with a shortened link as well, if requested
      if (shortenLink) {
        try {
          const clipBoardItem = new ClipboardItem({
            // A promise, not an awaited value: awaiting the shortener first
            // would end the task that handled the gesture, and Safari refuses
            // the write after that.
            'text/plain': getShortUrl(link, props.cid).then((shortenedLink) => {
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
    } else {
      displayToast(noLinkErrorMessage, { variant: ToastType.Error });
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

    // Nothing to put on the clipboard; writing it anyway pastes "undefined".
    if (!textToCopy) {
      displayToast(noTextErrorMessage, { variant: ToastType.Error });

      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      displayToast(blockedMessage, { variant: ToastType.Error });

      return;
    }

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
