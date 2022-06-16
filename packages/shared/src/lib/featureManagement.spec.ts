import { Features, getFeatureValue } from './featureManagement';

const defaultFlags = {
  enabled: true,
  value: 'signup_button_copy',
};

const defaultValue = 'Access all features';

describe('feature testing', () => {
  it('should return the default for a disabled feature', () => {
    const test = getFeatureValue(Features.SignupButtonCopy, {
      my_feed_position: {
        ...defaultFlags,
        enabled: false,
      },
    });
    expect(test).toEqual(defaultValue);
  });

  it('should return the default for a not allowed feature value', () => {
    const test = getFeatureValue(Features.SignupButtonCopy, {
      my_feed_position: {
        ...defaultFlags,
        value: 'false_value',
      },
    });
    expect(test).toEqual(defaultValue);
  });

  it('should return the correct value when a flag is set', () => {
    const differentValue = 'different_value';
    const test = getFeatureValue(Features.SignupButtonCopy, {
      signup_button_copy: {
        ...defaultFlags,
        value: differentValue,
      },
    });
    expect(test).toEqual(differentValue);
  });

  it('should return the default if the flag doesnt exist', () => {
    const test = getFeatureValue(Features.SignupButtonCopy, {});
    expect(test).toEqual(defaultValue);
  });
});
