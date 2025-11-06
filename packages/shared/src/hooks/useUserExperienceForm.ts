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
} from '../graphql/user/profile';
import { useDirtyForm } from './useDirtyForm';
import { ApiError } from '../graphql/common';
import { labels } from '../lib/labels';
import { applyZodErrorsToForm } from '../lib/form';
import { useToastNotification } from './useToastNotification';
import type { GraphQLError } from '../lib/errors';

export const userExperienceInputBaseSchema = z.object({
  type: z.enum(['work', 'education', 'project', 'certification']),
  title: z.string().max(1000).nonempty('Title is required.'),
  description: z.string().max(5000).optional(),
  subtitle: z.string().max(1000).optional(),
  startedAt: z.date('Start date is required.'),
  endedAt: z.date().optional(),
  companyId: z.string().nullable().optional().default(null),
  customCompanyName: z
    .string()
    .trim()
    .normalize()
    .max(100)
    .nonempty()
    .nullable()
    .optional()
    .default(null),
});

export enum UserExperienceType {
  Work = 'work',
  Education = 'education',
  Project = 'project',
  Certification = 'certification',
}

type BaseUserExperience = Omit<
  UserExperience,
  'type' | 'id' | 'createdAt' | 'company' | 'customCompanyName'
>;

const DEFAULT_VALUES: BaseUserExperience = {
  title: '',
  description: '',
  subtitle: '',
  startedAt: null,
  endedAt: null,
};

const useUserExperienceForm = ({
  id,
  defaultValues = DEFAULT_VALUES,
  type = UserExperienceType.Work,
}: {
  id?: string;
  defaultValues?: BaseUserExperience;
  type?: UserExperienceType;
}) => {
  const dirtyFormRef = useRef<ReturnType<typeof useDirtyForm> | null>(null);
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const methods = useForm<UserExperience>({
    defaultValues: {
      ...defaultValues,
      type,
    },
    resolver: zodResolver(userExperienceInputBaseSchema),
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserExperienceWork) =>
      type === UserExperienceType.Work
        ? upsertUserWorkExperience(data, id)
        : upsertUserGeneralExperience(data, id),
    onSuccess: () => {
      dirtyFormRef.current?.allowNavigation();
      router.back();
    },
    onError: (error: GraphQLError) => {
      console.log('*** error', error.response?.errors);
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
  console.log('*** errors', methods.formState.errors);
  return { methods, save: dirtyFormRef.current?.save, isPending };
};

export default useUserExperienceForm;
