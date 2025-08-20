import type { ReactElement } from 'react';
import React from 'react';

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

import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
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

const PreferencePage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            Train us to find your unicorn job
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            Tell us exactly what’s worth bugging you about so we can ghost every
            irrelevant recruiter on your behalf. The better you set this up, the
            less nonsense you’ll ever see.
          </Typography>
        </FlexCol>
        <FlexCol className="gap-6">
          <FlexCol className="gap-2">
            <Typography type={TypographyType.Body} bold>
              What kind of role are you looking for?
            </Typography>
            <Textarea
              inputId="role"
              label="role"
              rows={5}
              placeholder="Describe your next ideal role or career goal…"
              fieldType="quaternary"
            />
            <Radio
              className={{ container: '!flex-row' }}
              name="type_role"
              options={[
                { label: 'Auto (Recommended)', value: 'auto' },
                { label: 'IC roles', value: 'ic' },
                { label: 'Managerial roles', value: 'managerial' },
              ]}
              value="auto"
              onChange={() => {}}
            />
          </FlexCol>
          <FlexCol className="gap-2">
            <Typography type={TypographyType.Body} bold>
              Employment type
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Select all that apply to the roles you’d consider.
            </Typography>
            <FlexRow>
              <Checkbox name="full_time">Full-time</Checkbox>
              <Checkbox name="part-time">Part-time</Checkbox>
              <Checkbox name="contract">Contract / Freelance</Checkbox>
              <Checkbox name="internship">Internship</Checkbox>
            </FlexRow>
          </FlexCol>
          <FlexCol className="gap-2">
            <Typography type={TypographyType.Body} bold>
              Salary expectations
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Give a minimum so we only surface roles that meet your
              requirements.
            </Typography>
            <FlexRow className="gap-3">
              <TextField
                inputId="min"
                label="USD"
                value="120.000"
                className={{ container: 'w-40' }}
              />
              <Dropdown
                selectedIndex={0}
                options={['Annually', 'Monthly']}
                onChange={() => {}}
              />
            </FlexRow>
          </FlexCol>
          <FlexCol className="gap-2">
            <Typography type={TypographyType.Body} bold>
              Location preferences
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Tell us where you want to work from.
            </Typography>
            <FlexRow className="gap-3">
              <TextField
                inputId="country"
                label="Country"
                className={{ container: 'flex-1' }}
              />
              <TextField
                inputId="city"
                label="City"
                className={{ container: 'flex-1' }}
              />
            </FlexRow>
            <FlexRow>
              <Checkbox name="remote">Remote</Checkbox>
              <Checkbox name="hybrid">Hybrid</Checkbox>
              <Checkbox name="on-site">On-site</Checkbox>
            </FlexRow>
          </FlexCol>
          <FlexCol className="gap-2">
            <Typography type={TypographyType.Body} bold>
              Preferred tech stack
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Define the tools, technologies, and languages you want in your
              next role.
            </Typography>
            <Radio
              className={{ container: '!flex-row' }}
              name="tech_stack"
              options={[
                { label: 'Copy from my profile (Recommended)', value: 'auto' },
                { label: 'Select manually', value: 'manual' },
              ]}
              value="auto"
              onChange={() => {}}
            />
          </FlexCol>
        </FlexCol>
        <FlexCol className="border-t border-border-subtlest-tertiary">
          <Accordion title="Advanced filters">
            <FlexCol className="gap-6">
              <FlexCol className="gap-2">
                <Typography type={TypographyType.Body} bold>
                  Company stage
                </Typography>
                <FlexRow className="flex-1 flex-wrap">
                  <Checkbox name="remote">Pre-seed</Checkbox>
                  <Checkbox name="hybrid">Seed</Checkbox>
                  <Checkbox name="on-site">Series A</Checkbox>
                  <Checkbox name="on-site">Series B</Checkbox>
                  <Checkbox name="on-site">Series C</Checkbox>
                  <Checkbox name="on-site">Series D+</Checkbox>
                  <Checkbox name="on-site">Public company</Checkbox>
                  <Checkbox name="on-site">Bootstrapped</Checkbox>
                  <Checkbox name="on-site">Non-profit</Checkbox>
                  <Checkbox name="on-site">Government</Checkbox>
                </FlexRow>
              </FlexCol>
              <FlexCol className="gap-2">
                <Typography type={TypographyType.Body} bold>
                  Company size
                </Typography>
                <FlexRow className="flex-1 flex-wrap">
                  <Checkbox name="remote">1-10</Checkbox>
                  <Checkbox name="hybrid">11-50</Checkbox>
                  <Checkbox name="on-site">51-200</Checkbox>
                  <Checkbox name="on-site">201-500</Checkbox>
                  <Checkbox name="on-site">501-1000</Checkbox>
                  <Checkbox name="on-site">1001-5000</Checkbox>
                  <Checkbox name="on-site">5000+</Checkbox>
                </FlexRow>
              </FlexCol>
              <FlexCol className="gap-2">
                <Typography type={TypographyType.Body} bold>
                  Which industries excite you most?
                </Typography>
                <Textarea
                  inputId="role"
                  label="role"
                  rows={5}
                  placeholder="List the fields or sectors you’d love to work in (e.g., fintech, gaming, climate tech)."
                  fieldType="quaternary"
                />
              </FlexCol>
              <FlexCol className="gap-2">
                <Typography type={TypographyType.Body} bold>
                  Which companies inspire you?
                </Typography>
                <Textarea
                  inputId="role"
                  label="role"
                  rows={5}
                  placeholder="Name organizations whose work, culture, or products you admire."
                  fieldType="quaternary"
                />
              </FlexCol>
            </FlexCol>
          </Accordion>
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
            tag="a"
            href={`${webappUrl}jobs/job-123/preference-done`}
          >
            Save preferences
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

PreferencePage.getLayout = getPageLayout;
PreferencePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default PreferencePage;
