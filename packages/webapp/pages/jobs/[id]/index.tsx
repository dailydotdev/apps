import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
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
  MiniCloseIcon,
  OpenLinkIcon,
  ShieldPlusIcon,
  TwitterIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { Chip } from '@dailydotdev/shared/src/components/cards/common/PostTags';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { briefButtonBg } from '@dailydotdev/shared/src/styles/custom';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import { DragDrop } from '@dailydotdev/shared/src/components/fields/DragDrop';
import classNames from 'classnames';
import { fileValidation } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { FeelingLazy } from '@dailydotdev/shared/src/features/profile/components/FeelingLazy';
import { useRouter } from 'next/router';
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

const JobPageIntro = () => {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
      <Typography bold center type={TypographyType.LargeTitle}>
        Now it&apos;s your turn to call the shots
      </Typography>
      <Typography
        center
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
      >
        We&apos;ve pulled this role because we believe it&apos;s worth your
        attention, but you have the final say. If it&apos;s a fit, we&apos;ll
        discuss with the recruiter. If not, it disappears without a trace.
      </Typography>
    </div>
  );
};

const tags = [
  'React',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'Node.js',
  'GraphQL',
];

const jobDetails = [
  { label: 'Location', value: 'Cupertino, California, United States' },
  { label: 'Salary range', value: '$212K/yr - $318K/yr' },
  { label: 'Work site', value: 'Remote (US timezone)' },
  { label: 'Seniority level', value: 'Senior' },
  { label: 'Employment type', value: 'Full time' },
  { label: 'Role Type', value: 'Individual contributor' },
  { label: 'Team size', value: '15 engineers' },
];

const companyMeta = [
  { label: 'Founded', value: '1976' },
  { label: 'HQ', value: 'Cupertino, California, USA' },
  { label: 'Employees', value: '50-100 employees' },
];

const perksAndBenefits = [
  'Competitive equity package',
  'Health, dental, and vision insurance',
  '$4k annual learning & development budget',
  'Top-tier equipment and home office setup',
  'Flexible PTO and parental leave',
];

const faq = [
  {
    key: 'overview',
    title: 'Overview',
    content: (
      <>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Join Linear&apos;s frontend team to build the next generation of issue
          tracking and project management tools. You&apos;ll work on
          performance-critical features, design systems, and collaborate closely
          with design and product teams.
        </Typography>
        <br />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Join Linear&apos;s frontend team to build the next generation of issue
          tracking and project management tools. You&apos;ll work on
          performance-critical features, design systems, and collaborate closely
          with design and product teams.
        </Typography>
        <br />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Join Linear&apos;s frontend team to build the next generation of issue
          tracking and project management tools. You&apos;ll work on
          performance-critical features, design systems, and collaborate closely
          with design and product teams.
        </Typography>
      </>
    ),
  },
  {
    key: 'responsibilities',
    title: 'Responsibilities',
    content: (
      <ul className="list-disc pl-7">
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Build and maintain Linear&apos;s web application using React and
          TypeScript
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Implement pixel-perfect designs with attention to performance
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Collaborate with the team on architecture decisions
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Contribute to Linear&apos;s open-source projects
        </Typography>
      </ul>
    ),
  },
  {
    key: 'requirements',
    title: 'Requirements',
    content: (
      <ul className="list-disc pl-7">
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          5+ years of experience building and maintaining complex web
          applications
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Deep expertise in JavaScript, TypeScript, and React (or similar modern
          frameworks)
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Proven track record of shipping polished, performant UIs in
          product-led environments
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Strong understanding of frontend architecture, state management, and
          component design
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Comfortable collaborating across design, product, and backend teams
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Clear, concise communicator, especially in remote and async work
          setups
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Experience working in high-autonomy, fast-moving teams
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Bonus: Familiarity with tools like Vite, Next.js, GraphQL, or design
          systems
        </Typography>
      </ul>
    ),
  },
  {
    key: 'what_youll_do',
    title: "What you'll do",
    content: (
      <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
        As a Senior Frontend Developer at Linear, your day will be centered
        around crafting high-quality user experiences using React and
        TypeScript. You&apos;ll collaborate closely with product designers and
        backend engineers to ship clean, maintainable code across the app. Your
        mornings might start with async stand-ups or pairing sessions
        (remote-friendly, timezone-aligned), followed by deep focus time for
        building new features, refining UX, or improving performance.
        You&apos;ll participate in thoughtful code reviews, contribute to
        architecture decisions, and help shape internal tooling and frontend
        infrastructure. Expect a product-minded culture with minimal process
        overhead, where autonomy and craftsmanship are highly valued.
      </Typography>
    ),
  },
  {
    key: 'interview_process',
    title: 'Interview process',
    content: (
      <ol className="list-decimal pl-7">
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Intro Chat (30 mins)
          <br />A casual conversation with our recruiter or hiring manager to
          learn more about your background and share more about the role and
          team.
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Technical Interview (60 mins)
          <br />A live technical discussion or hands-on coding exercise focused
          on frontend fundamentals, React/TypeScript, and product thinking.
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Project Assignment or Deep Dive (1-2 hrs async or scheduled)
          <br />
          Either a take-home project or a session diving into real-world
          frontend challenges, followed by a walkthrough of your thought
          process.
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Team Interviews (2 x 45 mins)
          <br />
          Meet with 2-3 team members across engineering and design. We&apos;ll
          explore how you collaborate, make decisions, and approach
          product-building.
        </Typography>
        <Typography
          tag={TypographyTag.Li}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Final Chat (30-45 mins)
          <br />A wrap-up conversation with leadership to align on expectations,
          values, and any final questions.
        </Typography>
      </ol>
    ),
  },
];

