import { authContextLine } from './authContextLines';
import { AuthTriggers } from '../../lib/auth';

describe('authContextLine', () => {
  it('names what the gating action gets the member', () => {
    expect(authContextLine(AuthTriggers.JoinSquad)).toBe(
      'Sign up to join this Squad.',
    );
    expect(authContextLine(AuthTriggers.Bookmark)).toBe(
      'Sign up to save posts for later.',
    );
  });

  it('shows nothing for a trigger without a line', () => {
    expect(authContextLine(AuthTriggers.Onboarding)).toBeUndefined();
    expect(authContextLine(undefined)).toBeUndefined();
  });
});
