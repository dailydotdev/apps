export enum ExtensionMessageType {
  ContentLoaded = 'CONTENT_LOADED',
  GraphQLRequest = 'GRAPHQL_REQUEST',
  FetchRequest = 'FETCH_REQUEST',
  DisableCompanion = 'DISABLE_COMPANION',
  RequestUpdate = 'REQUEST_UPDATE',
  EnableFrameEmbeddingForTab = 'ENABLE_FRAME_EMBEDDING_FOR_TAB',
  DisableFrameEmbeddingForTab = 'DISABLE_FRAME_EMBEDDING_FOR_TAB',
}

export const getCompanionWrapper = (): HTMLElement | null =>
  globalThis?.document
    ?.querySelector('daily-companion-app')
    ?.shadowRoot?.querySelector('#daily-companion-wrapper') ?? null;
