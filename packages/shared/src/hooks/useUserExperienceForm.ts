import { useMutation } from '@tanstack/react-query';
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
import { ApiError } from '../graphql/common';
import type { ApiErrorResult } from '../graphql/common';
import { labels } from '../lib/labels';
import { applyZodErrorsToForm } from '../lib/form';
import { useToastNotification } from './useToastNotification';
import { useAuthContext } from '../contexts/AuthContext';
import { webappUrl } from '../lib/constants';

export const userExperienceInputBaseSchema = z
  .object({
    type: z.enum(UserExperienceType),
    title: z.string().min(1, 'Title is required.').max(1000),
    description: z.string().max(5000).optional(),
    subtitle: z.string().max(1000).optional(),
    startedAt: z.date({ message: 'Start date is required.' }),
    endedAt: z.date().optional(),
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
    url: z
      .union([
        z.url('Please enter a valid URL.').max(2000),
        z.string().length(0),
        z.null(),
      ])
      .optional()
      .default(null),
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
  );

type BaseUserExperience = Omit<
  UserExperience,
  'id' | 'createdAt' | 'company' | 'customCompanyName'
>;

const useUserExperienceForm = ({
  defaultValues,
}: {
  defaultValues: BaseUserExperience;
}) => {
  const { user } = useAuthContext();
  const dirtyFormRef = useRef<ReturnType<typeof useDirtyForm> | null>(null);
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const methods = useForm<UserExperience>({
    defaultValues,
    resolver: zodResolver(userExperienceInputBaseSchema),
  });
  const { id, type } = methods.getValues();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserExperience | UserExperienceWork) =>
      type === UserExperienceType.Work
        ? upsertUserWorkExperience(data as UserExperienceWork, id)
        : upsertUserGeneralExperience(data, id),
    onSuccess: () => {
      dirtyFormRef.current?.allowNavigation();
      router.push(`${webappUrl}settings/profile/experience/${type}`);
      methods.reset();
    },
    onError: (error: ApiErrorResult) => {
      if (
        error.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        applyZodErrorsToForm({
          error,
          setError: methods.setError,
        });
      } else {
        displayToast(
          error.response?.errors?.[0]?.message || labels.error.generic,
        );
      }
    },
  });
  const dirtyForm = useDirtyForm(methods.formState.isDirty, {
    onSave: () => {
      const formData = methods.getValues();
      mutate(formData);
    },
    onDiscard: () => {
      methods.reset();
    },
  });
  dirtyFormRef.current = dirtyForm;
  return { methods, save: dirtyFormRef.current?.save, isPending };
};

export default useUserExperienceForm;
