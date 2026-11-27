import { Phone, Navigation, MapPin } from 'lucide-react';
import type { Hospital, Language } from '../types';
import { getGoogleMapsLink, formatDistance } from '../services/hospitalService';
import { t } from '../data/translations';

// ============================================================
// HospitalCard Component
// Clear distance (km), place, call, and Google Maps directions
// ============================================================

interface Props {
  hospital: Hospital;
  language: Language;
  isSnakebite?: boolean;
  isNearest?: boolean;
}

export function HospitalCard({ hospital, language, isNearest = false }: Props) {
  const nearestLabel =
    language === 'kn'
      ? 'ಅತಿ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ'
      : language === 'hi'
        ? 'सबसे नजदीकी अस्पताल'
        : 'NEAREST HOSPITAL';

  const mapsLabel =
    language === 'kn'
      ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್'
      : language === 'hi'
        ? 'गूगल मैप्स खोलें'
        : 'Google Maps';

  return (
    <div
      className={`rounded-2xl backdrop-blur-sm p-4 animate-fade-in border-2 ${
        isNearest
          ? 'bg-blue-950/70 border-blue-400 shadow-xl'
          : 'bg-white/10 border-white/15'
      }`}
    >
      {isNearest && (
        <div className="inline-block text-xs font-black tracking-wider bg-blue-500 text-white px-2.5 py-0.5 rounded-full mb-2">
          {nearestLabel}
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <MapPin size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg leading-tight">{hospital.name}</h3>
          <p className="text-gray-300 text-sm mt-1 leading-snug">
            {hospital.address || `${hospital.lat.toFixed(4)}, ${hospital.lon.toFixed(4)}`}
          </p>
          {hospital.distance !== undefined && (
            <div className="mt-2">
              <span className="inline-block text-sm font-extrabold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                {formatDistance(hospital.distance)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2.5">
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            id={`call-hospital-${hospital.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-3 rounded-xl text-sm transition-colors"
            aria-label={`Call ${hospital.name}`}
          >
            <Phone size={18} />
            {t('callHospital', language)}
          </a>
        )}
        <a
          href={getGoogleMapsLink(hospital)}
          target="_blank"
          rel="noopener noreferrer"
          id={`directions-hospital-${hospital.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-3 rounded-xl text-sm transition-colors"
          aria-label={`Open Google Maps to ${hospital.name}`}
        >
          <Navigation size={18} />
          {mapsLabel}
        </a>
      </div>
    </div>
  );
}
