import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  MagicIcon,
  ShieldIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import classNames from 'classnames';
import { Divider } from '@dailydotdev/shared/src/components/utilities';
import { Chip } from '@dailydotdev/shared/src/components/cards/common/PostTags';
import { AnonymousUserTable } from '@dailydotdev/shared/src/components/recruiter/AnonymousUserTable';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import { RecruiterProgress } from '@dailydotdev/shared/src/components/recruiter/Progress';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useRouter } from 'next/router';
import {
  OpportunityPreviewProvider,
  useOpportunityPreviewContext,
} from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { cloudinarySquadsImageFallback } from '@dailydotdev/shared/src/lib/image';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

const iconSize = 24;
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

type CompanyItemProps = {
  favicon?: string;
  name: string;
};
const CompanyItem = ({ favicon, name }: CompanyItemProps) => (
  <div className="flex gap-2">
    <img
      src={`${apiUrl}/icon?url=${encodeURIComponent(favicon)}&size=${iconSize}`}
      className="size-4 rounded-2"
      alt={name}
    />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {name}
    </Typography>
  </div>
);

const RelevantBlock = () => {
  const data = useOpportunityPreviewContext();
  const totalCount = data?.result?.totalCount ?? 0;
  const tags = data?.result?.tags ?? [];
  const companies = data?.result?.companies ?? [];
  const squads = data?.result?.squads ?? [];

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
          {totalCount.toLocaleString()}
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
        {tags.map((tag) => (
          <Chip key={tag} className="!my-0 !text-text-tertiary">
            {tag}
          </Chip>
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <Typography type={TypographyType.Footnote} bold>
        Developers verified work at
      </Typography>
      <div className="grid grid-cols-2 gap-2">
        {companies.map((company) => (
          <CompanyItem
            key={company.name}
            favicon={company.favicon}
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
          <div className="flex gap-2" key={squad.handle}>
            <img
              src={cloudinarySquadsImageFallback}
              className="size-4 rounded-full"
              alt={squad.image}
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {squad.handle}
            </Typography>
          </div>
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
  const router = useRouter();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();

  const handlePrepareCampaignClick = useCallback(() => {
    if (!user) {
      openModal({
        type: LazyModal.RecruiterSignIn,
      });
    } else {
      router.push('/recruiter/prepare');
    }
  }, [user, openModal, router]);

  return (
    <OpportunityPreviewProvider>
      <div className="flex flex-1 flex-col">
        <RecruiterHeader
          headerButton={{
            text: 'Prepare campaign',
            onClick: handlePrepareCampaignClick,
          }}
        />
        <RecruiterProgress />
        <div className="flex flex-1">
          <ContentSidebar />
          <AnonymousUserTable />
        </div>
      </div>
    </OpportunityPreviewProvider>
  );
}

RecruiterPage.getLayout = getLayout;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
