import type { ReactElement } from 'react';
import React, { useState } from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
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

const questions = [
  {
    title: 'What’s the most complex front-end project you’ve led recently?',
    placeholder:
      'e.g. Built and scaled a real-time dashboard for 50k+ users using React and WebSockets…',
  },
  {
    title: 'Which tools, frameworks, or libraries do you work with most often?',
    placeholder: 'e.g. React, TypeScript, Next.js, Tailwind, Zustand, Cypress…',
  },
  {
    title:
      'What’s your experience with performance optimization in large-scale React apps?',
    placeholder:
      'e.g. Implemented code-splitting, memoization, and custom hooks to cut load times by 40%…',
  },
];

const DeclinePage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;
  const [activeQuestion, setActiveQuestion] = useState(0);

  const submitClick = () => {
    if (activeQuestion === questions.length - 1) {
      router.push(`${webappUrl}jobs/${id}/notify`);
      return;
    }
    setActiveQuestion((current) => current + 1);
  };

  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            A few quick checks before we intro
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            These help confirm the role is truly worth your time and ensure the
            recruiter already sees you as a strong match.
          </Typography>
        </FlexCol>
        <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <FlexRow className="items-center gap-2">
            <ProgressCircle
              size={16}
              stroke={2}
              progress={(activeQuestion / questions.length) * 100}
            />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              Step {activeQuestion + 1} of {questions.length}
            </Typography>
          </FlexRow>
          <Typography type={TypographyType.Title3}>
            {questions[activeQuestion].title}
          </Typography>
          <Textarea
            inputId="one"
            placeholder={questions[activeQuestion].placeholder}
            label="question[1]"
            rows={5}
            fieldType="quaternary"
          />
        </FlexCol>
        <FlexRow className="justify-between">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
            className="hidden laptop:flex"
          >
            Back
          </Button>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
            onClick={submitClick}
          >
            {activeQuestion === questions.length - 1
              ? 'Submit'
              : 'Next question →'}
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

DeclinePage.getLayout = getPageLayout;
DeclinePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default DeclinePage;
