import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  MapPin,
  Ambulance,
  Navigation,
  Phone,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { useTTS } from '../hooks/useTTS';
import { findNearbyHospitals, formatDistance, getGoogleMapsLink, getGoogleMapsSearchLink } from '../services/hospitalService';
import { getCurrentLocation } from '../services/locationService';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalMap } from '../components/HospitalMap';
import { AMBULANCE_NUMBER, type Hospital, type LocationData } from '../types';

// ============================================================
// Hospitals Page
// Auto-fetches GPS → finds nearest hospitals → shows on map
// No manual city search — fully automatic for low-literacy users
// ============================================================

type LoadState = 'idle' | 'locating' | 'searching' | 'done' | 'error' | 'offline' | 'location-denied';

const LABEL = {
  en: {
    title: 'Nearest Hospitals',
    locating: 'Finding your location…',
    searching: 'Finding nearest hospital…',
    nearest: 'Nearest Hospital',
    openMaps: 'Open Google Maps',
    retry: 'Try Again',
    offline: 'No internet connection.',
    offlineSub: 'Connect to find nearby hospitals.',
    denied: 'Location access denied.',
    deniedSub: 'Please allow location in your browser settings, then tap "Try Again".',
    errorSub: 'Could not find hospitals.',
    openingMaps: 'Opening Google Maps in',
    cancel: 'Cancel',
    calling: 'Calling Ambulance',
    ambulance: 'Ambulance',
    noResults: 'No hospitals found nearby.',
    noResultsSub: 'Try moving closer to a town or city.',
  },
  kn: {
    title: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    locating: 'ನಿಮ್ಮ ಸ್ಥಳ ಹುಡುಕಲಾಗುತ್ತಿದೆ…',
    searching: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಹುಡುಕಲಾಗುತ್ತಿದೆ…',
    nearest: 'ಅತಿ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ',
    openMaps: 'Google Maps ತೆರೆಯಿರಿ',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    offline: 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಇಲ್ಲ.',
    offlineSub: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಹುಡುಕಲು ಸಂಪರ್ಕಿಸಿ.',
    denied: 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.',
    deniedSub: 'ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorSub: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಲಾಗಲಿಲ್ಲ.',
    openingMaps: 'Google Maps ತೆರೆಯಲಾಗುತ್ತಿದೆ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    calling: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ',
    ambulance: 'ಆಂಬ್ಯುಲೆನ್ಸ್',
    noResults: 'ಹತ್ತಿರದಲ್ಲಿ ಆಸ್ಪತ್ರೆ ಸಿಗಲಿಲ್ಲ.',
    noResultsSub: 'ಹತ್ತಿರದ ಪಟ್ಟಣ ಅಥವಾ ನಗರಕ್ಕೆ ಹೋಗಿ.',
  },
  hi: {
    title: 'नज़दीकी अस्पताल',
    locating: 'आपका स्थान ढूंढा जा रहा है…',
    searching: 'नज़दीकी अस्पताल ढूंढा जा रहा है…',
    nearest: 'सबसे नज़दीकी अस्पताल',
    openMaps: 'Google Maps खोलें',
    retry: 'फिर कोशिश करें',
    offline: 'इंटरनेट नहीं है।',
    offlineSub: 'नज़दीकी अस्पताल ढूंढने के लिए कनेक्ट करें।',
    denied: 'स्थान की अनुमति नहीं दी।',
    deniedSub: 'ब्राउज़र सेटिंग में स्थान की अनुमति दें, फिर कोशिश करें।',
    errorSub: 'अस्पताल नहीं मिला।',
    openingMaps: 'Google Maps खुल रहा है',
    cancel: 'रद्द करें',
    calling: 'एम्बुलेंस बुला रहे हैं',
    ambulance: 'एम्बुलेंस',
    noResults: 'पास में कोई अस्पताल नहीं मिला।',
    noResultsSub: 'किसी नज़दीकी शहर की तरफ जाएं।',
  },
};

