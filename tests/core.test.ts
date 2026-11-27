import test from 'node:test';
import assert from 'node:assert/strict';
import { detectEmergencyRuleBased } from '../src/services/emergencyDetection.ts';
import { getFirstAidProtocol } from '../src/services/firstAidService.ts';
import {
  haversineDistance,
  parseOverpassResult,
  formatDistance,
} from '../src/services/hospitalService.ts';
import { EmergencyCategory } from '../src/types/index.ts';

test('detectEmergencyRuleBased classifies snakebite in English', () => {
  const result = detectEmergencyRuleBased('A snake bit my father in the field');
  assert.equal(result.category, EmergencyCategory.SNAKEBITE);
  assert.equal(result.source, 'rule-based');
  assert.ok(result.confidence >= 0.25);
});

test('detectEmergencyRuleBased classifies heart attack symptoms', () => {
  const result = detectEmergencyRuleBased('My father has chest pain and is sweating');
  assert.equal(result.category, EmergencyCategory.HEART_ATTACK);
  assert.ok(result.confidence >= 0.25);
});

test('detectEmergencyRuleBased returns unknown for unrelated input', () => {
  const result = detectEmergencyRuleBased('hello how are you today');
  assert.equal(result.category, EmergencyCategory.UNKNOWN);
  assert.equal(result.confidence, 0);
});

test('getFirstAidProtocol returns curated steps for every category', () => {
  for (const category of Object.values(EmergencyCategory)) {
    const protocol = getFirstAidProtocol(category);
    assert.ok(protocol.steps.length > 0, `Expected steps for ${category}`);
  }
});

test('haversineDistance computes ~0 km for identical coordinates', () => {
  assert.equal(haversineDistance(12.9716, 77.5946, 12.9716, 77.5946), 0);
});

test('parseOverpassResult sorts hospitals by distance and localizes names', () => {
  const elements = [
    {
      type: 'node',
      id: 1,
      lat: 12.98,
      lon: 77.6,
      tags: {
        name: 'Far Hospital',
        'name:kn': 'ದೂರದ ಆಸ್ಪತ್ರೆ',
        amenity: 'hospital',
        emergency: 'yes',
      },
    },
    {
      type: 'way',
      id: 2,
      center: { lat: 12.972, lon: 77.595 },
      tags: {
        name: 'Near Hospital',
        'name:kn': 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ',
        amenity: 'hospital',
      },
    },
  ];

  const hospitals = parseOverpassResult(elements, 12.9716, 77.5946, 'kn');
  assert.equal(hospitals.length, 2);
  assert.equal(hospitals[0].name, 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ');
  assert.equal(hospitals[1].hasEmergency, true);
  assert.ok((hospitals[0].distance ?? 0) < (hospitals[1].distance ?? 0));
});

test('formatDistance formats meters and kilometers', () => {
  assert.equal(formatDistance(0.45), '450 m');
  assert.equal(formatDistance(2.34), '2.3 km');
});
