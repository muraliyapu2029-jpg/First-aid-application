import { createContext, useContext, useState, type ReactNode } from 'react';
import { EmergencyCategory, type EmergencyDetectionResult, type FirstAidProtocol } from '../types';
import { getFirstAidProtocol } from '../services/firstAidService';

// ============================================================
// Emergency Context
// Global emergency state across the app flow
// ============================================================

interface EmergencyContextValue {
  detection: EmergencyDetectionResult | null;
  protocol: FirstAidProtocol | null;
  currentStepIndex: number;
  setDetection: (result: EmergencyDetectionResult) => void;
  setStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  selectCategory: (category: EmergencyCategory, rawText?: string) => void;
}

const EmergencyContext = createContext<EmergencyContextValue>({
  detection: null,
  protocol: null,
  currentStepIndex: 0,
  setDetection: () => {},
  setStepIndex: () => {},
  nextStep: () => {},
  prevStep: () => {},
  reset: () => {},
  selectCategory: () => {},
});

const STORAGE_KEY = 'raksha_emergency_state';

interface PersistedEmergencyState {
  detection: EmergencyDetectionResult;
  currentStepIndex: number;
}

function loadPersistedState(): {
  detection: EmergencyDetectionResult | null;
  protocol: FirstAidProtocol | null;
  currentStepIndex: number;
} {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { detection: null, protocol: null, currentStepIndex: 0 };
    const parsed = JSON.parse(raw) as PersistedEmergencyState;
    if (!parsed?.detection?.category) {
      return { detection: null, protocol: null, currentStepIndex: 0 };
    }
    const protocol = getFirstAidProtocol(parsed.detection.category);
    const maxStep = Math.max(0, protocol.steps.length - 1);
    const step = Math.min(Math.max(0, Number(parsed.currentStepIndex) || 0), maxStep);
    return { detection: parsed.detection, protocol, currentStepIndex: step };
  } catch {
    return { detection: null, protocol: null, currentStepIndex: 0 };
  }
}

function savePersistedState(detection: EmergencyDetectionResult | null, currentStepIndex: number): void {
  try {
    if (!detection) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ detection, currentStepIndex }));
  } catch {
    // Ignore storage errors (e.g., private browsing quota)
  }
}

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const initial = loadPersistedState();
  const [detection, setDetectionState] = useState<EmergencyDetectionResult | null>(initial.detection);
  const [protocol, setProtocol] = useState<FirstAidProtocol | null>(initial.protocol);
  const [currentStepIndex, setCurrentStepIndex] = useState(initial.currentStepIndex);

  const setDetection = (result: EmergencyDetectionResult) => {
    setDetectionState(result);
    setProtocol(getFirstAidProtocol(result.category));
    setCurrentStepIndex(0);
    savePersistedState(result, 0);
  };

  const selectCategory = (category: EmergencyCategory, rawText = '') => {
    setDetection({
      category,
      confidence: 1.0,
      rawText,
      source: 'rule-based',
    });
  };

  const setStepIndex = (index: number) => {
    if (protocol && index >= 0 && index < protocol.steps.length) {
      setCurrentStepIndex(index);
      savePersistedState(detection, index);
    }
  };

  const nextStep = () => {
    if (protocol && currentStepIndex < protocol.steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      savePersistedState(detection, next);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prev = currentStepIndex - 1;
      setCurrentStepIndex(prev);
      savePersistedState(detection, prev);
    }
  };

  const reset = () => {
    setDetectionState(null);
    setProtocol(null);
    setCurrentStepIndex(0);
    savePersistedState(null, 0);
  };

  return (
    <EmergencyContext.Provider
      value={{
        detection,
        protocol,
        currentStepIndex,
        setDetection,
        setStepIndex,
        nextStep,
        prevStep,
        reset,
        selectCategory,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency(): EmergencyContextValue {
  return useContext(EmergencyContext);
}
