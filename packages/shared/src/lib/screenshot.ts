/**
 * Check if the browser supports screen capture via getDisplayMedia API.
 * This is used to determine whether to show the "Capture Screenshot" button.
 */
export const supportsScreenCapture = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return (
    'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices
  );
};

/**
 * Capture a screenshot using the Screen Capture API (getDisplayMedia).
 * The user will be prompted to select which screen/window/tab to capture.
 *
 * @returns A File object containing the screenshot as a PNG, or null if cancelled/failed.
 */
export const captureScreenshot = async (): Promise<File | null> => {
  if (!supportsScreenCapture()) {
    return null;
  }

  let stream: MediaStream | null = null;

  try {
    // Request screen capture - user will see a selection dialog
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
      } as MediaTrackConstraints,
      audio: false,
    });

    const track = stream.getVideoTracks()[0];
    if (!track) {
      return null;
    }

    // Create a video element to capture a frame from the stream
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;

    // Wait for video to be ready
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject);
      };
      video.onerror = () => reject(new Error('Video load failed'));
    });

    // Give the video a moment to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create canvas and draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      return null;
    }

    // Create a File from the blob
    const timestamp = Date.now();
    const file = new File([blob], `screenshot-${timestamp}.png`, {
      type: 'image/png',
    });

    return file;
  } catch (error) {
    // User cancelled or permission denied - this is expected behavior
    if (
      error instanceof Error &&
      (error.name === 'NotAllowedError' || error.name === 'AbortError')
    ) {
      return null;
    }
    // Re-throw unexpected errors
    throw error;
  } finally {
    // Always stop all tracks to clean up
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
};

/**
 * Create an object URL for a File object to display a preview.
 * Remember to call URL.revokeObjectURL() when done to free memory.
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke an object URL to free memory.
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Validate that a file is an allowed image type for screenshot upload.
 */
export const isValidImageType = (file: File): boolean => {
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
  ];
  return allowedTypes.includes(file.type);
};

/**
 * Maximum file size for screenshot upload (5MB).
 */
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

/**
 * Validate that a file is within the size limit.
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_SCREENSHOT_SIZE;
};
