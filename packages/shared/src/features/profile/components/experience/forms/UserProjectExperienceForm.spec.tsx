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
      endedAt: null,
      url: '',
      description: '',
      repository: null,
      repositorySearch: '',
      ...defaultValues,
    },
  });

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

const getFieldByName = (container: HTMLElement, name: string) => {
  // eslint-disable-next-line testing-library/no-node-access
  return container.querySelector(`[name="${name}"]`) as HTMLInputElement;
};

describe('UserProjectExperienceForm', () => {
  it('should render all form fields', () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check title input field is rendered
    const titleInput = getFieldByName(container, 'title');
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
    const urlInput = getFieldByName(container, 'url');
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute('name', 'url');

    // Check description label
    const descriptionLabel = screen.getByText('Description');
    expect(descriptionLabel).toBeInTheDocument();

    // Check date field exists (look for the label)
    expect(screen.getByText('Publication Date*')).toBeInTheDocument();

    // Check end date field exists when current is false
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should handle user interaction with form fields', async () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Type in title field
    const titleInput = getFieldByName(container, 'title');
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
    const urlInput = getFieldByName(container, 'url');
    await userEvent.type(
      urlInput,
      'https://example-blog.com/@user/microservices-article',
    );
    expect(urlInput).toHaveValue(
      'https://example-blog.com/@user/microservices-article',
    );

    // Type in description
    const descriptionTextarea = getFieldByName(container, 'description');
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

    const { container } = render(
      <FormWrapper defaultValues={defaultValues}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check that form fields have the default values
    const titleInput = getFieldByName(container, 'title');
    expect(titleInput).toHaveValue('Machine Learning Research Paper');

    const urlInput = getFieldByName(container, 'url');
    expect(urlInput).toHaveValue(
      'https://example-publications.org/document/12345',
    );

    const descriptionTextarea = getFieldByName(container, 'description');
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

    // End date field should not be present when current is true
    expect(screen.queryByText('End date*')).not.toBeInTheDocument();
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

    // Check for OpenSource-specific start date label
    expect(screen.getByText('Active from*')).toBeInTheDocument();

    // End date field should be present when current is false
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should display Repository URL field for OpenSource type', () => {
    const { container } = render(
      <FormWrapper defaultValues={{ type: UserExperienceType.OpenSource }}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Repository URL field should be present for OpenSource
    expect(screen.getByText('Repository URL*')).toBeInTheDocument();

    // The URL field should use repository.url name
    const urlInput = getFieldByName(container, 'repository.url');
    expect(urlInput).toBeInTheDocument();
  });

  it('should show Repository URL as read-only when GitHub repository is selected', () => {
    const { container } = render(
      <FormWrapper
        defaultValues={{
          type: UserExperienceType.OpenSource,
          repository: {
            id: 'github-repo-123',
            owner: 'facebook',
            name: 'react',
            url: 'https://github.com/facebook/react',
            image: 'https://example.com/image.png',
          },
        }}
      >
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Label should not have asterisk when GitHub repo is selected
    expect(screen.getByText('Repository URL')).toBeInTheDocument();
    expect(screen.queryByText('Repository URL*')).not.toBeInTheDocument();

    // The URL field should be read-only
    const urlInput = getFieldByName(container, 'repository.url');
    expect(urlInput).toHaveAttribute('readonly');
  });

  it('should show Repository URL as editable when custom repository is entered', () => {
    const { container } = render(
      <FormWrapper
        defaultValues={{
          type: UserExperienceType.OpenSource,
          repository: {
            id: null,
            owner: 'myorg',
            name: 'myrepo',
            url: null,
            image: null,
          },
        }}
      >
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Label should have asterisk for custom repo (URL is required)
    expect(screen.getByText('Repository URL*')).toBeInTheDocument();

    // The URL field should NOT be read-only
    const urlInput = getFieldByName(container, 'repository.url');
    expect(urlInput).not.toHaveAttribute('readonly');
  });

  it('should not show Publication URL field for OpenSource type', () => {
    const { container } = render(
      <FormWrapper defaultValues={{ type: UserExperienceType.OpenSource }}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Should not have Publication URL label
    expect(screen.queryByText('Publication URL')).not.toBeInTheDocument();

    // Should not have url field (only repository.url)
    const urlInput = getFieldByName(container, 'url');
    expect(urlInput).not.toBeInTheDocument();
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

    // Check end date has required indicator when current is false
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });

  it('should render all form sections with proper structure', () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Verify all main input fields are present using proper queries
    expect(getFieldByName(container, 'title')).toBeInTheDocument();
    expect(getFieldByName(container, 'url')).toBeInTheDocument();
    expect(getFieldByName(container, 'description')).toBeInTheDocument();

    // Check current project text is present
    expect(screen.getByText('Ongoing project/publication')).toBeInTheDocument();

    // Check description section
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Verify labels for each section
    expect(screen.getByText('Title*')).toBeInTheDocument();
    expect(screen.getByText('Publisher*')).toBeInTheDocument();
    expect(screen.getByText('Publication URL')).toBeInTheDocument();
    expect(screen.getByText('End date*')).toBeInTheDocument();
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

    // End date field should be present when current is false
    expect(screen.getByText('End date*')).toBeInTheDocument();

    // When toggled to current
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // End date field should not be present when current is true
    expect(screen.queryByText('End date*')).not.toBeInTheDocument();
  });

  it('should show month and year dropdowns for publication date', () => {
    render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Check for "January" placeholder in publication date (startedAt)
    expect(screen.getByText('January')).toBeInTheDocument();

    // Check for "Month" placeholder in end date (endedAt) when current is false
    expect(screen.getByText('Month')).toBeInTheDocument();

    // Check for year placeholders (should have 2 - one for start date and one for end date)
    const yearPlaceholders = screen.getAllByText('Year');
    expect(yearPlaceholders).toHaveLength(2);
  });

  it('should validate project-specific fields', async () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Test title field accepts various project names
    const titleInput = getFieldByName(container, 'title');
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
    const urlInput = getFieldByName(container, 'url');
    await userEvent.type(urlInput, 'https://example-code.com/user/project');
    expect(urlInput).toHaveValue('https://example-code.com/user/project');
  });

  it('should handle description field with project details', async () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    const descriptionTextarea = getFieldByName(container, 'description');

    // Textarea has a 5000 character limit
    const description =
      'Developed a high-performance web application using React and Node.js for real-time data.';

    await userEvent.type(descriptionTextarea, description);
    expect(descriptionTextarea).toHaveValue(description);

    // Test that it has the correct character limit
    expect(descriptionTextarea).toHaveAttribute('maxlength', '5000');
  });

  it('should handle various URL formats in publication URL field', async () => {
    const { container } = render(
      <FormWrapper>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    const urlInput = getFieldByName(container, 'url');

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

  it('should show end date field when current is false for OpenSource type', () => {
    render(
      <FormWrapper
        defaultValues={{
          type: UserExperienceType.OpenSource,
          current: false,
        }}
      >
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // End date field should be present when current is false
    expect(screen.getByText('End date*')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('should hide end date field when current is true for OpenSource type', () => {
    render(
      <FormWrapper
        defaultValues={{
          type: UserExperienceType.OpenSource,
          current: true,
        }}
      >
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // End date field should not be present when current is true
    expect(screen.queryByText('End date*')).not.toBeInTheDocument();
    expect(screen.queryByText('Month')).not.toBeInTheDocument();
  });

  it('should toggle end date field visibility when switching current status', async () => {
    render(
      <FormWrapper defaultValues={{ type: UserExperienceType.OpenSource }}>
        <UserProjectExperienceForm />
      </FormWrapper>,
    );

    // Initially current is false, so end date should be visible
    expect(screen.getByText('End date*')).toBeInTheDocument();

    // Find and toggle the current switch
    const currentLabel = screen.getByText('Active open-source contribution');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    // Toggle to current (true)
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();
    expect(screen.queryByText('End date*')).not.toBeInTheDocument();

    // Toggle back to not current (false)
    await userEvent.click(currentSwitch);
    expect(currentSwitch).not.toBeChecked();
    expect(screen.getByText('End date*')).toBeInTheDocument();
  });
});
