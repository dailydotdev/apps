import {
  clearPostSignupActivation,
  hasPostSignupActivation,
  markPostSignupActivation,
} from './postSignupActivation';

describe('post signup activation', () => {
  beforeEach(() => {
    clearPostSignupActivation();
    window.history.replaceState({}, '', '/posts/original-post');
  });

  it('marks the newly registered user on the originating post', () => {
    markPostSignupActivation({ id: 'new-user' });

    expect(hasPostSignupActivation('new-user')).toBe(true);
    expect(hasPostSignupActivation('another-user')).toBe(false);
  });

  it('does not carry the activation prompt to another post', () => {
    markPostSignupActivation({ id: 'new-user' });

    window.history.replaceState({}, '', '/posts/another-post');

    expect(hasPostSignupActivation('new-user')).toBe(false);
  });

  it('does not mark registrations outside a post page', () => {
    window.history.replaceState({}, '', '/sources/javascript');

    markPostSignupActivation({ id: 'new-user' });

    expect(hasPostSignupActivation('new-user')).toBe(false);
  });

  it('clears the activation prompt', () => {
    markPostSignupActivation({ id: 'new-user' });

    clearPostSignupActivation();

    expect(hasPostSignupActivation('new-user')).toBe(false);
  });
});
