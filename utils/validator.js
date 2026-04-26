export function validateTranscript(transcript) {
  if (!transcript) return "Transcript is required";
  if (transcript.length < 10) return "Transcript too short";
  if (transcript.length > 10000) return "Transcript too long";

  return null;
}