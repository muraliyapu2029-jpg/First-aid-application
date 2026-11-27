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
  Building2,
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
import { EmergencyCategory, type Hospital, type Language, type LocationData } from '../types';
import { t } from '../data/translations';

const ASSIST_COPY: Record<Language, {
  yourLocation: string;
  locating: string;
  locationReady: string;
  locationUnavailable: string;
  retryLocation: string;
  openInMaps: string;
  sendSmsAlert: string;
  nearestHospitals: string;
  loadingHospitals: string;
  viewAllHospitals: string;
  offlineHospitals: string;
}> = {
  en: {
    yourLocation: 'Your Live Location',
    locating: 'Accessing your GPS location...',
    locationReady: 'Location accessed — ready to share with ambulance & hospital',
    locationUnavailable: 'Could not access GPS automatically. Enable location or search your city in Find Hospital.',
    retryLocation: 'Retry GPS',
    openInMaps: 'Open in Maps',
    sendSmsAlert: 'Send SMS Alert',
    nearestHospitals: 'Nearest Hospitals',
    loadingHospitals: 'Connecting to nearby hospitals...',
    viewAllHospitals: 'View All Nearby Hospitals →',
    offlineHospitals: 'Offline — call 108 / 112 directly for ambulance dispatch.',
  },
  kn: {
    yourLocation: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ',
    locating: 'ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    locationReady: 'ಸ್ಥಳ ಲಭ್ಯವಿದೆ — ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಆಸ್ಪತ್ರೆಗೆ ಹಂಚಿಕೊಳ್ಳಲು ಸಿದ್ಧ',
    locationUnavailable: 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ GPS ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ ಅಥವಾ ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ ಪುಟದಲ್ಲಿ ನಗರವನ್ನು ಹುಡುಕಿ.',
    retryLocation: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    openInMaps: 'ನಕ್ಷೆಯಲ್ಲಿ ತೆರೆಯಿರಿ',
    sendSmsAlert: 'SMS ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ',
    nearestHospitals: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    loadingHospitals: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    viewAllHospitals: 'ಎಲ್ಲಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ನೋಡಿ →',
    offlineHospitals: 'ಆಫ್‌ಲೈನ್ — ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಾಗಿ ನೇರವಾಗಿ 108 / 112 ಕ್ಕೆ ಕರೆ ಮಾಡಿ.',
  },
  hi: {
    yourLocation: 'आपका लाइव स्थान',
    locating: 'आपका GPS स्थान प्राप्त किया जा रहा है...',
    locationReady: 'स्थान प्राप्त — एम्बुलेंस और अस्पताल से साझा करने के लिए तैयार',
    locationUnavailable: 'GPS स्वतः प्राप्त नहीं हो सका। लोकेशन अनुमति दें या अस्पताल खोजें में अपना शहर खोजें।',
    retryLocation: 'पुनः प्रयास करें',
    openInMaps: 'मैप्स में खोलें',
    sendSmsAlert: 'SMS अलर्ट भेजें',
    nearestHospitals: 'नजदीकी अस्पताल',
    loadingHospitals: 'नजदीकी अस्पतालों से जोड़ा जा रहा है...',
    viewAllHospitals: 'सभी नजदीकी अस्पताल देखें →',
    offlineHospitals: 'ऑफ़लाइन — एम्बुलेंस के लिए सीधे 108 / 112 पर कॉल करें।',
  },
};

