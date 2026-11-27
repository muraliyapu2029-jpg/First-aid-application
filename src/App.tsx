import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Phone, MapPin } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { EmergencyProvider } from './context/EmergencyContext';
import Home from './pages/Home';
import Listening from './pages/Listening';
import Emergency from './pages/Emergency';
import FirstAid from './pages/FirstAid';
import Hospitals from './pages/Hospitals';
import EmergencyAssist from './pages/EmergencyAssist';
import Settings from './pages/Settings';
import { t } from './data/translations';

// Bottom navigation bar shown on main screens
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Hide on listening page (full-screen)
  if (location.pathname === '/listening') return null;

  const navItems = [
    { path: '/', icon: <HomeIcon size={22} />, label: t('home', language), id: 'nav-home' },
    { path: '/assist', icon: <Phone size={22} />, label: '112 / Help', id: 'nav-assist' },
    { path: '/hospitals', icon: <MapPin size={22} />, label: t('findHospital', language), id: 'nav-hospitals' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-white/10 backdrop-blur-md z-40">
      <div className="flex">
        {navItems.map(({ path, icon, label, id }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              id={id}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors duration-200
                ${isActive ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              {icon}
              <span className="text-xs font-medium truncate max-w-full">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/first-aid" element={<FirstAid />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/assist" element={<EmergencyAssist />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
