export enum ExtensionMessageType {
  ContentLoaded = 'CONTENT_LOADED',
  GraphQLRequest = 'GRAPHQL_REQUEST',
  FetchRequest = 'FETCH_REQUEST',
  DisableCompanion = 'DISABLE_COMPANION',
  RequestUpdate = 'REQUEST_UPDATE',
  EnableFrameEmbeddingForTab = 'ENABLE_FRAME_EMBEDDING_FOR_TAB',
  DisableFrameEmbeddingForTab = 'DISABLE_FRAME_EMBEDDING_FOR_TAB',
  RequestFrameEmbeddingPermissions = 'REQUEST_FRAME_EMBEDDING_PERMISSIONS',
  PingFrameEmbeddingReady = 'PING_FRAME_EMBEDDING_READY',
  RequestOpenNewTab = 'REQUEST_OPEN_NEW_TAB',
  ConsumeActivateOnboarding = 'CONSUME_ACTIVATE_ONBOARDING',
}

export const getCompanionWrapper = (): HTMLElement | null =>
  globalThis?.document
    ?.querySelector('daily-companion-app')
    ?.shadowRoot?.querySelector('#daily-companion-wrapper') ?? null;
