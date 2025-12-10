import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
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
import { Loader } from '@dailydotdev/shared/src/components/Loader';
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
import { SeniorityLevel } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { seniorityLevelMap } from '@dailydotdev/shared/src/features/opportunity/common';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

const iconSize = 24;

type LoadingBlockItemProps = {
  icon: ReactElement;
  description: string;
  className?: string;
  isComplete?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
};
const LoadingBlockItem = ({
  icon: Icon,
  description,
  className,
  isComplete = false,
  isActive = false,
  isVisible = true,
}: LoadingBlockItemProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-2 transition-opacity duration-300',
        className,
        {
          'opacity-100': isComplete || isActive,
          'opacity-40': !isComplete && !isActive,
        },
      )}
    >
      {isActive && !isComplete ? <Loader className="size-5" /> : Icon}
      {description}
    </div>
  );
};

type LoadingBlockProps = {
  loadingStep: number;
};

const LoadingBlock = ({ loadingStep }: LoadingBlockProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-16 bg-brand-float p-3">
      <LoadingBlockItem
        icon={<MagicIcon className="text-brand-default" />}
        description="Your hiring edge is loading."
        className="font-bold typo-callout"
        isComplete
      />
      <div className="flex flex-col gap-2">
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Reading your job description"
          className="typo-subhead"
          isComplete={loadingStep >= 1}
          isActive={loadingStep === 0}
          isVisible={loadingStep >= 0}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Mapping skills, requirements, and intent"
          className="typo-subhead"
          isComplete={loadingStep >= 2}
          isActive={loadingStep === 1}
          isVisible={loadingStep >= 1}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Scanning the daily.dev network"
          className="typo-subhead"
          isComplete={loadingStep >= 3}
          isActive={loadingStep === 2}
          isVisible={loadingStep >= 2}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Ranking engineers most likely to engage"
          className="typo-subhead"
          isComplete={loadingStep >= 4}
          isActive={loadingStep === 3}
          isVisible={loadingStep >= 3}
        />
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <LoadingBlockItem
        icon={<ShieldIcon secondary />}
        description="No scraping. No spam. Only real intent."
        className="text-text-tertiary typo-footnote"
        isComplete
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

type JobInfoProps = {
  loadingStep: number;
};

const JobInfo = ({ loadingStep }: JobInfoProps) => {
  const { opportunity } = useOpportunityPreviewContext();

  // Show after step 1 completes (Reading job description)
  if (!opportunity || loadingStep < 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  const locationString =
    opportunity.location
      ?.map((loc) =>
        [loc.city, loc.subdivision, loc.country].filter(Boolean).join(', '),
      )
      .join(' / ') || 'Not specified';

  const seniorityLabel =
    seniorityLevelMap[
      opportunity.meta?.seniorityLevel ?? SeniorityLevel.UNSPECIFIED
    ];

  const requirements = opportunity.content?.overview?.content
    ? opportunity.content.overview.content.split('\n').filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <JobInfoItem title="Job Title" description={opportunity.title} />
      <JobInfoItem title="Location" description={locationString} />
      <JobInfoItem title="Seniority" description={seniorityLabel} />
      {opportunity.keywords && opportunity.keywords.length > 0 && (
        <JobInfoItem title="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {opportunity.keywords.map((tag) => (
              <Chip key={tag.keyword} className="!my-0 !text-text-tertiary">
                {tag.keyword}
              </Chip>
            ))}
          </div>
        </JobInfoItem>
      )}
      {requirements.length > 0 && (
        <JobInfoItem title="Key requirements">
          <ul className="list-disc pl-4 typo-callout">
            {requirements.slice(0, 3).map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </JobInfoItem>
      )}
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

type RelevantBlockProps = {
  loadingStep: number;
};

const RelevantBlock = ({ loadingStep }: RelevantBlockProps) => {
  const data = useOpportunityPreviewContext();
  const totalCount = data?.result?.totalCount ?? 0;
  const tags = data?.result?.tags ?? [];
  const companies = data?.result?.companies ?? [];
  const squads = data?.result?.squads ?? [];
  const hasData = totalCount > 0 || tags.length > 0;
  const [animatedCount, setAnimatedCount] = useState(0);
  const [showSubtext, setShowSubtext] = useState(false);

  // Show after step 2 completes (Mapping skills, requirements, and intent)
  const isVisible = hasData && loadingStep >= 2;

  // Animate count from 0 to totalCount
  useEffect(() => {
    if (!isVisible || totalCount === 0) {
      return undefined;
    }

    const duration = 1000; // 1 second animation
    const steps = 30;
    const increment = totalCount / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setAnimatedCount(totalCount);
        setShowSubtext(true);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, totalCount]);

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography type={TypographyType.Body} bold>
          Relevant active developer
        </Typography>
        <Typography
          type={TypographyType.Title2}
          bold
          color={TypographyColor.Brand}
        >
          {animatedCount.toLocaleString()}
        </Typography>
        {showSubtext && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            30% searching for job only on daily.dev
          </Typography>
        )}
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

type ContentSidebarProps = {
  loadingStep: number;
};

const ContentSidebar = ({ loadingStep }: ContentSidebarProps) => {
  return (
    <div className="flex w-[22.5rem] flex-col gap-4 border-r border-border-subtlest-tertiary p-4">
      <LoadingBlock loadingStep={loadingStep} />
      <RelevantBlock loadingStep={loadingStep} />
      <JobInfo loadingStep={loadingStep} />
    </div>
  );
};

type UserTableWrapperProps = {
  loadingStep: number;
};

const UserTableWrapper = ({ loadingStep }: UserTableWrapperProps) => {
  const data = useOpportunityPreviewContext();
  const hasData = data?.edges && data.edges.length > 0;

  // Show after step 4 completes (Ranking engineers most likely to engage)
  if (!hasData || loadingStep < 4) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <AnonymousUserTable />;
};

const RecruiterPageContent = () => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setLoadingStep(1), 800));
    timers.push(setTimeout(() => setLoadingStep(2), 1600));
    timers.push(setTimeout(() => setLoadingStep(3), 2400));
    timers.push(setTimeout(() => setLoadingStep(4), 3200));

    return () => timers.forEach(clearTimeout);
  }, []);

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
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Prepare campaign',
          onClick: handlePrepareCampaignClick,
        }}
      />
      <RecruiterProgress />
      <div className="flex flex-1">
        <ContentSidebar loadingStep={loadingStep} />
        <UserTableWrapper loadingStep={loadingStep} />
      </div>
    </div>
  );
};

function RecruiterPage(): ReactElement {
  return (
    <OpportunityPreviewProvider>
      <RecruiterPageContent />
    </OpportunityPreviewProvider>
  );
}

RecruiterPage.getLayout = getLayout;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
