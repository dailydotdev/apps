import { IFlags } from 'flagsmith';

export const getFeatureValue = (
  key: string,
  flags: IFlags,
): string | undefined => {
  if (flags[key]?.enabled) {
    return flags[key].value;
  }
  return undefined;
};
