import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Search, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { findNearbyHospitals } from '../services/hospitalService';
import { geocodeLocation, getCurrentLocation } from '../services/locationService';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalMap } from '../components/HospitalMap';
import { OfflineFeatureNotice } from '../components/OfflineIndicator';
import { EmergencyCategory, type Hospital, type Language, type LocationData } from '../types';
import { t } from '../data/translations';

type LoadState = 'idle' | 'locating' | 'searching' | 'done' | 'error' | 'offline' | 'location-denied';

const QUICK_CITIES = ['Bengaluru', 'Mysuru', 'Hubballi', 'Delhi', 'Mumbai'];

const COPY: Record<Language, {
  locating: string;
  searchPlaceholder: string;
  searchBtn: string;
  orChooseCity: string;
  showingNear: string;
  enableLocationHint: string;
  couldNotFind: string;
  tryAgain: string;
  call112Now: string;
  snakebiteTitle: string;
  snakebiteBody: string;
}> = {
  en: {
    locating: 'Getting your location...',
    searchPlaceholder: 'Enter city or area (e.g. Bengaluru)...',
    searchBtn: 'Search',
    orChooseCity: 'Or search by city / area:',
    showingNear: 'Showing hospitals near',
    enableLocationHint: 'Enable browser location or search your city/area below.',
    couldNotFind: 'Could not find hospitals',
    tryAgain: 'Retry GPS',
    call112Now: 'Call 112 — National Emergency',
    snakebiteTitle: '🐍 Snakebite — Hospital Notice',
    snakebiteBody: 'Call the hospital before travelling to confirm they can treat snakebite. Do NOT delay transport while making this call if the person is deteriorating.',
  },
  kn: {
    locating: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    searchPlaceholder: 'ನಗರ ಅಥವಾ ಪ್ರದೇಶವನ್ನು ನಮೂದಿಸಿ (ಉದಾ: Bengaluru)...',
    searchBtn: 'ಹುಡುಕಿ',
    orChooseCity: 'ಅಥವಾ ನಗರ / ಪ್ರದೇಶದ ಮೂಲಕ ಹುಡುಕಿ:',
    showingNear: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು:',
    enableLocationHint: 'ಬ್ರೌಸರ್ ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ ಅಥವಾ ಕೆಳಗೆ ನಿಮ್ಮ ನಗರವನ್ನು ಹುಡುಕಿ.',
    couldNotFind: 'ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    call112Now: '112 ಕ್ಕೆ ಕರೆ ಮಾಡಿ — ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸೇವೆ',
    snakebiteTitle: '🐍 ಹಾವು ಕಡಿತ — ಆಸ್ಪತ್ರೆ ಸೂಚನೆ',
    snakebiteBody: 'ಹಾವು ಕಡಿತಕ್ಕೆ ಚಿಕಿತ್ಸೆ ಲಭ್ಯವಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಲು ಆಸ್ಪತ್ರೆಗೆ ಕರೆ ಮಾಡಿ. ಆದರೆ ರೋಗಿಯ ಸ್ಥಿತಿ ಗಂಭೀರವಾಗಿದ್ದರೆ ಕರೆಗಾಗಿ ಸಾಗಣೆಯನ್ನು ವಿಳಂಬ ಮಾಡಬೇಡಿ.',
  },
  hi: {
    locating: 'आपका स्थान प्राप्त किया जा रहा है...',
    searchPlaceholder: 'शहर या क्षेत्र दर्ज करें (जैसे Bengaluru)...',
    searchBtn: 'खोजें',
    orChooseCity: 'या शहर / क्षेत्र से खोजें:',
    showingNear: 'के पास के अस्पताल:',
    enableLocationHint: 'ब्राउज़र लोकेशन की अनुमति दें या नीचे अपना शहर खोजें।',
    couldNotFind: 'अस्पताल नहीं मिल सके',
    tryAgain: 'पुनः प्रयास करें',
    call112Now: '112 पर कॉल करें — राष्ट्रीय आपातकाल',
    snakebiteTitle: '🐍 सांप का काटना — अस्पताल सूचना',
    snakebiteBody: 'जाने से पहले अस्पताल को कॉल करके पुष्टि करें कि वहां सांप के काटने का इलाज उपलब्ध है। यदि मरीज की हालत बिगड़ रही हो तो कॉल के लिए देरी न करें।',
  },
};

