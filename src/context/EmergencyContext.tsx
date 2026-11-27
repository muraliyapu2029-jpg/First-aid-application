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

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [detection, setDetectionState] = useState<EmergencyDetectionResult | null>(null);
  const [protocol, setProtocol] = useState<FirstAidProtocol | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const setDetection = (result: EmergencyDetectionResult) => {
    setDetectionState(result);
    setProtocol(getFirstAidProtocol(result.category));
    setCurrentStepIndex(0);
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
    }
  };

  const nextStep = () => {
    if (protocol && currentStepIndex < protocol.steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  };

  const reset = () => {
    setDetectionState(null);
    setProtocol(null);
    setCurrentStepIndex(0);
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
