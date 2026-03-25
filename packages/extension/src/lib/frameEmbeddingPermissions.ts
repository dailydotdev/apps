import {
  FRAME_EMBED_ORIGIN,
  FRAME_EMBED_PERMISSION,
  getPermissionsApi,
} from './frameEmbeddingApi';

export const hasFrameEmbeddingPermissions = async (): Promise<boolean> =>
  getPermissionsApi()?.contains({
    permissions: [FRAME_EMBED_PERMISSION],
    origins: [FRAME_EMBED_ORIGIN],
  }) ?? false;

export const requestFrameEmbeddingPermissions = async (): Promise<boolean> =>
  getPermissionsApi()?.request({
    permissions: [FRAME_EMBED_PERMISSION],
    origins: [FRAME_EMBED_ORIGIN],
  }) ?? false;
