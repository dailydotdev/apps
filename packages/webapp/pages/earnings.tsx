import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import type { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import {
  DateFormat,
  PageWidgets,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { docs, searchDocs } from '@dailydotdev/shared/src/lib/constants';
import {
  CoinIcon,
  DevPlusIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import classNames from 'classnames';
import classed from '@dailydotdev/shared/src/lib/classed';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import type { UserImageProps } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';

type BuyCoreProps = {
  amount: number;
  price: number;
};
const BuyCore = ({ amount, price }: BuyCoreProps): ReactElement => {
  return (
    <div className="flex flex-1 flex-col items-center rounded-14 bg-surface-float p-2">
      <CoinIcon size={IconSize.XLarge} className="mb-1" />
      <Typography type={TypographyType.Title3} bold>
        {amount}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        ${price}
      </Typography>
    </div>
  );
};

type BalanceBlockProps = {
  Icon: ReactElement;
  title: string;
  description: string;
  balance: number;
} & WithClassNameProps;
const BalanceBlock = ({
  Icon,
  balance,
  title,
  description,
  className,
}: BalanceBlockProps): ReactElement => {
  return (
    <div
      className={classNames('flex flex-1 flex-col rounded-14 p-4', className)}
    >
      {Icon}
      <SimpleTooltip content={description} appendTo="parent">
        <div className="mt-4 flex gap-1">
          <Typography type={TypographyType.Callout}>{title}</Typography>
          <InfoIcon />
        </div>
      </SimpleTooltip>
      <Typography type={TypographyType.Title2} bold>
        {balance}
      </Typography>
    </div>
  );
};

const Divider = classed('div', 'h-px w-full bg-border-subtlest-tertiary');

type TransactionItemProps = {
  type: 'tip' | 'awardCredit' | 'awardDebit' | 'purchase';
  user: UserImageProps;
  date: Date;
  amount: number;
};

const TransactionTypeToIcon: Record<
  TransactionItemProps['type'],
  ReactElement
> = {
  tip: (
    <div className="size-4 rounded-10 bg-action-upvote-float text-accent-avocado-default">
      <PlusIcon size={IconSize.Size16} />
    </div>
  ),
  awardCredit: (
    <div className="size-4 rounded-10 bg-action-upvote-float text-accent-avocado-default">
      <PlusIcon size={IconSize.Size16} />
    </div>
  ),
  awardDebit: (
    <div className="size-4 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
      <MinusIcon size={IconSize.Size16} />
    </div>
  ),
  purchase: (
    <div className="size-4 rounded-10 bg-action-bookmark-float text-accent-bun-default">
      <CoinIcon size={IconSize.Size16} />
    </div>
  ),
};
const TransactionItem = ({
  type,
  user,
  date,
  amount,
}: TransactionItemProps): ReactElement => {
  return (
    <li className="flex">
      <div className="flex flex-1 items-center gap-2">
        {TransactionTypeToIcon[type]}
        <ProfilePicture size={ProfileImageSize.Medium} user={user} />{' '}
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Subhead} bold>
            {user.name}
          </Typography>
          <div className="flex text-text-tertiary typo-footnote">
            <Typography type={TypographyType.Footnote}>{type}</Typography>
            <Separator />
            <DateFormat date={date} type={TimeFormatType.Post} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <CoinIcon />
        <Typography type={TypographyType.Callout} bold>
          {type === 'awardDebit' ? '-' : '+'}
          {amount}
        </Typography>
      </div>
    </li>
  );
};

const Earnings = (): ReactElement => {
  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-2">
            <Typography type={TypographyType.Title3} bold>
              Core wallet
            </Typography>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
              Buy Cores
            </Button>
          </header>
          <div className="flex flex-col gap-6 p-6">
            <section className="flex w-full flex-wrap gap-4">
              <BalanceBlock
                Icon={<CoinIcon size={IconSize.Small} />}
                title="Balance"
                description="Lorem Ipsum Dollar Si Amet"
                balance={4500}
                className="bg-surface-float"
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-bookmark-float text-accent-bun-default">
                    <CoinIcon size={IconSize.Small} />
                  </div>
                }
                title="Balance"
                description="Lorem Ipsum Dollar Si Amet"
                balance={4500}
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-upvote-float text-accent-avocado-default">
                    <PlusIcon size={IconSize.Small} />
                  </div>
                }
                title="Balance"
                description="Lorem Ipsum Dollar Si Amet"
                balance={4500}
              />
              <BalanceBlock
                Icon={
                  <div className="size-6 rounded-10 bg-action-downvote-float text-accent-ketchup-default">
                    <MinusIcon size={IconSize.Small} />
                  </div>
                }
                title="Balance"
                description="Lorem Ipsum Dollar Si Amet"
                balance={4500}
              />
            </section>
            <Divider />
            <section className="flex w-full flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Typography type={TypographyType.Body}>
                  <strong>Earn with daily.dev</strong> (beta)
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Earn income by engaging with the daily.dev community,
                  contributing valuable content, and receiving Cores from
                  others. Once you reach 10,000 Cores, you can request a
                  withdrawal. Monetization is still in beta, so additional
                  eligibility steps and requirements may apply.
                </Typography>
              </div>
              <div className="flex gap-2">
                <CoinIcon />
                <div className="flex flex-col gap-1.5">
                  <ProgressBar
                    shouldShowBg
                    percentage={78.65}
                    className={{
                      wrapper: 'h-2 rounded-8',
                      bar: 'h-full rounded-8',
                      barColor: 'bg-accent-bun-default',
                    }}
                  />
                  <Typography type={TypographyType.Callout}>
                    7,865/<strong>10,000</strong> Cores (≈ USD $100)
                  </Typography>
                </div>
              </div>
              <Button
                variant={ButtonVariant.Secondary}
                className="mr-auto"
                disabled
              >
                Withdraw
              </Button>
            </section>
            <Divider />
            <section className="flex w-full flex-col gap-6">
              <Typography type={TypographyType.Body} bold>
                Transaction history
              </Typography>
              <ul className="flex flex-col gap-4">
                <TransactionItem
                  type="tip"
                  user={{
                    id: '123',
                    name: 'John Doe',
                    username: 'johndoe',
                    image:
                      'https://lh3.googleusercontent.com/a/ACg8ocKC0Gt247CSHrl-ndg5h9d87sLqRh6sppbf_a3jX5ciOQ2VSSs=s64-c',
                  }}
                  amount={40}
                  date={new Date('02-01-2025')}
                />
                <TransactionItem
                  type="awardCredit"
                  user={{
                    id: '123',
                    name: 'John Doe',
                    username: 'johndoe',
                    image:
                      'https://lh3.googleusercontent.com/a/ACg8ocKC0Gt247CSHrl-ndg5h9d87sLqRh6sppbf_a3jX5ciOQ2VSSs=s64-c',
                  }}
                  amount={45}
                  date={new Date('02-01-2025')}
                />
                <TransactionItem
                  type="purchase"
                  user={{
                    id: '123',
                    name: 'John Doe',
                    username: 'johndoe',
                    image:
                      'https://lh3.googleusercontent.com/a/ACg8ocKC0Gt247CSHrl-ndg5h9d87sLqRh6sppbf_a3jX5ciOQ2VSSs=s64-c',
                  }}
                  amount={100}
                  date={new Date('02-01-2025')}
                />
                <TransactionItem
                  type="awardDebit"
                  user={{
                    id: '123',
                    name: 'John Doe',
                    username: 'johndoe',
                    image:
                      'https://lh3.googleusercontent.com/a/ACg8ocKC0Gt247CSHrl-ndg5h9d87sLqRh6sppbf_a3jX5ciOQ2VSSs=s64-c',
                  }}
                  amount={1000}
                  date={new Date('02-01-2025')}
                />
              </ul>
            </section>
          </div>
        </main>
        <PageWidgets className="flex gap-4 py-6">
          <WidgetContainer className="hidden flex-col gap-4 p-6 laptop:flex">
            <div className="gap-1">
              <Typography type={TypographyType.Body} bold>
                Buy Cores
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                Stock up on Cores to engage, reward, and unlock more on
                daily.dev
              </Typography>
            </div>
            <div className="flex gap-3">
              <BuyCore amount={100} price={3.99} />
              <BuyCore amount={500} price={50} />
              <BuyCore amount={1000} price={100} />
            </div>
            <Button variant={ButtonVariant.Float}>See more options</Button>
          </WidgetContainer>
          <WidgetContainer className="flex flex-col gap-4 p-6">
            <div className="flex justify-between">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
                className="flex gap-1"
                color={TypographyColor.Plus}
              >
                <DevPlusIcon size={IconSize.XSmall} /> Plus
              </Typography>
              🎁
            </div>
            <Typography type={TypographyType.Body} bold>
              Get 100 Cores every month with daily.dev Plus and access pro
              features to fast-track your growth.
            </Typography>
            <Button
              className="mt-2"
              variant={ButtonVariant.Primary}
              color={ButtonColor.Bacon}
            >
              Upgrade to Plus
            </Button>
          </WidgetContainer>
          <WidgetContainer className="flex flex-col">
            <div className="flex justify-around p-4">
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={docs}
                icon={<FeedbackIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Docs
              </Button>
              <ListCardDivider className="mx-3" />
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={searchDocs}
                icon={<DocsIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Terms
              </Button>
            </div>
          </WidgetContainer>
        </PageWidgets>
      </div>
    </ProtectedPage>
  );
};

const getEarningsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = { title: 'Earnings', nofollow: true, noindex: true };

Earnings.getLayout = getEarningsLayout;
Earnings.layoutProps = { seo, screenCentered: false };

export default Earnings;
