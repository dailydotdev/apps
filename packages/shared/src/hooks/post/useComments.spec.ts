import { getReplyToInitialContent } from './useComments';

describe('useComments', () => {
  it('should include a non-breaking trailing space for a reply mention', () => {
    expect(getReplyToInitialContent('target-user')).toBe('@target-user\u00a0');
  });

  it('should return undefined when username is missing', () => {
    expect(getReplyToInitialContent()).toBeUndefined();
  });
});
