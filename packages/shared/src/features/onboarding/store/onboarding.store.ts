import { atom } from 'jotai/vanilla';
import type { AuthProps } from '../../../components/auth/common';
import { AuthDisplay } from '../../../components/auth/common';

export const authAtom = atom<AuthProps>({
  isAuthenticating: false,
  isLoginFlow: false,
  defaultDisplay: AuthDisplay.Default,
  email: '',
  isLoading: false,
});
