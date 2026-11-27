import { Mic, MicOff, Loader2 } from 'lucide-react';

// ============================================================
// MicrophoneButton Component
// Large pulsing CTA button — the central UI element
// ============================================================

type MicState = 'idle' | 'listening' | 'processing';

interface Props {
  state: MicState;
  onClick: () => void;
  disabled?: boolean;
  size?: 'lg' | 'xl';
}

export function MicrophoneButton({ state, onClick, disabled = false, size = 'xl' }: Props) {
  const isLarge = size === 'xl';
  const baseSize = isLarge ? 'w-32 h-32' : 'w-24 h-24';
  const iconSize = isLarge ? 48 : 36;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings — only during listening */}
      {state === 'listening' && (
        <>
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30 animate-ping" />
          <span
            className="absolute rounded-full bg-red-400 opacity-20 animate-pulse"
            style={{ width: isLarge ? '10rem' : '8rem', height: isLarge ? '10rem' : '8rem' }}
          />
        </>
      )}

      <button
        id="microphone-button"
        onClick={onClick}
        disabled={disabled || state === 'processing'}
        aria-label={
          state === 'idle'
            ? 'Start voice input'
            : state === 'listening'
            ? 'Stop listening'
            : 'Processing'
        }
        className={`
          relative ${baseSize} rounded-full flex items-center justify-center
          transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4
          ${disabled || state === 'processing'
            ? 'bg-gray-400 cursor-not-allowed focus:ring-gray-300'
            : state === 'listening'
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300 scale-105'
            : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-red-300 hover:scale-105 active:scale-95'
          }
        `}
      >
        {state === 'processing' ? (
          <Loader2 size={iconSize} className="text-white animate-spin" />
        ) : state === 'listening' ? (
          <MicOff size={iconSize} className="text-white" />
        ) : (
          <Mic size={iconSize} className="text-white" />
        )}
      </button>
    </div>
  );
}
