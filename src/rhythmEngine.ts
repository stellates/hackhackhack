// Cyber Rhythm & Timing Engine for Hollywood Hacker 2.0
// Synchronized strictly to BPM 128 (1 beat = 0.46875s, 1 bar = 1.875s, 16 bars = 30.0s).
// Supports Dual Highway (Top: SHIFT Lane, Bottom: MAIN Lane) with realistic typing cadences.

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type NoteType = 'BURST' | 'SPACE' | 'SHIFT' | 'ENTER';
export type LaneType = 'SHIFT' | 'MAIN';
export type JudgmentType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS' | 'PENALTY';

export interface RhythmNote {
  id: number;
  type: NoteType;
  lane: LaneType;
  targetTime: number; // in seconds from game start
  duration?: number;   // for BURST (in seconds)
  label: string;
  hit: boolean;
  judged: boolean;
  missed?: boolean;
}

export interface JudgmentFeedback {
  type: JudgmentType;
  scoreChange: number;
  noteLabel: string;
  noteType?: NoteType;
  message?: string;
  isLastNote?: boolean;
}

export interface TrackConfig {
  diff: Difficulty;
  title: string;
  artist: string;
  bpm: number;
  duration: number; // in seconds
  primaryFile: string;
}

export const TRACK_CONFIGS: Record<Difficulty, TrackConfig> = {
  EASY: {
    diff: 'EASY',
    title: 'NEURAL OVERDRIVE [CHILL]',
    artist: 'GEMINI LYRIA',
    bpm: 118,
    duration: 35.0,
    primaryFile: '/audio/easy.mp3'
  },
  NORMAL: {
    diff: 'NORMAL',
    title: 'CYBER ATTACK VECTOR',
    artist: 'GEMINI LYRIA',
    bpm: 134,
    duration: 48.0,
    primaryFile: '/audio/normal.mp3'
  },
  HARD: {
    diff: 'HARD',
    title: 'BREAKCORE PROTOCOL // APOCALYPSE',
    artist: 'GEMINI LYRIA',
    bpm: 165,
    duration: 56.0,
    primaryFile: '/audio/hard.mp3'
  }
};

export class RhythmEngine {
  private notes: RhythmNote[] = [];
  private activeNotes: RhythmNote[] = [];
  private noteIdCounter: number = 0;
  public difficulty: Difficulty = 'NORMAL';

  // Stats
  public perfectCount: number = 0;
  public greatCount: number = 0;
  public goodCount: number = 0;
  public missCount: number = 0;
  public penaltyCount: number = 0;
  public rhythmCombo: number = 0;
  public maxRhythmCombo: number = 0;

  // Window thresholds (seconds) - dynamically set by difficulty
  public PERFECT_WINDOW = 0.100;
  public GREAT_WINDOW = 0.180;
  public GOOD_WINDOW = 0.250;
  public scrollSpeed = 310;

  constructor(difficulty: Difficulty = 'NORMAL') {
    this.setDifficulty(difficulty);
  }

  public getCurrentTrack(): TrackConfig {
    return TRACK_CONFIGS[this.difficulty];
  }

  public setDifficulty(d: Difficulty): void {
    this.difficulty = d;
    if (d === 'EASY') {
      this.PERFECT_WINDOW = 0.125;
      this.GREAT_WINDOW = 0.230;
      this.GOOD_WINDOW = 0.320;
      this.scrollSpeed = 260;
    } else if (d === 'NORMAL') {
      this.PERFECT_WINDOW = 0.100;
      this.GREAT_WINDOW = 0.180;
      this.GOOD_WINDOW = 0.250;
      this.scrollSpeed = 310;
    } else { // HARD
      this.PERFECT_WINDOW = 0.080;
      this.GREAT_WINDOW = 0.140;
      this.GOOD_WINDOW = 0.200;
      this.scrollSpeed = 380;
    }
    this.reset();
  }

  public reset(): void {
    this.notes = [];
    this.activeNotes = [];
    this.noteIdCounter = 0;
    this.perfectCount = 0;
    this.greatCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.penaltyCount = 0;
    this.rhythmCombo = 0;
    this.maxRhythmCombo = 0;

    this.buildChart();
  }

