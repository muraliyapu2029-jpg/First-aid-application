import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hospital, Language, LocationData } from '../types';
import { formatDistance, getGoogleMapsLink } from '../services/hospitalService';

interface Props {
  center: LocationData;
  hospitals: Hospital[];
  language: Language;
}

const MAP_LABELS: Record<Language, { youAreHere: string; directions: string }> = {
  en: { youAreHere: 'Your Location', directions: 'Directions' },
  kn: { youAreHere: 'ನಿಮ್ಮ ಸ್ಥಳ', directions: 'ದಾರಿ ತೋರಿಸಿ' },
  hi: { youAreHere: 'आपका स्थान', directions: 'दिशा-निर्देश' },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function HospitalMap({ center, hospitals, language }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(el, {
      center: [center.lat, center.lon],
      zoom: 14,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const labels = MAP_LABELS[language];

    // User location marker
    const userMarker = L.circleMarker([center.lat, center.lon], {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#2563eb',
      fillOpacity: 1,
    }).addTo(map);
    userMarker.bindPopup(`<strong>${escapeHtml(labels.youAreHere)}</strong>`);

    const bounds = L.latLngBounds([[center.lat, center.lon]]);

    // Nearby hospital markers
    for (const h of hospitals) {
      const marker = L.circleMarker([h.lat, h.lon], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: h.facilityType === 'clinic' ? '#10b981' : '#dc2626',
        fillOpacity: 0.95,
      }).addTo(map);

      const distText = h.distance !== undefined ? ` (${formatDistance(h.distance)})` : '';
      const mapsUrl = getGoogleMapsLink(h);
      marker.bindPopup(
        `<div style="min-width:150px">
          <div style="font-weight:700;margin-bottom:4px">${escapeHtml(h.name)}${escapeHtml(distText)}</div>
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-weight:600;text-decoration:underline">${escapeHtml(labels.directions)}</a>
        </div>`
      );
      bounds.extend([h.lat, h.lon]);
    }

    if (hospitals.length > 0) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lon, hospitals, language]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/15 shadow-lg mb-4 bg-gray-900">
      <div ref={containerRef} className="w-full h-64 z-0" aria-label="Nearby hospitals map" />
    </div>
  );
}
