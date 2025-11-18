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

const ContentSidebar = () => {
  return (
    <div className="flex w-[22.5rem] flex-col gap-4 border-r border-border-subtlest-tertiary p-4">
      <LoadingBlock />
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
