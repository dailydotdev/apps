import type { CancelEvent, StartFn } from '../useDebounceFn';
import useDebounceFn from '../useDebounceFn';
import { isValidHttpUrl } from '../../lib/links';

export const useDebouncedUrl = (
  callback: StartFn<string>,
  onValidate: StartFn<string, boolean>,
  delay = 1000,
): [StartFn<string>, CancelEvent] =>
  useDebounceFn((value?: string) => {
    if (!value) {
      return;
    }

    if (!isValidHttpUrl(value) || !onValidate(value)) {
      return;
    }

    callback(value);
  }, delay);
