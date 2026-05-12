export const pickLiveTrack = (
  source: MediaStream | null,
  kind: 'audio' | 'video',
): MediaStreamTrack | null => {
  if (!source) {
    return null;
  }

  const tracks =
    kind === 'audio' ? source.getAudioTracks() : source.getVideoTracks();

  return tracks.find((track) => track.readyState === 'live') ?? null;
};
