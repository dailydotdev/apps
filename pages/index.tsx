import {useRouter} from "next/router";

export default async function Home() {
  const router = useRouter();
  // Make sure we're in the browser
  if (typeof window !== 'undefined') {
    await router.push('https://daily.dev');
    return;
  }
}

export async function getServerSideProps({res}) {
  if (res) {
    res.writeHead(302, { Location: 'https://daily.dev' });
    res.end();
  }
  return { props: {} };
}
