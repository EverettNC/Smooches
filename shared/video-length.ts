// Everett's rule for Smooches videos: 5 seconds to 3 minutes.
export const VIDEO_MIN_SECONDS = 5;
export const VIDEO_MAX_SECONDS = 180;
export const VIDEO_LENGTH_LABEL = "5 seconds to 3 minutes";

export function videoLengthProblem(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return "We couldn't read how long this video is. Please try a different file.";
  if (seconds < VIDEO_MIN_SECONDS) return `This video is ${seconds.toFixed(1)} seconds. Videos need to be ${VIDEO_LENGTH_LABEL}.`;
  if (seconds > VIDEO_MAX_SECONDS) {
    const m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
    return `This video is ${m}:${String(s).padStart(2, "0")}. Videos need to be ${VIDEO_LENGTH_LABEL}.`;
  }
  return null;
}
