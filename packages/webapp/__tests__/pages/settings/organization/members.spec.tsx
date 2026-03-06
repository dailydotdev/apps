import React from 'react';
import type { NextRouter } from 'next/router';
import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useViewSize } from '@dailydotdev/shared/src/hooks';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import MembersPage from '../../../../pages/settings/organization/[orgId]/members';

jest.mock(
  '@dailydotdev/shared/src/features/organizations/hooks/useOrganization',
  () => ({
    useOrganization: jest.fn(),
  }),
);

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSize: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/usePrompt', () => ({
  usePrompt: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

const mockedUseOrganization = useOrganization as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;
const mockedUseViewSize = useViewSize as jest.Mock;
const mockedUsePrompt = usePrompt as jest.Mock;
const mockedUseLazyModal = useLazyModal as jest.Mock;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('organization members page', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { orgId: 'org-1' },
      push: jest.fn(),
    } as unknown as NextRouter);

    mockedUseAuthContext.mockReturnValue({
      user: {
        id: 'user-1',
        username: 'test-user',
      },
    });

    mockedUseViewSize.mockReturnValue(false);
    mockedUsePrompt.mockReturnValue({ showPrompt: jest.fn() });
    mockedUseLazyModal.mockReturnValue({ openModal: jest.fn() });
  });

  it('should not crash when organization is unavailable', () => {
    mockedUseOrganization.mockReturnValue({
      organization: undefined,
      role: undefined,
      seatType: undefined,
      isFetching: false,
      isOwner: false,
      leaveOrganization: jest.fn(),
      isLeavingOrganization: false,
    });

    expect(() => render(<MembersPage />)).not.toThrow();
  });
});
