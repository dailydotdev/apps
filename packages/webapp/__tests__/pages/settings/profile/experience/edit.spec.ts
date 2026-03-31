import {
  getUserExperienceById,
  UserExperienceType,
} from '@dailydotdev/shared/src/graphql/user/profile';
import type { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from '../../../../../pages/settings/profile/experience/edit';

jest.mock('@dailydotdev/shared/src/graphql/user/profile', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/user/profile'),
  getUserExperienceById: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/features/onboarding/lib/utils', () => ({
  getCookiesAndHeadersFromRequest: jest.fn(() => ({
    cookies: 'test-cookie',
    headers: {},
  })),
}));

const mockGetUserExperienceById = getUserExperienceById as jest.MockedFunction<
  typeof getUserExperienceById
>;

const createMockContext = (
  query: Record<string, string | string[] | undefined> = {},
): GetServerSidePropsContext =>
  ({
    query,
    req: {
      headers: {
        cookie: 'test-cookie',
      },
    },
    res: {},
  } as unknown as GetServerSidePropsContext);

const mockExperience = {
  id: 'exp-123',
  type: UserExperienceType.Work,
  title: 'Software Engineer',
  description: 'Building great software',
  createdAt: '2024-01-01T00:00:00.000Z',
  startedAt: '2023-06-15T00:00:00.000Z',
  endedAt: '2024-01-01T00:00:00.000Z',
  company: { id: 'company-1', name: 'Test Company', image: null },
  customCompanyName: null,
  isOwner: true,
  skills: [{ value: 'TypeScript' }, { value: 'React' }],
  location: {
    id: 'loc-1',
    city: 'San Francisco',
    subdivision: 'CA',
    country: 'USA',
    externalId: 'ext-loc-1',
  },
};

describe('edit experience page getServerSideProps', () => {
  beforeEach(() => {
    mockGetUserExperienceById.mockReset();
  });

  describe('when no id is provided', () => {
    it('should return default values with the specified type', async () => {
      const context = createMockContext({ type: UserExperienceType.Education });
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('props');
      expect(
        (result as { props: { experience: { type: string } } }).props.experience
          .type,
      ).toBe(UserExperienceType.Education);
      expect(mockGetUserExperienceById).not.toHaveBeenCalled();
    });

    it('should default to work type when no type is specified', async () => {
      const context = createMockContext({});
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('props');
      expect(
        (result as { props: { experience: { type: string } } }).props.experience
          .type,
      ).toBe(UserExperienceType.Work);
    });
  });

  describe('when id is provided', () => {
    it('should return experience props when user is the owner', async () => {
      mockGetUserExperienceById.mockResolvedValueOnce(mockExperience);

      const context = createMockContext({
        id: 'exp-123',
        type: UserExperienceType.Work,
      });
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('props');
      const { props } = result as { props: { experience: unknown } };
      expect(props.experience).toMatchObject({
        id: 'exp-123',
        type: UserExperienceType.Work,
        title: 'Software Engineer',
        skills: ['TypeScript', 'React'],
        startedAtMonth: '5', // June is month 5 (0-indexed)
        startedAtYear: '2023',
        current: false,
      });
    });

    it('should redirect when user is not the owner', async () => {
      mockGetUserExperienceById.mockResolvedValueOnce({
        ...mockExperience,
        isOwner: false,
      });

      const context = createMockContext({
        id: 'exp-123',
        type: UserExperienceType.Work,
      });
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('redirect');
      expect(
        (result as { redirect: { destination: string } }).redirect.destination,
      ).toBe('/settings/profile/experience/work');
      expect(
        (result as { redirect: { permanent: boolean } }).redirect.permanent,
      ).toBe(false);
    });

    it('should redirect when experience is not found', async () => {
      mockGetUserExperienceById.mockResolvedValueOnce(null);

      const context = createMockContext({
        id: 'non-existent-id',
        type: UserExperienceType.Education,
      });
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('redirect');
      expect(
        (result as { redirect: { destination: string } }).redirect.destination,
      ).toBe('/settings/profile/experience/education');
    });

    it('should set current to true when endedAt is null', async () => {
      mockGetUserExperienceById.mockResolvedValueOnce({
        ...mockExperience,
        endedAt: null,
        isOwner: true,
      });

      const context = createMockContext({
        id: 'exp-123',
        type: UserExperienceType.Work,
      });
      const result = await getServerSideProps(context);

      expect(result).toHaveProperty('props');
      const { props } = result as {
        props: { experience: { current: boolean } };
      };
      expect(props.experience.current).toBe(true);
    });
  });
});
