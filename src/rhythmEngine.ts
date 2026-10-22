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
}

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
      this.scrollSpeed = 370;
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

  // ===================== EASY CHART =====================
  // Natural typing cadence (Word Burst -> Space -> Word Burst -> Enter)
  // Shift is minimal (only 2 times late in the song) so beginner can grasp the dual lane gently.
  private buildEasyChart(): void {
    // Phrase 1 (0 ~ 7.5s): Warm-up & 1st Enter
    this.addNote('BURST', 2.00, 'PORT SCAN RUN', 2.2);
    this.addNote('SPACE', 4.80, 'FIREWALL BREAK');
    this.addNote('BURST', 5.30, 'ROUTING BYPASS', 1.4);
    this.addNote('ENTER', 7.50, 'INJECT ROP CHAIN'); // Bar 5

    // Phrase 2 (7.5 ~ 15.0s): Breach & Enter
    this.addNote('BURST', 8.40, 'HEAP OVERFLOW', 2.4);
    this.addNote('SPACE', 11.50, 'ICE DISARM');
    this.addNote('BURST', 12.20, 'PROXY EXECUTE', 1.6);
    this.addNote('ENTER', 15.00, 'CORE PAYLOAD'); // Bar 9

    // Phrase 3 (15.0 ~ 22.5s): Decrypt & Override (Introduces 1st Shift)
    this.addNote('BURST', 15.90, 'QUANTUM CRACKER', 2.3);
    this.addNote('SPACE', 18.90, 'KEY SYNC');
    this.addNote('BURST', 19.60, 'BUFFER FLUSH', 1.4);
    this.addNote('SHIFT', 21.80, 'OVERCLOCK DRIVE');
    this.addNote('ENTER', 22.50, 'SECURITY OVERRIDE'); // Bar 13

    // Phrase 4 (22.5 ~ 30.0s): Climax (2nd Shift into Final Slam)
    this.addNote('BURST', 23.40, 'FINAL RECURSION', 2.4);
    this.addNote('SPACE', 26.60, 'WARHEAD UNSEAL');
    this.addNote('BURST', 27.20, 'CRITICAL PROTOCOL', 1.3);
    this.addNote('SHIFT', 28.90, 'SAFETY RELEASE');
    this.addNote('ENTER', 29.53, '💥 GRAND SLAM SHUTDOWN!'); // Bar 16
  }

  // ===================== NORMAL CHART =====================
  // Balanced typing rhythm: Bursts separated by Spaces, with 8 Shifts on the Shift sublane.
  // Several Shifts occur concurrently with Bursts to introduce parallel two-hand coordination!
  private buildNormalChart(): void {
    // Phrase 1 (0 ~ 7.5s): Perimeter Breach
    this.addNote('BURST', 2.00, 'PORT SCAN RUN', 1.8);
    this.addNote('SHIFT', 3.10, 'CAPS LOCK VAR');      // Parallel in Burst!
    this.addNote('SPACE', 4.40, 'DELIMITER');
    this.addNote('BURST', 4.90, 'FIREWALL PIERCE', 1.4);
    this.addNote('SPACE', 6.80, 'PROXY TOKEN');
    this.addNote('ENTER', 7.50, 'INJECT ROP CHAIN');    // Bar 5 Downbeat

    // Phrase 2 (7.5 ~ 15.0s): ICE Penetration
    this.addNote('BURST', 8.20, 'HEAP SPRAY', 1.8);
    this.addNote('SHIFT', 9.30, 'POINTER CAST');        // Parallel in Burst!
    this.addNote('SPACE', 10.60, 'PARAM GAP');
    this.addNote('BURST', 11.10, 'ICE CRUSHER', 1.5);
    this.addNote('SHIFT', 12.10, 'UPPER TOKEN');        // Parallel in Burst!
    this.addNote('SPACE', 13.20, 'CALL GAP');
    this.addNote('SPACE', 14.00, 'ARGS SEPARATOR');     // Double Space!
    this.addNote('ENTER', 15.00, 'CORE PAYLOAD');       // Bar 9 Downbeat

    // Phrase 3 (15.0 ~ 22.5s): Neural Overdrive
    this.addNote('BURST', 15.80, 'QUANTUM MATRIX', 1.8);
    this.addNote('SHIFT', 16.80, 'FREQ BOOST');         // Parallel in Burst!
    this.addNote('SPACE', 18.20, 'BLOCK GAP');
    this.addNote('BURST', 18.70, 'BUFFER OVERCLOCK', 1.5);
    this.addNote('SHIFT', 19.60, 'HEX PREFIX');         // Parallel in Burst!
    this.addNote('SPACE', 20.80, 'TOKEN GAP');
    this.addNote('SHIFT', 21.70, 'VOLTAGE MAX');
    this.addNote('ENTER', 22.50, 'SECURITY OVERRIDE');  // Bar 13 Downbeat

    // Phrase 4 (22.5 ~ 30.0s): Grand Climax
    this.addNote('BURST', 23.20, 'NEURAL HIJACK', 1.8);
    this.addNote('SHIFT', 24.30, 'ROOT ELEVATE');       // Parallel in Burst!
    this.addNote('SPACE', 25.60, 'WARHEAD GAP');
    this.addNote('BURST', 26.10, 'CIPHER DECIMATE', 1.4);
    this.addNote('SHIFT', 27.00, 'FINAL SYMBOL');       // Parallel in Burst!
    this.addNote('SPACE', 28.10, 'TRIGGER RELEASE');
    this.addNote('SHIFT', 28.80, 'ARM MISSILE');
    this.addNote('ENTER', 29.53, '💥 GRAND SLAM SHUTDOWN!'); // Bar 16 Climax
  }

  // ===================== HARD CHART =====================
  // Expert Hacker mode: High-density Burst & Space combinations, occasional heavy Enters,
  // and frequent Shifts (16 total) flowing on the Shift sublane concurrently with bursts!
  private buildHardChart(): void {
    // Phrase 1 (0 ~ 7.5s): Blitzkrieg Breach
    this.addNote('BURST', 2.00, 'KEYWORD INJECT', 1.4);
    this.addNote('SHIFT', 2.60, 'UPPER_A');            // Parallel in Burst!
    this.addNote('SHIFT', 3.10, 'UPPER_B');            // Parallel in Burst!
    this.addNote('SPACE', 3.70, 'GAP 1');
    this.addNote('BURST', 4.00, 'VARIABLE ASSIGN', 1.1);
    this.addNote('SHIFT', 4.60, 'DOLLAR_SYM');         // Parallel in Burst!
    this.addNote('SPACE', 5.40, 'GAP 2');
    this.addNote('BURST', 5.70, 'METHOD CALL', 1.0);
    this.addNote('SHIFT', 6.20, 'BRACKET_OPEN');       // Parallel in Burst!
    this.addNote('SPACE', 7.00, 'GAP 3');
    this.addNote('ENTER', 7.50, 'ROP CHAIN SLAM!');    // Bar 5 Downbeat

    // Phrase 2 (7.5 ~ 15.0s): Memory Devastation
    this.addNote('BURST', 8.10, 'ZERO-DAY STREAM', 1.4);
    this.addNote('SHIFT', 8.60, 'POINTER_CAST');       // Parallel in Burst!
    this.addNote('SHIFT', 9.20, 'DEREF_AMP');          // Parallel in Burst!
    this.addNote('SPACE', 9.80, 'SEMICOLON GAP');
    this.addNote('BURST', 10.20, 'STACK OVERWRITE', 1.2);
    this.addNote('SHIFT', 10.80, 'REG_EAX');           // Parallel in Burst!
    this.addNote('SPACE', 11.70, 'DELIM 1');
    this.addNote('SPACE', 12.20, 'DELIM 2');
    this.addNote('BURST', 12.50, 'HEAP EXPANSION', 1.4);
    this.addNote('SHIFT', 13.00, 'STRUCT_TYPEDEF');    // Parallel in Burst!
    this.addNote('SHIFT', 13.60, 'SIZEOF_CONST');      // Parallel in Burst!
    this.addNote('SPACE', 14.30, 'FINAL GAP');
    this.addNote('ENTER', 15.00, 'CORE PAYLOAD SLAM!'); // Bar 9 Downbeat

    // Phrase 3 (15.0 ~ 22.5s): Neural Quantum Override
    this.addNote('BURST', 15.60, 'QUANTUM ENTANGLE', 1.4);
    this.addNote('SHIFT', 16.10, 'LAMBDA_FN');         // Parallel in Burst!
    this.addNote('SHIFT', 16.70, 'PIPE_OPERATOR');      // Parallel in Burst!
    this.addNote('SPACE', 17.30, 'EXPR GAP');
    this.addNote('BURST', 17.70, 'LATTICE ANNEAL', 1.2);
    this.addNote('SHIFT', 18.30, 'TEMPLATE_ARG');      // Parallel in Burst!
    this.addNote('SPACE', 19.20, 'ARG GAP');
    this.addNote('BURST', 19.60, 'REGISTER INVERT', 1.4);
    this.addNote('SHIFT', 20.10, 'BITWISE_XOR');       // Parallel in Burst!
    this.addNote('SHIFT', 20.70, 'MASK_HEX');          // Parallel in Burst!
    this.addNote('SPACE', 21.40, 'STMT GAP');
    this.addNote('SPACE', 21.90, 'BLOCK END');
    this.addNote('ENTER', 22.50, 'SECURITY OVERRIDE SLAM!'); // Bar 13 Downbeat

    // Phrase 4 (22.5 ~ 30.0s): Grand Apocalyptic Climax
    this.addNote('BURST', 23.10, 'APOCALYPSE PROTOCOL', 1.5);
    this.addNote('SHIFT', 23.70, 'ROOT_AUTH_TOKEN');   // Parallel in Burst!
    this.addNote('SHIFT', 24.30, 'ESCAPE_SEQ');        // Parallel in Burst!
    this.addNote('SPACE', 24.90, 'COMMAND GAP');
    this.addNote('BURST', 25.30, 'PAYLOAD COMPRESS', 1.1);
    this.addNote('SHIFT', 25.90, 'MACRO_DEFINE');      // Parallel in Burst!
    this.addNote('ENTER', 26.80, 'INTERMEDIATE TRIGGER'); // Occasional mid Enter!
    this.addNote('BURST', 27.20, 'KILL SWITCH DEPLOY', 1.4);
    this.addNote('SHIFT', 27.70, 'NULL_PTR_UNWRAP');   // Parallel in Burst!
    this.addNote('SHIFT', 28.30, 'FORCE_OVERRIDE');    // Parallel in Burst!
    this.addNote('SPACE', 29.00, 'LAUNCH CONFIRM');
    this.addNote('ENTER', 29.53, '💥 APOCALYPTIC ROOT SLAM!'); // Climax Grand Finale!!
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
          feedbackList.push({
            type: 'MISS',
            scoreChange: -600,
            noteLabel: note.label,
            noteType: note.type,
            message: `MISSED ${note.type}!`
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

          return {
            type: judgment,
            scoreChange,
            noteLabel: candidateMainNote.label,
            noteType: expectedType,
            message: `${judgment}!!`
          };
        } else {
          // Wrong key on MAIN lane! (e.g. pressed Space when Enter was needed, or vice-versa)
          candidateMainNote.judged = true;
          candidateMainNote.missed = true;
          this.penaltyCount++;
          this.rhythmCombo = 0;
          return {
            type: 'PENALTY',
            scoreChange: -800,
            noteLabel: candidateMainNote.label,
            noteType: expectedType,
            message: `WRONG KEY! NEEDED ${expectedType}`
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
