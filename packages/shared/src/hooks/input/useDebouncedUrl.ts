import type { CancelEvent, StartFn } from '../useDebounceFn';
import useDebounceFn from '../useDebounceFn';
import { isValidHttpUrl } from '../../lib/links';

export const useDebouncedUrl = (
  callback: StartFn<string>,
  onValidate: StartFn<string, boolean>,
  delay = 1000,
): [StartFn<string>, CancelEvent] =>
  useDebounceFn((value: string) => {
    if (!isValidHttpUrl(value) || !onValidate(value)) {
      return undefined;
    }

    return callback(value);
  }, delay);