const company = {
  handle: 'Linear',
  image: null,
  website: 'https://vg.no',
};

const socialMediaLinks = [
  { key: 'linkedin', href: '#', icon: <LinkedInIcon /> },
  { key: 'twitter', href: '#', icon: <TwitterIcon /> },
  { key: 'github', href: '#', icon: <GitHubIcon /> },
  { key: 'crunchbase', href: '#', icon: <CrunchbaseIcon /> },
];

const resourcesLinks = [
  { key: 'engineering_blog', href: '#', label: 'Engineering Blog' },
  { key: 'public_github', href: '#', label: 'Public GitHub / OSS Links' },
  { key: 'workplace_policy', href: '#', label: 'Workplace Policy' },
  { key: 'culture_deck', href: '#', label: 'Culture Deck' },
];

const featuredPressLinks = [
  {
    key: 'openai_aws',
    href: '#',
    label: 'For the first time, OpenAI models are available on AWS',
    source: company,
  },
  {
    key: 'google_gemini',
    href: '#',
    label: "Google's Gemini CLI Agent Comes to GitHub",
    source: company,
  },
];

const recruiters = [
  {
    key: 'rachel_brown',
    user: {
      image: null,
      name: 'Rachel Brown',
      title: 'Lead Talent Acquisition',
    },
    description:
      'Rachel specializes in connecting top-tier frontend talent with innovative startups. She values clear communication and a genuine interest in product development.',
    agency: false,
  },
  {
    key: 'mark_davis',
    user: {
      image: null,
      name: 'Mark Davis',
      title: 'Senior Recruiter',
    },
    description:
      'Mark partners with leading tech companies to identify and attract engineers passionate about building scalable solutions. He has a keen eye for detail and a knack for finding great culture fits.',
    agency: true,
  },
];

const CVOverlay = (): ReactElement => (
  <div className="absolute top-10 z-1 size-full bg-blur-glass backdrop-blur-xl laptop:top-16">
    <div className="mx-auto mt-10 flex max-w-[42.5rem] flex-col gap-6 rounded-16 border border-border-subtlest-secondary bg-blur-baseline p-6">
      <div>
        <Typography
          type={TypographyType.LargeTitle}
          bold
          center
          className="mb-4"
        >
          We never want to waste your time. Ever.
        </Typography>
        <Typography type={TypographyType.Title3} center>
          Upload your CV so we know what really matters to you and every role we
          surface, now or later, is worth your time.{' '}
        </Typography>
      </div>
      <div className="flex w-full flex-col gap-2">
        <DragDrop
          isCompactList
          className={classNames('w-full')}
          validation={fileValidation}
          onFilesDrop={() => {}}
        />
        <FeelingLazy />
      </div>
      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
        <div className="flex gap-2">
          <ShieldPlusIcon secondary className="text-status-success" />
          <Typography type={TypographyType.Subhead} bold>
            Why we ask for your CV
          </Typography>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Because guessing is a waste of everyone’s time. The more signal we
          have from day one, the less noise you’ll ever see here. We’d rather
          show you nothing than risk wasting your time, and that starts with
          knowing exactly what’s worth showing you.
          <br />
          <br />
          Your CV stays 100% confidential and no recruiter sees it unless you
          explicitly say yes to an opportunity.
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        disabled
        className="mx-auto"
      >
        Upload CV & Activate Filters
      </Button>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        center
      >
        🛡️ One upload. 100% confidential. Zero bad recruiting.
      </Typography>
    </div>
  </div>
);

