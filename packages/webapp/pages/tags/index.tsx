import React, { ReactElement } from 'react';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import Link from 'next/link';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';

const ListItem = ({
  index,
  tag,
}: {
  index: number;
  tag: string;
}): ReactElement => {
  return (
    <li className="py-1.5 pr-2 text-text-tertiary">
      <Link href={getTagPageLink(tag)} passHref key={tag} prefetch={false}>
        <a className="inline-block w-full">
          <span className="inline-flex w-6 pr-2 text-text-quaternary">
            {index}
          </span>
          {tag}
        </a>
      </Link>
    </li>
  );
};

const TopList = ({ title }: { title: string }): ReactElement => {
  return (
    <Card className="!p-4">
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">
        {[...new Array(10)].map((_, i) => (
          <ListItem key={i} index={i + 1} tag={i + 1} />
        ))}
      </ol>
    </Card>
  );
};

const TagsPage = (): ReactElement => {
  return (
    <main className="px-10 py-6">
      <div className="flex h-10 items-center">Breadcrumbs</div>
      <div className="grid grid-cols-3 gap-6">
        <TopList title="Trending tags" />
        <TopList title="Popular tags" />
        <TopList title="Recently added tags" />
      </div>
      <div>
        <p>All tags</p>
        <div className="grid grid-cols-5">
          <p>Item 1</p>
          <p>Item 2</p>
          <p>Item 3</p>
          <p>Item 4</p>
          <p>Item 5</p>
          <p>Item 6</p>
        </div>
      </div>
    </main>
  );
};

const getTagsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TagsPage.getLayout = getTagsPageLayout;
TagsPage.layoutProps = {
  screenCentered: false,
};
export default TagsPage;
