import type { LocationData } from '../types';

// ============================================================
// Location Service
// Browser Geolocation API wrapper
// ============================================================

function requestPosition(options: PositionOptions): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('Unknown location error.'));
        }
      },
      options
    );
  });
}

export async function getCurrentLocation(): Promise<LocationData> {
  try {
    return await requestPosition({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('permission') || msg.includes('denied') || msg.includes('not supported')) {
      throw err;
    }
    // Fallback to low-accuracy (Wi-Fi / IP network location) for desktops without GPS
    return await requestPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });
  }
}

export async function geocodeLocation(query: string): Promise<LocationData & { displayName: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a city or area name.');
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Location lookup failed: HTTP ${response.status}`);
  }

  const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!results || results.length === 0) {
    throw new Error(`Could not find "${trimmed}". Try a nearby city or town name.`);
  }

  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
    accuracy: 5000,
    displayName: results[0].display_name.split(',').slice(0, 2).join(', '),
  };
}

export function buildShareText(
  location: LocationData,
  emergencyCategory: string,
  language: string
): string {
  const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lon}`;
  return `🆘 EMERGENCY ALERT\nCategory: ${emergencyCategory}\nLanguage: ${language}\nLocation: ${mapsLink}\nCoordinates: ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`;
}

export function buildWhatsAppLink(shareText: string): string {
  return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
}

export function buildSmsLink(shareText: string, phoneNumber = ''): string {
  return `sms:${phoneNumber}?body=${encodeURIComponent(shareText)}`;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
