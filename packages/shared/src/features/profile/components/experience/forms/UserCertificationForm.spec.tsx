import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserCertificationForm from './UserCertificationForm';

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
      customCompanyName: '',
      currentPosition: false,
      startedAt: null,
      endedAt: null,
      externalReferenceId: '',
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

describe('UserCertificationForm', () => {
  it('should render all form fields', () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Check certification name input field is rendered
    const certNameInput = screen.getByPlaceholderText(
      'Ex: AWS Certified Solutions Architect',
    );
    expect(certNameInput).toBeInTheDocument();
    expect(certNameInput).toHaveAttribute('name', 'title');

    // Check currently valid certification switch is rendered
    const currentLabel = screen.getByText('Currently valid certification');
    expect(currentLabel).toBeInTheDocument();
    const currentDescription = screen.getByText(
      'Check if this certification is still valid or active.',
    );
    expect(currentDescription).toBeInTheDocument();

    // Check credential ID field
    const credentialIdInput = screen.getByPlaceholderText(
      'Ex: Certificate number',
    );
    expect(credentialIdInput).toBeInTheDocument();
    expect(credentialIdInput).toHaveAttribute('name', 'externalReferenceId');

    // Check credential URL field
    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );
    expect(credentialUrlInput).toBeInTheDocument();
    expect(credentialUrlInput).toHaveAttribute('name', 'url');

    // Check description label
    const descriptionLabel = screen.getByText('Description');
    expect(descriptionLabel).toBeInTheDocument();

    // Check date fields exist (look for the labels)
    expect(screen.getByText('Issue date*')).toBeInTheDocument();
    expect(screen.getByText('Expiration Date')).toBeInTheDocument();
  });

  it('should handle user interaction with form fields', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Type in certification name field
    const certNameInput = screen.getByPlaceholderText(
      'Ex: AWS Certified Solutions Architect',
    );
    await userEvent.type(certNameInput, 'AWS Solutions Architect - Associate');
    expect(certNameInput).toHaveValue('AWS Solutions Architect - Associate');

    // Toggle currently valid certification - find the hidden checkbox by looking for the label
    const currentLabel = screen.getByText('Currently valid certification');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(currentSwitch).toBeDefined();
    await userEvent.click(currentSwitch);
    expect(currentSwitch).toBeChecked();

    // Type in credential ID field
    const credentialIdInput = screen.getByPlaceholderText(
      'Ex: Certificate number',
    );
    await userEvent.type(credentialIdInput, 'AWS-123456789');
    expect(credentialIdInput).toHaveValue('AWS-123456789');

    // Type in credential URL field
    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );
    await userEvent.type(
      credentialUrlInput,
      'https://example-cert.com/verification/123456789',
    );
    expect(credentialUrlInput).toHaveValue(
      'https://example-cert.com/verification/123456789',
    );

    // Type in description
    const descriptionTextarea = screen.getByPlaceholderText(
      'Achievements, societies, coursework',
    );
    await userEvent.type(
      descriptionTextarea,
      'Certified for designing distributed systems on AWS',
    );
    expect(descriptionTextarea).toHaveValue(
      'Certified for designing distributed systems on AWS',
    );
  });

  it('should render with pre-filled data', () => {
    const defaultValues = {
      title: 'Google Cloud Professional Data Engineer',
      customCompanyName: 'Google',
      currentPosition: true,
      externalReferenceId: 'GCP-987654321',
      url: 'https://example-cloud.com/certification/verify/987654321',
      description: 'Expertise in data engineering on Google Cloud Platform',
    };

    render(
      <FormWrapper defaultValues={defaultValues}>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Check that form fields have the default values
    const certNameInput = screen.getByPlaceholderText(
      'Ex: AWS Certified Solutions Architect',
    );
    expect(certNameInput).toHaveValue(
      'Google Cloud Professional Data Engineer',
    );

    const credentialIdInput = screen.getByPlaceholderText(
      'Ex: Certificate number',
    );
    expect(credentialIdInput).toHaveValue('GCP-987654321');

    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );
    expect(credentialUrlInput).toHaveValue(
      'https://example-cloud.com/certification/verify/987654321',
    );

    const descriptionTextarea = screen.getByPlaceholderText(
      'Achievements, societies, coursework',
    );
    expect(descriptionTextarea).toHaveValue(
      'Expertise in data engineering on Google Cloud Platform',
    );

    // Check current switch state through the label
    const currentLabel = screen.getByText('Currently valid certification');
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
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Check for required field indicators in labels
    expect(screen.getByText('Certification Name*')).toBeInTheDocument();
    expect(screen.getByText('Issuing Organization*')).toBeInTheDocument();

    // Check issue date has required indicator
    expect(screen.getByText('Issue date*')).toBeInTheDocument();

    // Check that Expiration Date is not required (no asterisk)
    expect(screen.getByText('Expiration Date')).toBeInTheDocument();
    expect(screen.queryByText('Expiration Date*')).not.toBeInTheDocument();

    // Check that Credential ID is not required (no asterisk)
    expect(screen.getByText('Credential ID')).toBeInTheDocument();
    expect(screen.queryByText('Credential ID*')).not.toBeInTheDocument();

    // Check that Credential URL is not required (no asterisk)
    expect(screen.getByText('Credential URL')).toBeInTheDocument();
    expect(screen.queryByText('Credential URL*')).not.toBeInTheDocument();
  });

  it('should render all form sections with proper structure', () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Verify all main input fields are present using proper queries
    expect(
      screen.getByPlaceholderText('Ex: AWS Certified Solutions Architect'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: Certificate number'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Link to verification page'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Achievements, societies, coursework'),
    ).toBeInTheDocument();

    // Check currently valid certification text is present
    expect(
      screen.getByText('Currently valid certification'),
    ).toBeInTheDocument();

    // Check description section
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Verify labels for each section
    expect(screen.getByText('Certification Name*')).toBeInTheDocument();
    expect(screen.getByText('Issuing Organization*')).toBeInTheDocument();
    expect(screen.getByText('Credential ID')).toBeInTheDocument();
    expect(screen.getByText('Credential URL')).toBeInTheDocument();
  });

  it('should handle current certification toggle affecting expiration date', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Find the currently valid certification switch
    const currentLabel = screen.getByText('Currently valid certification');
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

    // Expiration date fields should still be present
    expect(screen.getByText('Expiration Date')).toBeInTheDocument();
  });

  it('should show month and year dropdowns for date fields', () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Check for month and year placeholders in issue date and expiration date
    const monthPlaceholders = screen.getAllByText('Month');
    const yearPlaceholders = screen.getAllByText('Year');

    // We should have 2 sets (issue date and expiration date)
    expect(monthPlaceholders).toHaveLength(2);
    expect(yearPlaceholders).toHaveLength(2);
  });

  it('should validate certification-specific fields', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Test certification name field accepts various certification types
    const certNameInput = screen.getByPlaceholderText(
      'Ex: AWS Certified Solutions Architect',
    );
    await userEvent.type(
      certNameInput,
      'Microsoft Azure Administrator Associate',
    );
    expect(certNameInput).toHaveValue(
      'Microsoft Azure Administrator Associate',
    );

    // Clear and test another certification type
    await userEvent.clear(certNameInput);
    await userEvent.type(certNameInput, 'Certified Kubernetes Administrator');
    expect(certNameInput).toHaveValue('Certified Kubernetes Administrator');

    // Test credential ID accepts various formats
    const credentialIdInput = screen.getByPlaceholderText(
      'Ex: Certificate number',
    );
    await userEvent.type(credentialIdInput, '2024-CERT-001234');
    expect(credentialIdInput).toHaveValue('2024-CERT-001234');

    // Test URL field accepts valid URLs
    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );
    await userEvent.type(
      credentialUrlInput,
      'https://certification.example.com/verify/abc123',
    );
    expect(credentialUrlInput).toHaveValue(
      'https://certification.example.com/verify/abc123',
    );
  });

  it('should handle description field with certification details', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    const descriptionTextarea: HTMLTextAreaElement =
      screen.getByPlaceholderText('Achievements, societies, coursework');

    // Textarea has a 100 character limit
    const description =
      'Advanced cloud architecture certification with focus on scalability and security.';

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

  it('should maintain form state when switching current certification status', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    // Fill in some fields
    const certNameInput = screen.getByPlaceholderText(
      'Ex: AWS Certified Solutions Architect',
    );
    await userEvent.type(certNameInput, 'AWS DevOps Engineer');

    const credentialIdInput = screen.getByPlaceholderText(
      'Ex: Certificate number',
    );
    await userEvent.type(credentialIdInput, 'AWS-2024-12345');

    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );
    await userEvent.type(
      credentialUrlInput,
      'https://example-verify.com/12345',
    );

    // Toggle current certification
    const currentLabel = screen.getByText('Currently valid certification');
    const currentSwitch = currentLabel
      // eslint-disable-next-line testing-library/no-node-access
      .closest('.flex-row')
      // eslint-disable-next-line testing-library/no-node-access
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await userEvent.click(currentSwitch);

    // Check that other fields retained their values
    expect(certNameInput).toHaveValue('AWS DevOps Engineer');
    expect(credentialIdInput).toHaveValue('AWS-2024-12345');
    expect(credentialUrlInput).toHaveValue('https://example-verify.com/12345');
    expect(currentSwitch).toBeChecked();

    // Toggle back
    await userEvent.click(currentSwitch);
    expect(currentSwitch).not.toBeChecked();
    expect(certNameInput).toHaveValue('AWS DevOps Engineer');
    expect(credentialIdInput).toHaveValue('AWS-2024-12345');
    expect(credentialUrlInput).toHaveValue('https://example-verify.com/12345');
  });

  it('should handle various URL formats in credential URL field', async () => {
    render(
      <FormWrapper>
        <UserCertificationForm />
      </FormWrapper>,
    );

    const credentialUrlInput = screen.getByPlaceholderText(
      'Link to verification page',
    );

    // Test with https URL
    await userEvent.type(
      credentialUrlInput,
      'https://example-badges.com/badges/abc-123',
    );
    expect(credentialUrlInput).toHaveValue(
      'https://example-badges.com/badges/abc-123',
    );

    // Clear and test with http URL
    await userEvent.clear(credentialUrlInput);
    await userEvent.type(
      credentialUrlInput,
      'http://example-certification.org/id/12345',
    );
    expect(credentialUrlInput).toHaveValue(
      'http://example-certification.org/id/12345',
    );

    // Clear and test with URL containing query parameters
    await userEvent.clear(credentialUrlInput);
    await userEvent.type(
      credentialUrlInput,
      'https://example.com/verify?id=123&name=test',
    );
    expect(credentialUrlInput).toHaveValue(
      'https://example.com/verify?id=123&name=test',
    );
  });
});
