import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  EmergencyCategory,
  type CallTurn,
  type EmergencyDetectionResult,
  type FirstAidProtocol,
} from '../types';
import { getFirstAidProtocol } from '../services/firstAidService';

// ============================================================
// Emergency Context
// Global emergency, WHO guidelines, and phone-call Q&A state
// ============================================================

export interface ActiveGuidelines {
  title: string;
  guidelines: string[];
  doNots: string[];
}

interface EmergencyContextValue {
  detection: EmergencyDetectionResult | null;
  protocol: FirstAidProtocol | null;
  currentStepIndex: number;
  callHistory: CallTurn[];
  ambulanceTriggered: boolean;
  activeGuidelines: ActiveGuidelines | null;
  setDetection: (result: EmergencyDetectionResult) => void;
  setStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  addCallTurn: (turn: CallTurn) => void;
  clearCallHistory: () => void;
  setAmbulanceTriggered: (val: boolean) => void;
  setActiveGuidelines: (g: ActiveGuidelines | null) => void;
  reset: () => void;
  selectCategory: (category: EmergencyCategory, rawText?: string) => void;
}

const EmergencyContext = createContext<EmergencyContextValue>({
  detection: null,
  protocol: null,
  currentStepIndex: 0,
  callHistory: [],
  ambulanceTriggered: false,
  activeGuidelines: null,
  setDetection: () => {},
  setStepIndex: () => {},
  nextStep: () => {},
  prevStep: () => {},
  addCallTurn: () => {},
  clearCallHistory: () => {},
  setAmbulanceTriggered: () => {},
  setActiveGuidelines: () => {},
  reset: () => {},
  selectCategory: () => {},
});

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [detection, setDetectionState] = useState<EmergencyDetectionResult | null>(null);
  const [protocol, setProtocol] = useState<FirstAidProtocol | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [callHistory, setCallHistory] = useState<CallTurn[]>([]);
  const [ambulanceTriggered, setAmbulanceTriggered] = useState(false);
  const [activeGuidelines, setActiveGuidelines] = useState<ActiveGuidelines | null>(null);

  const setDetection = useCallback((result: EmergencyDetectionResult) => {
    setDetectionState(result);
    setProtocol(getFirstAidProtocol(result.category));
    setCurrentStepIndex(0);
    if (result.aiGuidance) {
      setActiveGuidelines({
        title: result.aiGuidance.title,
        guidelines: result.aiGuidance.guidelines,
        doNots: result.aiGuidance.doNots,
      });
    } else {
      setActiveGuidelines(null);
    }
    if (result.arrangeAmbulance) {
      setAmbulanceTriggered(true);
    }
  }, []);

  const selectCategory = useCallback((category: EmergencyCategory, rawText = '') => {
    setDetection({
      category,
      confidence: 1.0,
      rawText,
      source: 'rule-based',
    });
  }, [setDetection]);

  const setStepIndex = useCallback((index: number) => {
    if (protocol && index >= 0 && index < protocol.steps.length) {
      setCurrentStepIndex(index);
    }
  }, [protocol]);

  const nextStep = useCallback(() => {
    if (protocol && currentStepIndex < protocol.steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }
  }, [protocol, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
    }
  }, [currentStepIndex]);

  const addCallTurn = useCallback((turn: CallTurn) => {
    setCallHistory(prev => [...prev, turn]);
  }, []);

  const clearCallHistory = useCallback(() => {
    setCallHistory([]);
  }, []);

  const reset = useCallback(() => {
    setDetectionState(null);
    setProtocol(null);
    setCurrentStepIndex(0);
    setCallHistory([]);
    setAmbulanceTriggered(false);
    setActiveGuidelines(null);
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        detection,
        protocol,
        currentStepIndex,
        callHistory,
        ambulanceTriggered,
        activeGuidelines,
        setDetection,
        setStepIndex,
        nextStep,
        prevStep,
        addCallTurn,
        clearCallHistory,
        setAmbulanceTriggered,
        setActiveGuidelines,
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
