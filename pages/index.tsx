import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export default async function Home(): Promise<ReactElement> {
  const router = useRouter();
  // Make sure we're in the browser
  if (typeof window !== 'undefined') {
    await router.push('https://daily.dev');
    return;
  }
}

export async function getServerSideProps({
  res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<null>> {
  if (res) {
    res.writeHead(302, { Location: 'https://daily.dev' });
    res.end();
  }
  return { props: null };
}
