import { onValidateHandles } from '../useProfileForm';

describe('onValidateHandles', () => {
  it('should accept accented characters in social handles', () => {
    const before = {};
    const after = {
      twitter: 'ítalo-oliveira-800923162',
      github: 'José',
      linkedin: 'François',
      username: 'Müller',
    };

    const result = onValidateHandles(before, after);

    expect(result).toEqual({});
  });

  it('should accept accented characters in username', () => {
    const before = { username: 'oldname' };
    const after = { username: 'José_González' };

    const result = onValidateHandles(before, after);

    expect(result).toEqual({});
  });

  it('should accept Unicode characters from various languages', () => {
    const before = {};
    const after = {
      username: 'Борис', // Cyrillic
      twitter: '北京', // Chinese
      github: 'جوزيف', // Arabic
    };

    const result = onValidateHandles(before, after);

    expect(result).toEqual({});
  });

  it('should accept mixed Unicode and ASCII characters', () => {
    const before = {};
    const after = {
      twitter: '@José-González_123',
      github: 'François-dev',
      username: 'Müller_Corp',
    };

    const result = onValidateHandles(before, after);

    expect(result).toEqual({});
  });

  it('should still accept regular ASCII usernames', () => {
    const before = {};
    const after = {
      username: 'john_doe',
      twitter: '@johndoe',
      github: 'johndoe-dev',
    };

    const result = onValidateHandles(before, after);

    expect(result).toEqual({});
  });

  it('should reject usernames that are too short', () => {
    const before = { username: 'oldname' };
    const after = { username: 'í' }; // Single character

    const result = onValidateHandles(before, after);

    expect(result.username).toBeDefined();
  });

  it('should reject empty usernames', () => {
    const before = { username: 'oldname' };
    const after = { username: '' };

    const result = onValidateHandles(before, after);

    expect(result.username).toBeDefined();
  });
});
