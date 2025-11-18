import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  MagicIcon,
  MoveToIcon,
  ShieldIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classed from '@dailydotdev/shared/src/lib/classed';
import classNames from 'classnames';
import { Divider } from '@dailydotdev/shared/src/components/utilities';
import { Chip } from '@dailydotdev/shared/src/components/cards/common/PostTags';
import { AnonymousUserTable } from '@dailydotdev/shared/src/components/recruiter/AnonymousUserTable';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

const ProgressItemIcon = classed(
  'div',
  'typo-caption2 rounded-8 flex items-center justify-center size-5',
);

type ProgressItemProps = {
  icon: ReactElement;
  title: string;
  active?: boolean;
  className?: string;
};
const ProgressItem = ({
  icon: Icon,
  title,
  active,
  className,
}: ProgressItemProps) => {
  return (
    <div
      className={classNames(
        'flex flex-1 items-center justify-center gap-2 p-2',
        active && 'text-brand-default',
        className,
      )}
    >
      <ProgressItemIcon
        className={
          active
            ? 'bg-brand-default font-bold text-surface-invert'
            : 'bg-surface-float text-text-tertiary'
        }
      >
        {Icon}
      </ProgressItemIcon>
      <Typography
        type={TypographyType.Caption2}
        color={active ? TypographyColor.Brand : TypographyColor.Tertiary}
      >
        {title}
      </Typography>
    </div>
  );
};

const Progress = () => (
  <div className="flex flex-row gap-4 border-b border-border-subtlest-tertiary">
    <ProgressItem icon={<VIcon />} title="Analyze & Match" active />
    <ProgressItem
      className="border-x border-border-subtlest-tertiary"
      icon={<p>2</p>}
      title="Prepare & Launch"
      active
    />
    <ProgressItem icon={<p>2</p>} title="Connect & Hire" />
  </div>
);

const Header = () => {
  return (
    <div className="flex flex-row items-center gap-2 border-b border-border-subtlest-tertiary p-4">
      <div>
        <Typography type={TypographyType.Title3} bold>
          This is how your candidates will see your job
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Review your draft carefully and update any details as needed.
        </Typography>
      </div>
      <div className="flex-1" />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Private matching.
        <br />
        No spam. 100% opt-in.
      </Typography>
      <Button variant={ButtonVariant.Primary} color={ButtonColor.Cabbage}>
        Outreach Settings <MoveToIcon />
      </Button>
    </div>
  );
};

type LoadingBlockItemProps = {
  icon: ReactElement;
  description: string;
  className?: string;
};
const LoadingBlockItem = ({
  icon: Icon,
  description,
  className,
}: LoadingBlockItemProps) => {
  return (
    <div className={classNames('flex flex-row items-center gap-2', className)}>
      {Icon}
      {description}
    </div>
  );
};

const LoadingBlock = () => {
  return (
    <div className="flex flex-col gap-4 rounded-16 bg-brand-float p-3">
      <LoadingBlockItem
        icon={<MagicIcon className="text-brand-default" />}
        description="Your hiring edge is loading."
        className="font-bold typo-callout"
      />
      <div className="flex flex-col gap-2">
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Your hiring edge is loading."
          className="typo-subhead"
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Your hiring edge is loading."
          className="typo-subhead"
        />
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <LoadingBlockItem
        icon={<ShieldIcon secondary />}
        description="No scraping. No spam. Only real intent."
        className="text-text-tertiary typo-footnote"
      />
    </div>
  );
};

type JobInfoItemProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};
const JobInfoItem = ({ title, description, children }: JobInfoItemProps) => {
  return (
    <div className="flex flex-col gap-1">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {title}
      </Typography>
      {description && (
        <Typography type={TypographyType.Subhead}>{description}</Typography>
      )}
      {children}
    </div>
  );
};

const JobInfo = () => {
  return (
    <div className="flex flex-col gap-4">
      <JobInfoItem title="Job Title" description="Senior Frontend Developer" />
      <JobInfoItem
        title="Location"
        description="Cupertino, California, United States"
      />
      <JobInfoItem title="Seniority" description="Senior" />
      <JobInfoItem title="Tech Stack">
        <div className="flex flex-wrap gap-2">
          {[{ keyword: 'JavaScript' }, { keyword: 'Next.js' }].map((tag) => (
            <Chip key={tag.keyword} className="!my-0 !text-text-tertiary">
              {tag.keyword}
            </Chip>
          ))}
        </div>
      </JobInfoItem>
      <JobInfoItem title="Key requirements">
        <ul className="list-disc pl-4 typo-callout">
          <li>Experience with React and Next.js</li>
          <li>Experience with TypeScript</li>
          <li>Experience with Tailwind CSS</li>
        </ul>
      </JobInfoItem>
      <div className="flex flex-col gap-1 rounded-16 bg-background-subtle px-4 py-2">
        <Typography type={TypographyType.Footnote} bold>
          Job in high level details
        </Typography>
        <Typography type={TypographyType.Footnote}>
          In the next step we will be going into details
        </Typography>
      </div>
    </div>
  );
};

