import React, { useState } from 'react';
import { TextField } from '../fields/TextField';
import { PasswordField } from '../fields/PasswordField';
import { Checkbox } from '../fields/Checkbox';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import type { UserExperienceLevel } from '../../lib/user';
import { Button, ButtonVariant } from '../buttons/Button';
import ImageInput from '../fields/ImageInput';
import { useGenerateUsername } from '../../hooks';

export type UserExperienceLevelKey = keyof typeof UserExperienceLevel;

export interface RegistrationFieldsFormValues {
  email: string;
  name: string;
  password?: string;
  username: string;
  experienceLevel?: UserExperienceLevelKey;
  optOutMarketing: boolean;
  image?: string;
}

type FormValues = Omit<RegistrationFieldsFormValues, 'image'>;

export interface RegistrationFieldsFormProps {
  onSubmit: (values: FormValues) => void;
  initialValues?: Partial<RegistrationFieldsFormValues>;
  submitLabel?: string;
  disabled?: boolean;
  errors?: Partial<Record<keyof RegistrationFieldsFormValues, string>>;
  onResetErrors?: (field?: keyof RegistrationFieldsFormValues) => void;
  withPassword?: boolean;
}

const RegistrationFieldsForm: React.FC<RegistrationFieldsFormProps> = ({
  onSubmit,
  initialValues = {},
  submitLabel = 'Sign up',
  disabled = false,
  errors: serverErrors = {},
  onResetErrors,
  withPassword,
}) => {
  const [values, setValues] = useState<FormValues>({
    email: initialValues.email || '',
    name: initialValues.name || '',
    password: withPassword ? initialValues.password || '' : undefined,
    username: initialValues.username || '',
    experienceLevel: initialValues.experienceLevel as UserExperienceLevelKey,
    optOutMarketing: initialValues.optOutMarketing || false,
  });
  const { username } = useGenerateUsername(
    initialValues.username ? undefined : initialValues.name,
  );
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof RegistrationFieldsFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setValues((v) => ({ ...v, [field]: value }));
      onResetErrors?.(field);
    };

  const handleBlur = (field: keyof RegistrationFieldsFormValues) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    onResetErrors?.(field);
  };

  const suggestedUsername = initialValues.username ?? username;
  const inputUsername = touched.username ? values.username : suggestedUsername;

  const validate = () => {
    const errors: Partial<Record<keyof RegistrationFieldsFormValues, string>> =
      {};
    if (!values.email) {
      errors.email = 'Email is required.';
    }
    if (!values.name) {
      errors.name = 'Name is required.';
    }
    if (!values.password && withPassword) {
      errors.password = 'Password is required.';
    }
    if (!inputUsername) {
      errors.username = 'Username is required.';
    }
    if (!values.experienceLevel) {
      errors.experienceLevel = 'Experience level is required.';
    }
    return errors;
  };

  const localErrors = validate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(localErrors).length === 0) {
      onSubmit({ ...values, username: inputUsername });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      {initialValues.image && (
        <ImageInput
          className={{ container: 'mb-4' }}
          initialValue={initialValues.image}
          size="medium"
          viewOnly
        />
      )}
      <TextField
        name="email"
        inputId="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        hint={
          serverErrors.email ||
          ((touched.email || submitted) && localErrors.email) ||
          ''
        }
        required
        autoComplete="email"
        className={{ container: 'w-full' }}
      />
      <TextField
        name="name"
        inputId="name"
        label="Name"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        hint={
          serverErrors.name ||
          ((touched.name || submitted) && localErrors.name) ||
          ''
        }
        required
        autoComplete="name"
        className={{ container: 'w-full' }}
      />
      {withPassword && (
        <PasswordField
          name="password"
          inputId="password"
          label="Create a password"
          value={values.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          hint={
            serverErrors.password ||
            ((touched.password || submitted) && localErrors.password) ||
            ''
          }
          required
          minLength={6}
          maxLength={72}
          autoComplete="off"
          className={{ container: 'w-full' }}
        />
      )}
      <TextField
        name="username"
        inputId="username"
        label="Enter a username"
        value={inputUsername}
        onChange={handleChange('username')}
        onBlur={handleBlur('username')}
        hint={
          serverErrors.username ||
          ((touched.username || submitted) && localErrors.username) ||
          ''
        }
        required
        autoComplete="user"
        className={{ container: 'w-full' }}
      />
      <ExperienceLevelDropdown
        name="experienceLevel"
        className={{ container: 'w-full' }}
        defaultValue={values.experienceLevel}
        onChange={(val) => {
          setValues((v) => ({ ...v, experienceLevel: val }));
          setTouched((t) => ({ ...t, experienceLevel: true }));
          onResetErrors?.('experienceLevel');
        }}
        hint={
          serverErrors.experienceLevel ||
          ((touched.experienceLevel || submitted) &&
            localErrors.experienceLevel) ||
          ''
        }
        saveHintSpace
      />
      <span className="border-b border-border-subtlest-tertiary pb-4 text-text-secondary typo-subhead">
        Your email will be used to send you product and community updates
      </span>
      <Checkbox
        name="optOutMarketing"
        checked={values.optOutMarketing}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValues((v) => ({ ...v, optOutMarketing: e.target.checked }));
          onResetErrors?.('optOutMarketing');
        }}
      >
        I don&apos;t want to receive updates and promotions via email
      </Checkbox>
      <Button
        className="w-full"
        type="submit"
        variant={ButtonVariant.Primary}
        disabled={disabled}
      >
        {submitLabel}
      </Button>
    </form>
  );
};

export default RegistrationFieldsForm;
