import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { FormProvider } from 'react-hook-form';
import UserWorkExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserWorkExperienceForm';
import UserEducationForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserEducationForm';
import UserCertificationForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserCertificationForm';
import UserProjectExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserProjectExperienceForm';
import DeleteExperienceButton from '@dailydotdev/shared/src/features/profile/components/experience/DeleteExperienceButton';
import UserVolunteeringExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserVolunteeringExperienceForm';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { UserExperience } from '@dailydotdev/shared/src/graphql/user/profile';
import useUserExperienceForm from '@dailydotdev/shared/src/hooks/useUserExperienceForm';
import {
  getUserExperienceById,
  UserExperienceType,
} from '@dailydotdev/shared/src/graphql/user/profile';
import type { GetServerSideProps } from 'next';
import { format } from 'date-fns';
import type { TLocation } from '@dailydotdev/shared/src/graphql/autocomplete';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Edit experience'),
};

type DefaultValues = UserExperience & {
  startedAtMonth: string;
  startedAtYear: string;
  endedAtMonth: string;
  endedAtYear: string;
  skills?: string[];
  location?: TLocation;
};

type PageProps = {
  experience: DefaultValues | null;
};

const splitMonthYear = (value?: string) => {
  if (!value) {
    return ['', ''];
  }
  const date = new Date(value);
  const month = format(date, 'MMMM');
  const year = format(date, 'yyyy');
  return [month, year];
};

const defaultValues: DefaultValues = {
  type: UserExperienceType.Work,
  id: '',
  title: '',
  description: '',
  createdAt: '',
  startedAtMonth: '',
  startedAtYear: '',
  endedAtMonth: '',
  endedAtYear: '',
  skills: [],
};

const getExperienceType = (
  typeParam: string | string[] | undefined,
): UserExperienceType => {
  if (typeof typeParam === 'string') {
    const validType = Object.values(UserExperienceType).find(
      (t) => t === typeParam,
    );
    if (validType) {
      return validType;
    }
  }
  return UserExperienceType.Work;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
}) => {
  const { id, type } = query;
  const typeParam = getExperienceType(type);

  if (!id) {
    return {
      props: {
        experience: {
          ...defaultValues,
          type: typeParam,
        },
      },
    };
  }

  const result = await getUserExperienceById(id as string);
  const [startedAtMonth, startedAtYear] = splitMonthYear(result?.startedAt);
  const [endedAtMonth, endedAtYear] = splitMonthYear(result?.endedAt);

  return {
    props: {
      experience: {
        ...result,
        companyId: result?.company?.id || '',
        customCompanyName: result?.company?.name || result?.customCompanyName,
        startedAtMonth,
        startedAtYear,
        endedAtMonth,
        endedAtYear,
        skills: result?.skills.map((skill) => skill.value),
        location: result?.location,
        locationId: result?.location?.id || '',
      },
    },
  };
};

const renderExperienceForm = (type?: UserExperienceType) => {
  switch (type) {
    case UserExperienceType.Education:
      return <UserEducationForm />;
    case UserExperienceType.Certification:
      return <UserCertificationForm />;
    case UserExperienceType.Volunteering:
      return <UserVolunteeringExperienceForm />;
    case UserExperienceType.Project:
    case UserExperienceType.OpenSource:
      return <UserProjectExperienceForm />;
    default:
      return <UserWorkExperienceForm />;
  }
};

const Page = ({ experience }: PageProps): ReactElement => {
  const { methods, save, isPending } = useUserExperienceForm({
    defaultValues: experience,
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-1 flex-col"
        onSubmit={methods.handleSubmit(() => save())}
      >
        <AccountPageContainer
          title="Experience"
          actions={
            <Button
              type="submit"
              className="ml-auto"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={isPending}
              loading={isPending}
            >
              Save
            </Button>
          }
        >
          {renderExperienceForm(experience?.type)}
          {experience?.id && (
            <DeleteExperienceButton
              experienceId={experience.id}
              experienceType={experience.type}
            />
          )}
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};

Page.getLayout = getSettingsLayout;
Page.layoutProps = { seo };

export default Page;
