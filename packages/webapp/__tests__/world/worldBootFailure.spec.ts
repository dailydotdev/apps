import {
  classifyWorldEngineCreationFailure,
  probeWebGLSupport,
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

/* Loaded through the runtime rather than imported: three ships no declarations
   at this version, and the pin below needs exactly one constructor from it. */
const { WebGLRenderer } = jest.requireActual('three') as {
  WebGLRenderer: new () => unknown;
};

const contextWithLoseExtension = (loseContext = jest.fn()) => ({
  getExtension: jest.fn(() => ({ loseContext })),
});

afterEach(() => {
  if (originalGetContext) {
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      'getContext',
      originalGetContext,
    );
  }
});

describe('probeWebGLSupport', () => {
  it('reports a released context as available', () => {
    const loseContext = jest.fn();
    const context = contextWithLoseExtension(loseContext);
    const getContext = jest.fn(() => context);
    mockGetContext(getContext);

    expect(probeWebGLSupport()).toEqual('available');
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(context.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('reports no context at all as absent', () => {
    const getContext = jest.fn(() => null);
    mockGetContext(getContext);

    expect(probeWebGLSupport()).toEqual('absent');
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(getContext).toHaveBeenCalledWith('webgl');
  });

  it('reports a context it cannot hand back as inconclusive', () => {
    mockGetContext(jest.fn(() => ({ getExtension: jest.fn(() => null) })));

    expect(probeWebGLSupport()).toEqual('inconclusive');
  });

  it('reports a blocked canvas as inconclusive', () => {
    mockGetContext(
      jest.fn(() => {
        throw new Error('blocked');
      }),
    );

    expect(probeWebGLSupport()).toEqual('inconclusive');
  });
});

describe('world boot failure classification', () => {
  it('calls a browser unsupported only when the probe finds no WebGL', () => {
    mockGetContext(jest.fn(() => null));

    expect(
      classifyWorldEngineCreationFailure(
        new Error('Error creating WebGL context.'),
      ),
    ).toEqual('unsupported');
  });

  it('stays off the message for the unsupported call, so a three.js reword cannot hide it', () => {
    mockGetContext(jest.fn(() => null));

    expect(
      classifyWorldEngineCreationFailure(new Error('WebGL is not available')),
    ).toEqual('unsupported');
  });

  it('treats a refused context on a WebGL browser as a context limit', () => {
    mockGetContext(jest.fn(() => contextWithLoseExtension()));

    expect(
      classifyWorldEngineCreationFailure(
        new Error(
          'Error creating WebGL context with your selected attributes.',
        ),
      ),
    ).toEqual('context-limit');
  });

  it('keeps non-context construction failures in the engine bucket', () => {
    mockGetContext(jest.fn(() => contextWithLoseExtension()));

    expect(
      classifyWorldEngineCreationFailure(new Error('missing mount')),
    ).toEqual('engine');
  });

  /* An inconclusive probe is the branch a reader would be told the most about
     their browser on the least evidence, so it is the one worth pinning. */
  it('never claims unsupported on an inconclusive probe', () => {
    mockGetContext(
      jest.fn(() => {
        throw new Error('blocked');
      }),
    );

    expect(
      classifyWorldEngineCreationFailure(
        new Error('Error creating WebGL context.'),
      ),
    ).toEqual('context-limit');
  });

  /* Against the real constructor rather than a hand-written Error, so a three.js
     upgrade that rewords this fails here instead of quietly collapsing the
     context-limit bucket into `engine` in production. */
  it('classifies what three.js actually throws when no context can be had', () => {
    mockGetContext(jest.fn(() => null));

    /* three.js logs the same failure on its way out, and this test is the one
       place that runs it on purpose. */
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    let thrown: unknown;
    try {
      // eslint-disable-next-line no-new
      new WebGLRenderer();
    } catch (error) {
      thrown = error;
    }
    logged.mockRestore();

    expect(thrown).toBeInstanceOf(Error);
    expect(classifyWorldEngineCreationFailure(thrown)).toEqual('unsupported');

    mockGetContext(jest.fn(() => contextWithLoseExtension()));
    expect(classifyWorldEngineCreationFailure(thrown)).toEqual('context-limit');
  });
});
