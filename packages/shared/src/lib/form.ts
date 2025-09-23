import type { UseFormSetError } from 'react-hook-form';
import type { GraphQLError } from './errors';
import type { ApiResponseError, ApiZodErrorExtension } from '../graphql/common';
import { ApiError } from '../graphql/common';

export function formToJson<T>(form: HTMLFormElement, initialValue?: T): T {
  return Array.from(form.elements).reduce((acc, val: HTMLInputElement) => {
    if (val.name === '') {
      return acc;
    }
    if (val.type === 'checkbox') {
      return { ...acc, [val.name]: val.checked };
    }
    if (val.type === 'radio' && !val.checked) {
      return acc;
    }
    if (val.type === 'file') {
      return { ...acc, [val.name]: val.files.length === 0 ? null : val.files };
    }
    return {
      ...acc,
      [val.name]: val.value.length ? val.value : null,
    };
  }, initialValue);
}

export const applyZodErrorsToForm = ({
  error: originalError,
  setError,
}: {
  error: GraphQLError;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setError: UseFormSetError<any>;
}) => {
  if (
    originalError.response?.errors?.[0]?.extensions?.code ===
    ApiError.ZodValidationError
  ) {
    const apiError = originalError.response
      .errors[0] as ApiResponseError<ApiZodErrorExtension>;

    apiError.extensions.issues.forEach((issue) => {
      if (issue.path?.length) {
        setError(issue.path.join('.'), {
          type: issue.code,
          message: issue.message,
        });
      }
    });
  }
};
