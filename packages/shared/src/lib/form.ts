import type { UseFormSetError } from 'react-hook-form';
import type { GraphQLError } from './errors';
import type { ApiResponseError, ApiZodErrorExtension } from '../graphql/common';
import { ApiError } from '../graphql/common';

type FormFieldElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;
type FormValue = string | string[] | boolean | FileList | null;
type FormValues = Record<string, FormValue>;

const isFormFieldElement = (element: Element): element is FormFieldElement =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement;

export function formToJson<T extends object>(
  form: HTMLFormElement,
  initialValue?: T,
): T {
  const initialData = (initialValue ?? {}) as FormValues;

  const values = Array.from(form.elements).reduce<FormValues>(
    (acc, element) => {
      if (!isFormFieldElement(element) || element.name === '') {
        return acc;
      }

      // Handle fields that end with [] as arrays.
      if (element.name.endsWith('[]')) {
        const fieldName = element.name.slice(0, -2);
        const existingValue = acc[fieldName];
        const existingArray = Array.isArray(existingValue) ? existingValue : [];

        if (element.value && element.value.trim().length > 0) {
          return { ...acc, [fieldName]: [...existingArray, element.value] };
        }

        return acc;
      }

      if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        return { ...acc, [element.name]: element.checked };
      }

      if (
        element instanceof HTMLInputElement &&
        element.type === 'radio' &&
        !element.checked
      ) {
        return acc;
      }

      if (element instanceof HTMLInputElement && element.type === 'file') {
        const { files } = element;
        return {
          ...acc,
          [element.name]: !files || files.length === 0 ? null : files,
        };
      }

      return {
        ...acc,
        [element.name]: element.value.length ? element.value : null,
      };
    },
    initialData,
  );

  return values as unknown as T;
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
