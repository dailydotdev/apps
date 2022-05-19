import { useState } from 'react';
import {
  NotifyOptionalProps,
  useToastNotification,
} from './useToastNotification';

type CopyNotifyFunctionProps = NotifyOptionalProps & {
  message?: string;
};

const defaultMessage = '✅ Copied link to clipboard';

export type CopyNotifyFunction =
  | ((props?: CopyNotifyFunctionProps) => void)
  | ((props?: CopyNotifyFunctionProps) => Promise<void>);

export function useCopyLink(
  getLink: () => string,
): [boolean, CopyNotifyFunction] {
  const [copying, setCopying] = useState(false);
  const { displayToast } = useToastNotification();

  const copy: CopyNotifyFunction = async (props = {}) => {
    await navigator.clipboard.writeText(getLink());
    setCopying(true);
    displayToast(props.message || defaultMessage, props);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
