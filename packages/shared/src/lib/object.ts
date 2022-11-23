import { isNullOrUndefined } from './func';

type UnknownObject = Record<string | number, unknown>;

export const getObjectFeaturesFlags = (
  keys: string[],
  obj: UnknownObject,
  origin?: UnknownObject,
): UnknownObject =>
  keys.reduce((result, key) => {
    const value = obj[key];

    if (isNullOrUndefined(value)) {
      return result;
    }

    if (!origin || typeof origin[key] !== 'boolean') {
      return { ...result, [key]: value };
    }

    if (value === 'true') {
      return { ...result, [key]: true };
    }

    if (value === 'false') {
      return { ...result, [key]: false };
    }

    return { ...result, [key]: !!value };
  }, {});
