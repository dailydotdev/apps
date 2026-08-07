import type { JSONValue } from '@growthbook/growthbook';

export class Feature<T extends JSONValue> {
  readonly id: string;

  readonly defaultValue: T;

  constructor(id: string, defaultValue: T) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
}
