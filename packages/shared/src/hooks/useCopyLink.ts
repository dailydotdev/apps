import { useState } from 'react';
import {
  NotifyOptionalProps,
  useToastNotification,
} from './useToastNotification';

type CopyNotifyFunctionProps = NotifyOptionalProps & {
  message?: string;
};

const defaultMessage = '✅ Copied link to clipboard';
const noLinkErrorMessage = '❌ Could not copy, link is missing';

export type CopyNotifyFunction =
  | ((props?: CopyNotifyFunctionProps) => void)
  | ((props?: CopyNotifyFunctionProps) => Promise<void>);

export function useCopyLink(
  getLink: () => string,
): [boolean, CopyNotifyFunction] {
  const [copying, setCopying] = useState(false);
  const { displayToast } = useToastNotification();

  const copy: CopyNotifyFunction = async (props = {}) => {
    const link = getLink();

    if (link) {
      if (
        process.env.NODE_ENV === 'development' &&
        !window.location.origin.includes('localhost')
      ) {
        // since we are using custom domain in dev, we can't use the clipboard API
        // this is a workaround to not crash the app in development and still be able
        // to test other stuff while working with clipboard
        // more info here https://web.dev/async-clipboard
        // eslint-disable-next-line no-alert
        alert(`Dev copied: ${link}`);
      } else {
        await navigator.clipboard.writeText(link);
      }

      displayToast(props.message || defaultMessage, props);
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
