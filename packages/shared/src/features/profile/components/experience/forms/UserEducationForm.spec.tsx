import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserEducationForm from './UserEducationForm';

// Only mock what's absolutely necessary - the AuthContext
jest.mock('../../../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: { id: '123', username: 'testuser' },
    isLoggedIn: true,
  }),
}));

// Mock the LogContext if needed
jest.mock('../../../../../contexts/LogContext', () => ({
  useLogContext: () => ({
    logEvent: jest.fn(),
  }),
}));

interface FormWrapperProps {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}

const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  defaultValues = {},
}) => {
  const methods = useForm({
    defaultValues: {
      customCompanyName: '',
      subtitle: '',
      title: '',
      current: false,
      startedAt: null,
      endedAt: null,
      grade: '',
      description: '',
      ...defaultValues,
    },
  });

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

describe('UserEducationForm', () => {
  it('should render all form fields', () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Check degree input field is rendered
    const degreeInput = screen.getByPlaceholderText(
      'Ex: Bachelor, Master, PhD, Diploma, Certificate',
    );
    expect(degreeInput).toBeInTheDocument();
    expect(degreeInput).toHaveAttribute('name', 'subtitle');

    // Check field of study input field is rendered
    const fieldOfStudyInput = screen.getByPlaceholderText(
      'Ex: Science in Computer Science',
    );
    expect(fieldOfStudyInput).toBeInTheDocument();
    expect(fieldOfStudyInput).toHaveAttribute('name', 'title');

    // Check current education switch is rendered
    const currentLabel = screen.getByText('Current education');
    expect(currentLabel).toBeInTheDocument();
    const currentDescription = screen.getByText(
      'Check if you are currently enrolled in this program or pursuing this degree.',
    );
    expect(currentDescription).toBeInTheDocument();

    // Check grade field
    const gradeInput = screen.getByPlaceholderText(
      'Ex: 3.8/4.0, First Class Honours, 85%',
    );
    expect(gradeInput).toBeInTheDocument();
    expect(gradeInput).toHaveAttribute('name', 'grade');

    // Check description label
    const descriptionLabel = screen.getByText('Description');
    expect(descriptionLabel).toBeInTheDocument();

    // Check date fields exist (look for the labels)
    expect(screen.getByText('Start date*')).toBeInTheDocument();
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should handle user interaction with form fields', async () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Type in degree field
    const degreeInput = screen.getByPlaceholderText(
      'Ex: Bachelor, Master, PhD, Diploma, Certificate',
    );
    await userEvent.type(degreeInput, 'Bachelor of Science');
    expect(degreeInput).toHaveValue('Bachelor of Science');

    // Type in field of study
    const fieldOfStudyInput = screen.getByPlaceholderText(
      'Ex: Science in Computer Science',
    );
    await userEvent.type(fieldOfStudyInput, 'Computer Science');
    expect(fieldOfStudyInput).toHaveValue('Computer Science');

    // Toggle current education - find the hidden checkbox by looking for the label
    const currentLabel = screen.getByText('Current education');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeDefined();
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // Type in grade field
    const gradeInput = screen.getByPlaceholderText(
      'Ex: 3.8/4.0, First Class Honours, 85%',
    );
    await userEvent.type(gradeInput, '3.9/4.0');
    expect(gradeInput).toHaveValue('3.9/4.0');

    // Type in description
    const descriptionTextarea = screen.getByPlaceholderText(
      'Achievements, societies, coursework',
    );
    await userEvent.type(
      descriptionTextarea,
      "Dean's list, Computer Science Society President",
    );
    expect(descriptionTextarea).toHaveValue(
      "Dean's list, Computer Science Society President",
    );
  });

  it('should render with pre-filled data', () => {
    const defaultValues = {
      customCompanyName: 'MIT',
      subtitle: 'Bachelor of Science',
      title: 'Computer Science',
      current: true,
      grade: '3.95/4.0',
      description: 'Graduated with honors, member of ACM',
    };

    render(
      <FormWrapper defaultValues={defaultValues}>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Check that form fields have the default values
    const degreeInput = screen.getByPlaceholderText(
      'Ex: Bachelor, Master, PhD, Diploma, Certificate',
    );
    expect(degreeInput).toHaveValue('Bachelor of Science');

    const fieldOfStudyInput = screen.getByPlaceholderText(
      'Ex: Science in Computer Science',
    );
    expect(fieldOfStudyInput).toHaveValue('Computer Science');

    const gradeInput = screen.getByPlaceholderText(
      'Ex: 3.8/4.0, First Class Honours, 85%',
    );
    expect(gradeInput).toHaveValue('3.95/4.0');

    const descriptionTextarea = screen.getByPlaceholderText(
      'Achievements, societies, coursework',
    );
    expect(descriptionTextarea).toHaveValue(
      'Graduated with honors, member of ACM',
    );

    // Check current switch state through the label
    const currentLabel = screen.getByText('Current education');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeChecked();
  });

  it('should display all required field indicators', () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Check for required field indicators in labels
    expect(screen.getByText('School*')).toBeInTheDocument();
    expect(screen.getByText('Degree*')).toBeInTheDocument();
    expect(screen.getByText('Field of Study*')).toBeInTheDocument();

    // Check date fields have required indicators
    expect(screen.getByText('Start date*')).toBeInTheDocument();
    expect(screen.getByText('End date*')).toBeInTheDocument();

    // Check that Grade is not required (no asterisk)
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.queryByText('Grade*')).not.toBeInTheDocument();
  });

  it('should render all form sections with proper structure', () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Verify all main input fields are present using proper queries
    expect(
      screen.getByPlaceholderText(
        'Ex: Bachelor, Master, PhD, Diploma, Certificate',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: Science in Computer Science'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: 3.8/4.0, First Class Honours, 85%'),
    ).toBeInTheDocument();

    // Check current education text is present
    expect(screen.getByText('Current education')).toBeInTheDocument();

    // Check description section
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Achievements, societies, coursework'),
    ).toBeInTheDocument();

    // Verify labels for each section
    expect(screen.getByText('School*')).toBeInTheDocument();
    expect(screen.getByText('Degree*')).toBeInTheDocument();
    expect(screen.getByText('Field of Study*')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
  });

  it('should handle current education toggle affecting end date', async () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Find the current education switch
    const currentLabel = screen.getByText('Current education');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    // Initially not checked
    expect(currentSwitch).not.toBeChecked();

    // When toggled to current
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // End date fields should still be present
    expect(screen.getByText(/End date\*/)).toBeInTheDocument();
  });

  it('should show month and year dropdowns for date fields', () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Check for month and year placeholders in start date
    const monthPlaceholders = screen.getAllByText('Month');
    const yearPlaceholders = screen.getAllByText('Year');

    // We should have 2 sets (start date and end date)
    expect(monthPlaceholders).toHaveLength(2);
    expect(yearPlaceholders).toHaveLength(2);
  });

  it('should validate education-specific fields', async () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Test degree field accepts various degree types
    const degreeInput = screen.getByPlaceholderText(
      'Ex: Bachelor, Master, PhD, Diploma, Certificate',
    );
    await userEvent.type(degreeInput, 'Master of Business Administration');
    expect(degreeInput).toHaveValue('Master of Business Administration');

    // Clear and test another degree type
    await userEvent.clear(degreeInput);
    await userEvent.type(degreeInput, 'PhD');
    expect(degreeInput).toHaveValue('PhD');

    // Test field of study accepts various fields
    const fieldOfStudyInput = screen.getByPlaceholderText(
      'Ex: Science in Computer Science',
    );
    await userEvent.type(fieldOfStudyInput, 'Electrical Engineering');
    expect(fieldOfStudyInput).toHaveValue('Electrical Engineering');

    // Test grade field accepts various formats
    const gradeInput = screen.getByPlaceholderText(
      'Ex: 3.8/4.0, First Class Honours, 85%',
    );
    await userEvent.type(gradeInput, 'First Class Honours');
    expect(gradeInput).toHaveValue('First Class Honours');

    await userEvent.clear(gradeInput);
    await userEvent.type(gradeInput, '92%');
    expect(gradeInput).toHaveValue('92%');
  });

  it('should handle description field with achievements and coursework', async () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    const descriptionTextarea = screen.getByPlaceholderText(
      'Achievements, societies, coursework',
    ) as HTMLTextAreaElement;

    // Textarea has a 100 character limit
    const description =
      "Dean's List, CS Society President, ML research. Coursework: Data Structures, AI";

    await userEvent.type(descriptionTextarea, description);
    expect(descriptionTextarea).toHaveValue(description);

    // Test that it respects the character limit
    expect(descriptionTextarea).toHaveAttribute('maxlength', '100');

    // Clear and type a longer text that will be truncated
    await userEvent.clear(descriptionTextarea);
    const longText = 'a'.repeat(150); // 150 characters
    await userEvent.type(descriptionTextarea, longText);
    // Should only contain 100 characters
    expect(descriptionTextarea.value).toHaveLength(100);
  });

  it('should maintain form state when switching current education status', async () => {
    render(
      <FormWrapper>
        <UserEducationForm />
      </FormWrapper>,
    );

    // Fill in some fields
    const degreeInput = screen.getByPlaceholderText(
      'Ex: Bachelor, Master, PhD, Diploma, Certificate',
    );
    await userEvent.type(degreeInput, 'Bachelor of Arts');

    const gradeInput = screen.getByPlaceholderText(
      'Ex: 3.8/4.0, First Class Honours, 85%',
    );
    await userEvent.type(gradeInput, '3.7/4.0');

    // Toggle current education
    const currentLabel = screen.getByText('Current education');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await userEvent.click(currentSwitch);

    // Check that other fields retained their values
    expect(degreeInput).toHaveValue('Bachelor of Arts');
    expect(gradeInput).toHaveValue('3.7/4.0');
    expect(currentSwitch).toBeChecked();

    // Toggle back
    await userEvent.click(currentSwitch);
    expect(currentSwitch).not.toBeChecked();
    expect(degreeInput).toHaveValue('Bachelor of Arts');
    expect(gradeInput).toHaveValue('3.7/4.0');
  });
});