export default function EmergencyAssist() {
  const { language } = useLanguage();
  const { detection } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const copy = ASSIST_COPY[language];
  const isSnakebite = detection?.category === EmergencyCategory.SNAKEBITE;

  const emergencyName = detection
    ? t(`emergency_${detection.category}` as Parameters<typeof t>[0], language)
    : 'Unknown Emergency';

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
      setShareError(copy.locationUnavailable);
    }
  }, [copy.locationUnavailable, isOffline, language]);

  useEffect(() => {
    const id = setTimeout(() => { void fetchLocationAndHospitals(); }, 0);
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
      setShareError(copy.locationUnavailable);
    }
  };

  const handleWhatsApp = async () => {
    try {
      setShareError('');
      const loc = await getOrFetchLocation();
      const text = buildShareText(loc, emergencyName, language);
      window.open(buildWhatsAppLink(text), '_blank');
    } catch {
      setShareError(copy.locationUnavailable);
    }
  };

  const handleSmsAlert = async () => {
    try {
      setShareError('');
      const loc = await getOrFetchLocation();
      const text = buildShareText(loc, emergencyName, language);
      window.location.href = buildSmsLink(text);
    } catch {
      setShareError(copy.locationUnavailable);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 flex flex-col px-5 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          id="assist-back"
          onClick={() => navigate(-1)}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-white">{t('callEmergency', language)}</h2>
      </div>

      {/* Emergency context */}
      {detection && (
        <div className="flex items-center gap-3 bg-white/8 rounded-2xl p-3 mb-5 border border-white/10">
          <span className="text-3xl">{getEmergencyIcon(detection.category)}</span>
          <div>
            <p className="text-xs text-gray-400">Current Emergency</p>
            <p className="text-white font-bold">{emergencyName}</p>
          </div>
        </div>
      )}

      {/* Live Location Card */}
      <div className="bg-blue-950/40 border border-blue-700/40 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            {copy.yourLocation}
          </h3>
          <button
            type="button"
            onClick={() => { void fetchLocationAndHospitals(); }}
            className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
          >
            <RefreshCw size={12} className={locLoading ? 'animate-spin' : ''} />
            {copy.retryLocation}
          </button>
        </div>

        {locLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Loader2 size={14} className="animate-spin text-blue-400" />
            <span>{copy.locating}</span>
          </div>
        ) : location ? (
          <div>
            <p className="text-xs text-green-300 font-medium mb-1">{copy.locationReady}</p>
            <div className="flex items-center justify-between gap-2 text-xs text-gray-300">
              <span className="font-mono">
                {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </span>
              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline font-semibold"
              >
                {copy.openInMaps}
              </a>
            </div>
          </div>
        ) : (
          <p className="text-xs text-yellow-300">{shareError || copy.locationUnavailable}</p>
        )}
      </div>

      {/* Ambulance & Emergency call buttons */}
      <div className="mb-7">
        <EmergencyCallButton language={language} />
      </div>

      {/* Location sharing with Ambulance / Family */}
      <div className="mb-7">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Share2 size={18} className="text-blue-400" />
          {t('shareLocation', language)}
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Share your GPS location and emergency details with ambulance dispatch or family.
        </p>
        {shareError && location && (
          <p className="text-red-400 text-sm mb-3 bg-red-950/40 rounded-xl p-2">{shareError}</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="copy-location-btn"
            onClick={() => { void handleCopyLocation(); }}
            className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold py-3 px-2 rounded-2xl text-xs transition-colors"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            <span className="truncate">{copied ? t('locationShared', language) : t('copyLocation', language)}</span>
          </button>
          <button
            id="whatsapp-share-btn"
            onClick={() => { void handleWhatsApp(); }}
            className="flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-2 rounded-2xl text-xs transition-colors"
          >
            <MessageCircle size={15} />
            <span className="truncate">{t('shareViaWhatsApp', language)}</span>
          </button>
          <button
            id="sms-share-btn"
            onClick={() => { void handleSmsAlert(); }}
            className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-2 rounded-2xl text-xs transition-colors"
          >
            <MessageSquare size={15} />
            <span className="truncate">{copy.sendSmsAlert}</span>
          </button>
        </div>
      </div>

      {/* Nearest Hospitals Quick Connect */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 size={18} className="text-blue-400" />
            {copy.nearestHospitals}
          </h3>
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            {copy.viewAllHospitals}
          </button>
        </div>

        {isOffline ? (
          <p className="text-xs text-yellow-300 bg-yellow-900/30 border border-yellow-600/30 rounded-xl p-3">
            {copy.offlineHospitals}
          </p>
        ) : hospitalsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-300 py-4">
            <Loader2 size={16} className="animate-spin text-blue-400" />
            <span>{copy.loadingHospitals}</span>
          </div>
        ) : hospitals.length > 0 ? (
          <div className="space-y-3">
            {hospitals.map(h => (
              <HospitalCard
                key={h.id}
                hospital={h}
                language={language}
                isSnakebite={isSnakebite}
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="w-full py-3 rounded-xl bg-blue-700/40 hover:bg-blue-700/60 border border-blue-500/30 text-blue-200 text-sm font-semibold transition-colors"
          >
            {t('findHospital', language)}
          </button>
        )}
      </div>

      {/* Privacy note */}
      <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
        🔒 {t('privacyNote', language)}
      </p>
    </div>
  );
}