const JobPage = (): ReactElement => {
  const { checkHasCompleted } = useActions();
  const {
    query: { cv_step: cvStep },
  } = useRouter();

  const hasCompleted = checkHasCompleted(ActionType.ViewJob);
  const showCVScreen = !!cvStep;
  document.body.classList.add('hidden-scrollbar');

  return (
    <>
      {showCVScreen && <CVOverlay />}
      {!hasCompleted && <JobPageIntro />}
      <div className="mx-auto flex w-full max-w-[69.25rem] flex-col gap-4 laptop:flex-row">
        <div className="h-full flex-1 flex-shrink-0 rounded-16 border border-border-subtlest-tertiary">
          {/* Header */}
          <div className="flex min-h-14 items-center gap-4 border-b border-border-subtlest-tertiary p-3">
            <div className="flex items-center">
              <SourceAvatar source={company} size={ProfileImageSize.Medium} />

              <Typography
                bold
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                {company.handle}{' '}
                <Typography
                  tag={TypographyTag.Span}
                  color={TypographyColor.Tertiary}
                  className="font-normal"
                >
                  Verified opportunity
                </Typography>
              </Typography>
            </div>

            <div className="ml-auto hidden gap-2 tablet:flex">
              <Button
                size={ButtonSize.Small}
                icon={<MiniCloseIcon />}
                variant={ButtonVariant.Subtle}
              >
                Not for me
              </Button>
              <Button
                size={ButtonSize.Small}
                icon={<VIcon />}
                variant={ButtonVariant.Primary}
              >
                I&apos;m interested
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 px-8 py-6">
            {/* Recruiter */}
            <div className="flex items-center gap-2">
              <ProfilePicture
                user={recruiters[0].user}
                size={ProfileImageSize.Large}
              />

              <div className="flex flex-col">
                <Typography
                  bold
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                >
                  {recruiters[0].user.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {recruiters[0].user.title}
                </Typography>
              </div>
            </div>

            {/* Title */}
            <Typography
              bold
              tag={TypographyTag.H1}
              type={TypographyType.LargeTitle}
            >
              Senior Frontend Developer
            </Typography>

            {/* Tags */}
            <div className="flex gap-2">
              {tags.map((tag) => (
                <Chip key={tag} className="!my-0">
                  {tag}
                </Chip>
              ))}
            </div>

            {/* TLDR */}
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              <span className="font-bold text-text-primary">TLDR</span> Senior
              frontend role at Linear (issue tracking startup). React/TS stack,
              $140k-$180k, remote- first, Series B stage. Build dev tools used
              by top companies. Strong culture, great benefits, perfect match
              for your skills and preferences.
            </Typography>

            {/* Details */}
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-white laptop:grid-cols-[max-content_1fr_max-content_1fr]">
              {jobDetails.map(({ label, value }) => (
                <React.Fragment key={label}>
                  <Typography
                    className="laptop:[&:nth-child(4n+3)]:pl-2"
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {label}
                  </Typography>
                  <Typography
                    className="laptop:[&:nth-child(4n+3)]:pl-2"
                    bold
                    type={TypographyType.Subhead}
                    color={TypographyColor.Primary}
                  >
                    {value}
                  </Typography>
                </React.Fragment>
              ))}
            </div>

            {/* Why we think */}
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
                We noticed you&apos;ve been digging into React performance
                optimization and exploring payment systems lately. Your skills
                in TypeScript and Node.js line up directly with the core
                technologies this team uses. You also follow several Atlassian
                engineers and have shown consistent interest in project
                management software, which makes this role a natural fit for
                your trajectory.
              </Typography>
            </FlexCol>
          </div>

          {faq.map((faqItem) => (
            <div
              key={faqItem.key}
              className="border-t border-border-subtlest-tertiary px-8"
            >
              <Accordion title={<Typography>{faqItem.title}</Typography>}>
                <div className="pb-4">{faqItem.content}</div>
              </Accordion>
            </div>
          ))}

          <div className="hidden gap-3 border-t border-border-subtlest-tertiary p-3 laptop:flex">
            <Button
              className="flex-1"
              icon={<MiniCloseIcon />}
              variant={ButtonVariant.Subtle}
            >
              Not for me
            </Button>
            <Button
              className="flex-1"
              icon={<VIcon />}
              variant={ButtonVariant.Primary}
            >
              I&apos;m interested
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <FlexCol className="h-full flex-1 flex-shrink-0 gap-4 laptop:max-w-80">
          {/* Company Info */}
          <FlexCol className="flex-1 gap-4 rounded-16 border border-border-subtlest-tertiary">
            {/* Header */}
            <div className="flex min-h-14 items-center justify-between px-4 py-3">
              <Typography
                bold
                type={TypographyType.Body}
                color={TypographyColor.Primary}
              >
                Company
              </Typography>

              <Link href={company.website} passHref>
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
            </div>
            {/* Comapny information */}
            <div className="flex px-4">
              <SourceAvatar source={company} size={ProfileImageSize.Large} />

              <div className="flex flex-col">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                >
                  {company.handle}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Series B • Software
                </Typography>
              </div>
            </div>

            {/* SoMe Links */}
            <div className="flex gap-2 px-4">
              {socialMediaLinks.map(({ href, icon, key }) => (
                <Link key={key} href={href} passHref>
                  <Button
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    icon={icon}
                  />
                </Link>
              ))}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 px-4">
              {companyMeta.map(({ label, value }) => (
                <React.Fragment key={label}>
                  <Typography
                    type={TypographyType.Subhead}
                    color={TypographyColor.Tertiary}
                  >
                    {label}
                  </Typography>
                  <Typography type={TypographyType.Footnote} bold>
                    {value}
                  </Typography>
                </React.Fragment>
              ))}
            </div>

            {/* Description */}
            <Typography
              className="px-4"
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Linear is building the future of issue tracking and project
              management. Used by companies like Vercel, Stripe, and Coinbase,
              Linear combines speed, simplicity, and powerful functionality in a
              beautiful interface.
            </Typography>

            {/* Perks & Benefits */}
            <div className="flex flex-col gap-2 px-4">
              <Typography bold type={TypographyType.Callout}>
                Perks & Benefits
              </Typography>

              <ul className="list-disc pl-7">
                {perksAndBenefits.map((perk) => (
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

            {/* See more */}
            <div className="flex items-center justify-center gap-1 border-t border-border-subtlest-tertiary px-4 py-2.5">
              <Accordion
                title={
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                  >
                    See more
                  </Typography>
                }
              >
                <FlexCol className="gap-4">
                  {/* Resources */}
                  <div className="flex flex-col gap-2">
                    <Typography bold type={TypographyType.Callout}>
                      Resources
                    </Typography>

                    {resourcesLinks.map(({ key, href, label }) => (
                      <Link key={key} href={href} passHref>
                        <Button
                          variant={ButtonVariant.Subtle}
                          icon={<OpenLinkIcon />}
                          iconPosition={ButtonIconPosition.Right}
                          className="justify-between !pl-2 !pr-3"
                        >
                          {label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Featured press */}
                  <div className="flex flex-col gap-2 pb-2">
                    <Typography bold type={TypographyType.Callout}>
                      Featured press
                    </Typography>

                    {featuredPressLinks.map(({ key, href, label, source }) => (
                      <Link key={key} href={href} passHref>
                        <Button
                          variant={ButtonVariant.Subtle}
                          icon={<OpenLinkIcon />}
                          iconPosition={ButtonIconPosition.Right}
                          className="justify-between !pl-2 !pr-3"
                        >
                          <SourceAvatar
                            source={source}
                            size={ProfileImageSize.Small}
                          />
                          <span className="flex-1 truncate text-left">
                            {label}
                          </span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </FlexCol>
              </Accordion>
            </div>
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
            {recruiters.map(({ key, user, description, agency }) => (
              <FlexCol key={key} className="gap-4 px-4 pb-4">
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
                      {user.title}{' '}
                      {agency && (
                        <Chip className="!my-0 border-none bg-surface-float text-text-tertiary">
                          Agency
                        </Chip>
                      )}
                    </Typography>
                  </div>
                </div>

                {/* Description */}
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  {description}
                </Typography>
              </FlexCol>
            ))}
          </FlexCol>
        </FlexCol>
      </div>
    </>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

JobPage.getLayout = getPageLayout;
JobPage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default JobPage;
