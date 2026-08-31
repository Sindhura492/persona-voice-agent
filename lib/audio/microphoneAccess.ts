function micBlockedMessage(hostname: string): string {
  return `Microphone access is blocked for ${hostname}. Click the lock icon in your browser address bar, allow the microphone for this site, then start the call again.`;
}

export async function ensureMicrophoneAccess(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone is not supported in this browser.");
  }

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "this site";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) {
      track.stop();
    }
  } catch (error) {
    if (error instanceof DOMException) {
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        throw new Error(micBlockedMessage(hostname));
      }
      if (error.name === "NotFoundError") {
        throw new Error("No microphone was found. Connect a mic and try again.");
      }
    }
    throw error;
  }
}
