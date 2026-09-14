import {
  classifyWorldEngineCreationFailure,
  canCreateThrowawayWebGLContext,
} from '../../components/world/worldBootFailure';

const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext',
);

const mockGetContext = (getContext: jest.Mock) => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: getContext,
  });
};

afterEach(() => {
  if (originalGetContext) {
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      'getContext',
      originalGetContext,
    );
  }
});

describe('world boot failure classification', () => {
  it('treats a successful throwaway WebGL probe as a context limit', () => {
    const loseContext = jest.fn();
    const context = {
      getExtension: jest.fn(() => ({ loseContext })),
    };
    const getContext = jest.fn(() => context);
    mockGetContext(getContext);

    expect(
      classifyWorldEngineCreationFailure(
        new Error('Error creating WebGL context.'),
      ),
    ).toEqual('context-limit');
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(context.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('treats a failed throwaway WebGL probe as unsupported', () => {
    const getContext = jest.fn(() => null);
    mockGetContext(getContext);

    expect(canCreateThrowawayWebGLContext()).toBe(false);
    expect(
      classifyWorldEngineCreationFailure(
        new Error('Error creating WebGL context.'),
      ),
    ).toEqual('unsupported');
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(getContext).toHaveBeenCalledWith('webgl');
  });

  it('treats a throwing throwaway WebGL probe as unsupported', () => {
    const getContext = jest.fn(() => {
      throw new Error('blocked');
    });
    mockGetContext(getContext);

    expect(
      classifyWorldEngineCreationFailure(
        new Error('Error creating WebGL context.'),
      ),
    ).toEqual('unsupported');
  });

  it('keeps non-WebGL construction failures in the engine bucket', () => {
    const getContext = jest.fn();
    mockGetContext(getContext);

    expect(
      classifyWorldEngineCreationFailure(new Error('missing mount')),
    ).toEqual('engine');
    expect(getContext).not.toHaveBeenCalled();
  });
});
