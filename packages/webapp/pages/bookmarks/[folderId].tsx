import React, { ReactElement, useMemo } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import {
  BookmarkFolder,
  getBookmarkFolder,
} from '@dailydotdev/shared/src/graphql/bookmarks';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import {
  getBookmarkFeedLayout,
  bookmarkFeedLayoutProps,
} from '../../components/layouts/BookmarkFeedPage';

const seo: NextSeoProps = {
  title: `Your daily.dev bookmarks`,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

interface BookmarksFolderPageProps {
  folder: BookmarkFolder;
}

const BookmarksPage = ({ folder }: BookmarksFolderPageProps): ReactElement => {
  const title = `${folder.icon} ${folder.name}`;
  const props = useMemo(
    () => ({ ...bookmarkFeedLayoutProps, folder, title }),
    [folder, title],
  );
  const layout = getBookmarkFeedLayout(null, { seo }, props);

  return <>{layout}</>;
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}): Promise<GetStaticPropsResult<BookmarksFolderPageProps>> {
  try {
    const folder = await getBookmarkFolder(params.folderId);

    return {
      props: { folder },
      revalidate: 60,
    };
  } catch (err) {
    return {
      redirect: { destination: '/404', permanent: false },
      revalidate: 60,
    };
  }
}

export default BookmarksPage;
