import React, { ReactElement } from 'react';
import { Card } from '@dailydotdev/shared/src/components/cards/Card';
import Link from 'next/link';
import {
  SourceAuthorProps,
  UserHighlight,
} from '@dailydotdev/shared/src/components/widgets/PostUsersHighlights';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  HomeIcon,
  PlusIcon,
  SitesIcon,
} from '@dailydotdev/shared/src/components/icons';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import classed from '@dailydotdev/shared/src/lib/classed';
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
  const isMobile = useViewSize(ViewSize.MobileL);
  const MobileDiv = classed(
    'div',
    'flex flex-col border-b border-b-border-subtlest-tertiary p-4',
  );
  const CardElement = classed(Card, '!max-h-none !p-4');
  const Wrapper = isMobile ? MobileDiv : CardElement;
  return (
    <Wrapper>
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
    </Wrapper>
  );
};

const SourcesPage = (): ReactElement => {
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    <main className="py-6 tablet:px-4 laptop:px-10">
      <div className="flex justify-between">
        <div className="hidden h-10 items-center p-1.5 text-border-subtlest-tertiary laptop:flex">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<HomeIcon secondary />}
            tag="a"
            href={process.env.NEXT_PUBLIC_WEBAPP_URL}
            size={ButtonSize.XSmall}
          />
          /
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<SitesIcon secondary />}
            disabled
          >
            Sources
          </Button>
        </div>
        <Button
          icon={<PlusIcon />}
          variant={isLaptop ? ButtonVariant.Secondary : ButtonVariant.Float}
          className="mb-6 ml-4 tablet:ml-0 laptop:float-right"
          onClick={() => openModal({ type: LazyModal.NewSource })}
        >
          Suggest new source
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptopXL:grid-cols-4">
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
