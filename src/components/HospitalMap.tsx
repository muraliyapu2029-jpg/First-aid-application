import type { Hospital, Language, LocationData } from '../types';
import { getGoogleMapsLink } from '../services/hospitalService';

// ============================================================
// HospitalMap — Google Maps iframe embed
// No Leaflet / no tile loading issues — works everywhere
// Shows hospitals near the user's GPS location
// ============================================================

interface Props {
  center: LocationData;
  hospitals: Hospital[];
  language: Language;
}

const DIRECTIONS_LABEL: Record<Language, string> = {
  en: 'Directions',
  kn: 'ದಾರಿ ತೋರಿಸಿ',
  hi: 'दिशा-निर्देश',
};

export function HospitalMap({ center, hospitals, language }: Props) {
  // Build a Google Maps embed that searches for hospitals near the user's location
  // This requires NO API key and works in any browser
  const mapsEmbedSrc =
    `https://maps.google.com/maps?q=hospitals+near+me&ll=${center.lat},${center.lon}` +
    `&z=14&output=embed&hl=en`;

  const directionsLabel = DIRECTIONS_LABEL[language] ?? DIRECTIONS_LABEL.en;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/15 shadow-lg mb-4">
      {/* Google Maps embed — shows hospitals near location */}
      <div className="w-full" style={{ height: '300px' }}>
        <iframe
          title="Nearby Hospitals Map"
          src={mapsEmbedSrc}
          width="100%"
          height="300"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Quick links to Google Maps for each hospital */}
      {hospitals.length > 0 && (
        <div className="bg-gray-900 px-4 py-3 space-y-2">
          {hospitals.slice(0, 3).map((h) => (
            <a
              key={h.id}
              href={getGoogleMapsLink(h)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/40 rounded-xl px-4 py-2 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{h.name}</p>
                {h.address && (
                  <p className="text-gray-400 text-xs truncate">{h.address}</p>
                )}
              </div>
              <span className="text-blue-400 text-xs font-bold flex-shrink-0">
                {directionsLabel} ↗
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
