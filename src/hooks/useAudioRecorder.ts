import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// useAudioRecorder Hook
// Records one utterance with MediaRecorder for cloud STT.
// Stops automatically after ~1.5s of silence (so we don't pay
// to transcribe silence), or after MAX_DURATION_MS.
// ============================================================

const MAX_DURATION_MS = 15_000;      // hard cap per utterance
const NO_SPEECH_TIMEOUT_MS = 7_000;  // give up if nobody speaks
const SILENCE_AFTER_SPEECH_MS = 1_500;
const SPEECH_RMS_THRESHOLD = 0.02;   // time-domain RMS considered "speech"
const POLL_MS = 100;

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',            // Safari / iOS
  'audio/ogg;codecs=opus',
];

export interface RecordedUtterance {
  blob: Blob;
  mimeType: string;
  hadSpeech: boolean;
}

export function isAudioRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

function pickMimeType(): string | undefined {
  return PREFERRED_MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  // Bumped on cancel() so a record() still awaiting mic permission
  // releases the mic instead of starting a recording nobody wants.
  const generationRef = useRef(0);

  /**
   * Record a single utterance. Resolves when recording stops
   * (silence, max duration, or stop()). Resolves `null` if cancelled.
   * Rejects with an Error whose message is 'not-allowed' | 'no-microphone' | 'recording-failed'.
   */
  const record = useCallback(async (): Promise<RecordedUtterance | null> => {
    const generation = generationRef.current;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
    } catch (err) {
      const name = (err as DOMException)?.name;
      throw new Error(name === 'NotAllowedError' || name === 'SecurityError' ? 'not-allowed' : 'no-microphone');
    }

    if (generation !== generationRef.current) {
      stream.getTracks().forEach(track => track.stop());
      return null; // cancelled while waiting for permission
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('recording-failed');
    }

    // Silence detection via Web Audio analyser
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const audioContext = AudioCtx ? new AudioCtx() : null;
    const analyser = audioContext?.createAnalyser() ?? null;
    if (audioContext && analyser) {
      analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(stream).connect(analyser);
    }
    const samples = new Float32Array(analyser?.fftSize ?? 0);

    const chunks: Blob[] = [];
    let hadSpeech = false;
    let cancelled = false;
    const startedAt = Date.now();
    let lastSpeechAt = 0;

    return new Promise<RecordedUtterance | null>((resolve, reject) => {
      let pollTimer: ReturnType<typeof setInterval> | undefined;

      const cleanup = () => {
        if (pollTimer) clearInterval(pollTimer);
        stream.getTracks().forEach(track => track.stop());
        audioContext?.close().catch(() => {});
        stopRef.current = null;
        cancelRef.current = null;
        setIsRecording(false);
      };

      const stop = () => {
        if (recorder.state !== 'inactive') recorder.stop();
      };

      stopRef.current = stop;
      cancelRef.current = () => {
        cancelled = true;
        stop();
      };

      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onerror = () => {
        cleanup();
        reject(new Error('recording-failed'));
      };

      recorder.onstop = () => {
        cleanup();
        if (cancelled) {
          resolve(null);
          return;
        }
        const type = recorder.mimeType || mimeType || 'audio/webm';
        resolve({ blob: new Blob(chunks, { type }), mimeType: type, hadSpeech });
      };

      pollTimer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startedAt;

        if (analyser) {
          analyser.getFloatTimeDomainData(samples);
          let sumSquares = 0;
          for (let i = 0; i < samples.length; i++) sumSquares += samples[i] * samples[i];
          const rms = Math.sqrt(sumSquares / samples.length);
          if (rms > SPEECH_RMS_THRESHOLD) {
            hadSpeech = true;
            lastSpeechAt = now;
          }
        } else {
          hadSpeech = true; // can't measure — assume speech, rely on max duration / manual stop
        }

        if (elapsed >= MAX_DURATION_MS) stop();
        else if (!hadSpeech && elapsed >= NO_SPEECH_TIMEOUT_MS) stop();
        else if (analyser && hadSpeech && now - lastSpeechAt >= SILENCE_AFTER_SPEECH_MS) stop();
      }, POLL_MS);

      recorder.start(250);
      setIsRecording(true);
    });
  }, []);

  /** Finish recording now and transcribe what was captured. */
  const stop = useCallback(() => stopRef.current?.(), []);

  /** Abort recording and discard the audio. */
  const cancel = useCallback(() => {
    generationRef.current++;
    cancelRef.current?.();
  }, []);

  // Release the microphone if the component unmounts mid-recording
  useEffect(() => () => {
    generationRef.current++;
    cancelRef.current?.();
  }, []);

  return { isRecording, record, stop, cancel };
}