const companies = [
  { domain: 'apple.com', name: 'Apple Inc.' },
  { domain: 'google.com', name: 'Google' },
  { domain: 'microsoft.com', name: 'Microsoft' },
  { domain: 'meta.com', name: 'Meta' },
  { domain: 'amazon.com', name: 'Amazon' },
  { domain: 'netflix.com', name: 'Netflix' },
];

const squads = [
  {
    icon: 'https://media.daily.dev/image/upload/s--5UYbnNwZ--/f_auto,q_auto/v1703238590/squads/1c73f1ee-c7fb-492d-8ac2-0d1ba72dc72a',
    name: 'DevOps',
  },
  {
    icon: 'https://media.daily.dev/image/upload/s--ljDCWNBZ--/f_auto/v1731669074/squads/efbb7001-f465-4dca-a829-5e56b672f8b2',
    name: 'Flutter Developers',
  },
  {
    icon: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
    name: 'WebDev',
  },
  {
    icon: 'https://media.daily.dev/image/upload/s--5UYbnNwZ--/f_auto,q_auto/v1703238590/squads/1c73f1ee-c7fb-492d-8ac2-0d1ba72dc72a',
    name: 'DevOps',
  },
  {
    icon: 'https://media.daily.dev/image/upload/s--ljDCWNBZ--/f_auto/v1731669074/squads/efbb7001-f465-4dca-a829-5e56b672f8b2',
    name: 'Flutter Developers',
  },
  {
    icon: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d81fd85ddaea4d25a658694de448118f',
    name: 'WebDev',
  },
];

type CompanyItemProps = {
  domain: string;
  name: string;
};
const CompanyItem = ({ domain, name }: CompanyItemProps) => (
  <div className="flex gap-2">
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}`}
      className="size-4 rounded-2"
      alt={name}
    />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {name}
    </Typography>
  </div>
);

type SquadItemProps = {
  icon: string;
  name: string;
};
const SquadItem = ({ icon, name }: SquadItemProps) => (
  <div className="flex gap-2">
    <img src={icon} className="size-4 rounded-2" alt={name} />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {name}
    </Typography>
  </div>
);

const RelevantBlock = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography type={TypographyType.Body} bold>
          Relevant active developer
        </Typography>
        <Typography
          type={TypographyType.Title2}
          bold
          color={TypographyColor.Brand}
        >
          5,001
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          30% searching for job only on daily.dev
        </Typography>
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <Typography type={TypographyType.Footnote} bold>
        Interesting in
      </Typography>
      <div className="flex flex-wrap gap-2">
        <Chip className="!my-0 !text-text-tertiary">Frontend Developer</Chip>{' '}
        <Chip className="!my-0 !text-text-tertiary">Next.js</Chip>
        <Chip className="!my-0 !text-text-tertiary">PHP</Chip>
        <Chip className="!my-0 !text-text-tertiary">cloud</Chip>
        <Chip className="!my-0 !text-text-tertiary">security</Chip>
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <Typography type={TypographyType.Footnote} bold>
        Developers verified work at
      </Typography>
      <div className="grid grid-cols-2 gap-2">
        {companies.map((company) => (
          <CompanyItem
            key={company.domain}
            domain={company.domain}
            name={company.name}
          />
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <div>
        <Typography type={TypographyType.Footnote} bold>
          Most active squads
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Where your matches are most active inside daily.dev.
        </Typography>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {squads.map((squad) => (
          <SquadItem key={squad.name} name={squad.name} icon={squad.icon} />
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
    </div>
  );
};

const ContentSidebar = () => {
  return (
    <div className="flex w-[22.5rem] flex-col gap-4 border-r border-border-subtlest-tertiary p-4">
      <LoadingBlock />
      <RelevantBlock />
      <JobInfo />
    </div>
  );
};

function RecruiterPage(): ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <Progress />
      <div className="flex flex-1">
        <ContentSidebar />
        <AnonymousUserTable />
      </div>
    </div>
  );
}

RecruiterPage.getLayout = getLayout;

export default RecruiterPage;
