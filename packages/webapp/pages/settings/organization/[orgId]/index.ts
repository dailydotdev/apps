import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { orgId } = params;

  return {
    redirect: {
      destination: `/settings/organization/${orgId}/members`,
      permanent: false,
    },
  };
};

const Page = () => null;

export default Page;
