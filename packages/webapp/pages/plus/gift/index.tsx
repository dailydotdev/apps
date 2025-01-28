import type { GetServerSideProps } from 'next';
import { getUserShortInfo } from '@dailydotdev/shared/src/graphql/users';
import type { PlusPageProps } from '../index';
import PlusPage from '../index';

const PlusGiftPage = PlusPage;

export const getServerSideProps: GetServerSideProps<PlusPageProps> = async ({
  res,
  query,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const giftToUserId = query.gift as string;

  if (!validateUserId(giftToUserId)) {
    return { props: {} };
  }

  try {
    const giftToUser = await getUserShortInfo(giftToUserId);

    if (giftToUser.isPlus) {
      return {
        props: {},
      };
    }

    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${1 * 60 * 60}`,
    );

    return { props: { giftToUser } };
  } catch (err) {
    return { props: {} };
  }
};

export default PlusGiftPage;
