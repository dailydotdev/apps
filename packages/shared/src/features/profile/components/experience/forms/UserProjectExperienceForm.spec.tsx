import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProjectExperienceForm from './UserProjectExperienceForm';
import { UserExperienceType } from '../../../../../graphql/user/profile';

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
      type: UserExperienceType.Project,
      title: '',
      customCompanyName: '',
      current: false,
      startedAt: null,
      url: '',
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

describe('UserProjectExperienceForm', () => {
  it('should render all form fields', () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check title input field is rendered
    const titleInput = screen.getByPlaceholderText(
      'Ex: Name of the publication or article',
    );
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('name', 'title');

    // Check current project switch is rendered
    const currentLabel = screen.getByText('Ongoing project/publication');
    expect(currentLabel).toBeInTheDocument();
    const currentDescription = screen.getByText(
      'Check if this project or publication is currently active or ongoing.',
    );
    expect(currentDescription).toBeInTheDocument();

    // Check URL field
    const urlInput = screen.getByPlaceholderText(
      'Ex: Validates against URL format',
    );
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute('name', 'url');

    // Check description label
    const descriptionLabel = screen.getByText('Description');
    expect(descriptionLabel).toBeInTheDocument();

    // Check date field exists (look for the label)
    expect(screen.getByText('Publication Date*')).toBeInTheDocument();
  });

  it('should handle user interaction with form fields', async () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Type in title field
    const titleInput = screen.getByPlaceholderText(
      'Ex: Name of the publication or article',
    );
    await userEvent.type(
      titleInput,
      'Building Scalable Microservices Architecture',
    );
    expect(titleInput).toHaveValue(
      'Building Scalable Microservices Architecture',
    );

    // Toggle current project - find the hidden checkbox by looking for the label
    const currentLabel = screen.getByText('Ongoing project/publication');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeDefined();
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // Type in URL field
    const urlInput = screen.getByPlaceholderText(
      'Ex: Validates against URL format',
    );
    await userEvent.type(
      urlInput,
      'https://example-blog.com/@user/microservices-article',
    );
    expect(urlInput).toHaveValue(
      'https://example-blog.com/@user/microservices-article',
    );

    // Type in description
    const descriptionTextarea = screen.getByPlaceholderText(
      'Summary of the work, focus area',
    );
    await userEvent.type(
      descriptionTextarea,
      'Article about implementing microservices with Docker and Kubernetes',
    );
    expect(descriptionTextarea).toHaveValue(
      'Article about implementing microservices with Docker and Kubernetes',
    );
  });

  it('should render with pre-filled data for project type', () => {
    const defaultValues = {
      type: UserExperienceType.Project,
      title: 'Machine Learning Research Paper',
      customCompanyName: 'IEEE',
      current: true,
      url: 'https://example-publications.org/document/12345',
      description: 'Research on neural network optimization techniques',
    };

    render(
      <FormWrapper defaultValues={defaultValues}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check that form fields have the default values
    const titleInput = screen.getByPlaceholderText(
      'Ex: Name of the publication or article',
    );
    expect(titleInput).toHaveValue('Machine Learning Research Paper');

    const urlInput = screen.getByPlaceholderText(
      'Ex: Validates against URL format',
    );
    expect(urlInput).toHaveValue(
      'https://example-publications.org/document/12345',
    );

    const descriptionTextarea = screen.getByPlaceholderText(
      'Summary of the work, focus area',
    );
    expect(descriptionTextarea).toHaveValue(
      'Research on neural network optimization techniques',
    );

    // Check current switch state through the label
    const currentLabel = screen.getByText('Ongoing project/publication');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeChecked();
  });

  it('should display different switch labels for OpenSource type', () => {
    render(
      <FormWrapper defaultValues={{ type: UserExperienceType.OpenSource }}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check for OpenSource-specific switch label
    expect(
      screen.getByText('Active open-source contribution'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Check if you are still actively contributing to this open-source project.',
      ),
    ).toBeInTheDocument();

    // Should not have the project/publication label
    expect(
      screen.queryByText('Ongoing project/publication'),
    ).not.toBeInTheDocument();
  });

  it('should display all required field indicators', () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check for required field indicators in labels
    expect(screen.getByText('Title*')).toBeInTheDocument();
    expect(screen.getByText('Publisher*')).toBeInTheDocument();

    // Check publication date has required indicator
    expect(screen.getByText('Publication Date*')).toBeInTheDocument();

    // Check that Publication URL is not required (no asterisk)
    expect(screen.getByText('Publication URL')).toBeInTheDocument();
    expect(screen.queryByText('Publication URL*')).not.toBeInTheDocument();
  });

  it('should render all form sections with proper structure', () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Verify all main input fields are present using proper queries
    expect(
      screen.getByPlaceholderText('Ex: Name of the publication or article'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: Validates against URL format'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Summary of the work, focus area'),
    ).toBeInTheDocument();

    // Check current project text is present
    expect(screen.getByText('Ongoing project/publication')).toBeInTheDocument();

    // Check description section
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Verify labels for each section
    expect(screen.getByText('Title*')).toBeInTheDocument();
    expect(screen.getByText('Publisher*')).toBeInTheDocument();
    expect(screen.getByText('Publication URL')).toBeInTheDocument();
  });

  it('should handle current project toggle', async () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Find the current project switch
    const currentLabel = screen.getByText('Ongoing project/publication');
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
  });

  it('should show month and year dropdowns for publication date', () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check for month and year placeholders in publication date
    const monthPlaceholder = screen.getByText('Month');
    const yearPlaceholder = screen.getByText('Year');

    // We should have 1 set (publication date)
    expect(monthPlaceholder).toBeInTheDocument();
    expect(yearPlaceholder).toBeInTheDocument();
  });

  it('should validate project-specific fields', async () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Test title field accepts various project names
    const titleInput = screen.getByPlaceholderText(
      'Ex: Name of the publication or article',
    );
    await userEvent.type(titleInput, 'React Performance Optimization Guide');
    expect(titleInput).toHaveValue('React Performance Optimization Guide');

    // Clear and test another title
    await userEvent.clear(titleInput);
    await userEvent.type(
      titleInput,
      'Open Source Contribution to React Native',
    );
    expect(titleInput).toHaveValue('Open Source Contribution to React Native');

    // Test URL field accepts valid URLs
    const urlInput = screen.getByPlaceholderText(
      'Ex: Validates against URL format',
    );
    await userEvent.type(urlInput, 'https://example-code.com/user/project');
    expect(urlInput).toHaveValue('https://example-code.com/user/project');
  });

  it('should handle description field with project details', async () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    const descriptionTextarea = screen.getByPlaceholderText(
      'Summary of the work, focus area',
    );

    // Textarea has a 100 character limit
    const description =
      'Developed a high-performance web application using React and Node.js for real-time data.';

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

  it('should handle various URL formats in publication URL field', async () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    const urlInput = screen.getByPlaceholderText(
      'Ex: Validates against URL format',
    );

    // Test with https URL
    await userEvent.type(
      urlInput,
      'https://example-research.org/abs/2024.12345',
    );
    expect(urlInput).toHaveValue('https://example-research.org/abs/2024.12345');

    // Clear and test with code repository URL
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, 'https://example-code.com/company/project');
    expect(urlInput).toHaveValue('https://example-code.com/company/project');

    // Clear and test with URL containing query parameters
    await userEvent.clear(urlInput);
    await userEvent.type(
      urlInput,
      'https://blog.example.com/post?id=123&category=tech',
    );
    expect(urlInput).toHaveValue(
      'https://blog.example.com/post?id=123&category=tech',
    );
  });
});