  private buildChart(): void {
    if (this.difficulty === 'EASY') {
      this.buildEasyChart();
    } else if (this.difficulty === 'NORMAL') {
      this.buildNormalChart();
    } else {
      this.buildHardChart();
    }
    this.activeNotes = [...this.notes];
  }

  // ===================== EASY CHART (BPM 118, 35s - Chorus Outro) =====================
  // Smooth retrowave cyber groove ending right after the chorus climax (35s).
  private buildEasyChart(): void {
    // Phrase 1 (0 ~ 8.1s): Warm-up & 1st Enter
    this.addNote('BURST', 2.03, 'PORT SCAN RUN', 1.9);
    this.addNote('SPACE', 4.07, 'FIREWALL BREAK');
    this.addNote('BURST', 5.08, 'ROUTING BYPASS', 1.6);
    this.addNote('SPACE', 7.12, 'DELIMITER');
    this.addNote('ENTER', 8.14, 'INJECT ROP CHAIN');

    // Phrase 2 (8.1 ~ 16.3s): Breach & Override
    this.addNote('BURST', 9.15, 'HEAP OVERFLOW', 2.2);
    this.addNote('SPACE', 11.69, 'ICE DISARM');
    this.addNote('BURST', 12.71, 'PROXY EXECUTE', 1.8);
    this.addNote('SPACE', 14.75, 'TOKEN SYNC');
    this.addNote('ENTER', 15.76, 'CORE PAYLOAD');

    // Phrase 3 (16.3 ~ 26.4s): Main Chorus Explosion & 1st Shift
    this.addNote('BURST', 16.78, 'QUANTUM CRACKER', 2.4);
    this.addNote('SPACE', 19.83, 'KEY SYNC');
    this.addNote('BURST', 20.85, 'BUFFER FLUSH', 1.8);
    this.addNote('SHIFT', 23.39, 'OVERCLOCK DRIVE');
    this.addNote('SPACE', 24.41, 'DELIM GAP');
    this.addNote('ENTER', 25.42, 'SECURITY OVERRIDE');

    // Phrase 4 (26.4 ~ 35.0s): Grand Chorus Finale Slam
    this.addNote('BURST', 26.44, 'FINAL RECURSION', 2.2);
    this.addNote('SHIFT', 28.98, 'SAFETY RELEASE');
    this.addNote('SPACE', 30.51, 'WARHEAD UNSEAL');
    this.addNote('BURST', 31.53, 'APEX PROTOCOL', 1.8);
    this.addNote('SHIFT', 33.56, 'FINAL KEYLOCK');
    this.addNote('ENTER', 34.50, '💥 GRAND CHORUS SLAM!'); // Perfect musical cut at 34.5s
  }

