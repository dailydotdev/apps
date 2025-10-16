import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';

type UseHookFormProps = {
  defaultValues: FieldValues;
};

const useHookForm = ({ defaultValues }: UseHookFormProps) => {
  const methods = useForm<typeof defaultValues>({
    defaultValues,
  });

  return {
    methods,
  };
};

export default useHookForm;
