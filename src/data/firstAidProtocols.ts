import { AMBULANCE_NUMBER, EmergencyCategory, type FirstAidProtocol } from '../types';

// ============================================================
// WHO-Approved Basic Emergency Care First-Aid Guidelines
// Short, clear, voice-friendly instructions for low-literacy users.
// ============================================================

export const firstAidProtocols: Record<EmergencyCategory, FirstAidProtocol> = {
  [EmergencyCategory.SNAKEBITE]: {
    category: EmergencyCategory.SNAKEBITE,
    severity: 'critical',
    immediateAction: `Keep person calm and still. Call ambulance ${AMBULANCE_NUMBER} now.`,
    steps: [
      { id: 1, instruction: 'Move away from the snake. Keep the person calm and completely still.' },
      { id: 2, instruction: 'Keep the bitten arm or leg still and below heart level.' },
      { id: 3, instruction: 'Gently remove rings, watches, and tight clothes before swelling starts.' },
      { id: 4, instruction: `Call ambulance ${AMBULANCE_NUMBER} and go to the nearest hospital for antivenom.` },
    ],
    doNots: [
      'Do NOT cut the wound or suck out venom',
      'Do NOT tie a tight cloth or rope (tourniquet)',
      'Do NOT put ice, herbs, or electric shock',
      'Do NOT let the person walk or run',
    ],
    whenToCallDoctor: `Go to hospital immediately. Call ${AMBULANCE_NUMBER}.`,
    followUpQuestions: [
      'Is the person awake?',
      'Which part was bitten?',
      'Do you need an ambulance?',
    ],
  },

  [EmergencyCategory.HEART_ATTACK]: {
    category: EmergencyCategory.HEART_ATTACK,
    severity: 'critical',
    immediateAction: `Call ambulance ${AMBULANCE_NUMBER} now. Make the person sit calmly.`,
    steps: [
      { id: 1, instruction: `Call ambulance ${AMBULANCE_NUMBER} immediately.` },
      { id: 2, instruction: 'Help the person sit up comfortably with knees bent and back supported.' },
      { id: 3, instruction: 'Loosen tight clothes around the neck and chest.' },
      { id: 4, instruction: 'If unresponsive and not breathing normally, push hard and fast in center of chest (100–120/min).' },
    ],
    doNots: [
      'Do NOT give food or water',
      'Do NOT let them walk or stand',
      'Do NOT leave the person alone',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} immediately.`,
    followUpQuestions: [
      'Is the person awake and breathing?',
      'Do you need an ambulance?',
    ],
  },

  [EmergencyCategory.STROKE]: {
    category: EmergencyCategory.STROKE,
    severity: 'critical',
    immediateAction: `Check Face, Arm, Speech (FAST). Call ambulance ${AMBULANCE_NUMBER} now.`,
    steps: [
      { id: 1, instruction: 'Check FAST: Face drooping, one Arm weak, Speech unclear.' },
      { id: 2, instruction: `Call ambulance ${AMBULANCE_NUMBER} immediately and note the time symptoms started.` },
      { id: 3, instruction: 'Lay the person safely on their side if drowsy or unconscious.' },
      { id: 4, instruction: 'Loosen tight clothes around the neck and keep them calm.' },
    ],
    doNots: [
      'Do NOT give water, food, or pills by mouth',
      'Do NOT let them sleep before reaching hospital',
    ],
    whenToCallDoctor: `Every minute matters. Call ${AMBULANCE_NUMBER} now.`,
    followUpQuestions: [
      'Is one side of the face or arm weak?',
      'Is speech unclear?',
    ],
  },

  [EmergencyCategory.UNCONSCIOUSNESS]: {
    category: EmergencyCategory.UNCONSCIOUSNESS,
    severity: 'critical',
    immediateAction: `Check breathing. Call ambulance ${AMBULANCE_NUMBER} now.`,
    steps: [
      { id: 1, instruction: 'Tap shoulders and shout loudly to check if they respond.' },
      { id: 2, instruction: 'Tilt head back gently, lift chin, and check breathing for 10 seconds.' },
      { id: 3, instruction: 'If breathing: turn the person onto their side (recovery position).' },
      { id: 4, instruction: `If NOT breathing: call ${AMBULANCE_NUMBER} and push hard and fast in center of chest (100–120/min).` },
    ],
    doNots: [
      'Do NOT give food or water',
      'Do NOT put anything in the mouth',
      'Do NOT leave them alone',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} immediately.`,
    followUpQuestions: [
      'Is the person breathing?',
      'Do you need an ambulance?',
    ],
  },

  [EmergencyCategory.ROAD_ACCIDENT]: {
    category: EmergencyCategory.ROAD_ACCIDENT,
    severity: 'critical',
    immediateAction: `Keep scene safe. Call ${AMBULANCE_NUMBER}. Do not move neck or back.`,
    steps: [
      { id: 1, instruction: 'Stay safe from traffic. Turn on hazard lights.' },
      { id: 2, instruction: `Call ambulance ${AMBULANCE_NUMBER} right away.` },
      { id: 3, instruction: 'Do NOT move the injured person unless there is fire or danger.' },
      { id: 4, instruction: 'Press any heavy bleeding firmly with a clean cloth.' },
    ],
    doNots: [
      'Do NOT pull or lift the person unless in danger',
      'Do NOT remove a helmet if the person is breathing',
      'Do NOT give food or water',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} immediately.`,
    followUpQuestions: [
      'Is anyone bleeding heavily?',
      'Is everyone breathing?',
    ],
  },

  [EmergencyCategory.HEAVY_BLEEDING]: {
    category: EmergencyCategory.HEAVY_BLEEDING,
    severity: 'critical',
    immediateAction: `Press firmly on the wound with a clean cloth. Call ${AMBULANCE_NUMBER}.`,
    steps: [
      { id: 1, instruction: 'Press hard directly on the wound with a clean cloth or bandage.' },
      { id: 2, instruction: 'If blood soaks through, add another cloth on top. Keep pressing.' },
      { id: 3, instruction: 'If on an arm or leg with no broken bone, raise the limb above the heart.' },
      { id: 4, instruction: `Lay the person flat and call ambulance ${AMBULANCE_NUMBER}.` },
    ],
    doNots: [
      'Do NOT remove the first cloth',
      'Do NOT pull out stuck glass or objects',
      'Do NOT give food or water',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} immediately.`,
    followUpQuestions: [
      'Did the bleeding slow down?',
      'Is the person awake?',
    ],
  },

  [EmergencyCategory.BURNS]: {
    category: EmergencyCategory.BURNS,
    severity: 'high',
    immediateAction: 'Cool the burn under cool running water for 10 to 20 minutes.',
    steps: [
      { id: 1, instruction: 'Move away from heat or fire safely.' },
      { id: 2, instruction: 'Hold the burn under cool running water for 10 to 20 minutes.' },
      { id: 3, instruction: 'Gently remove rings, watches, and loose clothes before swelling.' },
      { id: 4, instruction: 'Cover loosely with a clean cloth or clean plastic wrap.' },
    ],
    doNots: [
      'Do NOT put ice or ice water on the burn',
      'Do NOT apply toothpaste, butter, oil, or turmeric',
      'Do NOT pop blisters or pull stuck cloth',
    ],
    whenToCallDoctor: `Go to hospital for large, deep, face/hand, or child burns. Call ${AMBULANCE_NUMBER}.`,
    followUpQuestions: [
      'Is the burn larger than a hand?',
      'Is it on the face or hands?',
    ],
  },

  [EmergencyCategory.ELECTRIC_SHOCK]: {
    category: EmergencyCategory.ELECTRIC_SHOCK,
    severity: 'critical',
    immediateAction: 'Switch OFF the power first. Do NOT touch the person while connected.',
    steps: [
      { id: 1, instruction: 'Turn off the main switch or unplug the wire first.' },
      { id: 2, instruction: 'If you cannot switch off power, push the wire away using dry wood.' },
      { id: 3, instruction: `Call ambulance ${AMBULANCE_NUMBER} as soon as power is off.` },
      { id: 4, instruction: 'Check breathing. Start chest compressions if not breathing.' },
    ],
    doNots: [
      'Do NOT touch the person until power is OFF',
      'Do NOT use metal or wet sticks',
      'Do NOT let them walk away without hospital check',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER}. Every electric shock needs a hospital check.`,
    followUpQuestions: [
      'Is the power switched off?',
      'Is the person breathing?',
    ],
  },

  [EmergencyCategory.CHOKING]: {
    category: EmergencyCategory.CHOKING,
    severity: 'critical',
    immediateAction: 'Give 5 sharp back blows between shoulder blades, then 5 belly thrusts.',
    steps: [
      { id: 1, instruction: 'If they can cough, encourage them to keep coughing.' },
      { id: 2, instruction: 'If unable to breathe or speak: lean them forward and give 5 firm back blows.' },
      { id: 3, instruction: 'If still stuck: stand behind, place fist above belly button, pull sharply inward and upward 5 times.' },
      { id: 4, instruction: `Repeat 5 back blows and 5 belly thrusts. If unconscious, call ${AMBULANCE_NUMBER} and start CPR.` },
    ],
    doNots: [
      'Do NOT put fingers blindly in the mouth',
      'Do NOT do belly thrusts on babies under 1 year (use gentle back blows + chest thrusts)',
      'Do NOT give water',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} if choking does not clear or person faints.`,
    followUpQuestions: [
      'Can the person cough or speak?',
      'Did the object come out?',
    ],
  },

  [EmergencyCategory.BREATHING_DIFFICULTY]: {
    category: EmergencyCategory.BREATHING_DIFFICULTY,
    severity: 'high',
    immediateAction: `Help the person sit upright. Call ${AMBULANCE_NUMBER} if severe.`,
    steps: [
      { id: 1, instruction: 'Help the person sit upright. Do NOT lay them flat.' },
      { id: 2, instruction: 'Loosen tight clothes around neck and chest. Open windows for fresh air.' },
      { id: 3, instruction: 'If they have an asthma inhaler, help them take it slowly.' },
      { id: 4, instruction: `Call ambulance ${AMBULANCE_NUMBER} if lips turn blue or they cannot speak.` },
    ],
    doNots: [
      'Do NOT lay the person flat on their back',
      'Do NOT give food or water',
      'Do NOT expose to smoke or dust',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} if breathing gets worse or lips turn blue.`,
    followUpQuestions: [
      'Do they have an asthma inhaler?',
      'Are their lips turning blue?',
    ],
  },

  [EmergencyCategory.SEIZURE]: {
    category: EmergencyCategory.SEIZURE,
    severity: 'high',
    immediateAction: 'Protect their head and turn them on their side. Do NOT hold them down.',
    steps: [
      { id: 1, instruction: 'Move sharp or hard objects away so they do not get hurt.' },
      { id: 2, instruction: 'Put something soft under their head and loosen neck clothes.' },
      { id: 3, instruction: 'Gently turn them onto their side to keep breathing clear.' },
      { id: 4, instruction: `Call ${AMBULANCE_NUMBER} if fits last over 5 minutes or it is their first fit.` },
    ],
    doNots: [
      'Do NOT put a spoon, cloth, or fingers in their mouth',
      'Do NOT hold their arms or legs down',
      'Do NOT give water until fully awake',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} if seizure lasts more than 5 minutes.`,
    followUpQuestions: [
      'How many minutes has it lasted?',
      'Are they breathing after it stopped?',
    ],
  },

  [EmergencyCategory.FAINTING]: {
    category: EmergencyCategory.FAINTING,
    severity: 'medium',
    immediateAction: 'Lay the person flat and raise their legs. Give fresh air.',
    steps: [
      { id: 1, instruction: 'Lay the person flat on their back in a shaded, airy place.' },
      { id: 2, instruction: 'Raise their legs slightly above chest level.' },
      { id: 3, instruction: 'Loosen tight neck clothes and keep crowds away.' },
      { id: 4, instruction: `If not awake within 1–2 minutes, turn on their side and call ${AMBULANCE_NUMBER}.` },
    ],
    doNots: [
      'Do NOT make them sit or stand right away',
      'Do NOT splash water on their face',
      'Do NOT give food or drink until fully awake',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} if they do not wake up in 1–2 minutes.`,
    followUpQuestions: [
      'Did the person wake up?',
      'Do they have chest pain?',
    ],
  },

  [EmergencyCategory.UNKNOWN]: {
    category: EmergencyCategory.UNKNOWN,
    severity: 'high',
    immediateAction: `Keep the person calm and safe. Call ambulance ${AMBULANCE_NUMBER}.`,
    steps: [
      { id: 1, instruction: 'Make sure the area is safe from traffic, fire, or electricity.' },
      { id: 2, instruction: 'Check if the person is awake and breathing normally.' },
      { id: 3, instruction: 'If unconscious and breathing, turn them gently onto their side.' },
      { id: 4, instruction: `Call ambulance ${AMBULANCE_NUMBER} for immediate help.` },
    ],
    doNots: [
      'Do NOT give food or water',
      'Do NOT leave the person alone',
      'Do NOT move them if neck or back may be hurt',
    ],
    whenToCallDoctor: `Call ${AMBULANCE_NUMBER} for urgent medical help.`,
    followUpQuestions: [
      'Is the person awake?',
      'Is the person breathing?',
      'Do you need an ambulance?',
    ],
  },
};

export function getProtocol(category: EmergencyCategory): FirstAidProtocol {
  return firstAidProtocols[category] ?? firstAidProtocols[EmergencyCategory.UNKNOWN];
}