export default function Hospitals() {
  const { language, detectedLanguageCode } = useLanguage();
  const { ambulanceTriggered, setAmbulanceTriggered } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const { speak, stop } = useTTS(language, detectedLanguageCode);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isAmbulanceMode = searchParams.get('ambulance') === '1' || ambulanceTriggered;
  const lbl = LABEL[language] ?? LABEL.en;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchCenter, setSearchCenter] = useState<LocationData | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const announcedRef = useRef<string>('');

  const nearestHospital = hospitals[0] ?? null;

  // ——————————————————————————————————————————————
  // Core loader — GPS only, fully automatic
  // ——————————————————————————————————————————————
  const loadByGPS = async () => {
    if (isOffline) { setLoadState('offline'); return; }

    setErrorMsg('');
    setLoadState('locating');
    setHospitals([]);
    setSearchCenter(null);
    announcedRef.current = '';

    try {
      const loc = await getCurrentLocation();
      setSearchCenter(loc);
      setLoadState('searching');

      const results = await findNearbyHospitals(loc, language);
      setHospitals(results);
      setLoadState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('not supported')) {
        setLoadState('location-denied');
      } else if (isOffline) {
        setLoadState('offline');
      } else {
        setLoadState('error');
        setErrorMsg(msg);
      }
    }
  };

  // Auto-load on mount
  useEffect(() => {
    const id = window.setTimeout(() => { void loadByGPS(); }, 100);
    return () => { window.clearTimeout(id); stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce nearest hospital by voice + start redirect countdown in ambulance mode
  useEffect(() => {
    if (loadState !== 'done' || !nearestHospital) return;
    if (announcedRef.current === nearestHospital.id) return;
    announcedRef.current = nearestHospital.id;

    const dist  = formatDistance(nearestHospital.distance);
    const place = nearestHospital.address || '';

    const msg =
      language === 'kn'
        ? `ಅತಿ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ${nearestHospital.name}, ${dist} ದೂರ${place ? `, ${place}` : ''}.`
        : language === 'hi'
          ? `सबसे नजदीकी अस्पताल ${nearestHospital.name}, ${dist} दूर${place ? `, ${place}` : ''}।`
          : `Nearest hospital: ${nearestHospital.name}, ${dist} away${place ? `, ${place}` : ''}.`;

    speak(msg, detectedLanguageCode);

    if (isAmbulanceMode) {
      window.setTimeout(() => setRedirectCountdown(4), 0);
    }
  }, [loadState, nearestHospital, isAmbulanceMode, language, detectedLanguageCode, speak]);

  // Auto-redirect countdown
  useEffect(() => {
    if (redirectCountdown === null || !nearestHospital) return;
    const timer = window.setTimeout(() => {
      if (redirectCountdown <= 1) {
        const url = getGoogleMapsLink(nearestHospital);
        setRedirectCountdown(null);
        setAmbulanceTriggered(false);
        window.open(url, '_blank', 'noopener');
      } else {
        setRedirectCountdown(c => (c !== null ? c - 1 : null));
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [redirectCountdown, nearestHospital, setAmbulanceTriggered]);

  // ——————————————————————————————————————————————
  // Render
  // ——————————————————————————————————————————————
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 flex flex-col px-4 py-5 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => { stop(); setRedirectCountdown(null); navigate(-1); }}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-black text-white flex-1">{lbl.title}</h2>
        <button
          onClick={() => { void loadByGPS(); }}
          aria-label="Refresh location"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <RefreshCw size={17} className="text-gray-300" />
        </button>
      </div>

      {/* ── Ambulance CTA ── */}
      <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-4 mb-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <Ambulance size={26} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-200 uppercase tracking-wider">
                {isAmbulanceMode ? lbl.calling : lbl.ambulance}
              </p>
              <p className="text-3xl font-black text-white tracking-wide">{AMBULANCE_NUMBER}</p>
            </div>
          </div>
          <a
            href={`tel:${AMBULANCE_NUMBER}`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 rounded-2xl text-base shadow-lg"
          >
            <Phone size={20} />
            <span>Call</span>
          </a>
        </div>
      </div>

      {/* ── Loading ── */}
      {(loadState === 'locating' || loadState === 'searching') && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={52} className="text-blue-400 animate-spin" />
          <p className="text-white font-bold text-lg text-center">
            {loadState === 'locating' ? lbl.locating : lbl.searching}
          </p>
        </div>
      )}

      {/* ── Offline ── */}
      {loadState === 'offline' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <WifiOff size={52} className="text-gray-500" />
          <p className="text-white font-bold text-lg">{lbl.offline}</p>
          <p className="text-gray-400 text-sm">{lbl.offlineSub}</p>
        </div>
      )}

      {/* ── Location denied ── */}
      {loadState === 'location-denied' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-900/40 flex items-center justify-center">
            <MapPin size={40} className="text-yellow-400" />
          </div>
          <p className="text-yellow-300 font-bold text-lg">{lbl.denied}</p>
          <p className="text-yellow-200/70 text-sm max-w-xs">{lbl.deniedSub}</p>
          <button
            onClick={() => { void loadByGPS(); }}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl text-base"
          >
            {lbl.retry}
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {loadState === 'error' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <p className="text-red-300 font-bold text-lg">{lbl.errorSub}</p>
          {errorMsg && <p className="text-gray-400 text-xs max-w-xs">{errorMsg}</p>}
          <button
            onClick={() => { void loadByGPS(); }}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl text-base"
          >
            {lbl.retry}
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {loadState === 'done' && (
        <div className="space-y-4">
          {/* No results */}
          {hospitals.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                <MapPin size={40} className="text-gray-500" />
              </div>
              <p className="text-white font-bold text-lg">{lbl.noResults}</p>
              <p className="text-gray-400 text-sm">{lbl.noResultsSub}</p>
              <button
                onClick={() => { void loadByGPS(); }}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl text-base"
              >
                {lbl.retry}
              </button>
              {searchCenter && (
                <a
                  href={getGoogleMapsSearchLink(searchCenter.lat, searchCenter.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl text-sm"
                >
                  <Navigation size={18} />
                  Search on Google Maps
                </a>
              )}
            </div>
          )}

          {/* Nearest hospital hero card */}
          {nearestHospital && (
            <div className="bg-blue-600/20 border-2 border-blue-400 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-blue-300">
                  {lbl.nearest}
                </span>
                <span className="text-sm font-black text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full">
                  {formatDistance(nearestHospital.distance)}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white leading-tight">
                {nearestHospital.name}
              </h3>

              {nearestHospital.address && (
                <p className="text-sm text-gray-200 flex items-start gap-2">
                  <MapPin size={16} className="text-blue-300 flex-shrink-0 mt-0.5" />
                  <span>{nearestHospital.address}</span>
                </p>
              )}

              {/* Redirect countdown */}
              {redirectCountdown !== null && (
                <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-2 text-sm text-yellow-300 font-bold">
                  <span>{lbl.openingMaps} {redirectCountdown}s…</span>
                  <button onClick={() => setRedirectCountdown(null)} className="text-white underline text-xs">
                    {lbl.cancel}
                  </button>
                </div>
              )}

              {/* Google Maps button */}
              <a
                href={getGoogleMapsLink(nearestHospital)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg w-full shadow-lg"
              >
                <Navigation size={22} />
                <span>{lbl.openMaps}</span>
              </a>
            </div>
          )}

          {/* Map */}
          {searchCenter && hospitals.length > 0 && (
            <HospitalMap
              center={searchCenter}
              hospitals={hospitals}
              language={language}
            />
          )}

          {/* Other hospitals */}
          {hospitals.slice(1).map(hospital => (
            <HospitalCard key={hospital.id} hospital={hospital} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}