  // ===================== NORMAL CHART (BPM 134, 48s - Drop Climax) =====================
  // Upbeat Cyber Electro ending after the peak drop explosion (48s).
  private buildNormalChart(): void {
    // Phrase 1 (0 ~ 12.0s): Perimeter Infiltration
    this.addNote('BURST', 1.79, 'PORT SCAN RUN', 1.6);
    this.addNote('SHIFT', 2.69, 'CAPS LOCK VAR');
    this.addNote('SPACE', 3.58, 'DELIMITER');
    this.addNote('BURST', 4.48, 'FIREWALL PIERCE', 1.4);
    this.addNote('SPACE', 6.27, 'PROXY TOKEN');
    this.addNote('SPACE', 7.16, 'BEAT IMPACT'); // Beat kicks in at 7.16s!
    this.addNote('BURST', 8.06, 'ZERO-DAY STREAM', 1.6);
    this.addNote('SHIFT', 8.96, 'POINTER CAST');
    this.addNote('ENTER', 10.75, 'INJECT ROP CHAIN');

    // Phrase 2 (12.0 ~ 24.0s): ICE Penetration
    this.addNote('BURST', 11.64, 'HEAP SPRAY', 1.8);
    this.addNote('SHIFT', 12.54, 'UPPER TOKEN');
    this.addNote('SPACE', 14.33, 'PARAM GAP');
    this.addNote('BURST', 15.22, 'ICE CRUSHER', 1.6);
    this.addNote('SHIFT', 16.12, 'VTABLE HOOK');
    this.addNote('SPACE', 17.91, 'CALL GAP');
    this.addNote('SPACE', 18.81, 'ARGS SEPARATOR');
    this.addNote('BURST', 19.70, 'CANARY BYPASS', 1.6);
    this.addNote('SHIFT', 20.60, 'REG_EAX');
    this.addNote('ENTER', 22.39, 'CORE PAYLOAD');

    // Phrase 3 (24.0 ~ 36.0s): Build-up to Drop
    this.addNote('BURST', 23.28, 'QUANTUM MATRIX', 1.8);
    this.addNote('SHIFT', 24.18, 'FREQ BOOST');
    this.addNote('SPACE', 25.97, 'BLOCK GAP');
    this.addNote('BURST', 26.87, 'BUFFER OVERCLOCK', 1.6);
    this.addNote('SHIFT', 27.76, 'HEX PREFIX');
    this.addNote('SPACE', 29.55, 'TOKEN GAP');
    this.addNote('SHIFT', 30.45, 'VOLTAGE MAX');
    this.addNote('BURST', 31.34, 'BUILDUP STREAM', 1.8);
    this.addNote('SHIFT', 32.24, 'PRESSURE HIGH');
    this.addNote('SPACE', 34.03, 'PRE-DROP SILENCE');
    this.addNote('ENTER', 35.82, '🔥 DROP INITIATION SLAM!'); // 36s Drop!

    // Phrase 4 (36.0 ~ 48.0s): Massive Drop Climax Finale
    this.addNote('BURST', 36.72, 'NEURAL OVERDRIVE', 2.0);
    this.addNote('SHIFT', 37.61, 'ROOT ELEVATE');
    this.addNote('SPACE', 39.40, 'WARHEAD GAP');
    this.addNote('BURST', 40.30, 'CIPHER DECIMATE', 1.8);
    this.addNote('SHIFT', 41.19, 'FINAL SYMBOL');
    this.addNote('SPACE', 42.99, 'TRIGGER RELEASE');
    this.addNote('BURST', 43.88, 'APEX DESTRUCTION', 1.8);
    this.addNote('SHIFT', 44.78, 'ARM MISSILE');
    this.addNote('SPACE', 46.57, 'FINAL LOCK');
    this.addNote('ENTER', 47.50, '💥 APOCALYPTIC DROP SLAM!'); // Perfect musical cut at 47.5s
  }