export default function Hospitals() {
  const { language } = useLanguage();
  const { detection } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [activePlace, setActivePlace] = useState('');
  const [searchCenter, setSearchCenter] = useState<LocationData | null>(null);

  const isSnakebite = detection?.category === EmergencyCategory.SNAKEBITE;
  const copy = COPY[language];

  const loadByGPS = async () => {
    if (isOffline) { setLoadState('offline'); return; }

    try {
      setErrorMsg('');
      setActivePlace('');
      setLoadState('locating');
      const loc = await getCurrentLocation();
      setSearchCenter(loc);
      setLoadState('searching');
      const results = await findNearbyHospitals(loc, language);
      setHospitals(results);
      setLoadState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('permission') || msg.includes('denied')) {
        setLoadState('location-denied');
      } else if (isOffline) {
        setLoadState('offline');
      } else {
        setLoadState('error');
        setErrorMsg(msg);
      }
    }
  };

  const loadByCity = async (query: string) => {
    if (isOffline) { setLoadState('offline'); return; }
    if (!query.trim()) return;

    try {
      setErrorMsg('');
      setLoadState('locating');
      const loc = await geocodeLocation(query);
      setSearchCenter(loc);
      setActivePlace(loc.displayName);
      setLoadState('searching');
      const results = await findNearbyHospitals(loc, language);
      setHospitals(results);
      setLoadState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setLoadState('error');
      setErrorMsg(msg);
    }
  };

  const handleCitySubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadByCity(cityQuery);
  };

  useEffect(() => {
    const id = setTimeout(() => { void loadByGPS(); }, 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 flex flex-col px-5 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          id="hospitals-back"
          onClick={() => navigate(-1)}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-white">{t('nearbyHospitals', language)}</h2>
        <button
          id="hospitals-refresh"
          onClick={() => { void loadByGPS(); }}
          aria-label="Refresh"
          className="ml-auto w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <RefreshCw size={16} className="text-gray-300" />
        </button>
      </div>

      {/* City / Area Search Fallback */}
      {!isOffline && (
        <div className="mb-5">
          <form onSubmit={handleCitySubmit} className="flex gap-2 mb-2.5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="hospital-city-input"
                type="text"
                value={cityQuery}
                onChange={e => setCityQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              id="hospital-city-submit"
              type="submit"
              disabled={!cityQuery.trim() || loadState === 'locating' || loadState === 'searching'}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 rounded-xl transition-colors"
            >
              {copy.searchBtn}
            </button>
          </form>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500">{copy.orChooseCity}</span>
            {QUICK_CITIES.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setCityQuery(city);
                  void loadByCity(city);
                }}
                className="text-xs bg-white/8 hover:bg-white/15 text-gray-300 border border-white/10 rounded-full px-2.5 py-1 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Snakebite notice */}
      {isSnakebite && (
        <div className="bg-red-950/60 border border-red-700/40 rounded-2xl p-4 mb-5">
          <p className="text-red-300 font-semibold text-sm mb-1">{copy.snakebiteTitle}</p>
          <p className="text-red-200/80 text-xs leading-relaxed">{copy.snakebiteBody}</p>
        </div>
      )}

      {/* Loading states */}
      {(loadState === 'locating' || loadState === 'searching') && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={40} className="text-blue-400 animate-spin" />
          <p className="text-gray-300 text-base">
            {loadState === 'locating' ? copy.locating : t('loadingHospitals', language)}
          </p>
        </div>
      )}

      {/* Offline */}
      {loadState === 'offline' && (
        <OfflineFeatureNotice language={language} feature="hospital" />
      )}

      {/* Location denied */}
      {loadState === 'location-denied' && (
        <div className="bg-yellow-900/40 border border-yellow-600/40 rounded-2xl p-4">
          <p className="text-yellow-300 font-semibold mb-1">{t('locationDenied', language)}</p>
          <p className="text-yellow-400/80 text-sm mb-3">{copy.enableLocationHint}</p>
          <a href="tel:112" className="text-red-400 font-bold">{copy.call112Now} →</a>
        </div>
      )}

      {/* Error */}
      {loadState === 'error' && (
        <div className="bg-red-950/40 border border-red-700/40 rounded-2xl p-4">
          <p className="text-red-300 font-semibold mb-1">{copy.couldNotFind}</p>
          <p className="text-red-400/80 text-sm mb-3">{errorMsg}</p>
          <div className="flex items-center gap-4">
            <button onClick={() => { void loadByGPS(); }} className="text-blue-400 text-sm underline">
              {copy.tryAgain}
            </button>
            <a href="tel:112" className="text-red-400 text-sm font-bold">{copy.call112Now} →</a>
          </div>
        </div>
      )}

      {/* Results */}
      {loadState === 'done' && (
        <div className="space-y-3">
          {activePlace && (
            <div className="flex items-center gap-1.5 text-xs text-blue-300">
              <MapPin size={13} />
              <span>{copy.showingNear} {activePlace}</span>
            </div>
          )}
          {searchCenter && (
            <HospitalMap
              center={searchCenter}
              hospitals={hospitals}
              language={language}
            />
          )}
          <p className="text-sm text-gray-400">
            {hospitals.length > 0
              ? t('hospitalsFound', language, { count: hospitals.length })
              : t('noHospitalsFound', language)}
          </p>
          {hospitals.length === 0 && (
            <a href="tel:112" className="block text-center text-red-400 font-bold py-3">
              {copy.call112Now}
            </a>
          )}
          {hospitals.map(hospital => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              language={language}
              isSnakebite={isSnakebite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
