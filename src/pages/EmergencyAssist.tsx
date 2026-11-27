import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  MessageCircle,
  MapPin,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { EmergencyCallButton } from '../components/EmergencyCallButton';
import { HospitalCard } from '../components/HospitalCard';
import {
  buildShareText,
  buildSmsLink,
  buildWhatsAppLink,
  copyToClipboard,
  getCurrentLocation,
} from '../services/locationService';
import { findNearbyHospitals } from '../services/hospitalService';
import { getEmergencyIcon } from '../services/firstAidService';
import { EmergencyCategory, type Hospital, type LocationData } from '../types';
import { t } from '../data/translations';

export default function EmergencyAssist() {
  const { language } = useLanguage();
  const { detection, setAmbulanceTriggered } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const isSnakebite = detection?.category === EmergencyCategory.SNAKEBITE;

  const emergencyName = detection
    ? t(`emergency_${detection.category}` as Parameters<typeof t>[0], language)
    : 'Emergency';

  const fetchLocationAndHospitals = useCallback(async () => {
    setLocLoading(true);
    setShareError('');
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      setLocLoading(false);

      if (!isOffline) {
        setHospitalsLoading(true);
        try {
          const nearby = await findNearbyHospitals(loc, language);
          setHospitals(nearby.slice(0, 3));
        } catch {
          setHospitals([]);
        } finally {
          setHospitalsLoading(false);
        }
      }
    } catch {
      setLocLoading(false);
      setShareError('Enable GPS to share location.');
    }
  }, [isOffline, language]);

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchLocationAndHospitals();
    }, 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getOrFetchLocation = async (): Promise<LocationData> => {
    if (location) return location;
    const loc = await getCurrentLocation();
    setLocation(loc);
    return loc;
  };

  const handleCopyLocation = async () => {
    try {
      setShareError('');
      const loc = await getOrFetchLocation();
      const text = buildShareText(loc, emergencyName, language);
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setShareError('GPS unavailable');
    }
  };

  const handleWhatsApp = async () => {
    try {
      setShareError('');
      const loc = await getOrFetchLocation();
      const text = buildShareText(loc, emergencyName, language);
      window.open(buildWhatsAppLink(text), '_blank');
    } catch {
      setShareError('GPS unavailable');
    }
  };

  const handleSmsAlert = async () => {
    try {
      setShareError('');
      const loc = await getOrFetchLocation();
      const text = buildShareText(loc, emergencyName, language);
      window.location.href = buildSmsLink(text);
    } catch {
      setShareError('GPS unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 flex flex-col px-5 py-6 pb-28">
      <div className="flex items-center gap-3 mb-5">
        <button
          id="assist-back"
          onClick={() => navigate(-1)}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-black text-white">{t('callEmergency', language)}</h2>
      </div>

      {detection && (
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 mb-5 border border-white/10">
          <span className="text-3xl">{getEmergencyIcon(detection.category)}</span>
          <p className="text-white font-bold text-lg">{emergencyName}</p>
        </div>
      )}

      {/* Ambulance (108) & 112 */}
      <div className="mb-6">
        <EmergencyCallButton
          language={language}
          onAmbulanceClick={() => {
            setAmbulanceTriggered(true);
            navigate('/hospitals?ambulance=1');
          }}
        />
      </div>

      {/* Live GPS */}
      <div className="bg-blue-950/40 border border-blue-700/40 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            GPS Location
          </h3>
          <button
            type="button"
            onClick={() => {
              void fetchLocationAndHospitals();
            }}
            className="text-xs text-blue-300 flex items-center gap-1"
          >
            <RefreshCw size={12} className={locLoading ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>

        {locLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Loader2 size={14} className="animate-spin text-blue-400" />
            <span>Getting location...</span>
          </div>
        ) : location ? (
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="font-mono">
              {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
            </span>
            <a
              href={`https://maps.google.com/?q=${location.lat},${location.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline font-bold"
            >
              Google Maps
            </a>
          </div>
        ) : (
          <p className="text-xs text-yellow-300">{shareError}</p>
        )}
      </div>

      {/* Share Location */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
          <Share2 size={16} className="text-blue-400" />
          {t('shareLocation', language)}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            id="copy-location-btn"
            onClick={() => {
              void handleCopyLocation();
            }}
            className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-2 rounded-2xl text-xs"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="whatsapp-share-btn"
            onClick={() => {
              void handleWhatsApp();
            }}
            className="flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-2 rounded-2xl text-xs"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>
          <button
            id="sms-share-btn"
            onClick={() => {
              void handleSmsAlert();
            }}
            className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-2 rounded-2xl text-xs"
          >
            <MessageSquare size={15} />
            <span>SMS</span>
          </button>
        </div>
      </div>

      {/* Nearest Hospitals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">Nearest Hospitals</h3>
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="text-xs text-blue-400 font-bold"
          >
            View All →
          </button>
        </div>

        {hospitalsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-300 py-3">
            <Loader2 size={16} className="animate-spin text-blue-400" />
            <span>Searching...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {hospitals.map((h, i) => (
              <HospitalCard
                key={h.id}
                hospital={h}
                language={language}
                isSnakebite={isSnakebite}
                isNearest={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
