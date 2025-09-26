import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { CodeField } from '@dailydotdev/shared/src/components/fields/CodeField';
import { fn } from 'storybook/test';

const meta: Meta<typeof CodeField> = {
  title: 'Components/Fields/CodeField',
  component: CodeField,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of code input fields',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all input fields',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CodeField>;

// Wrapper component to show the current code value
const CodeFieldWrapper = (props: any) => {
  const [currentCode, setCurrentCode] = useState('');

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
        <p className="text-text-tertiary mb-4">
          Current value:{' '}
          <code className="bg-surface-float px-2 py-1 rounded">
            {currentCode || 'empty'}
          </code>
        </p>
      </div>
      <CodeField
        {...props}
        onChange={(code) => {
          setCurrentCode(code);
          props.onChange?.(code);
        }}
      />
      <p className="text-text-tertiary text-sm mt-2">
        Try typing, pasting, or using iOS OTP autofill
      </p>
    </div>
  );
};

export const Default: Story = {
  args: {
    length: 6,
    disabled: false,
    onSubmit: fn(),
    onChange: fn(),
  },
  render: (props) => <CodeFieldWrapper {...props} />,
};

export const FourDigit: Story = {
  args: {
    length: 4,
    disabled: false,
    onSubmit: fn(),
    onChange: fn(),
  },
  render: (props) => <CodeFieldWrapper {...props} />,
};

export const EightDigit: Story = {
  args: {
    length: 8,
    disabled: false,
    onSubmit: fn(),
    onChange: fn(),
  },
  render: (props) => <CodeFieldWrapper {...props} />,
};

export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    onSubmit: fn(),
    onChange: fn(),
  },
  render: (props) => <CodeFieldWrapper {...props} />,
};

export const InteractiveDemo: Story = {
  args: {
    length: 6,
    disabled: false,
    onSubmit: fn(),
    onChange: fn(),
  },
  render: (props) => {
    const [code, setCode] = useState('');
    const [submitted, setSubmitted] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Interactive Code Field Demo
          </h3>
          <p className="text-text-tertiary mb-4">
            Test all features: typing, pasting, iOS autofill
          </p>
        </div>

        <CodeField
          {...props}
          onChange={(newCode) => {
            setCode(newCode);
            setSubmitted(false);
            props.onChange?.(newCode);
          }}
          onSubmit={(finalCode) => {
            setSubmitted(true);
            props.onSubmit?.(finalCode);
          }}
        />

        <div className="text-center space-y-2">
          <p className="text-text-tertiary">
            Current:{' '}
            <code className="bg-surface-float px-2 py-1 rounded">
              {code || 'empty'}
            </code>
          </p>
          {submitted && (
            <p className="text-green-500 font-semibold">
              ✅ Code submitted: {code}
            </p>
          )}
        </div>

        <div className="text-sm text-text-tertiary space-y-1 max-w-md text-center">
          <p>
            <strong>Features to test:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Type digits manually</li>
            <li>Use backspace to navigate backwards</li>
            <li>Paste a code (try "123456")</li>
            <li>On iOS Safari: receive SMS and tap autofill</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText('123456');
            }}
            className="px-3 py-1 bg-accent-cabbage-default text-white rounded text-sm"
          >
            Copy "123456" to clipboard
          </button>
          <button
            onClick={() => {
              setCode('');
              setSubmitted(false);
            }}
            className="px-3 py-1 bg-surface-float text-text-primary rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};
