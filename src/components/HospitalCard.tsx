import { Phone, Navigation, MapPin, ShieldAlert } from 'lucide-react';
import type { Hospital, Language } from '../types';
import { getGoogleMapsLink, formatDistance } from '../services/hospitalService';
import { t } from '../data/translations';

// ============================================================
// HospitalCard Component
// Hospital info with call, directions, and antidote status
// ============================================================

interface Props {
  hospital: Hospital;
  language: Language;
  isSnakebite?: boolean;
}

const CARD_COPY: Record<Language, {
  hospitalBadge: string;
  clinicBadge: string;
  emergencyBadge: string;
  govtBadge: string;
  antidoteTitle: string;
  antidoteHospitalNote: string;
  antidoteClinicNote: string;
}> = {
  en: {
    hospitalBadge: 'Hospital',
    clinicBadge: 'Clinic',
    emergencyBadge: 'Emergency',
    govtBadge: 'Govt',
    antidoteTitle: 'Anti-Snake Venom (ASV) Availability',
    antidoteHospitalNote: 'Live stock unverified — major/govt hospitals usually stock ASV. Call to confirm before travelling.',
    antidoteClinicNote: 'Small clinics rarely stock antivenom — prefer a full hospital or call first.',
  },
  kn: {
    hospitalBadge: 'ಆಸ್ಪತ್ರೆ',
    clinicBadge: 'ಕ್ಲಿನಿಕ್',
    emergencyBadge: 'ತುರ್ತು ಸೇವೆ',
    govtBadge: 'ಸರ್ಕಾರಿ',
    antidoteTitle: 'ಪ್ರತಿವಿಷ (ASV Antidote) ಲಭ್ಯತೆ',
    antidoteHospitalNote: 'ಲೈವ್ ಸ್ಟಾಕ್ ಖಚಿತವಾಗಿಲ್ಲ — ಪ್ರಮುಖ/ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ASV ಇರುತ್ತದೆ. ಹೋಗುವ ಮೊದಲು ಕರೆ ಮಾಡಿ ಖಚಿತಪಡಿಸಿ.',
    antidoteClinicNote: 'ಸಣ್ಣ ಕ್ಲಿನಿಕ್‌ಗಳಲ್ಲಿ ಪ್ರತಿವಿಷ ಇರುವುದು ಅಪರೂಪ — ಪೂರ್ಣ ಆಸ್ಪತ್ರೆಗೆ ಆದ್ಯತೆ ನೀಡಿ.',
  },
  hi: {
    hospitalBadge: 'अस्पताल',
    clinicBadge: 'क्लिनिक',
    emergencyBadge: 'आपातकालीन',
    govtBadge: 'सरकारी',
    antidoteTitle: 'एंटी-स्नेक वेनम (ASV) उपलब्धता',
    antidoteHospitalNote: 'लाइव स्टॉक असत्यापित — बड़े/सरकारी अस्पतालों में आमतौर पर ASV होता है। जाने से पहले कॉल करके पुष्टि करें।',
    antidoteClinicNote: 'छोटे क्लिनिक में एंटीवेनम कम ही मिलता है — बड़े अस्पताल को प्राथमिकता दें।',
  },
};

export function HospitalCard({ hospital, language, isSnakebite = false }: Props) {
  const copy = CARD_COPY[language];
  const isClinic = hospital.facilityType === 'clinic';

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4 animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-600/80 flex items-center justify-center flex-shrink-0">
          <MapPin size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight truncate">{hospital.name}</h3>
          {hospital.address && (
            <p className="text-gray-400 text-sm mt-0.5 leading-snug line-clamp-2">
              {hospital.address}
            </p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {hospital.distance !== undefined && (
              <span className="inline-block text-xs font-semibold text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full">
                {formatDistance(hospital.distance)}
              </span>
            )}
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              isClinic ? 'text-gray-300 bg-white/10' : 'text-emerald-300 bg-emerald-900/40'
            }`}>
              {isClinic ? copy.clinicBadge : copy.hospitalBadge}
            </span>
            {hospital.hasEmergency && (
              <span className="inline-block text-xs font-semibold text-red-300 bg-red-900/40 px-2 py-0.5 rounded-full">
                {copy.emergencyBadge}
              </span>
            )}
            {hospital.isGovernment && (
              <span className="inline-block text-xs font-semibold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded-full">
                {copy.govtBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Antidote / Special Medicine Notice */}
      {isSnakebite && (
        <div className={`rounded-xl p-2.5 mb-3 border text-xs ${
          isClinic
            ? 'bg-orange-950/40 border-orange-600/30 text-orange-300'
            : 'bg-yellow-900/30 border-yellow-600/30 text-yellow-300'
        }`}>
          <p className="font-semibold flex items-center gap-1.5 mb-0.5">
            <ShieldAlert size={13} />
            {copy.antidoteTitle}
          </p>
          <p className="opacity-90 leading-snug">
            {isClinic ? copy.antidoteClinicNote : copy.antidoteHospitalNote}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            id={`call-hospital-${hospital.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-3 rounded-xl text-sm transition-colors duration-200"
            aria-label={`Call ${hospital.name}`}
          >
            <Phone size={16} />
            {t('callHospital', language)}
          </a>
        )}
        <a
          href={getGoogleMapsLink(hospital)}
          target="_blank"
          rel="noopener noreferrer"
          id={`directions-hospital-${hospital.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-xl text-sm transition-colors duration-200"
          aria-label={`Get directions to ${hospital.name}`}
        >
          <Navigation size={16} />
          {t('getDirections', language)}
        </a>
      </div>
    </div>
  );
}
