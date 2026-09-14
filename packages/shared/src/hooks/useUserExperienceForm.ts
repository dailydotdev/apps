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
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import useLogEventOnce from './log/useLogEventOnce';
import {
  userExperienceSkillMaxLength,
  userExperienceSkillsLimit,
} from '../features/profile/common';

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
    skills: z
      .array(
        z
          .string()
          .trim()
          .normalize()
          .min(1, 'Skill cannot be empty.')
          .max(
            userExperienceSkillMaxLength,
            `Each skill must be ${userExperienceSkillMaxLength} characters or less.`,
          ),
      )
      .max(
        userExperienceSkillsLimit,
        `You can add up to ${userExperienceSkillsLimit} skills.`,
      )
      .optional()
      .default([]),
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
  })
  .passthrough()
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

export type UserExperienceFormValues = Omit<
  UserExperience,
  | 'id'
  | 'createdAt'
  | 'startedAt'
  | 'endedAt'
  | 'customCompanyName'
  | 'repository'
> & {
  id?: string;
  createdAt?: string;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  current?: boolean;
  companyId?: string | null;
  customCompanyName?: string | null;
  customDomain?: string | null;
  employmentType?: number | null;
  locationType?: number | null;
  externalLocationId?: string | null;
  repository?: {
    id?: string | null;
    owner?: string | null;
    name: string;
    url?: string | null;
    image?: string | null;
  } | null;
  repositorySearch?: string;
  skills?: string[];
};

type BaseUserExperience = UserExperienceFormValues;

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
      const input = { ...data, type } as UserExperienceFormValues;

      return type === UserExperienceType.Work
        ? upsertUserWorkExperience(input as unknown as UserExperienceWork, id)
        : upsertUserGeneralExperience(input as unknown as UserExperience, id);
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
      const apiError = error.response?.errors?.[0];
      if (apiError?.extensions?.code === ApiError.ZodValidationError) {
        const zodError = apiError as ApiResponseError<ApiZodErrorExtension>;
        applyZodErrorsToForm({
          error,
          setError: methods.setError,
        });
        displayToast(
          zodError.extensions.issues?.[0]?.message || labels.error.generic,
        );
      } else {
        displayToast(apiError?.message || labels.error.generic);
      }
    },
  });
  const saveExperience = () => {
    methods.setValue('type', type, { shouldDirty: false });

    return methods.handleSubmit(async (data) => {
      await mutateAsync({ ...data, type }).catch(() => undefined);
    })();
  };

  const dirtyForm = useDirtyForm(methods.formState.isDirty, {
    onSave: saveExperience,
    onDiscard: () => {
      methods.reset();
    },
  });
  dirtyFormRef.current = dirtyForm;
  return { methods, save: dirtyForm.save, isPending };
};

export default useUserExperienceForm;
