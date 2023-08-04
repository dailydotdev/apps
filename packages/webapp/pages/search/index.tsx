import React, { ReactElement } from 'react';
import { NextSeo } from 'next-seo';
import {
  SearchFeedback,
  SearchResult,
  SourceList,
} from '@dailydotdev/shared/src/components/search';
import { useChat } from '@dailydotdev/shared/src/hooks';
import { FieldInput } from '@dailydotdev/shared/src/components/fields/common';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const SearchPage = (): ReactElement => {
  const { messages, handleSubmit, input, setInput } = useChat({});
  const content = messages[0] || '';

  return (
    <main className="m-auto w-full">
      <NextSeo nofollow noindex />
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-y-6 pt-8 m-auto max-w-screen-laptop">
        <main className="flex flex-col flex-1 col-span-2 px-4 laptop:px-8">
          <FieldInput
            className="bg-theme-label-primary field"
            placeholder="Search here"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              handleSubmit();
            }}
          >
            Search
          </button>
        </main>
        <SearchFeedback />
        {!!content && (
          <>
            <SearchResult content={content} />
            <SourceList />
          </>
        )}
      </div>
    </main>
  );
};

SearchPage.getLayout = getMainLayout;
SearchPage.layoutProps = { screenCentered: false };
export default SearchPage;
