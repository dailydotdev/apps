import React, { ReactElement } from 'react';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import Link from 'next/link';
import {
  SourceAuthorProps,
  UserHighlight,
} from '@dailydotdev/shared/src/components/widgets/PostUsersHighlights';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const ListItem = ({
  index,
  href,
  children,
}: {
  index: number;
  href: string;
  children: ReactElement;
}): ReactElement => {
  return (
    <li>
      <Link href={href} passHref key={href} prefetch={false}>
        <a className="flex w-full flex-row items-center">
          <span className="inline-flex w-4 text-text-quaternary">{index}</span>
          {children}
        </a>
      </Link>
    </li>
  );
};

const mockProps: SourceAuthorProps = {
  id: 'daily_updates',
  active: true,
  handle: 'daily_updates',
  name: 'daily.dev changelog',
  permalink: 'http://webapp.local.com:5002/sources/daily_updates',
  public: true,
  type: 'machine',
  description: null,
  image:
    'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/172d19bda1bd403f9497a9d29a3ed99b',
  membersCount: 0,
  privilegedMembers: [],
  currentMember: null,
  memberPostingRole: 'member',
  memberInviteRole: 'member',
  userType: 'source',
  allowSubscribe: false,
};

const TopList = ({ title }: { title: string }): ReactElement => {
  return (
    <Card className="!max-h-none !p-4">
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">
        {[...new Array(10)].map((_, i) => (
          <ListItem key={i} index={i + 1} href={mockProps.permalink}>
            <UserHighlight
              {...mockProps}
              className={{
                wrapper: '!p-2',
                image: '!h-8 !w-8',
                textWrapper: '!ml-2',
                name: '!typo-caption1',
                handle: '!typo-caption2',
              }}
            />
          </ListItem>
        ))}
      </ol>
    </Card>
  );
};

const SourcesPage = (): ReactElement => {
  const { openModal } = useLazyModal();

  return (
    <main className="px-4 py-6 laptop:px-10">
      <div className="mb-6 inline-block h-10 content-center items-center">
        Breadcrumbs
      </div>
      <Button
        icon={<PlusIcon />}
        variant={ButtonVariant.Secondary}
        className="float-right mb-6"
        onClick={() => openModal({ type: LazyModal.NewSource })}
      >
        Suggest new source
      </Button>
      <div className="grid grid-cols-2 gap-6 laptopXL:grid-cols-4">
        <TopList title="Trending sources" />
        <TopList title="Popular sources" />
        <TopList title="Recently added sources" />
        <TopList title="Top video sources" />
      </div>
    </main>
  );
};

const getSourcesPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SourcesPage.getLayout = getSourcesPageLayout;
SourcesPage.layoutProps = {
  screenCentered: false,
};
export default SourcesPage;
