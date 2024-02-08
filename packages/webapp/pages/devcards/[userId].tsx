import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import {
  DevCard,
  DevCardType,
} from '@dailydotdev/shared/src/components/profile/DevCard';
import { ReactElement } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface DevCardPageProps {
  userId: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<DevCardPageProps>> {
  const { userId } = params;

  if (!userId) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  return {
    props: { userId: userId as string },
    revalidate: 60,
  };
}

const DevCardPage = ({ userId }: DevCardPageProps): ReactElement => {
  return (
    <div id="screenshot_wrapper" className="w-[356px]">
      <DevCard userId={userId} type={DevCardType.Vertical} />
    </div>
  );
};

export default DevCardPage;
