import type { Hospital, Language, LocationData } from '../types';

// ============================================================
// Hospital Finder Service
//
// Strategy (most reliable → least):
//   1. Overpass via /api/overpass Vite proxy  (dev, no CORS)
//   2. Overpass direct mirrors                (prod, CORS allowed on some)
//   3. Nominatim /search?amenity=hospital     (always CORS-safe fallback)
// ============================================================

const OVERPASS_PROXY    = '/api/overpass';          // Vite dev-server proxy
const OVERPASS_MIRRORS  = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const NEARBY_RADIUS_KM   = 5;
const EXPANDED_RADIUS_KM = 25;
const MAX_RESULTS        = 10;

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.');
}

// ——————————————————————————————————————————————
// Distance
// ——————————————————————————————————————————————

export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ——————————————————————————————————————————————
// Overpass path
// ——————————————————————————————————————————————

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:en'?: string;
    'name:kn'?: string;
    'name:hi'?: string;
    'addr:full'?: string;
    'addr:street'?: string;
    'addr:suburb'?: string;
    'addr:city'?: string;
    'addr:town'?: string;
    'addr:village'?: string;
    phone?: string;
    'contact:phone'?: string;
    amenity?: string;
    emergency?: string;
    'operator:type'?: string;
    'healthcare:speciality'?: string;
  };
}

function overpassQuery(lat: number, lon: number, radiusM: number): string {
  return (
    `[out:json][timeout:30];` +
    `(` +
    `node["amenity"="hospital"](around:${radiusM},${lat},${lon});` +
    `way["amenity"="hospital"](around:${radiusM},${lat},${lon});` +
    `relation["amenity"="hospital"](around:${radiusM},${lat},${lon});` +
    `node["amenity"="clinic"](around:${radiusM},${lat},${lon});` +
    `node["healthcare"="hospital"](around:${radiusM},${lat},${lon});` +
    `node["amenity"="doctors"](around:${radiusM},${lat},${lon});` +
    `);` +
    `out center;`
  );
}

function overpassAddr(tags: NonNullable<OverpassElement['tags']>): string {
  if (tags['addr:full']) return tags['addr:full'];
  return [
    tags['addr:street'],
    tags['addr:suburb'] ?? tags['addr:village'],
    tags['addr:city']   ?? tags['addr:town'],
  ].filter(Boolean).join(', ');
}

function parseOverpass(
  elements: OverpassElement[],
  userLat: number, userLon: number,
  language: Language
): Hospital[] {
  const out: Hospital[] = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) continue;

    const tags    = el.tags ?? {};
    const locName = language === 'kn' ? tags['name:kn']
      : language === 'hi' ? tags['name:hi']
      : tags['name:en'];
    const name    = locName ?? tags['name:en'] ?? tags.name ?? 'Hospital';

    out.push({
      id:          `osm-${el.type}-${el.id}`,
      name,
      address:     overpassAddr(tags),
      lat,
      lon,
      phone:       tags.phone ?? tags['contact:phone'],
      distance:    haversineKm(userLat, userLon, lat, lon),
      osmId:       `${el.type}/${el.id}`,
      facilityType: (tags.amenity === 'clinic' || tags.amenity === 'doctors') ? 'clinic' : 'hospital',
      hasEmergency: tags.emergency === 'yes',
      isGovernment: tags['operator:type'] === 'government' || tags['operator:type'] === 'public',
      speciality:   tags['healthcare:speciality'],
    });
  }
  return out
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, MAX_RESULTS);
}

async function fetchOverpass(
  lat: number, lon: number, radiusM: number, language: Language
): Promise<Hospital[]> {
  const body = `data=${encodeURIComponent(overpassQuery(lat, lon, radiusM))}`;

  const endpoints = [
    ...(isLocalhost() ? [OVERPASS_PROXY] : []),
    ...OVERPASS_MIRRORS,
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal:  AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { elements?: OverpassElement[] };
      return parseOverpass(data.elements ?? [], lat, lon, language);
    } catch {
      // try next
    }
  }

  // Signal failure so we fall through to Nominatim
  throw new Error('overpass_failed');
}

