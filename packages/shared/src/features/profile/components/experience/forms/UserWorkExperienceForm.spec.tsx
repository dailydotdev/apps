import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserWorkExperienceForm from './UserWorkExperienceForm';
import type { TLocation } from '../../../../../graphql/autocomplete';

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
      title: '',
      employmentType: '',
      customCompanyName: '',
      current: false,
      startedAt: null,
      endedAt: null,
      locationId: '',
      locationType: '',
      description: '',
      skills: [],
      ...defaultValues,
    },
  });

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

describe('UserWorkExperienceForm', () => {
  it('should render all form fields', () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Check title input field is rendered
    const titleInput = screen.getByPlaceholderText('Job Title*');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('name', 'title');

    // Check employment type select is rendered (it's a button that opens a dropdown)
    const employmentButton = screen.getByRole('button', {
      name: /please select/i,
    });
    expect(employmentButton).toBeInTheDocument();

    // Check current position switch is rendered
    const currentLabel = screen.getByText('Current position');
    expect(currentLabel).toBeInTheDocument();
    const currentDescription = screen.getByText(
      'Check if this is your current role',
    );
    expect(currentDescription).toBeInTheDocument();

    // Check description textarea
    const descriptionTextarea = screen.getByPlaceholderText(
      'List your major duties and successes, highlighting specific projects',
    );
    expect(descriptionTextarea).toBeInTheDocument();
    expect(descriptionTextarea).toHaveAttribute('name', 'description');

    // Verify key sections are rendered
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
    expect(screen.getByText('Current position')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Check date fields exist (look for the labels)
    expect(screen.getByText('Start date*')).toBeInTheDocument();
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should handle user interaction with form fields', async () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Type in title field
    const titleInput = screen.getByPlaceholderText('Job Title*');
    await userEvent.type(titleInput, 'Senior Software Engineer');
    expect(titleInput).toHaveValue('Senior Software Engineer');

    // Toggle current position - find the hidden checkbox by looking for the label
    const currentLabel = screen.getByText('Current position');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeDefined();
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // Type in description
    const descriptionTextarea = screen.getByPlaceholderText(
      'List your major duties and successes, highlighting specific projects',
    );
    await userEvent.type(
      descriptionTextarea,
      'Led development of microservices',
    );
    expect(descriptionTextarea).toHaveValue('Led development of microservices');

    // Test skills input
    const skillsInput = screen.getByPlaceholderText('Search skills');
    expect(skillsInput).toBeInTheDocument();
    await userEvent.type(skillsInput, 'React');
    expect(skillsInput).toHaveValue('React');
  });

  it('should render with location prop', () => {
    const mockLocation: TLocation = {
      id: 'loc-123',
      city: 'San Francisco',
      subdivision: 'CA',
      country: 'USA',
    };

    render(
      <FormWrapper>
        <UserWorkExperienceForm location={mockLocation} />
      </FormWrapper>,
    );

    // Verify form renders with location - the ProfileLocation component should handle it
    expect(screen.getByPlaceholderText('Job Title*')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render with pre-filled data', () => {
    const defaultValues = {
      title: 'Software Engineer',
      employmentType: 1,
      customCompanyName: 'Example Corp',
      current: true,
      description: 'Building awesome applications',
      skills: ['JavaScript', 'React'],
    };

    render(
      <FormWrapper defaultValues={defaultValues}>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Check that form fields have the default values
    const titleInput = screen.getByPlaceholderText('Job Title*');
    expect(titleInput).toHaveValue('Software Engineer');

    const descriptionTextarea = screen.getByPlaceholderText(
      'List your major duties and successes, highlighting specific projects',
    );
    expect(descriptionTextarea).toHaveValue('Building awesome applications');

    // Check current switch state through the label
    const currentLabel = screen.getByText('Current position');
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
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Check for required field indicators - the title field has * in placeholder
    expect(screen.getByPlaceholderText('Job Title*')).toBeInTheDocument();

    // Check date fields have required indicators
    expect(screen.getByText('Start date*')).toBeInTheDocument();
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should render all form sections with proper structure', () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Verify all main input fields are present using proper queries
    expect(screen.getByPlaceholderText('Job Title*')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /please select/i }),
    ).toBeInTheDocument();

    // Check current position text is present
    expect(screen.getByText('Current position')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'List your major duties and successes, highlighting specific projects',
      ),
    ).toBeInTheDocument();

    // Check text content for sections
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
    expect(screen.getByText('Current position')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should handle current position toggle affecting end date', async () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Find the current position switch
    const currentLabel = screen.getByText('Current position');
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

  it('should show character count for description field', async () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    const descriptionTextarea = screen.getByPlaceholderText(
      'List your major duties and successes, highlighting specific projects',
    );

    // Type some text and check if character count updates
    await userEvent.type(descriptionTextarea, 'Test description');

    // Look for character count display (e.g., "16/5000" or similar)
    const characterCount = screen.getByText(/\/\d+/);
    expect(characterCount).toBeInTheDocument();
  });

  it('should render skills input and verify skill rendering', async () => {
    render(
      <FormWrapper
        defaultValues={{
          skills: ['JavaScript', 'TypeScript', 'React'],
        }}
      >
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Check Skills label is rendered
    expect(screen.getByText('Skills')).toBeInTheDocument();

    // Check skills search input is rendered
    const skillsInput = screen.getByPlaceholderText('Search skills');
    expect(skillsInput).toBeInTheDocument();

    // Check skills hint is rendered
    expect(
      screen.getByText(
        'Add commas (,) to add multiple skills. Press Enter to submit them.',
      ),
    ).toBeInTheDocument();

    // Check that skills from defaultValues are properly rendered as tag buttons
    expect(
      screen.getByRole('button', { name: /JavaScript/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /TypeScript/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /React/i })).toBeInTheDocument();

    // Test that we can type in the skills input
    await userEvent.type(skillsInput, 'Vue');
    expect(skillsInput).toHaveValue('Vue');

    // Test typing comma-separated values
    await userEvent.clear(skillsInput);
    await userEvent.type(skillsInput, 'Angular,Node.js');
    expect(skillsInput).toHaveValue('Angular,Node.js');

    // Verify input functionality
    await userEvent.clear(skillsInput);
    expect(skillsInput).toHaveValue('');
  });

  it('should render all skills-related elements', () => {
    render(
      <FormWrapper>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Check Skills section is rendered
    expect(screen.getByText('Skills')).toBeInTheDocument();

    // Check search input with correct placeholder
    const skillsInput = screen.getByPlaceholderText('Search skills');
    expect(skillsInput).toBeInTheDocument();
    // Check that the id starts with 'skills' (React may append instance keys)
    expect(skillsInput.id).toMatch(/^skills/);

    // Check the hint text is displayed
    expect(
      screen.getByText(
        'Add commas (,) to add multiple skills. Press Enter to submit them.',
      ),
    ).toBeInTheDocument();
  });

  it('should handle skills with pre-filled data', () => {
    const defaultValues = {
      title: 'Software Engineer',
      skills: ['React', 'Node.js', 'PostgreSQL'],
    };

    render(
      <FormWrapper defaultValues={defaultValues}>
        <UserWorkExperienceForm />
      </FormWrapper>,
    );

    // Skills section should be present
    expect(screen.getByText('Skills')).toBeInTheDocument();

    // Skills input should be present
    const skillsInput = screen.getByPlaceholderText('Search skills');
    expect(skillsInput).toBeInTheDocument();

    // Pre-filled skills should be rendered as tag buttons
    expect(screen.getByRole('button', { name: /React/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Node\.js/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /PostgreSQL/i }),
    ).toBeInTheDocument();
  });
});