  // ===================== HARD CHART (BPM 165, 56s - Neurofunk Drop Finale) =====================
  // Expert Hacker mode: 56-second high-density breakcore ending with the peak drop climax (56s).
  private buildHardChart(): void {
    // Section 1 (0 ~ 13.0s): Neurofunk Infiltration
    this.addNote('BURST', 1.45, 'KEYWORD INJECT', 1.3);
    this.addNote('SHIFT', 2.00, 'UPPER_A');
    this.addNote('SHIFT', 2.54, 'UPPER_B');
    this.addNote('SPACE', 3.09, 'GAP 1');
    this.addNote('BURST', 3.45, 'VARIABLE ASSIGN', 1.2);
    this.addNote('SHIFT', 4.00, 'DOLLAR_SYM');
    this.addNote('SPACE', 4.90, 'GAP 2');
    this.addNote('BURST', 5.27, 'METHOD CALL', 1.2);
    this.addNote('SHIFT', 5.82, 'BRACKET_OPEN');
    this.addNote('SPACE', 6.90, 'DELIM 1');
    this.addNote('SPACE', 7.45, 'DELIM 2');
    this.addNote('BURST', 7.82, 'BYTECODE INJECT', 1.4);
    this.addNote('SHIFT', 8.54, 'REG_EAX');
    this.addNote('SHIFT', 9.27, 'REG_EBX');
    this.addNote('SPACE', 10.00, 'EXECUTE GAP');
    this.addNote('ENTER', 10.91, '🔥 1ST ROP SLAM!');

    // Section 2 (13.0 ~ 26.0s): 1st Drop Wave
    this.addNote('BURST', 11.82, 'ZERO-DAY STREAM', 1.5);
    this.addNote('SHIFT', 12.36, 'POINTER_CAST');
    this.addNote('SHIFT', 13.09, 'DEREF_AMP');
    this.addNote('SPACE', 13.82, 'SEMICOLON');
    this.addNote('BURST', 14.18, 'STACK OVERWRITE', 1.4);
    this.addNote('SHIFT', 14.90, 'CANARY_BYPASS');
    this.addNote('SPACE', 16.00, 'PAYLOAD GAP');
    this.addNote('BURST', 16.54, 'HEAP EXPANSION', 1.5);
    this.addNote('SHIFT', 17.27, 'STRUCT_TYPEDEF');
    this.addNote('SHIFT', 18.00, 'SIZEOF_CONST');
    this.addNote('SPACE', 18.90, 'CALL GAP');
    this.addNote('BURST', 19.45, 'VTABLE HIJACK', 1.2);
    this.addNote('SHIFT', 20.00, 'OFFSET_HOOK');
    this.addNote('SPACE', 21.09, 'CONFIRM GAP');
    this.addNote('ENTER', 21.82, '⚡ CORE DEVASTATION SLAM!');

    // Section 3 (26.0 ~ 40.0s): Quantum Buildup & Drop
    this.addNote('BURST', 23.27, 'QUANTUM ENTANGLE', 1.6);
    this.addNote('SHIFT', 24.00, 'LAMBDA_FN');
    this.addNote('SHIFT', 24.72, 'PIPE_OPERATOR');
    this.addNote('SPACE', 25.45, 'EXPR GAP');
    this.addNote('BURST', 26.18, 'LATTICE ANNEAL', 1.4);
    this.addNote('SHIFT', 26.90, 'TEMPLATE_ARG');
    this.addNote('SPACE', 28.00, 'TOKEN GAP');
    this.addNote('BURST', 28.72, 'REGISTER INVERT', 1.5);
    this.addNote('SHIFT', 29.45, 'BITWISE_XOR');
    this.addNote('SHIFT', 30.18, 'MASK_HEX');
    this.addNote('SPACE', 31.27, 'BLOCK GAP');
    this.addNote('BURST', 32.00, 'NEURAL OVERCLOCK', 1.4);
    this.addNote('SHIFT', 32.72, 'MAX_VOLTAGE');
    this.addNote('SPACE', 33.45, 'TRIGGER CONFIRM');
    this.addNote('ENTER', 34.50, '💥 QUANTUM OVERRIDE SLAM!');

    // Section 4 (40.0 ~ 56.0s): Apocalyptic Peak Climax Finale
    this.addNote('BURST', 36.36, 'APOCALYPSE PROTOCOL', 1.8);
    this.addNote('SHIFT', 37.45, 'ROOT_AUTH_TOKEN');
    this.addNote('SHIFT', 38.18, 'ESCAPE_SEQ');
    this.addNote('SPACE', 39.27, 'COMMAND GAP');
    this.addNote('BURST', 40.00, 'PAYLOAD COMPRESS', 1.6);
    this.addNote('SHIFT', 41.09, 'MACRO_DEFINE');
    this.addNote('SPACE', 42.54, 'INTERMEDIATE TRIGGER');
    this.addNote('BURST', 43.63, 'KILL SWITCH DEPLOY', 1.8);
    this.addNote('SHIFT', 44.72, 'NULL_PTR_UNWRAP');
    this.addNote('SHIFT', 45.45, 'FORCE_OVERRIDE');
    this.addNote('SPACE', 46.90, 'LAUNCH CONFIRM 1');
    this.addNote('BURST', 48.00, 'WARHEAD DETONATE', 1.8);
    this.addNote('SHIFT', 49.09, 'SYSTEM CORE UNLOCK');
    this.addNote('SHIFT', 50.18, 'FINAL OVERRIDE');
    this.addNote('SPACE', 52.00, 'ULTIMATE TRIGGER');
    this.addNote('SHIFT', 53.45, 'FINAL ARM');
    this.addNote('ENTER', 55.40, '💥 APOCALYPTIC ROOT SLAM!'); // Musical drop cutoff at 55.4s
  }

