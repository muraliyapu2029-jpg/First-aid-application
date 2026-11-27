import { EmergencyCategory, type FirstAidProtocol } from '../types';

// ============================================================
// Curated First-Aid Protocol Database
// All medical content is based on standard first-aid guidelines.
// AI is NEVER used to generate these protocols.
// Always seek professional medical care.
// ============================================================

export const firstAidProtocols: Record<EmergencyCategory, FirstAidProtocol> = {
  [EmergencyCategory.SNAKEBITE]: {
    category: EmergencyCategory.SNAKEBITE,
    severity: 'critical',
    immediateAction: 'Keep the person CALM and STILL. Move away from the snake. Call 112 immediately.',
    steps: [
      { id: 1, instruction: 'Keep the person calm and as still as possible. Movement spreads venom faster through the body.' },
      { id: 2, instruction: 'Move the person safely away from the snake. Do NOT try to catch, trap, or kill the snake.' },
      { id: 3, instruction: 'Keep the bitten limb below the level of the heart. Minimize all movement of the affected area.' },
      { id: 4, instruction: 'Carefully remove rings, watches, bangles, tight clothing, or footwear near the bitten area BEFORE swelling starts — only if this can be done gently.' },
      { id: 5, instruction: 'Keep the person lying down and comfortable. Monitor their breathing and consciousness continuously.' },
      { id: 6, instruction: 'Call 112 immediately if not already done. Tell them it is a snakebite. Arrange the fastest possible transport to a hospital.' },
      { id: 7, instruction: 'Note the time of the bite if possible. If you can describe the snake\'s color or markings from a safe distance, tell the medical team — but do NOT delay treatment to identify the snake.' },
      { id: 8, instruction: 'Stay with the person. Keep them reassured. Do not give them anything to eat or drink.' },
    ],
    doNots: [
      'Do NOT cut the bitten area or make any incision',
      'Do NOT suck out the venom with your mouth',
      'Do NOT apply ice or cold water to the bite',
      'Do NOT use a tight tourniquet or tie a cloth tightly above the bite',
      'Do NOT apply electric shock or use traditional remedies',
      'Do NOT let the person walk or run if avoidable',
      'Do NOT give alcohol, painkillers, or any medication without medical guidance',
      'Do NOT delay going to hospital while trying to identify the snake species',
    ],
    whenToCallDoctor: 'Go to the nearest hospital IMMEDIATELY. Every snakebite must be evaluated by a doctor, even if no symptoms are visible. Antivenom must only be given by trained medical professionals in a hospital.',
    followUpQuestions: [
      'Is the person conscious and responding?',
      'Which part of the body was bitten?',
      'Is there swelling or pain at the bite site?',
      'Has the person been moved away from the snake?',
    ],
  },

  [EmergencyCategory.HEART_ATTACK]: {
    category: EmergencyCategory.HEART_ATTACK,
    severity: 'critical',
    immediateAction: 'Call 112 NOW. Have the person sit or lie in a comfortable position immediately.',
    steps: [
      { id: 1, instruction: 'Call 112 immediately. Tell them you suspect a heart attack and your location. Do not delay this step.' },
      { id: 2, instruction: 'Help the person sit down or lie in a comfortable position — usually half-sitting with knees bent and back supported, or lying flat if they feel faint.' },
      { id: 3, instruction: 'Loosen any tight clothing around the neck, chest, and waist to make breathing easier.' },
      { id: 4, instruction: 'Keep the person calm. Reassure them that help is coming. Ask them not to move or exert themselves.' },
      { id: 5, instruction: 'If the person becomes unconscious and stops breathing normally, begin CPR if you are trained to do so: 30 chest compressions followed by 2 rescue breaths. Continue until help arrives.' },
      { id: 6, instruction: 'Do NOT leave the person alone. Stay with them and keep monitoring their condition.' },
      { id: 7, instruction: 'If the person is unconscious, place them in the recovery position (on their side) to keep the airway clear — unless you suspect a neck injury.' },
    ],
    doNots: [
      'Do NOT give the person food or water',
      'Do NOT let the person walk around or exert themselves',
      'Do NOT leave them alone',
      'Do NOT give aspirin or any medication unless specifically instructed by emergency services',
      'Do NOT ignore the symptoms and wait for them to pass',
    ],
    whenToCallDoctor: 'This is a life-threatening emergency. Call 112 immediately. Do not drive to the hospital yourself — wait for the ambulance unless it will take too long.',
    followUpQuestions: [
      'Is the person conscious and responding?',
      'Is the person breathing normally?',
      'Has 112 been called?',
      'Is the chest pain still present?',
    ],
  },

  [EmergencyCategory.STROKE]: {
    category: EmergencyCategory.STROKE,
    severity: 'critical',
    immediateAction: 'Use FAST test. Call 112 immediately. Time is critical — brain damage increases every minute.',
    steps: [
      { id: 1, instruction: 'Use the FAST test: Face — ask them to smile (is one side drooping?). Arms — ask them to raise both arms (does one drift down?). Speech — ask them to say a simple phrase (is speech slurred?). Time — if any FAST sign is yes, call 112 immediately.' },
      { id: 2, instruction: 'Call 112 immediately. Tell them you suspect a stroke and your location. Time is critical in stroke treatment.' },
      { id: 3, instruction: 'Help the person sit or lie down in a safe, comfortable position. If they are conscious, support their head and upper body slightly elevated.' },
      { id: 4, instruction: 'If the person is unconscious but breathing, place them in the recovery position on their side with their head tilted back slightly to keep the airway open.' },
      { id: 5, instruction: 'Loosen any tight clothing around the neck and chest. Keep them warm and comfortable.' },
      { id: 6, instruction: 'Do NOT give them any food, water, or medication. Their swallowing reflex may be impaired.' },
      { id: 7, instruction: 'Stay with the person and keep reassuring them. Note the exact time when symptoms first appeared — this is important for doctors.' },
    ],
    doNots: [
      'Do NOT give food, water, or any medication by mouth',
      'Do NOT let the person go to sleep before being evaluated',
      'Do NOT ignore mild symptoms — even brief symptoms need urgent evaluation',
      'Do NOT delay calling 112',
    ],
    whenToCallDoctor: 'Call 112 immediately. Stroke treatment must begin within hours for best outcome. Every minute matters.',
    followUpQuestions: [
      'Is the person conscious and responding?',
      'Is their speech slurred or unclear?',
      'Is one side of the face, arm, or leg weaker?',
      'Has 112 been called?',
    ],
  },

  [EmergencyCategory.UNCONSCIOUSNESS]: {
    category: EmergencyCategory.UNCONSCIOUSNESS,
    severity: 'critical',
    immediateAction: 'Check if breathing. Call 112. Begin CPR if trained and no breathing.',
    steps: [
      { id: 1, instruction: 'Check if the person is responding: tap their shoulders firmly and shout "Are you OK?" If no response, they are unconscious.' },
      { id: 2, instruction: 'Call 112 immediately or ask a bystander to call while you attend to the person.' },
      { id: 3, instruction: 'Open the airway: tilt the head back gently and lift the chin. Look, listen, and feel for breathing for no more than 10 seconds.' },
      { id: 4, instruction: 'If the person IS breathing: place them in the recovery position — on their side, with top knee bent forward to prevent rolling, and head tilted back to keep airway open.' },
      { id: 5, instruction: 'If the person is NOT breathing and you are trained in CPR: begin CPR. Push hard and fast in the center of the chest — 30 compressions then 2 rescue breaths. Continue until help arrives.' },
      { id: 6, instruction: 'If you are not trained in CPR, the emergency operator (112) can guide you through hands-only CPR over the phone.' },
      { id: 7, instruction: 'Stay with the person and monitor their breathing continuously until emergency services arrive.' },
    ],
    doNots: [
      'Do NOT leave the unconscious person alone',
      'Do NOT give food or water to an unconscious person',
      'Do NOT place an unconscious person flat on their back unless doing CPR',
      'Do NOT shake the person violently',
      'Do NOT put anything in their mouth',
    ],
    whenToCallDoctor: 'Call 112 immediately for any unconscious person. This is always an emergency.',
    followUpQuestions: [
      'Is the person breathing?',
      'Did the person fall or have an injury before losing consciousness?',
      'Has 112 been called?',
      'Are you trained in CPR?',
    ],
  },

  [EmergencyCategory.ROAD_ACCIDENT]: {
    category: EmergencyCategory.ROAD_ACCIDENT,
    severity: 'critical',
    immediateAction: 'Ensure scene safety. Call 112. Do not move the injured person unless in immediate danger.',
    steps: [
      { id: 1, instruction: 'Ensure your own safety first. Turn on hazard lights, use warning triangles if available, and keep bystanders at a safe distance from traffic.' },
      { id: 2, instruction: 'Call 112 immediately. Give your exact location, number of people injured, and their visible condition.' },
      { id: 3, instruction: 'Do NOT move injured persons unless they are in immediate danger from fire or further collision. Moving someone with a spinal injury incorrectly can cause permanent paralysis.' },
      { id: 4, instruction: 'Check if each person is conscious and breathing. Talk to them calmly to assess their response.' },
      { id: 5, instruction: 'For conscious persons: keep them calm and still. Encourage them not to move. Keep them warm with a jacket or blanket if available.' },
      { id: 6, instruction: 'For heavy bleeding: apply firm direct pressure using a clean cloth or clothing. Hold continuously without lifting to check.' },
      { id: 7, instruction: 'If a person is not breathing and you are trained in CPR, only begin CPR if moving them is unavoidable. The 112 operator can guide you.' },
      { id: 8, instruction: 'Stay at the scene until emergency services arrive. Direct them to the location if needed.' },
    ],
    doNots: [
      'Do NOT move injured persons unless absolutely necessary for safety',
      'Do NOT remove a helmet from a motorcyclist unless they are not breathing',
      'Do NOT let people crowd around and obstruct airway',
      'Do NOT give food or water to injured persons',
    ],
    whenToCallDoctor: 'Call 112 immediately for all road accidents with injuries. Even if a person appears fine, internal injuries may not be visible.',
    followUpQuestions: [
      'How many people are injured?',
      'Is anyone unconscious or not breathing?',
      'Is there heavy bleeding?',
      'Has 112 been called?',
    ],
  },

  [EmergencyCategory.HEAVY_BLEEDING]: {
    category: EmergencyCategory.HEAVY_BLEEDING,
    severity: 'critical',
    immediateAction: 'Apply firm direct pressure to the wound. Keep pressing. Call 112.',
    steps: [
      { id: 1, instruction: 'Stay calm. Put on gloves if available. Apply firm, direct pressure to the wound using the cleanest material available — a cloth, clean clothing, or bandage.' },
      { id: 2, instruction: 'Press hard and continuously without lifting the cloth to check. If blood soaks through, add more material on top — do NOT remove the first layer.' },
      { id: 3, instruction: 'If the wound is on a limb and bleeding is life-threatening, raise the limb above the level of the heart while maintaining pressure.' },
      { id: 4, instruction: 'Call 112 immediately if the bleeding is severe. Continue pressure while calling.' },
      { id: 5, instruction: 'Keep the person lying down and still. Reassure them and keep them warm to prevent shock.' },
      { id: 6, instruction: 'If you suspect an embedded object in the wound, do NOT remove it. Apply pressure around the object, not on it.' },
      { id: 7, instruction: 'Watch for signs of shock: pale or cold skin, rapid weak pulse, feeling faint or confused. If shock appears, lay them flat and raise their legs slightly (unless head or chest is injured).' },
    ],
    doNots: [
      'Do NOT remove the first cloth — add more material on top',
      'Do NOT use a tourniquet unless bleeding is life-threatening and emergency services advise it',
      'Do NOT give food or water to the person',
      'Do NOT remove any embedded objects from wounds',
    ],
    whenToCallDoctor: 'Call 112 for heavy or uncontrolled bleeding. Any large wound needs professional medical evaluation.',
    followUpQuestions: [
      'Is the bleeding slowing down with pressure?',
      'Is the person conscious?',
      'Is the person showing signs of shock (pale, cold, faint)?',
      'Has 112 been called?',
    ],
  },

  [EmergencyCategory.BURNS]: {
    category: EmergencyCategory.BURNS,
    severity: 'high',
    immediateAction: 'Cool the burn with cool running water for 20 minutes. Do NOT use ice.',
    steps: [
      { id: 1, instruction: 'Remove the person from the source of heat immediately. Ensure your own safety.' },
      { id: 2, instruction: 'Cool the burn with cool (not cold, not iced) running water for at least 20 minutes. Start cooling as quickly as possible — even hours after a burn, cooling still helps.' },
      { id: 3, instruction: 'While cooling, carefully remove jewelry, watches, or tight clothing near the burned area — before swelling starts — only if they are not stuck to the skin.' },
      { id: 4, instruction: 'After cooling, loosely cover the burn with a clean non-fluffy material, such as cling film, a clean plastic bag, or a clean cloth. Do NOT wrap tightly.' },
      { id: 5, instruction: 'Keep the person warm (cover unburned areas) while cooling the burn to prevent hypothermia.' },
      { id: 6, instruction: 'Call 112 or go to a hospital for: burns larger than the person\'s hand, burns on the face, hands, feet, genitals, or joints, all chemical or electrical burns, burns with blisters, or burns in children or elderly.' },
    ],
    doNots: [
      'Do NOT use ice, iced water, or cold packs — they cause further tissue damage',
      'Do NOT apply butter, oil, toothpaste, or any home remedy',
      'Do NOT break blisters',
      'Do NOT remove clothing stuck to the burn',
      'Do NOT use fluffy cotton wool directly on the burn',
    ],
    whenToCallDoctor: 'Seek medical care for all significant burns, burns on sensitive areas, or chemical/electrical burns. When in doubt, go to a hospital.',
    followUpQuestions: [
      'How large is the burned area?',
      'Is the burn on the face, hands, feet, or joints?',
      'Is the person in severe pain?',
      'Has the burn been cooled with water?',
    ],
  },

  [EmergencyCategory.ELECTRIC_SHOCK]: {
    category: EmergencyCategory.ELECTRIC_SHOCK,
    severity: 'critical',
    immediateAction: 'Do NOT touch the person until power is OFF. Switch off the power source first.',
    steps: [
      { id: 1, instruction: 'DO NOT touch the person if they are still in contact with the electrical source. You will also be electrocuted. This is the most important step.' },
      { id: 2, instruction: 'Switch off the main power supply at the switchboard or pull out the plug if it is safe to do so. If you cannot switch off power, use a dry wooden object (not metal) to push the wire away from the person.' },
      { id: 3, instruction: 'Once the power is confirmed OFF, call 112 immediately.' },
      { id: 4, instruction: 'Check if the person is conscious and breathing. If they are unresponsive and not breathing, begin CPR if you are trained — 30 chest compressions, then 2 rescue breaths.' },
      { id: 5, instruction: 'If the person is conscious, lay them down and keep them still. Do not let them walk around — electric shock can cause heart rhythm problems that may not be immediately visible.' },
      { id: 6, instruction: 'Treat any burns caused by the electric shock by cooling them with cool running water. Electric shock causes entry and exit burns.' },
      { id: 7, instruction: 'Keep the person warm and reassured while waiting for emergency services.' },
    ],
    doNots: [
      'Do NOT touch the person until you are CERTAIN power is OFF',
      'Do NOT use metal objects or wet materials to separate the person from the electrical source',
      'Do NOT assume the person is fine just because they are conscious — internal injuries are common',
      'Do NOT let the person get up and walk away without medical evaluation',
    ],
    whenToCallDoctor: 'Call 112 for every significant electric shock. All electric shock victims need hospital evaluation even if they appear normal.',
    followUpQuestions: [
      'Has the electrical source been switched off?',
      'Is the person conscious and breathing?',
      'Are there visible burns?',
      'Has 112 been called?',
    ],
  },

  [EmergencyCategory.CHOKING]: {
    category: EmergencyCategory.CHOKING,
    severity: 'critical',
    immediateAction: 'Ask the person to cough forcefully. If they cannot breathe, give 5 back blows now.',
    steps: [
      { id: 1, instruction: 'Ask the person: "Are you choking?" If they can speak, cough, or breathe, encourage them to keep coughing forcefully. Stay with them and watch.' },
      { id: 2, instruction: 'If the person CANNOT breathe, speak, or cough effectively: stand behind them, support their chest with one hand, and give 5 firm back blows between the shoulder blades with the heel of your other hand.' },
      { id: 3, instruction: 'After 5 back blows, check if the blockage has cleared. If not, give 5 abdominal thrusts (Heimlich maneuver): stand behind them, make a fist above their navel, cover with your other hand, and thrust sharply inward and upward.' },
      { id: 4, instruction: 'Alternate 5 back blows and 5 abdominal thrusts until the object is dislodged or the person loses consciousness.' },
      { id: 5, instruction: 'If the person becomes unconscious: lower them carefully to the ground, call 112, and begin CPR. Each time you open the airway for breaths, look for the object and remove it only if clearly visible.' },
      { id: 6, instruction: 'For infants under 1 year: use 5 gentle back blows face-down on your forearm, then 5 chest thrusts. NEVER use abdominal thrusts on infants.' },
    ],
    doNots: [
      'Do NOT perform blind finger sweeps in the mouth — only remove an object if clearly visible',
      'Do NOT use abdominal thrusts on infants under 1 year',
      'Do NOT slap the back of a person who is still breathing and coughing effectively',
      'Do NOT give water or food',
    ],
    whenToCallDoctor: 'Call 112 immediately if the person loses consciousness or the object cannot be removed. All choking incidents in children and elderly require medical evaluation even after the object is removed.',
    followUpQuestions: [
      'Can the person breathe at all?',
      'Can they make any sound or speak?',
      'Has the blockage been cleared?',
      'Is the person conscious?',
    ],
  },

  [EmergencyCategory.BREATHING_DIFFICULTY]: {
    category: EmergencyCategory.BREATHING_DIFFICULTY,
    severity: 'high',
    immediateAction: 'Sit the person upright. Keep them calm. Call 112 if breathing is very difficult.',
    steps: [
      { id: 1, instruction: 'Help the person sit upright in a comfortable position. Leaning slightly forward with hands on knees often helps open the airways.' },
      { id: 2, instruction: 'Keep the person calm — anxiety makes breathlessness worse. Speak in a slow, reassuring voice.' },
      { id: 3, instruction: 'Loosen any tight clothing around the neck and chest.' },
      { id: 4, instruction: 'If the person has an inhaler (asthma): help them use it. Shake the inhaler, have them breathe out slowly, then press the inhaler as they breathe in deeply, hold for 10 seconds.' },
      { id: 5, instruction: 'Move to a well-ventilated area or open a window if indoors. Keep the person away from smoke, dust, and strong smells.' },
      { id: 6, instruction: 'Call 112 immediately if: breathing is very labored, lips or fingernails are turning blue, the person cannot speak in full sentences, or they are becoming confused or drowsy.' },
      { id: 7, instruction: 'If the person becomes unconscious and stops breathing, begin CPR if trained and call 112 immediately.' },
    ],
    doNots: [
      'Do NOT lay the person flat — keep them sitting up',
      'Do NOT give food or drink',
      'Do NOT leave the person alone if severely breathless',
      'Do NOT expose them to smoke, dust, or strong smells',
    ],
    whenToCallDoctor: 'Call 112 for severe breathing difficulty, especially if lips are blue, person cannot speak, or is becoming drowsy or confused.',
    followUpQuestions: [
      'Can the person speak in full sentences?',
      'Are the lips or fingernails turning blue?',
      'Does the person have an inhaler?',
      'Is the breathing getting better or worse?',
    ],
  },

  [EmergencyCategory.SEIZURE]: {
    category: EmergencyCategory.SEIZURE,
    severity: 'high',
    immediateAction: 'Keep person safe. Do NOT hold them down. Time the seizure. Call 112 if over 5 minutes.',
    steps: [
      { id: 1, instruction: 'Stay calm. Note the time the seizure started. Most seizures stop on their own within 1–3 minutes.' },
      { id: 2, instruction: 'Clear the area around the person. Remove hard, sharp, or dangerous objects they might hit. Do NOT restrain or hold them down.' },
      { id: 3, instruction: 'Cushion their head with something soft. If possible, gently turn them onto their side to keep the airway clear and prevent choking.' },
      { id: 4, instruction: 'Loosen any tight clothing around the neck.' },
      { id: 5, instruction: 'Stay with the person throughout the seizure. Watch the time carefully.' },
      { id: 6, instruction: 'Call 112 immediately if: the seizure lasts more than 5 minutes, another seizure starts right after, the person is injured during the seizure, the person does not regain consciousness, or it is their first known seizure.' },
      { id: 7, instruction: 'After the seizure: the person may be confused, tired, or disoriented. Stay calm and reassure them. Keep them on their side until fully alert. Do not let them get up quickly.' },
    ],
    doNots: [
      'Do NOT put anything in the person\'s mouth — they cannot swallow their tongue',
      'Do NOT restrain or hold the person down',
      'Do NOT give food or water until the person is fully alert',
      'Do NOT leave the person alone during or immediately after a seizure',
    ],
    whenToCallDoctor: 'Call 112 if the seizure lasts more than 5 minutes, if the person is injured, or if this is their first seizure. All first-time seizures need medical evaluation.',
    followUpQuestions: [
      'How long has the seizure been going on?',
      'Has the person had seizures before?',
      'Is the person breathing?',
      'Has the seizure stopped?',
    ],
  },

  [EmergencyCategory.FAINTING]: {
    category: EmergencyCategory.FAINTING,
    severity: 'medium',
    immediateAction: 'Lay the person flat. Raise their legs. Ensure fresh air. Call 112 if unconscious more than 1 minute.',
    steps: [
      { id: 1, instruction: 'If the person feels faint but is still conscious: help them sit or lie down immediately to prevent a fall and injury.' },
      { id: 2, instruction: 'If the person has fainted: lay them flat on their back on a safe surface. Raise their legs 15–30 cm (above the level of the heart) to improve blood flow to the brain.' },
      { id: 3, instruction: 'Ensure good airflow: open windows, loosen tight clothing around the neck, and ask bystanders to give space.' },
      { id: 4, instruction: 'Most people regain consciousness within 1–2 minutes. As they recover, keep them lying down for a few minutes before helping them sit up slowly.' },
      { id: 5, instruction: 'Once alert, help them sit and then stand slowly. Offer water if they are fully conscious.' },
      { id: 6, instruction: 'Call 112 or go to a doctor if: the person does not regain consciousness within 1–2 minutes, they have chest pain or palpitations, they are elderly or have diabetes/heart conditions, or if fainting happens repeatedly.' },
    ],
    doNots: [
      'Do NOT sit the person up immediately after fainting',
      'Do NOT pour water on their face',
      'Do NOT let the person get up too quickly',
      'Do NOT leave the person alone until they are fully alert',
    ],
    whenToCallDoctor: 'Seek medical attention if fainting recurs, if there is associated chest pain, if the person is diabetic or elderly, or if the person does not recover quickly.',
    followUpQuestions: [
      'Has the person regained consciousness?',
      'Does the person have chest pain or palpitations?',
      'Has the person fainted before?',
      'Is there an obvious reason for fainting (heat, standing long, no food)?',
    ],
  },

  [EmergencyCategory.UNKNOWN]: {
    category: EmergencyCategory.UNKNOWN,
    severity: 'high',
    immediateAction: 'Keep the person safe and calm. Call 112 immediately for any serious emergency.',
    steps: [
      { id: 1, instruction: 'Keep yourself and the person calm. Assess the immediate scene for any dangers.' },
      { id: 2, instruction: 'Call 112 immediately. Describe what you see as clearly as possible — the person\'s condition, consciousness, and any visible symptoms.' },
      { id: 3, instruction: 'Keep the person still and comfortable. Do not give any food or water.' },
      { id: 4, instruction: 'If the person is unconscious but breathing, place them in the recovery position on their side.' },
      { id: 5, instruction: 'If the person is not breathing, begin CPR if trained — 30 chest compressions then 2 rescue breaths.' },
      { id: 6, instruction: 'Stay with the person and follow the instructions of the emergency operator (112) until help arrives.' },
    ],
    doNots: [
      'Do NOT leave the person alone',
      'Do NOT give food or water if the emergency is unknown',
      'Do NOT move the person unnecessarily',
    ],
    whenToCallDoctor: 'Call 112 immediately for any serious or unclear emergency. When in doubt, always call emergency services.',
    followUpQuestions: [
      'Is the person conscious?',
      'Is the person breathing?',
      'Has 112 been called?',
      'What are the main symptoms you can see?',
    ],
  },
};

export function getProtocol(category: EmergencyCategory): FirstAidProtocol {
  return firstAidProtocols[category] ?? firstAidProtocols[EmergencyCategory.UNKNOWN];
}
