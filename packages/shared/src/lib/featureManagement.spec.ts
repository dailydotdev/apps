import { Features, getFeatureValue } from './featureManagement';

const defaultFlags = {
  enabled: true,
  value: 'feed_title',
};

const defaultValue = 'sidebar';

describe('feature testing', () => {
  it('should return the default for a disabled feature', () => {
    const test = getFeatureValue(Features.MyFeedPosition, {
      my_feed_position: {
        ...defaultFlags,
        enabled: false,
      },
    });
    expect(test).toEqual(defaultValue);
  });

  it('should return the default for a not allowed feature value', () => {
    const test = getFeatureValue(Features.MyFeedPosition, {
      my_feed_position: {
        ...defaultFlags,
        value: 'false_value',
      },
    });
    expect(test).toEqual(defaultValue);
  });

  it('should return the correct value when a flag is set', () => {
    const differentValue = 'feed_title';
    const test = getFeatureValue(Features.MyFeedPosition, {
      my_feed_position: {
        ...defaultFlags,
        value: differentValue,
      },
    });
    expect(test).toEqual(differentValue);
  });

  it('should return the default if the flag doesnt exist', () => {
    const test = getFeatureValue(Features.MyFeedPosition, {});
    expect(test).toEqual(defaultValue);
  });
});
