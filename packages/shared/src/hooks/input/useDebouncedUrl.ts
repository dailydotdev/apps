import useDebounce, { CancelEvent, StartFn } from '../useDebounce';
import { isValidHttpUrl } from '../../lib/links';

export const useDebouncedUrl = (
  callback: StartFn<string>,
  onValidate: StartFn<string, boolean>,
  delay = 1000,
): [StartFn<string>, CancelEvent] =>
  useDebounce((value: string) => {
    if (!isValidHttpUrl(value) || !onValidate(value)) {
      return null;
    }

    return callback(value);
  }, delay);
