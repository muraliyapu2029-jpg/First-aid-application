import { Phone, Ambulance } from 'lucide-react';
import { AMBULANCE_NUMBER, NATIONAL_EMERGENCY_NUMBER, type Language } from '../types';

// ============================================================
// EmergencyCallButton Component
// Primary Ambulance dialer (108) + National Emergency (112)
// ============================================================

interface Props {
  language: Language;
  compact?: boolean;
  onAmbulanceClick?: () => void;
}

export function EmergencyCallButton({ language, compact = false, onAmbulanceClick }: Props) {
  const ambulanceLabel =
    language === 'kn'
      ? 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ'
      : language === 'hi'
        ? 'एम्बुलेंस कॉल करें'
        : 'Call Ambulance';

  const nationalLabel =
    language === 'kn'
      ? 'ತುರ್ತು ಸಹಾಯ'
      : language === 'hi'
        ? 'आपातकालीन सेवा'
        : 'National Emergency';

  if (compact) {
    return (
      <a
        href={`tel:${AMBULANCE_NUMBER}`}
        onClick={onAmbulanceClick}
        id="quick-call-ambulance"
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-200 shadow-lg text-base"
        aria-label={`${ambulanceLabel} ${AMBULANCE_NUMBER}`}
      >
        <Ambulance size={20} />
        <span>{AMBULANCE_NUMBER}</span>
      </a>
    );
  }

  return (
    <div className="space-y-3">
      <a
        href={`tel:${AMBULANCE_NUMBER}`}
        onClick={onAmbulanceClick}
        id="emergency-call-ambulance"
        className="flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-5 rounded-2xl transition-all duration-200 shadow-lg text-lg w-full"
        aria-label={`${ambulanceLabel} ${AMBULANCE_NUMBER}`}
      >
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Ambulance size={26} />
        </div>
        <div>
          <div className="text-xl font-black tracking-wide">{AMBULANCE_NUMBER}</div>
          <div className="text-sm font-medium opacity-95">{ambulanceLabel}</div>
        </div>
      </a>

      <a
        href={`tel:${NATIONAL_EMERGENCY_NUMBER}`}
        id="emergency-call-112"
        className="flex items-center gap-4 bg-orange-600/90 hover:bg-orange-700 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-200 shadow-md text-base w-full"
        aria-label={`${nationalLabel} ${NATIONAL_EMERGENCY_NUMBER}`}
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Phone size={20} />
        </div>
        <div>
          <div className="text-lg font-black">{NATIONAL_EMERGENCY_NUMBER}</div>
          <div className="text-xs font-normal opacity-90">{nationalLabel}</div>
        </div>
      </a>
    </div>
  );
}
