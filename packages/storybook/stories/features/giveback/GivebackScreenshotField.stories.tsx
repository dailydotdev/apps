import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackScreenshotField } from '@dailydotdev/shared/src/features/giveback/components/GivebackScreenshotField';

// The screenshot uploader used inside the submission modal. These cover the
// three states you hit when adding proof: empty drop zone, mid-upload, and a
// chosen preview ready to clear.
const meta: Meta<typeof GivebackScreenshotField> = {
  title: 'Features/Giveback/Screenshot field',
  component: GivebackScreenshotField,
  args: {
    inputId: 'sb-screenshot',
    onSelect: () => undefined,
    onClear: () => undefined,
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-[35rem] rounded-16 bg-background-default p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GivebackScreenshotField>;

export const Empty: Story = {
  args: { previewSrc: undefined, isUploading: false },
};

export const Uploading: Story = {
  args: { previewSrc: undefined, isUploading: true },
};

export const WithPreview: Story = {
  args: {
    isUploading: false,
    previewSrc:
      'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
  },
};