  private addNote(type: NoteType, targetTime: number, label: string, duration?: number): void {
    const lane: LaneType = type === 'SHIFT' ? 'SHIFT' : 'MAIN';
    this.notes.push({
      id: ++this.noteIdCounter,
      type,
      lane,
      targetTime,
      duration,
      label,
      hit: false,
      judged: false
    });
  }

  public getNotes(): RhythmNote[] {
    return this.notes;
  }

  // Returns current active phase if in BURST
  public getCurrentPhase(currentTime: number): { type: 'BURST' | 'NORMAL'; note?: RhythmNote } {
    for (const note of this.notes) {
      if (note.type === 'BURST' && note.duration) {
        if (currentTime >= note.targetTime && currentTime <= note.targetTime + note.duration) {
          return { type: 'BURST', note };
        }
      }
    }
    return { type: 'NORMAL' };
  }

  // Next upcoming precision note and time difference (across both lanes)
  public getNextApproachingNote(currentTime: number): { note: RhythmNote; secondsAway: number } | null {
    let nearest: RhythmNote | null = null;
    let minTimeAway = Infinity;

    for (const note of this.activeNotes) {
      if (note.judged || note.type === 'BURST') continue;
      const timeAway = note.targetTime - currentTime;
      if (timeAway >= -this.GOOD_WINDOW && timeAway < minTimeAway) {
        minTimeAway = timeAway;
        nearest = note;
      }
    }

    if (nearest) {
      return { note: nearest, secondsAway: minTimeAway };
    }
    return null;
  }

  // Check for auto-misses when target notes pass beyond the good window
  public updateTime(currentTime: number): JudgmentFeedback[] {
    const feedbackList: JudgmentFeedback[] = [];

    for (const note of this.activeNotes) {
      if (note.judged) continue;

      if (note.type === 'SPACE' || note.type === 'SHIFT' || note.type === 'ENTER') {
        // Passed beyond late good window
        if (currentTime > note.targetTime + this.GOOD_WINDOW) {
          note.judged = true;
          note.missed = true;
          this.missCount++;
          this.rhythmCombo = 0;
          const lastNote = this.notes[this.notes.length - 1];
          const isLastNote = lastNote && note.id === lastNote.id;
          feedbackList.push({
            type: 'MISS',
            scoreChange: -600,
            noteLabel: note.label,
            noteType: note.type,
            message: `MISSED ${note.type}!`,
            isLastNote
          });
        }
      }
    }

    return feedbackList;
  }

