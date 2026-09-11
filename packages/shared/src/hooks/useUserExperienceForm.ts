import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import type {
  UserExperience,
  UserExperienceWork,
} from '../graphql/user/profile';
import {
  upsertUserGeneralExperience,
  upsertUserWorkExperience,
  UserExperienceType,
} from '../graphql/user/profile';
import { useDirtyForm } from './useDirtyForm';
import { generateQueryKey, RequestKey } from '../lib/query';
import { ApiError } from '../graphql/common';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiZodErrorExtension,
} from '../graphql/common';
import { labels } from '../lib/labels';
import { applyZodErrorsToForm } from '../lib/form';
import { useToastNotification } from './useToastNotification';
import { webappUrl } from '../lib/constants';
import { useUserExperiencesByType } from '../features/profile/hooks/useUserExperiencesByType';
import {
  maxProfileSkillLength,
  maxProfileSkills,
} from '../features/profile/common';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import useLogEventOnce from './log/useLogEventOnce';

const repositorySchema = z
  .object({
    id: z.string().min(1).nullish(),
    owner: z.string().max(100).nullish(),
    name: z.string().min(1).max(200),
    url: z.url('Please enter a valid repository URL.'),
    image: z.url().nullish(),
  })
  .nullish();

export const userExperienceInputBaseSchema = z
  .object({
    type: z.enum(UserExperienceType),
    title: z.string().min(1, 'Title is required.').max(1000),
    description: z.string().max(5000).optional(),
    subtitle: z.string().max(1000).optional().nullable(),
    startedAt: z.date({ message: 'Start year is required.' }),
    endedAt: z.date().optional().nullable(),
    current: z.boolean().default(false),
    companyId: z.string().nullable().optional().default(null),
    customCompanyName: z
      .string()
      .trim()
      .normalize()
      .max(100)
      .nullable()
      .optional()
      .default(null),
    customDomain: z
      .string()
      .trim()
      .normalize()
      .max(255)
      .nullable()
      .optional()
      .default(null),
    url: z
      .union([
        z.url('Please enter a valid URL.').max(2000),
        z.string().length(0),
        z.null(),
      ])
      .optional()
      .default(null),
    repository: repositorySchema,
    repositorySearch: z.string().optional(),
    skills: z
      .array(
        z
          .string()
          .trim()
          .normalize()
          .nonempty()
          .max(
            maxProfileSkillLength,
            `Skills can be up to ${maxProfileSkillLength} characters.`,
          ),
      )
      .max(maxProfileSkills, `You can add up to ${maxProfileSkills} skills.`)
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (
        data.current === false &&
        data.type !== UserExperienceType.Project &&
        data.type !== UserExperienceType.OpenSource
      ) {
        return data.endedAt !== undefined;
      }
      return true;
    },
    {
      message: 'End date is required when not current.',
      path: ['endedAt'],
    },
  )
  .refine(
    (data) => {
      return !data.endedAt || data.endedAt >= data.startedAt;
    },
    {
      message: 'End date must be on or after start date.',
      path: ['endedAt'],
    },
  );

/**
 * What the form actually holds, which `UserExperience` does not describe: the
 * date fields arrive from the page as serialized strings and become Dates once
 * the month/year selects write to them, and the rest are form-only fields or
 * fields specific to one experience type.
 */
export type UserExperienceFormValues = Omit<
  UserExperience,
  'startedAt' | 'endedAt'
> & {
  startedAt?: string | Date | null;
  endedAt?: string | Date | null;
  current?: boolean;
  skills?: string[];
  repositorySearch?: string;
  employmentType?: number | null;
  locationType?: number | null;
  externalLocationId?: string | null;
  grade?: string | null;
};

type BaseUserExperience = Omit<
  UserExperienceFormValues,
  'id' | 'createdAt' | 'company' | 'customCompanyName'
> & {
  id?: string;
};

const useUserExperienceForm = ({
  defaultValues,
}: {
  defaultValues: BaseUserExperience;
}) => {
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const userId = user?.id ?? '';
  const { queryKey: experienceQueryKey } = useUserExperiencesByType(
    defaultValues.type,
    userId,
  );
  const dirtyFormRef = useRef<ReturnType<typeof useDirtyForm> | null>(null);
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const methods = useForm<UserExperienceFormValues>({
    defaultValues,
    reValidateMode: 'onSubmit',
    resolver: zodResolver(userExperienceInputBaseSchema),
  });
  const { id, type } = defaultValues;
  const isNewExperience = !id;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.StartAddExperience,
      target_type: type,
    }),
    { condition: isNewExperience },
  );

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: UserExperienceFormValues) => {
      // The mutations are typed in the GraphQL shape, which the form values
      // deliberately differ from: the API parses skills as strings and the
      // dates as Dates, and returns them as UserSkill[] and strings.
      const input = { ...data, type } as unknown as UserExperienceWork;

      return type === UserExperienceType.Work
        ? upsertUserWorkExperience(input, id)
        : upsertUserGeneralExperience(input, id);
    },
    onSuccess: (result, vars) => {
      if (isNewExperience) {
        logEvent({
          event_name: LogEvent.AddExperience,
          target_type: type,
          target_id: result?.id,
        });
      }
      methods.reset(vars);
      dirtyFormRef.current?.allowNavigation();
      qc.invalidateQueries({ queryKey: experienceQueryKey });
      qc.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.UserExperience, user, 'profile'),
        exact: false,
      });
      router.push(`${webappUrl}settings/profile/experience/${type}`);
    },
    onError: (error: ApiErrorResult) => {
      const responseError = error.response?.errors?.[0];

      if (responseError?.extensions?.code !== ApiError.ZodValidationError) {
        displayToast(responseError?.message || labels.error.generic);
        return;
      }

      applyZodErrorsToForm({
        error,
        setError: methods.setError,
      });

      // The GraphQL message for a zod error is always a generic "Validation
      // error", and not every field renders its own error, so surface the first
      // issue as a toast to guarantee the rejection is visible.
      const [issue] = (responseError as ApiResponseError<ApiZodErrorExtension>)
        .extensions.issues;
      displayToast(issue?.message || labels.error.generic);
    },
  });
  const dirtyForm = useDirtyForm(methods.formState.isDirty, {
    // getValues() rather than the resolver output: the client schema is a
    // subset of the form, so parsed values would drop fields like
    // employmentType or grade. trigger() gives us validation without that.
    onSave: async () => {
      const isValid = await methods.trigger();

      if (!isValid) {
        // The modal closes either way, so say why nothing was saved: some
        // fields (type, for one) have no input that could show the error.
        displayToast(labels.error.formInvalid);
        return;
      }

      try {
        await mutateAsync({ ...methods.getValues(), type });
      } catch {
        // handled by the mutation's onError
      }
    },
    onDiscard: () => {
      methods.reset();
    },
  });
  dirtyFormRef.current = dirtyForm;
  return { methods, save: dirtyForm.save, isPending };
};

export default useUserExperienceForm;
