import { describe, it, expect } from 'vitest';
import { detectLanguage } from './languageDetection';

describe('detectLanguage', () => {
  describe('native script', () => {
    it.each([
      ['ನನ್ನ ತಂದೆಗೆ ಹಾವು ಕಚ್ಚಿತು', 'kn'],
      ['ಎದೆ ನೋವು ಇದೆ', 'kn'],
      ['मेरे पिताजी को सांप ने काटा', 'hi'],
      ['सीने में दर्द हो रहा है', 'hi'],
    ] as const)('%s → %s', (text, expected) => {
      expect(detectLanguage(text, 'en')).toBe(expected);
    });

    it('prefers native script when English words are mixed in', () => {
      expect(detectLanguage('ಅಪ್ಪನಿಗೆ heart attack ಆಗಿದೆ', 'en')).toBe('kn');
      expect(detectLanguage('पापा को heart attack आया है', 'en')).toBe('hi');
    });

    it('ignores the fallback when script is clear', () => {
      expect(detectLanguage('ಹಾವು', 'hi')).toBe('kn');
      expect(detectLanguage('सांप', 'kn')).toBe('hi');
    });
  });

  describe('English', () => {
    it.each([
      'A snake bit my father',
      'Road accident, person is bleeding badly',
      'My father has chest pain and is sweating',
      'She fainted and is not breathing',
      'Electric shock from a wire',
    ])('%s → en', text => {
      expect(detectLanguage(text, 'kn')).toBe('en');
    });
  });

  describe('romanized Hindi / Kannada', () => {
    it.each([
      ['mere papa ko saap ne kaata', 'hi'],
      ['seene mein dard ho raha hai', 'hi'],
      ['jaldi madad karo', 'hi'],
    ] as const)('%s → %s', (text, expected) => {
      expect(detectLanguage(text, 'en')).toBe(expected);
    });

    it.each([
      ['nanna appa ge haavu kachchitu', 'kn'],
      ['edhe novu ide', 'kn'],
      ['sahaya beku bega', 'kn'],
    ] as const)('%s → %s', (text, expected) => {
      expect(detectLanguage(text, 'en')).toBe(expected);
    });

    it('does not switch on weak hints alone', () => {
      expect(detectLanguage('electric shock', 'en')).toBe('en');
      expect(detectLanguage('call anna now', 'en')).toBe('en');
    });
  });

  describe('fallback', () => {
    it('keeps the current language for empty or digit-only text', () => {
      expect(detectLanguage('', 'kn')).toBe('kn');
      expect(detectLanguage('   ', 'hi')).toBe('hi');
      expect(detectLanguage('112', 'kn')).toBe('kn');
    });
  });
});
