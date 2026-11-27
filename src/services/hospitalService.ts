import type { Hospital, Language, LocationData } from '../types';

// ============================================================
// Hospital Finder Service
// Uses Overpass API (OpenStreetMap) for nearby hospital discovery
// ============================================================

const PRIMARY_OVERPASS_URL = import.meta.env.VITE_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter';
const OVERPASS_ENDPOINTS = Array.from(
  new Set([
    PRIMARY_OVERPASS_URL,
    'https://overpass.kumi.systems/api/interpreter',
  ])
);
const NEARBY_RADIUS_KM = 3;
const EXPANDED_RADIUS_KM = 10;
const MAX_RESULTS = 15;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
    );
    out center;
  `;
}

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
    'addr:city'?: string;
    phone?: string;
    'contact:phone'?: string;
    website?: string;
    amenity?: string;
    emergency?: string;
    'operator:type'?: string;
    'healthcare:speciality'?: string;
  };
}

function parseOverpassResult(
  elements: OverpassElement[],
  userLat: number,
  userLon: number,
  language: Language = 'en'
): Hospital[] {
  const hospitals: Hospital[] = [];

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;

    const tags = el.tags ?? {};
    const localizedName =
      language === 'kn'
        ? tags['name:kn']
        : language === 'hi'
          ? tags['name:hi']
          : tags['name:en'];
    const name = localizedName || tags['name:en'] || tags.name || 'Unknown Hospital';
    const address = tags['addr:full'] || tags['addr:street'] || tags['addr:city'] || '';
    const phone = tags.phone || tags['contact:phone'] || undefined;
    const facilityType = tags.amenity === 'clinic' ? 'clinic' : 'hospital';
    const hasEmergency = tags.emergency === 'yes';
    const isGovernment =
      tags['operator:type'] === 'government' || tags['operator:type'] === 'public';
    const speciality = tags['healthcare:speciality'];

    hospitals.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      address,
      lat,
      lon,
      phone,
      distance: haversineDistance(userLat, userLon, lat, lon),
      osmId: `${el.type}/${el.id}`,
      facilityType,
      hasEmergency,
      isGovernment,
      speciality,
    });
  }

  return hospitals
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .slice(0, MAX_RESULTS);
}

async function queryOverpass(
  location: LocationData,
  radiusKm: number,
  language: Language
): Promise<Hospital[]> {
  const radiusMeters = radiusKm * 1000;
  const query = buildOverpassQuery(location.lat, location.lon, radiusMeters);
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        lastError = new Error(`Hospital search failed: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      return parseOverpassResult(data.elements ?? [], location.lat, location.lon, language);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Hospital search failed.');
    }
  }

  throw lastError ?? new Error('Could not reach hospital search service.');
}

export async function findNearbyHospitals(
  location: LocationData,
  language: Language = 'en'
): Promise<Hospital[]> {
  // Search very nearby (3 km) first; expand to 10 km if fewer than 3 facilities found
  const nearby = await queryOverpass(location, NEARBY_RADIUS_KM, language);
  if (nearby.length >= 3) {
    return nearby;
  }
  return queryOverpass(location, EXPANDED_RADIUS_KM, language);
}

export function getGoogleMapsLink(hospital: Hospital): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
}

export function getOSMLink(hospital: Hospital): string {
  return `https://www.openstreetmap.org/${hospital.osmId ?? `node/${hospital.id}`}`;
}

export function formatDistance(km: number | undefined): string {
  if (km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