// ——————————————————————————————————————————————
// Nominatim fallback — always works in browser (CORS: *)
// ——————————————————————————————————————————————

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  namedetails?: { name?: string };
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
  };
  type?: string;
}

async function fetchNominatim(
  lat: number, lon: number, radiusM: number
): Promise<Hospital[]> {
  // Compute bounding box from radius
  const delta = (radiusM / 1000) / 111; // approx degrees
  const bbox  = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=json&limit=15&addressdetails=1&namedetails=1` +
    `&amenity=hospital&bounded=1&viewbox=${bbox}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'RakshaAI-FirstAid/1.0' },
    signal:  AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const results = (await res.json()) as NominatimResult[];
  if (!results.length) {
    // Also try "clinic" if no hospitals found
    return fetchNominatimAmenity(lat, lon, radiusM, 'clinic');
  }
  return nominatimToHospitals(results, lat, lon);
}

async function fetchNominatimAmenity(
  lat: number, lon: number, radiusM: number, amenity: string
): Promise<Hospital[]> {
  const delta = (radiusM / 1000) / 111;
  const bbox  = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const url   =
    `https://nominatim.openstreetmap.org/search` +
    `?format=json&limit=10&addressdetails=1&namedetails=1` +
    `&amenity=${amenity}&bounded=1&viewbox=${bbox}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'RakshaAI-FirstAid/1.0' },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const results = (await res.json()) as NominatimResult[];
    return nominatimToHospitals(results, lat, lon);
  } catch {
    return [];
  }
}

function nominatimToHospitals(results: NominatimResult[], userLat: number, userLon: number): Hospital[] {
  return results
    .map((r) => {
      const lat  = parseFloat(r.lat);
      const lon  = parseFloat(r.lon);
      const name = r.namedetails?.name ?? r.display_name.split(',')[0];
      const a    = r.address;
      const addr = a
        ? [a.road, a.suburb, a.city ?? a.town ?? a.village].filter(Boolean).join(', ')
        : r.display_name.split(',').slice(0, 3).join(', ');

      return {
        id:           `nom-${r.place_id}`,
        name,
        address:      addr,
        lat,
        lon,
        distance:     haversineKm(userLat, userLon, lat, lon),
        facilityType: (r.type === 'clinic' ? 'clinic' : 'hospital') as Hospital['facilityType'],
        hasEmergency: false,
        isGovernment: false,
      };
    })
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, MAX_RESULTS);
}

// ——————————————————————————————————————————————
// Public API
// ——————————————————————————————————————————————

export async function findNearbyHospitals(
  location: LocationData,
  language: Language = 'en'
): Promise<Hospital[]> {
  const { lat, lon } = location;

  // 1. Try Overpass (accurate, tagged data)
  try {
    const nearby = await fetchOverpass(lat, lon, NEARBY_RADIUS_KM * 1000, language);
    if (nearby.length >= 1) return nearby;

    // Widen if sparse
    const wider = await fetchOverpass(lat, lon, EXPANDED_RADIUS_KM * 1000, language);
    if (wider.length >= 1) return wider;
  } catch {
    // Fall through to Nominatim
  }

  // 2. Nominatim fallback — always browser-safe
  try {
    const nearby = await fetchNominatim(lat, lon, NEARBY_RADIUS_KM * 1000);
    if (nearby.length >= 1) return nearby;

    return fetchNominatim(lat, lon, EXPANDED_RADIUS_KM * 1000);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Could not find nearby hospitals.'
    );
  }
}

export function getGoogleMapsLink(hospital: Hospital): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
}

export function getGoogleMapsSearchLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/hospitals+near+me/@${lat},${lon},14z`;
}

export function getOSMLink(hospital: Hospital): string {
  return `https://www.openstreetmap.org/${hospital.osmId ?? `node/${hospital.id}`}`;
}

export function formatDistance(km: number | undefined): string {
  if (km === undefined) return '';
  if (km < 0.1) return '< 100 m';
  if (km < 1)   return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