  // Handle a user key press with full dual-lane independence & burst concurrency
  public handleKeyInput(
    currentTime: number,
    key: string
  ): JudgmentFeedback | null {
    const isEnter = key === 'Enter';
    const isSpace = key === ' ';
    const isShift = key === 'Shift';

    // 1. Shift Key Pressed -> check candidate strictly on SHIFT lane!
    if (isShift) {
      let candidateShiftNote: RhythmNote | null = null;
      let minShiftDiff = Infinity;

      for (const note of this.activeNotes) {
        if (note.judged || note.lane !== 'SHIFT') continue;
        const diff = Math.abs(currentTime - note.targetTime);
        if (diff <= this.GOOD_WINDOW && diff < minShiftDiff) {
          minShiftDiff = diff;
          candidateShiftNote = note;
        }
      }

      if (candidateShiftNote) {
        candidateShiftNote.hit = true;
        candidateShiftNote.judged = true;

        let judgment: JudgmentType = 'GOOD';
        let scoreChange = 400;

        if (minShiftDiff <= this.PERFECT_WINDOW) {
          judgment = 'PERFECT';
          scoreChange = 1500;
          this.perfectCount++;
        } else if (minShiftDiff <= this.GREAT_WINDOW) {
          judgment = 'GREAT';
          scoreChange = 900;
          this.greatCount++;
        } else {
          this.goodCount++;
        }

        this.rhythmCombo++;
        if (this.rhythmCombo > this.maxRhythmCombo) {
          this.maxRhythmCombo = this.rhythmCombo;
        }

        return {
          type: judgment,
          scoreChange,
          noteLabel: candidateShiftNote.label,
          noteType: 'SHIFT',
          message: `${judgment} SHIFT!!`
        };
      } else {
        // Shift pressed outside any active Shift window
        this.penaltyCount++;
        this.rhythmCombo = 0;
        return {
          type: 'PENALTY',
          scoreChange: -300,
          noteLabel: 'SHIFT',
          noteType: 'SHIFT',
          message: 'SHIFT MISFIRE (-300)'
        };
      }
    }

    // 2. Space or Enter Pressed -> check candidate strictly on MAIN lane!
    if (isSpace || isEnter) {
      let candidateMainNote: RhythmNote | null = null;
      let minMainDiff = Infinity;

      for (const note of this.activeNotes) {
        if (note.judged || note.lane !== 'MAIN' || note.type === 'BURST') continue;
        const diff = Math.abs(currentTime - note.targetTime);
        if (diff <= this.GOOD_WINDOW && diff < minMainDiff) {
          minMainDiff = diff;
          candidateMainNote = note;
        }
      }

      if (candidateMainNote) {
        const expectedType = candidateMainNote.type;
        const matched = (expectedType === 'SPACE' && isSpace) || (expectedType === 'ENTER' && isEnter);

        if (matched) {
          candidateMainNote.hit = true;
          candidateMainNote.judged = true;

          let judgment: JudgmentType = 'GOOD';
          let scoreChange = 400;

          if (minMainDiff <= this.PERFECT_WINDOW) {
            judgment = 'PERFECT';
            scoreChange = expectedType === 'ENTER' ? 3000 : 1500;
            this.perfectCount++;
          } else if (minMainDiff <= this.GREAT_WINDOW) {
            judgment = 'GREAT';
            scoreChange = expectedType === 'ENTER' ? 2000 : 900;
            this.greatCount++;
          } else {
            scoreChange = expectedType === 'ENTER' ? 1000 : 400;
            this.goodCount++;
          }

          this.rhythmCombo++;
          if (this.rhythmCombo > this.maxRhythmCombo) {
            this.maxRhythmCombo = this.rhythmCombo;
          }

          const lastNote = this.notes[this.notes.length - 1];
          const isLastNote = lastNote && candidateMainNote.id === lastNote.id;

          return {
            type: judgment,
            scoreChange,
            noteLabel: candidateMainNote.label,
            noteType: expectedType,
            message: expectedType === 'ENTER' && isLastNote ? '💥 FINAL ACCESS PAYLOAD EXECUTED!!' : `${judgment}!!`,
            isLastNote
          };
        } else {
          // Wrong key on MAIN lane! (e.g. pressed Space when Enter was needed, or vice-versa)
          candidateMainNote.judged = true;
          candidateMainNote.missed = true;
          this.penaltyCount++;
          this.rhythmCombo = 0;
          const lastNote = this.notes[this.notes.length - 1];
          const isLastNote = lastNote && candidateMainNote.id === lastNote.id;
          return {
            type: 'PENALTY',
            scoreChange: -800,
            noteLabel: candidateMainNote.label,
            noteType: expectedType,
            message: `WRONG KEY! NEEDED ${expectedType}`,
            isLastNote
          };
        }
      } else {
        // Space or Enter pressed outside any valid window on MAIN lane
        this.penaltyCount++;
        this.rhythmCombo = 0;
        return {
          type: 'PENALTY',
          scoreChange: -400,
          noteLabel: isSpace ? 'SPACE' : 'ENTER',
          message: `FALSE ${isSpace ? 'SPACE' : 'ENTER'} (-400)`
        };
      }
    }

    // 3. Regular typing keys (letters, digits, etc.):
    // Seamlessly pass through to typing engine without rhythm penalty.
    return null;
  }

  // Calculate rhythm synchronization rate (0% ~ 100%)
  public getSyncRate(): number {
    const totalPrecisionNotes = this.notes.filter(n => n.type === 'SPACE' || n.type === 'SHIFT' || n.type === 'ENTER').length;
    if (totalPrecisionNotes === 0) return 100;

    const positiveScore = this.perfectCount * 1.0 + this.greatCount * 0.75 + this.goodCount * 0.4;
    const maxScore = totalPrecisionNotes;
    const penaltyReduction = (this.penaltyCount * 0.05) + (this.missCount * 0.06);

    const rawRate = ((positiveScore / maxScore) - penaltyReduction) * 100;
    return Math.max(0, Math.min(100, Math.round(rawRate)));
  }
}
