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
      await navigator.clipboard.writeText(link);
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
