import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { FormProvider } from 'react-hook-form';
import UserWorkExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserWorkExperienceForm';
import useUserExperienceForm, {
  UserExperienceType,
} from '@dailydotdev/shared/src/hooks/useUserExperienceForm';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { UserExperience } from '@dailydotdev/shared/src/graphql/user/profile';
import { getUserExperienceById } from '@dailydotdev/shared/src/graphql/user/profile';
import type { GetServerSideProps } from 'next';
import { format } from 'date-fns';
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
  startedAt: null,
  endedAt: null,
  company: null,
  customCompanyName: null,
  startedAtMonth: '',
  startedAtYear: '',
  endedAtMonth: '',
  endedAtYear: '',
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
}) => {
  const { id } = query;
  if (!id) {
    return {
      props: {
        experience: defaultValues,
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
        companyId: result?.company?.id,
        customCompanyName: result?.company.name || result?.customCompanyName,
        startedAtMonth,
        startedAtYear,
        endedAtMonth,
        endedAtYear,
      },
    },
  };
};

const Page = ({ experience }: PageProps): ReactElement => {
  const { methods, save, isPending } = useUserExperienceForm({
    defaultValues: experience,
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-1"
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
          <UserWorkExperienceForm />
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};

Page.getLayout = getSettingsLayout;
Page.layoutProps = { seo };

export default Page;
