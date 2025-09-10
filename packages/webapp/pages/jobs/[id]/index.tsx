import React, { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import type { NextSeoProps } from 'next-seo';
import type { GetServerSideProps } from 'next';
import { useQuery } from '@tanstack/react-query';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source';
import {
  ProfileImageSize,
  ProfilePicture,
  sizeClasses,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CrunchbaseIcon,
  GitHubIcon,
  LinkedInIcon,
  MagicIcon,
  MoveToIcon,
  OpenLinkIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { Chip } from '@dailydotdev/shared/src/components/cards/common/PostTags';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { briefButtonBg } from '@dailydotdev/shared/src/styles/custom';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import ShowMoreContent from '@dailydotdev/shared/src/components/cards/common/ShowMoreContent';
import {
  opportunityByIdOptions,
  opportunityMatchOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { CVOverlay } from '@dailydotdev/shared/src/features/opportunity/components/CVOverlay';
import { JobPageIntro } from '@dailydotdev/shared/src/features/opportunity/components/JobPageIntro';
import { ResponseButtons } from '@dailydotdev/shared/src/features/opportunity/components/ResponseButtons';
import type {
  Opportunity,
  OpportunityMeta,
} from '@dailydotdev/shared/src/features/opportunity/types';
import { LocationType } from '@dailydotdev/shared/src/features/opportunity/protobuf/util';
import {
  EmploymentType,
  SalaryPeriod,
  SeniorityLevel,
} from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import {
  CompanySize,
  CompanyStage,
} from '@dailydotdev/shared/src/features/opportunity/protobuf/organization';
import { getLayout } from '../../../components/layouts/NoSidebarLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

const faq = [
  {
    key: 'overview',
    title: 'Overview',
  },
  {
    key: 'responsibilities',
    title: 'Responsibilities',
  },
  {
    key: 'requirements',
    title: 'Requirements',
  },
  {
    key: 'whatYoullDo',
    title: "What you'll do",
  },
  {
    key: 'interviewProcess',
    title: 'Interview process',
  },
];

const socialMediaIconMap = {
  linkedin: <LinkedInIcon />,
  x: <TwitterIcon />,
  github: <GitHubIcon />,
  crunchbase: <CrunchbaseIcon />,
};

const locationTypeMap = {
  [LocationType.UNSPECIFIED]: 'N/A',
  [LocationType.REMOTE]: 'Remote',
  [LocationType.OFFICE]: 'Office',
  [LocationType.HYBRID]: 'Hybrid',
};

const roleTypeMap = {
  0: 'Individual Contributor',
  1: 'Management',
};

const employmentTypeMap = {
  [EmploymentType.UNSPECIFIED]: 'N/A',
  [EmploymentType.FULL_TIME]: 'Full-time',
  [EmploymentType.PART_TIME]: 'Part-time',
  [EmploymentType.CONTRACT]: 'Contract',
  [EmploymentType.INTERNSHIP]: 'Internship',
};

const seniorityLevelMap = {
  [SeniorityLevel.UNSPECIFIED]: 'N/A',
  [SeniorityLevel.INTERN]: 'Intern',
  [SeniorityLevel.JUNIOR]: 'Junior',
  [SeniorityLevel.MID]: 'Mid',
  [SeniorityLevel.SENIOR]: 'Senior',
  [SeniorityLevel.LEAD]: 'Lead',
  [SeniorityLevel.MANAGER]: 'Manager',
  [SeniorityLevel.DIRECTOR]: 'Director',
  [SeniorityLevel.VP]: 'VP',
  [SeniorityLevel.C_LEVEL]: 'C-Level',
};

const salaryPeriodMap = {
  [SalaryPeriod.UNSPECIFIED]: 'N/A',
  [SalaryPeriod.ANNUAL]: 'year',
  [SalaryPeriod.MONTHLY]: 'month',
  [SalaryPeriod.HOURLY]: 'hour',
};

const companySizeMap = {
  [CompanySize.COMPANY_SIZE_UNSPECIFIED]: 'N/A',
  [CompanySize.COMPANY_SIZE_1_10]: '1-10',
  [CompanySize.COMPANY_SIZE_11_50]: '11-50',
  [CompanySize.COMPANY_SIZE_51_200]: '51-200',
  [CompanySize.COMPANY_SIZE_201_500]: '201-500',
  [CompanySize.COMPANY_SIZE_501_1000]: '501-1000',
  [CompanySize.COMPANY_SIZE_1001_5000]: '1001-5000',
  [CompanySize.COMPANY_SIZE_5000_PLUS]: '5000+',
};

const companyStageMap = {
  [CompanyStage.UNSPECIFIED]: 'N/A',
  [CompanyStage.PRE_SEED]: 'Pre-Seed',
  [CompanyStage.SEED]: 'Seed',
  [CompanyStage.SERIES_A]: 'Series A',
  [CompanyStage.SERIES_B]: 'Series B',
  [CompanyStage.SERIES_C]: 'Series C',
  [CompanyStage.SERIES_D]: 'Series D',
  [CompanyStage.PUBLIC]: 'Public',
  [CompanyStage.BOOTSTRAPPED]: 'Bootstrapped',
  [CompanyStage.NON_PROFIT]: 'Non-Profit',
  [CompanyStage.GOVERNMENT]: 'Government',
};

const metaMap = {
  location: {
    title: 'Location',
    transformer: (value: Opportunity['location']) => {
      const location = value?.[0];
      if (!location) {
        return 'N/A';
      }
      return `${location.city}${
        location.subdivision ? `, ${location.subdivision}` : ''
      }${location.country ? `, ${location.country}` : ''}`;
    },
  },
  salary: {
    title: 'Salary range',
    transformer: (value: OpportunityMeta['salary']) =>
      `$${value.min}/${value.period} - $${value.max}/${
        salaryPeriodMap[value.period]
      }`,
  },
  locationType: {
    title: 'Work site',
    transformer: (value: Opportunity['location']) =>
      locationTypeMap[value?.[0].type || LocationType.UNSPECIFIED],
  },
  employmentType: {
    title: 'Employment type',
    transformer: (value: OpportunityMeta['employmentType']) =>
      employmentTypeMap[value || EmploymentType.UNSPECIFIED],
  },
  teamSize: {
    title: 'Team size',
    transformer: (value: OpportunityMeta['teamSize']) =>
      `${value} engineers` || 'N/A',
  },
  seniorityLevel: {
    title: 'Seniority level',
    transformer: (value: OpportunityMeta['seniorityLevel']) =>
      seniorityLevelMap[value || SeniorityLevel.UNSPECIFIED],
  },
  roleType: {
    title: 'Role type',
    transformer: (value: OpportunityMeta['roleType']) =>
      roleTypeMap[value] || 'N/A',
  },
};

const JobPage = ({
  opportunity: initialData,
}: {
  opportunity: Opportunity;
}): ReactElement => {
  const { checkHasCompleted } = useActions();
  const {
    query: { id, cv_step: cvStep },
  } = useRouter();

  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: id as string }),
    initialData,
  });
  const { data: match } = useQuery(
    opportunityMatchOptions({ id: id as string }),
  );

  const hasCompleted = checkHasCompleted(ActionType.ViewJob);
  const [showCVScreen, setShowCVScreen] = useState(!!cvStep);
  const activatedCVScreen = useRef<boolean>();

  const [showMore, setShowMore] = useState(false);

  const hasLinks =
    opportunity?.organization?.customLinks?.length > 0 ||
    opportunity?.organization?.pressLinks?.length > 0;

  useEffect(() => {
    if (cvStep && !activatedCVScreen.current) {
      setShowCVScreen(true);
      activatedCVScreen.current = true;
    }
    if (showCVScreen) {
      document.body.classList.add('hidden-scrollbar');
    }
    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, [showCVScreen, cvStep]);

  if (!opportunity || isPending) {
    return null;
  }

  return (
    <>
      {showCVScreen && <CVOverlay onDismiss={() => setShowCVScreen(false)} />}
      {!hasCompleted && <JobPageIntro />}
      <ResponseButtons
        id={opportunity.id}
        className={{
          buttons: 'flex-1',
          container:
            'fixed bottom-0 z-header flex min-h-14 w-full items-center gap-4 border-t border-border-subtlest-tertiary bg-background-default px-4 tablet:hidden',
        }}
        size={ButtonSize.Medium}
      />
      <div className="mx-auto flex w-full max-w-[69.25rem] flex-col gap-4 laptop:flex-row">
        <div className="h-full flex-1 flex-shrink-0 rounded-16 border border-border-subtlest-tertiary">
          {/* Header */}
          <div className="flex min-h-14 items-center gap-4 border-b border-border-subtlest-tertiary p-3">
            <div className="flex items-center">
              <SourceAvatar
                source={{
                  image: opportunity.organization.image,
                  handle: opportunity.organization.name,
                }}
                size={ProfileImageSize.Medium}
              />

              <Typography
                bold
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                {opportunity.organization.name}{' '}
                <Typography
                  tag={TypographyTag.Span}
                  color={TypographyColor.Tertiary}
                  className="font-normal"
                >
                  Verified opportunity
                </Typography>
              </Typography>
            </div>

            <ResponseButtons
              id={opportunity.id}
              className={{
                container: 'ml-auto hidden gap-2 tablet:flex',
              }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 px-8 py-6">
            {/* Recruiter */}
            <div className="flex items-center gap-2">
              <ProfilePicture
                user={opportunity.recruiters[0]}
                size={ProfileImageSize.Large}
              />

              <div className="flex flex-col">
                <Typography
                  bold
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                >
                  {opportunity.recruiters[0].name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {opportunity.recruiters[0].bio}
                </Typography>
              </div>
            </div>

            {/* Title */}
            <Typography
              bold
              tag={TypographyTag.H1}
              type={TypographyType.LargeTitle}
            >
              {opportunity.title}
            </Typography>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {opportunity.keywords?.map((tag) => (
                <Chip key={tag.keyword} className="!my-0 !text-text-tertiary">
                  {tag.keyword}
                </Chip>
              ))}
            </div>

            {/* TLDR */}
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              <span className="font-bold text-text-primary">TLDR</span>{' '}
              {opportunity.tldr}
            </Typography>

            {/* Details */}
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-white laptop:grid-cols-[max-content_1fr_max-content_1fr]">
              {Object.keys(metaMap).map((metaKey) => {
                const { title, transformer } = metaMap[metaKey];
                const isLocation =
                  metaKey === 'location' || metaKey === 'locationType';

                const value = isLocation
                  ? opportunity.location
                  : opportunity.meta[metaKey];

                return (
                  <>
                    <Typography
                      className="laptop:[&:nth-child(4n+3)]:pl-2"
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {title}
                    </Typography>
                    <Typography
                      className="laptop:[&:nth-child(4n+3)]:pl-2"
                      bold
                      type={TypographyType.Subhead}
                      color={TypographyColor.Primary}
                    >
                      {transformer(value)}
                    </Typography>
                  </>
                );
              })}
            </div>

            {/* Why we think */}
            {match?.description?.reasoning && (
              <FlexCol
                className="gap-2 rounded-16 p-4 text-black"
                style={{
                  background: briefButtonBg,
                }}
              >
                <div className="flex items-center gap-1">
                  <MagicIcon size={IconSize.Medium} />
                  <Typography bold type={TypographyType.Body}>
                    Why we think you&apos;ll like this
                  </Typography>
                </div>
                <Typography type={TypographyType.Callout}>
                  {match?.description?.reasoning}
                </Typography>
              </FlexCol>
            )}
          </div>

          {faq.map((faqItem) => (
            <div
              key={faqItem.key}
              className="border-t border-border-subtlest-tertiary px-8"
            >
              <Accordion
                className={{ button: 'min-h-12' }}
                title={<Typography>{faqItem.title}</Typography>}
              >
                <div
                  className="pb-4"
                  dangerouslySetInnerHTML={{
                    __html: opportunity.content[faqItem.key].html,
                  }}
                />
              </Accordion>
            </div>
          ))}

          <ResponseButtons
            id={opportunity.id}
            className={{
              container:
                'hidden gap-3 border-t border-border-subtlest-tertiary p-3 laptop:flex',
              buttons: 'flex-1',
            }}
          />
        </div>

        {/* Sidebar */}
        <FlexCol className="h-full flex-1 flex-shrink-0 gap-4 laptop:max-w-80">
          {/* Company Info */}
          <FlexCol
            className={classNames(
              'flex-1 gap-4 rounded-16 border border-border-subtlest-tertiary',
              !hasLinks && 'pb-4',
            )}
          >
            {/* Header */}
            <div className="flex min-h-14 items-center justify-between px-4 py-3">
              <Typography
                bold
                type={TypographyType.Body}
                color={TypographyColor.Primary}
              >
                Company
              </Typography>

              {opportunity.organization.website && (
                <Link href={opportunity.organization.website} passHref>
                  <Button
                    tag="a"
                    target="_blank"
                    rel={anchorDefaultRel}
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    icon={<OpenLinkIcon />}
                    iconPosition={ButtonIconPosition.Right}
                  >
                    Website
                  </Button>
                </Link>
              )}
            </div>
            {/* Company information */}
            <div className="flex px-4">
              <SourceAvatar
                source={{
                  image: opportunity.organization.image,
                  handle: opportunity.organization.name,
                }}
                size={ProfileImageSize.Large}
              />

              <div className="flex flex-col">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                >
                  {opportunity.organization.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {companyStageMap[opportunity.organization.stage]} •{' '}
                  {opportunity.organization.category}
                </Typography>
              </div>
            </div>

            {/* SoMe Links */}
            {opportunity.organization.socialLinks?.length > 0 && (
              <div className="flex gap-2 px-4">
                {opportunity.organization.socialLinks.map(
                  ({ link, socialType }) => (
                    <Link key={link} href={link} passHref>
                      <Button
                        variant={ButtonVariant.Subtle}
                        size={ButtonSize.Small}
                        icon={
                          socialMediaIconMap[
                            socialType.toLowerCase() as keyof typeof socialMediaIconMap
                          ]
                        }
                      />
                    </Link>
                  ),
                )}
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 px-4">
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
              >
                Founded
              </Typography>
              <Typography type={TypographyType.Footnote} bold>
                {opportunity.organization.founded}
              </Typography>

              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
              >
                HQ
              </Typography>
              <Typography type={TypographyType.Footnote} bold>
                {opportunity.organization.location}
              </Typography>

              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Tertiary}
              >
                Employees
              </Typography>
              <Typography type={TypographyType.Footnote} bold>
                {companySizeMap[opportunity.organization.size]}
              </Typography>
            </div>

            {/* Description */}
            {opportunity.organization.description && (
              <Typography
                className="px-4"
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {opportunity.organization.description}
              </Typography>
            )}

            {/* Perks & Benefits */}
            {opportunity.organization.perks && (
              <div className="flex flex-col gap-2 px-4">
                <Typography bold type={TypographyType.Callout}>
                  Perks & Benefits
                </Typography>

                <ul className="list-disc pl-7">
                  {opportunity.organization.perks.map((perk) => (
                    <Typography
                      key={perk}
                      tag={TypographyTag.Li}
                      type={TypographyType.Callout}
                      color={TypographyColor.Secondary}
                    >
                      {perk}
                    </Typography>
                  ))}
                </ul>
              </div>
            )}
            {hasLinks && (
              <>
                {/* Resources */}
                {opportunity.organization.customLinks?.length > 0 && (
                  <div
                    className={classNames(
                      'flex flex-col gap-2 px-4 pb-2',
                      showMore ? '' : 'hidden',
                    )}
                  >
                    <Typography bold type={TypographyType.Callout}>
                      Resources
                    </Typography>

                    {opportunity.organization.customLinks.map(
                      ({ link, title }) => (
                        <Link key={link} href={link} passHref>
                          <Button
                            tag="a"
                            target="_blank"
                            rel={anchorDefaultRel}
                            variant={ButtonVariant.Subtle}
                            icon={
                              <OpenLinkIcon
                                className="text-text-disabled"
                                size={IconSize.Small}
                              />
                            }
                            iconPosition={ButtonIconPosition.Right}
                            className="justify-between !pl-2 !pr-3 font-normal text-text-secondary"
                          >
                            {title}
                          </Button>
                        </Link>
                      ),
                    )}
                  </div>
                )}

                {/* Featured press */}
                {opportunity.organization.pressLinks?.length > 0 && (
                  <div
                    className={classNames(
                      'flex flex-col gap-2 px-4 pb-2',
                      showMore ? '' : 'hidden',
                    )}
                  >
                    <Typography bold type={TypographyType.Callout}>
                      Featured press
                    </Typography>

                    {opportunity.organization.pressLinks.map(
                      ({ link, title }) => (
                        <Link key={link} href={link} passHref>
                          <Button
                            tag="a"
                            target="_blank"
                            rel={anchorDefaultRel}
                            variant={ButtonVariant.Subtle}
                            icon={
                              <OpenLinkIcon
                                className="text-text-disabled"
                                size={IconSize.Small}
                              />
                            }
                            iconPosition={ButtonIconPosition.Right}
                            className="justify-between !pl-2 !pr-3 font-normal text-text-secondary"
                          >
                            <Image
                              className={classNames(
                                'mr-2 rounded-full object-cover',
                                sizeClasses[ProfileImageSize.Small],
                              )}
                              src={`${apiUrl}/icon?url=${encodeURIComponent(
                                link,
                              )}&size=${iconSize}`}
                              type={ImageType.Squad}
                            />
                            <span className="flex-1 truncate text-left">
                              {title}
                            </span>
                          </Button>
                        </Link>
                      ),
                    )}
                  </div>
                )}

                <Button
                  aria-controls="company-show-more"
                  aria-expanded={showMore}
                  className="flex w-full flex-row !justify-center gap-1 rounded-none border-0 border-t border-border-subtlest-tertiary !px-4 py-2.5"
                  type="button"
                  onClick={() => setShowMore((prev) => !prev)}
                >
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    {showMore ? 'See less' : 'See more'}
                  </Typography>

                  <MoveToIcon
                    className={classNames('transition-transform ease-in-out', {
                      'rotate-90': !showMore,
                      '-rotate-90': showMore,
                    })}
                  />
                </Button>
              </>
            )}
          </FlexCol>

          {/* Recruiter Info */}
          <FlexCol className="flex-1 rounded-16 border-t border-border-subtlest-tertiary laptop:border">
            {/* Header */}
            <div className="flex min-h-14 items-center justify-between px-4 py-3">
              <Typography
                bold
                type={TypographyType.Body}
                color={TypographyColor.Primary}
              >
                Recruiters
              </Typography>
            </div>

            {/* Recruiters */}
            {opportunity?.recruiters?.map((user) => (
              <FlexCol key={user.id} className="gap-4 px-4 pb-4">
                <div className="flex items-center gap-2">
                  <ProfilePicture user={user} size={ProfileImageSize.Large} />

                  <div className="flex flex-col">
                    <Typography
                      bold
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="flex items-center gap-1"
                    >
                      {user.bio}
                    </Typography>
                  </div>
                </div>

                {/* Description */}
                <ShowMoreContent
                  content={user.readme}
                  className={{ text: '!text-text-secondary !typo-callout' }}
                />
              </FlexCol>
            ))}
          </FlexCol>
        </FlexCol>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  opportunity: Opportunity;
}> = async (ctx) => {
  const { id } = ctx.params as { id: string };
  if (typeof id !== 'string' || !id) {
    return {
      notFound: true,
    };
  }

  const opportunity = await opportunityByIdOptions({ id }).queryFn();

  if (!opportunity) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      opportunity,
    },
  };
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

JobPage.getLayout = getPageLayout;
JobPage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default JobPage;
