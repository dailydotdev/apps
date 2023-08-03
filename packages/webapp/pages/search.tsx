import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { SearchMessage } from '@dailydotdev/shared/src/components';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const baseSeo: NextSeoProps = {
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

// TODO WT-1554-stream-rendering revert changes in this file
const Search = (): ReactElement => {
  const router = useRouter();
  const { query } = router;

  const seo = useMemo(() => {
    if ('q' in query) {
      return {
        title: `${query.q} - daily.dev search`,
      };
    }
    return {
      title: 'daily.dev | Where developers grow together',
    };
  }, [query]);

  const { messages, handleSubmit, input, setInput, status } = useChat({});
  const content = messages[0] || '';

  return (
    <>
      <NextSeo {...seo} {...baseSeo} />
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <button
        type="submit"
        className="btn-primary"
        onClick={() => {
          handleSubmit();
        }}
      >
        Search
      </button>
      {!content && status && <div>{status}</div>}
      <SearchMessage content={messages[0] || ''} />
    </>
  );
};

// Search.getLayout = ({ children }) => children;
// Search.layoutProps = { ...mainFeedLayoutProps, mobileTitle: 'Search' };

export default Search;
