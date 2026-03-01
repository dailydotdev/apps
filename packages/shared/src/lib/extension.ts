export enum ExtensionMessageType {
  ContentLoaded = 'CONTENT_LOADED',
  GraphQLRequest = 'GRAPHQL_REQUEST',
  FetchRequest = 'FETCH_REQUEST',
  DisableCompanion = 'DISABLE_COMPANION',
  RequestUpdate = 'REQUEST_UPDATE',
}

export const getCompanionWrapper = (): HTMLElement | null =>
  globalThis?.document
    ?.querySelector('daily-companion-app')
    ?.shadowRoot?.querySelector('#daily-companion-wrapper') ?? null;
