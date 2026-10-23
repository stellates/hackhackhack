import './style.css';
import { sound } from './sound';
import { HACKER_CODE_SNIPPETS, TERMINAL_LOGS, DRAMATIC_EVENTS, generateHexDumpLine } from './hackerData';
import { evaluateTyping, TypingMetrics } from './evaluator';
import { RhythmEngine, JudgmentFeedback, Difficulty, TRACK_CONFIGS } from './rhythmEngine';
import { CyberRadar } from './radar';
import { downloadReportCard, shareReportCardToX } from './canvasExporter';

enum GameState {
  START,
  COUNTDOWN,
  PLAYING,
  FINISHED
}

class HollywoodHackerGame {
  private state: GameState = GameState.START;
  private selectedDifficulty: Difficulty = 'NORMAL';
  private durationTotal: number = 30; // 30 seconds
  private timeLeft: number = 30;
  private timerIntervalId: number | null = null;
  private animFrameId: number | null = null;
  private countdownTimerId: number | null = null;
  private lastTimestamp: number = 0;

  // Rhythm Engine
  private rhythmEngine: RhythmEngine = new RhythmEngine('NORMAL');
  private noteElements: Map<number, HTMLElement> = new Map();

  // Typing & Performance tracking
  private totalKeystrokes: number = 0;
  private enterHits: number = 0;
  private currentCombo: number = 0;
  private maxCombo: number = 0;
  private comboTimeoutId: number | null = null;
  private keyTimestamps: number[] = [];
  private peakKps: number = 0;
  private currentKps: number = 0;

  // Dramatic Pause detection
  private lastKeyTime: number = 0;
  private dramaticPauses: number = 0;
  private wasHighSpeedBeforePause: boolean = false;

  // Code streaming state
  private snippetIndex: number = 0;
  private snippetCharIndex: number = 0;

  // Dramatic events tracking
  private triggeredEvents: Set<number> = new Set();

  // Radar component
  private radar: CyberRadar | null = null;

  // Cached Result Metrics
  private currentMetrics: TypingMetrics | null = null;

  // DOM Elements
  private timerDisplay!: HTMLElement;
  private timerBox!: HTMLElement;
  private progressBar!: HTMLElement;
  private progressText!: HTMLElement;
  private syncVal!: HTMLElement;
  private kpsValue!: HTMLElement;
  private comboValue!: HTMLElement;
  private keysCount!: HTMLElement;
  private penaltyDisplay!: HTMLElement;
  private headerDiffBadge!: HTMLElement;
  private headerTrackInfo!: HTMLElement;
  private resultDiffBadge!: HTMLElement;
  private diffButtons: HTMLButtonElement[] = [];
  private codeStream!: HTMLElement;
  private terminalScrollArea!: HTMLElement;
  private hexStream!: HTMLElement;
  private logsStream!: HTMLElement;
  private eventBanner!: HTMLElement;
  private eventTitle!: HTMLElement;
  private eventSub!: HTMLElement;
  private countdownOverlay!: HTMLElement;
  private countdownText!: HTMLElement;
  private targetZoneShift!: HTMLElement;
  private targetZoneMain!: HTMLElement;
  private rhythmNotesShift!: HTMLElement;
  private rhythmNotesMain!: HTMLElement;
  private rhythmJudgmentPop!: HTMLElement;
  private phaseBanner!: HTMLElement;
  private phaseIcon!: HTMLElement;
  private phaseText!: HTMLElement;
  private startModal!: HTMLElement;
  private resultModal!: HTMLElement;
  private btnSoundToggle!: HTMLButtonElement;
  private btnStartGame!: HTMLButtonElement;
  private btnDownloadPng!: HTMLButtonElement;
  private btnRestart!: HTMLButtonElement;
  private btnModalBack!: HTMLButtonElement;
  private btnShareCopy!: HTMLButtonElement;
  private btnXShare!: HTMLButtonElement;
  private toastNotification!: HTMLElement;
  private toastTimeoutId: number | null = null;
  private mobileHackBtn!: HTMLButtonElement;
  private mobileSpaceBtn!: HTMLButtonElement;
  private mobileShiftBtn!: HTMLButtonElement;
  private mobileEnterBtn!: HTMLButtonElement;
  private mainTerminal!: HTMLElement;

  constructor() {
    this.bindDom();
    this.initRadar();
    this.setupEventListeners();
    this.fillInitialBackgroundStreams();
    this.preloadAllTracks();
    this.setDifficulty('NORMAL');
  }

  private preloadAllTracks(): void {
    Object.values(TRACK_CONFIGS).forEach((track) => {
      sound.preloadTrack(track.diff, track.primaryFile);
    });
  }

  private bindDom(): void {
    this.timerDisplay = document.getElementById('timer-display')!;
    this.timerBox = document.getElementById('timer-box')!;
    this.progressBar = document.getElementById('progress-bar')!;
    this.progressText = document.getElementById('progress-text')!;
    this.syncVal = document.getElementById('sync-val')!;
    this.kpsValue = document.getElementById('kps-value')!;
    this.comboValue = document.getElementById('combo-value')!;
    this.keysCount = document.getElementById('keys-count')!;
    this.penaltyDisplay = document.getElementById('penalty-display')!;
    this.headerDiffBadge = document.getElementById('header-diff-badge')!;
    this.headerTrackInfo = document.getElementById('header-track-info')!;
    this.resultDiffBadge = document.getElementById('result-diff-badge')!;
    this.diffButtons = Array.from(document.querySelectorAll('.diff-btn')) as HTMLButtonElement[];
    this.codeStream = document.getElementById('code-stream')!;
    this.terminalScrollArea = document.getElementById('terminal-scroll-area')!;
    this.hexStream = document.getElementById('hex-stream')!;
    this.logsStream = document.getElementById('logs-stream')!;
    this.eventBanner = document.getElementById('event-banner')!;
    this.eventTitle = document.getElementById('event-title')!;
    this.eventSub = document.getElementById('event-sub')!;
    this.countdownOverlay = document.getElementById('countdown-overlay')!;
    this.countdownText = document.getElementById('countdown-text')!;
    this.targetZoneShift = document.getElementById('target-zone-shift')!;
    this.targetZoneMain = document.getElementById('target-zone-main')!;
    this.rhythmNotesShift = document.getElementById('rhythm-notes-shift')!;
    this.rhythmNotesMain = document.getElementById('rhythm-notes-main')!;
    this.rhythmJudgmentPop = document.getElementById('rhythm-judgment-pop')!;
    this.phaseBanner = document.getElementById('phase-banner')!;
    this.phaseIcon = document.getElementById('phase-icon')!;
    this.phaseText = document.getElementById('phase-text')!;
    this.startModal = document.getElementById('start-modal')!;
    this.resultModal = document.getElementById('result-modal')!;
    this.btnSoundToggle = document.getElementById('btn-sound-toggle') as HTMLButtonElement;
    this.btnStartGame = document.getElementById('btn-start-game') as HTMLButtonElement;
    this.btnDownloadPng = document.getElementById('btn-download-png') as HTMLButtonElement;
    this.btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
    this.btnModalBack = document.getElementById('btn-modal-back') as HTMLButtonElement;
    this.btnShareCopy = document.getElementById('btn-share-copy') as HTMLButtonElement;
    this.btnXShare = document.getElementById('btn-x-share') as HTMLButtonElement;
    this.toastNotification = document.getElementById('toast-notification')!;
    this.mobileHackBtn = document.getElementById('mobile-hack-btn') as HTMLButtonElement;
    this.mobileSpaceBtn = document.getElementById('mobile-space-btn') as HTMLButtonElement;
    this.mobileShiftBtn = document.getElementById('mobile-shift-btn') as HTMLButtonElement;
    this.mobileEnterBtn = document.getElementById('mobile-enter-btn') as HTMLButtonElement;
    this.mainTerminal = document.getElementById('main-terminal')!;
  }

  private initRadar(): void {
    const radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement;
    if (radarCanvas) {
      this.radar = new CyberRadar(radarCanvas);
      this.radar.start();
    }
  }

  private fillInitialBackgroundStreams(): void {
    for (let i = 0; i < 5; i++) {
      this.addHexLine();
    }
    this.addLogLine("[SYS] Target connected: MAINFRAME::VAULT-07");
    this.addLogLine("[BGM] Procedural synth ready (BPM 132)");
    this.addLogLine("[RDY] Press START to begin 3-second neural countdown...");
  }

  private setupEventListeners(): void {
    // Sound & BGM toggle
    this.btnSoundToggle.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      this.btnSoundToggle.textContent = isMuted ? '🔇 BGM & SFX: OFF' : '🔊 BGM & SFX: ON';
    });

    // Difficulty buttons
    this.diffButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        const diff = btn.dataset.diff as Difficulty;
        if (diff) {
          this.setDifficulty(diff);
          sound.playLogBeep();
        }
      });
    });

    // Start Button
    this.btnStartGame.addEventListener('click', () => {
      sound.init();
      this.startCountdown();
    });

    // Global Key Listener
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent browser default scrolling for space and tab during game
      if (this.state === GameState.PLAYING) {
        if (e.key === ' ' || e.key === 'Tab') {
          e.preventDefault();
        }
      }

      if (this.state === GameState.START) {
        sound.init();
        this.startCountdown();
        return;
      }

      if (this.state === GameState.PLAYING) {
        this.handleKeystroke(e.key);
      }
    });

    // Mobile buttons
    this.mobileHackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleInputFromUi('a');
    });

    this.mobileSpaceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleInputFromUi(' ');
    });

    this.mobileShiftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleInputFromUi('Shift');
    });

    this.mobileEnterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleInputFromUi('Enter');
    });

    // Touch tap on main terminal area for mobile furious tapping
    this.mainTerminal.addEventListener('touchstart', (e) => {
      if (this.state === GameState.PLAYING) {
        e.preventDefault();
        sound.init();
        this.handleKeystroke('a');
      }
    }, { passive: false });

    // Download PNG
    this.btnDownloadPng.addEventListener('click', () => {
      if (this.currentMetrics) {
        sound.init();
        sound.playLogBeep();
        downloadReportCard(this.currentMetrics);
        this.showToast('📥 認定証PNG画像をダウンロードしました！');
      }
    });

    // Restart Button (Same Difficulty)
    this.btnRestart.addEventListener('click', () => {
      this.resetGame();
      this.startCountdown();
    });

    // Top-Left Back Button (Return to Mission/Difficulty Selection)
    this.btnModalBack.addEventListener('click', () => {
      sound.init();
      sound.playLogBeep();
      this.resetGame();
      this.resultModal.style.display = 'none';
      this.startModal.style.display = 'flex';
    });

    // Share / Copy button (Result text to clipboard)
    this.btnShareCopy.addEventListener('click', () => {
      if (!this.currentMetrics) return;
      sound.init();
      sound.playLogBeep();
      const text = `【THE HOLLYWOOD HACKER】ハッカー適性診断\n` +
        `ランク: ${this.currentMetrics.rank} (${this.currentMetrics.score.toLocaleString()} PTS)\n` +
        `称号: ${this.currentMetrics.title}\n` +
        `同期率: ${this.currentMetrics.syncRate}%\n` +
        `判定: PERFECT ${this.currentMetrics.perfectCount} / GREAT ${this.currentMetrics.greatCount} / MISS ${this.currentMetrics.missCount}\n` +
        `最高打鍵速度: ${this.currentMetrics.peakKps} Keys/s\n` +
        `寸評: ${this.currentMetrics.roast}\n` +
        `#HollywoodHacker #ハッカー音ゲータイピング`;

      navigator.clipboard.writeText(text).then(() => {
        this.showToast('📋 結果テキストをクリップボードにコピーしました！');
      }).catch(() => {
        this.showToast('⚠️ クリップボードへのコピーに失敗しました');
      });
    });

    // X (Twitter) Share Button (Direct Web Intent with clipboard image copy)
    this.btnXShare.addEventListener('click', async () => {
      if (!this.currentMetrics) return;
      sound.init();
      sound.playLogBeep();
      await shareReportCardToX(this.currentMetrics);
      this.showToast('🚀 X投稿画面を開きました！（認定証画像は Ctrl+V / ⌘V で貼り付け可能）');
    });
  }

  private showToast(msg: string, duration = 3500): void {
    if (!this.toastNotification) return;
    this.toastNotification.textContent = msg;
    this.toastNotification.style.display = 'flex';
    this.toastNotification.classList.remove('show');
    void this.toastNotification.offsetWidth; // trigger reflow
    this.toastNotification.classList.add('show');

    if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);
    this.toastTimeoutId = window.setTimeout(() => {
      this.toastNotification.classList.remove('show');
      setTimeout(() => {
        this.toastNotification.style.display = 'none';
      }, 300);
    }, duration);
  }

  public setDifficulty(diff: Difficulty): void {
    sound.stopTrack();
    this.selectedDifficulty = diff;
    this.rhythmEngine.setDifficulty(diff);
    const track = this.rhythmEngine.getCurrentTrack();
    this.durationTotal = track.duration;
    this.timeLeft = this.durationTotal;

    // Update active button classes
    this.diffButtons.forEach((b) => {
      b.classList.toggle('active', b.dataset.diff === diff);
    });

    // Update header badge & track badge
    if (this.headerDiffBadge) {
      this.headerDiffBadge.textContent = diff;
      this.headerDiffBadge.className = `header-diff-badge diff-${diff.toLowerCase()}`;
    }
    if (this.headerTrackInfo) {
      this.headerTrackInfo.textContent = `🎵 ${track.title} [BPM ${track.bpm}]`;
    }
    if (this.timerDisplay) {
      this.timerDisplay.textContent = this.formatTime(this.timeLeft);
    }
  }

  private handleInputFromUi(key: string): void {
    if (this.state === GameState.START) {
      sound.init();
      this.startCountdown();
    } else if (this.state === GameState.PLAYING) {
      this.handleKeystroke(key);
    }
  }

  // 3-2-1 Countdown before actual start to prevent surprise rush
  private startCountdown(): void {
    if (this.state !== GameState.START) return;
    this.state = GameState.COUNTDOWN;
    sound.stopTrack();

    this.startModal.style.display = 'none';
    this.resultModal.style.display = 'none';
    this.countdownOverlay.style.display = 'flex';

    let count = 3;
    this.countdownText.textContent = count.toString();
    this.countdownText.style.color = '#00ff88';
    sound.playCountdownStep(count);

    this.countdownTimerId = window.setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownText.textContent = count.toString();
        sound.playCountdownStep(count);
      } else if (count === 0) {
        this.countdownText.textContent = 'HACK!!';
        this.countdownText.style.color = '#ff0055';
        sound.playCountdownStep(0);
      } else {
        if (this.countdownTimerId) {
          clearInterval(this.countdownTimerId);
          this.countdownTimerId = null;
        }
        this.countdownOverlay.style.display = 'none';
        this.actualStartGame();
      }
    }, 750);
  }

  private actualStartGame(): void {
    this.state = GameState.PLAYING;
    const track = this.rhythmEngine.getCurrentTrack();
    this.durationTotal = track.duration;
    this.timeLeft = this.durationTotal;
    this.lastTimestamp = performance.now();
    this.triggeredEvents.clear();
    this.timerBox.classList.remove('timer-warning');

    // Reset rhythm engine with selected difficulty
    this.rhythmEngine.setDifficulty(this.selectedDifficulty);
    this.clearNoteElements();

    // Start Track (AudioBuffer playback with procedural fallback)
    sound.startTrack(this.selectedDifficulty);

    // Run game logic loop (50ms interval)
    this.timerIntervalId = window.setInterval(() => {
      this.updateTimer();
    }, 50);

    // Run high-precision rhythm highway visual loop
    this.startRhythmRenderLoop();

    // Initial audio blip
    sound.playLogBeep();
  }

  private startRhythmRenderLoop(): void {
    const loop = () => {
      if (this.state !== GameState.PLAYING) return;

      const elapsed = this.durationTotal - this.timeLeft;
      this.renderRhythmHighway(elapsed);
      this.updatePhaseBanner(elapsed);

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private flashKeyFeedback(key: string): void {
    let hudId = 'hud-key-any';
    if (key === ' ') {
      hudId = 'hud-key-space';
    } else if (key === 'Shift') {
      hudId = 'hud-key-shift';
    } else if (key === 'Enter') {
      hudId = 'hud-key-enter';
    }

    const hudEl = document.getElementById(hudId);
    if (hudEl) {
      hudEl.classList.remove('key-pressed');
      void hudEl.offsetWidth; // trigger reflow
      hudEl.classList.add('key-pressed');
      window.setTimeout(() => hudEl.classList.remove('key-pressed'), 140);
    }
  }

  private handleKeystroke(key: string): void {
    const now = performance.now();
    const isEnter = key === 'Enter';
    const isShift = key === 'Shift';
    const elapsed = this.durationTotal - this.timeLeft;

    // 0. Visual Key Legend HUD flash
    this.flashKeyFeedback(key);

    // 1. Audio feedback
    if (isShift) {
      sound.playShiftHit();
    } else {
      sound.playKeyClick(isEnter);
    }

    // 2. Rhythm Precision Judgment
    const judgment = this.rhythmEngine.handleKeyInput(elapsed, key);
    if (judgment) {
      this.processJudgmentFeedback(judgment);
    }

    // 3. Keystroke counts
    this.totalKeystrokes++;
    if (isEnter) this.enterHits++;

    // 4. Combo tracking
    this.currentCombo++;
    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }
    this.comboValue.textContent = this.currentCombo.toString();
    this.keysCount.textContent = this.totalKeystrokes.toString();

    if (this.comboTimeoutId) clearTimeout(this.comboTimeoutId);
    this.comboTimeoutId = window.setTimeout(() => {
      this.currentCombo = 0;
      this.comboValue.textContent = '0';
    }, 1200);

    // 5. KPS and Dramatic Pause calculation
    this.keyTimestamps.push(now);
    const oneSecAgo = now - 1000;
    while (this.keyTimestamps.length > 0 && this.keyTimestamps[0] < oneSecAgo) {
      this.keyTimestamps.shift();
    }
    this.currentKps = this.keyTimestamps.length;
    if (this.currentKps > this.peakKps) {
      this.peakKps = this.currentKps;
    }
    this.kpsValue.textContent = this.currentKps.toFixed(1);

    // Dramatic Pause Detection (Quiet moment between intense bursts)
    if (this.lastKeyTime > 0) {
      const pauseDuration = (now - this.lastKeyTime) / 1000;
      if (this.wasHighSpeedBeforePause && pauseDuration >= 0.4 && pauseDuration <= 1.8) {
        this.dramaticPauses++;
        this.showDramaticPauseNotice();
      }
    }
    this.wasHighSpeedBeforePause = this.currentKps >= 6;
    this.lastKeyTime = now;

    // 6. Visual Effects & Code Streaming
    this.streamHackerCode(isEnter ? 12 : 5);
    this.radar?.triggerActivity();

    if (this.totalKeystrokes % 4 === 0) {
      this.addHexLine();
    }

    if (this.totalKeystrokes % 12 === 0) {
      const log = TERMINAL_LOGS[Math.floor(Math.random() * TERMINAL_LOGS.length)];
      this.addLogLine(log);
      sound.playLogBeep();
    }

    // Screen Shake on extreme speed
    if (this.currentKps >= 11) {
      this.mainTerminal.classList.add('screen-shake');
      setTimeout(() => this.mainTerminal.classList.remove('screen-shake'), 120);
    }
  }

  private processJudgmentFeedback(j: JudgmentFeedback): void {
    if (j.type === 'PERFECT') {
      if (j.noteType === 'ENTER') {
        sound.playKeyClick(true);
        this.mainTerminal.classList.add('screen-shake-heavy');
        setTimeout(() => this.mainTerminal.classList.remove('screen-shake-heavy'), 280);
        this.streamHackerCode(25);
        this.showJudgmentPop('💥 CRITICAL ENTER SLAM!! (+3000)', 'pop-perfect');
      } else {
        sound.playPerfectHit();
        this.showJudgmentPop('PERFECT!!', 'pop-perfect');
      }
    } else if (j.type === 'GREAT') {
      if (j.noteType === 'ENTER') {
        sound.playKeyClick(true);
        this.mainTerminal.classList.add('screen-shake-heavy');
        setTimeout(() => this.mainTerminal.classList.remove('screen-shake-heavy'), 240);
        this.streamHackerCode(18);
        this.showJudgmentPop('💥 GREAT ENTER SLAM!! (+2000)', 'pop-great');
      } else {
        sound.playGreatHit();
        this.showJudgmentPop('GREAT!', 'pop-great');
      }
    } else if (j.type === 'GOOD') {
      sound.playLogBeep();
      this.showJudgmentPop('GOOD', 'pop-good');
    } else if (j.type === 'PENALTY') {
      sound.playMissHit();
      this.showJudgmentPop(j.message || 'PENALTY!', 'pop-penalty');
      this.triggerPenaltyFlash();
      this.currentCombo = 0;
      this.comboValue.textContent = '0';
      this.penaltyDisplay.textContent = this.rhythmEngine.penaltyCount.toString();
    } else if (j.type === 'MISS') {
      sound.playMissHit();
      this.showJudgmentPop('MISS!', 'pop-miss');
      this.currentCombo = 0;
      this.comboValue.textContent = '0';
    }

    // Update real-time sync rate
    const sync = this.rhythmEngine.getSyncRate();
    this.syncVal.textContent = `${sync}%`;

    // If this was the final note of the song, trigger finish after a brief dramatic punch
    if (j.isLastNote) {
      setTimeout(() => {
        if (this.state === GameState.PLAYING) {
          this.finishGame();
        }
      }, 500);
    }
  }

  private showJudgmentPop(text: string, className: string): void {
    this.rhythmJudgmentPop.textContent = text;
    this.rhythmJudgmentPop.className = `rhythm-judgment-pop show-pop ${className}`;

    setTimeout(() => {
      this.rhythmJudgmentPop.classList.remove('show-pop');
    }, 450);
  }

  private triggerPenaltyFlash(): void {
    this.mainTerminal.classList.add('penalty-flash');
    setTimeout(() => {
      this.mainTerminal.classList.remove('penalty-flash');
    }, 280);
  }

  private renderRhythmHighway(elapsed: number): void {
    const targetX = 104; // Center line of the target zone bracket (left 80px + 48/2)
    const speed = this.rhythmEngine.scrollSpeed; // Scaled by difficulty (Easy: 260, Normal: 310, Hard: 370)
    const highwayWidth = this.rhythmNotesMain.clientWidth || this.rhythmNotesShift.clientWidth || 600;

    const notes = this.rhythmEngine.getNotes();
    let isCurrentlyBurstActive = false;
    let isEnterApproaching = false;
    let isEnterReady = false;
    let isShiftApproaching = false;
    let isShiftReady = false;

    for (const note of notes) {
      let isVisible = false;
      let el = this.noteElements.get(note.id);

      if (note.type === 'BURST') {
        const noteDuration = note.duration || 1;
        const noteWidth = noteDuration * speed;
        const noteStart = targetX + (note.targetTime - elapsed) * speed;
        const noteRight = noteStart + noteWidth;

        // Note is visible as long as its right end hasn't passed off-screen left, and left end is before screen right
        isVisible = noteRight >= -40 && noteStart <= highwayWidth + 60 && !note.hit;

        if (isVisible) {
          if (!el) {
            el = document.createElement('div');
            el.className = 'rhythm-note-item note-type-burst';
            this.rhythmNotesMain.appendChild(el);
            this.noteElements.set(note.id, el);
          }
          el.style.width = `${Math.round(noteWidth)}px`;
          el.style.transform = `translate3d(${Math.round(noteStart)}px, 0, 0)`;

          // Check if target zone is inside this active burst
          if (noteStart <= targetX && noteRight >= targetX) {
            isCurrentlyBurstActive = true;
          }
        }
      } else if (note.lane === 'SHIFT') {
        // SHIFT Note - Solid Neon Purple block without text
        const noteWidth = 56;
        const noteCenter = targetX + (note.targetTime - elapsed) * speed;
        const noteLeft = noteCenter - noteWidth / 2;

        isVisible = noteLeft + noteWidth >= -40 && noteLeft <= highwayWidth + 60 && !note.hit && !note.judged && !note.missed;

        if (isVisible) {
          if (!el) {
            el = document.createElement('div');
            el.className = 'rhythm-note-item note-type-shift';
            this.rhythmNotesShift.appendChild(el);
            this.noteElements.set(note.id, el);
          }
          el.style.transform = `translate3d(${Math.round(noteLeft)}px, 0, 0)`;

          const dist = noteCenter - targetX;
          if (dist > 0 && dist <= 200) {
            isShiftApproaching = true;
          }
          if (Math.abs(dist) <= 35) {
            isShiftReady = true;
          }
        }
      } else {
        // SPACE (Gold) or ENTER (Red) solid block without text
        const isEnterNote = note.type === 'ENTER';
        const noteWidth = isEnterNote ? 84 : 64;
        const noteCenter = targetX + (note.targetTime - elapsed) * speed;
        const noteLeft = noteCenter - noteWidth / 2;

        isVisible = noteLeft + noteWidth >= -40 && noteLeft <= highwayWidth + 60 && !note.hit && !note.judged && !note.missed;

        if (isVisible) {
          if (!el) {
            el = document.createElement('div');
            el.className = `rhythm-note-item note-type-${note.type.toLowerCase()}`;
            this.rhythmNotesMain.appendChild(el);
            this.noteElements.set(note.id, el);
          }

          el.style.transform = `translate3d(${Math.round(noteLeft)}px, 0, 0)`;

          if (isEnterNote) {
            const dist = noteCenter - targetX;
            if (dist > 0 && dist <= 280) {
              isEnterApproaching = true;
            }
            if (Math.abs(dist) <= 45) {
              isEnterReady = true;
            }
          }
        }
      }

      // Immediately remove invisible or already judged notes to prevent any phantom lingering
      if (!isVisible && el) {
        el.remove();
        this.noteElements.delete(note.id);
      }
    }

    // Shift sublane target zone visual alert states
    if (isShiftReady) {
      this.targetZoneShift.className = 'rhythm-target-zone target-zone-shift shift-ready';
    } else if (isShiftApproaching) {
      this.targetZoneShift.className = 'rhythm-target-zone target-zone-shift shift-approaching';
    } else {
      this.targetZoneShift.className = 'rhythm-target-zone target-zone-shift';
    }

    // Main highway target zone visual alert states
    if (isEnterReady) {
      this.targetZoneMain.className = 'rhythm-target-zone target-zone-main enter-ready';
    } else if (isEnterApproaching) {
      this.targetZoneMain.className = 'rhythm-target-zone target-zone-main enter-approaching';
    } else if (isCurrentlyBurstActive) {
      this.targetZoneMain.className = 'rhythm-target-zone target-zone-main burst-active';
    } else {
      this.targetZoneMain.className = 'rhythm-target-zone target-zone-main';
    }

    // Update banner with dynamic instructions
    this.updatePhaseBanner(elapsed, isEnterApproaching, isEnterReady, isCurrentlyBurstActive, isShiftApproaching);
  }

  private updatePhaseBanner(
    elapsed: number,
    isEnterApproaching: boolean = false,
    isEnterReady: boolean = false,
    isBurstActive: boolean = false,
    isShiftApproaching: boolean = false
  ): void {
    // 0.0s ~ 2.0s: Warm-up lead-in period
    if (elapsed < 2.0) {
      const remainingLeadIn = Math.max(0, 2.0 - elapsed).toFixed(1);
      this.phaseBanner.className = 'current-phase-banner';
      this.phaseIcon.textContent = '🚀';
      this.phaseText.textContent = `STANDBY: キーボードを構えろ！ 連打まで ${remainingLeadIn}秒...`;
      return;
    }

    if (isEnterReady) {
      this.phaseBanner.className = 'current-phase-banner phase-stealth-active';
      this.phaseIcon.textContent = '💥';
      this.phaseText.textContent = 'SLAM ENTER NOW!! [ENTER強打!!]';
      return;
    }

    if (isEnterApproaching) {
      this.phaseBanner.className = 'current-phase-banner phase-stealth-active';
      this.phaseIcon.textContent = '⚠️';
      this.phaseText.textContent = 'ENTER接近中: 照準枠でENTERを叩き込め！';
      return;
    }

    if (isBurstActive) {
      this.phaseBanner.className = 'current-phase-banner phase-burst-active';
      if (isShiftApproaching) {
        this.phaseIcon.textContent = '⚡⇧';
        this.phaseText.textContent = 'BURST連打中!! ⇧ SHIFT接近: タイミングを合わせろ！';
      } else {
        this.phaseIcon.textContent = '⚡';
        this.phaseText.textContent = 'BURST: 全キー猛烈連打中！！ (MASH ANY KEYS!)';
      }
      return;
    }

    // Show next upcoming target note countdown
    const nextInfo = this.rhythmEngine.getNextApproachingNote(elapsed);
    if (nextInfo && nextInfo.secondsAway <= 2.2) {
      const sec = Math.max(0, nextInfo.secondsAway).toFixed(1);
      this.phaseBanner.className = 'current-phase-banner';
      if (nextInfo.note.type === 'SPACE') {
        this.phaseIcon.textContent = '␣';
        this.phaseText.textContent = `NEXT: SPACE (あと ${sec}s)`;
      } else if (nextInfo.note.type === 'SHIFT') {
        this.phaseIcon.textContent = '⇧';
        this.phaseText.textContent = `NEXT: SHIFT (あと ${sec}s)`;
      } else if (nextInfo.note.type === 'ENTER') {
        this.phaseIcon.textContent = '↵';
        this.phaseText.textContent = `NEXT: ENTER (あと ${sec}s)`;
      }
    } else {
      this.phaseBanner.className = 'current-phase-banner';
      this.phaseIcon.textContent = '🎯';
      this.phaseText.textContent = 'STANDBY: 連打またはノーツ待機';
    }
  }

  private clearNoteElements(): void {
    for (const [, el] of this.noteElements) {
      el.remove();
    }
    this.noteElements.clear();
  }

  private streamHackerCode(charCount: number): void {
    const currentSnippet = HACKER_CODE_SNIPPETS[this.snippetIndex];
    const chunk = currentSnippet.slice(this.snippetCharIndex, this.snippetCharIndex + charCount);

    this.codeStream.textContent += chunk;
    this.snippetCharIndex += charCount;

    if (this.snippetCharIndex >= currentSnippet.length) {
      this.codeStream.textContent += '\n\n';
      this.snippetCharIndex = 0;
      this.snippetIndex = (this.snippetIndex + 1) % HACKER_CODE_SNIPPETS.length;
    }

    this.terminalScrollArea.scrollTop = this.terminalScrollArea.scrollHeight;
  }

  private addHexLine(): void {
    const line = generateHexDumpLine();
    const p = document.createElement('div');
    p.textContent = line;
    this.hexStream.appendChild(p);

    if (this.hexStream.childElementCount > 6) {
      this.hexStream.removeChild(this.hexStream.firstElementChild!);
    }
  }

  private addLogLine(text: string): void {
    const div = document.createElement('div');
    div.textContent = text;
    if (text.includes('[!]') || text.includes('ICE') || text.includes('WARN')) {
      div.className = 'log-line-danger';
    } else if (text.includes('[✓]') || text.includes('[+]') || text.includes('ROOT')) {
      div.className = 'log-line-success';
    } else {
      div.className = 'log-line-warning';
    }
    this.logsStream.appendChild(div);

    if (this.logsStream.childElementCount > 8) {
      this.logsStream.removeChild(this.logsStream.firstElementChild!);
    }
  }

  private showDramaticPauseNotice(): void {
    const flash = document.createElement('span');
    flash.style.position = 'absolute';
    flash.style.right = '20px';
    flash.style.bottom = '60px';
    flash.style.color = '#ffff00';
    flash.style.fontSize = '12px';
    flash.style.fontWeight = 'bold';
    flash.style.textShadow = '0 0 8px #ffff00';
    flash.textContent = '★ DRAMATIC PAUSE BONUS! (+2000)';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);
  }

  private formatTime(seconds: number): string {
    const s = Math.max(0, seconds);
    const totalMs = Math.floor(s * 100);
    const sec = Math.floor(totalMs / 100);
    const ms = totalMs % 100;
    return `00:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  private updateTimer(): void {
    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.timeLeft = Math.max(0, this.timeLeft - delta);
    const elapsed = this.durationTotal - this.timeLeft;

    // Check rhythm auto-misses
    const misses = this.rhythmEngine.updateTime(elapsed);
    if (misses.length > 0) {
      for (const m of misses) {
        this.processJudgmentFeedback(m);
      }
    }

    // Format mm:ss.ms
    this.timerDisplay.textContent = this.formatTime(this.timeLeft);

    // Intrusion progress calculation (0 - 100%)
    const timeProgress = (this.durationTotal - this.timeLeft) / this.durationTotal;
    const keyProgress = Math.min(1.0, this.totalKeystrokes / 180);
    const combinedPercent = Math.min(100, Math.floor((timeProgress * 0.4 + keyProgress * 0.6) * 100));

    this.progressBar.style.width = `${combinedPercent}%`;
    this.progressText.textContent = `${combinedPercent}%`;

    // Check dramatic milestone events
    this.checkDramaticEvents(combinedPercent);

    // Urgent countdown in last 5 seconds
    if (this.timeLeft <= 5.0 && this.timeLeft > 0) {
      this.timerBox.classList.add('timer-warning');
      if (Math.floor(this.timeLeft * 10) % 10 === 0) {
        sound.playCountdownTick(this.timeLeft <= 2.0);
      }
    }

    // Time's up!
    if (this.timeLeft <= 0) {
      this.finishGame();
    }
  }

  private checkDramaticEvents(progress: number): void {
    for (const ev of DRAMATIC_EVENTS) {
      if (progress >= ev.triggerPercent && !this.triggeredEvents.has(ev.triggerPercent)) {
        this.triggeredEvents.add(ev.triggerPercent);
        this.triggerDramaticEvent(ev.title, ev.subtitle, ev.type);
        break;
      }
    }
  }

  private triggerDramaticEvent(title: string, sub: string, type: string): void {
    this.eventTitle.textContent = title;
    this.eventSub.textContent = sub;

    if (type === 'danger' || type === 'warning') {
      sound.playAlarm();
    } else {
      sound.playLogBeep();
    }

    this.eventBanner.classList.add('show');
    setTimeout(() => {
      this.eventBanner.classList.remove('show');
    }, 2200);
  }

  private finishGame(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.state = GameState.FINISHED;

    // Keep BGM track flowing to the end of the song into the result screen,
    // ducking slightly so the ACCESS GRANTED fanfare shines.
    sound.duckBgmForResults();
    sound.playAccessGranted();

    // Calculate metrics with rhythm evaluation
    this.currentMetrics = evaluateTyping(
      this.totalKeystrokes,
      this.durationTotal,
      this.peakKps,
      this.dramaticPauses,
      this.enterHits,
      this.maxCombo,
      this.rhythmEngine.perfectCount,
      this.rhythmEngine.greatCount,
      this.rhythmEngine.goodCount,
      this.rhythmEngine.missCount,
      this.rhythmEngine.penaltyCount,
      this.rhythmEngine.getSyncRate(),
      this.selectedDifficulty
    );

    // Populate result modal
    this.populateResultModal(this.currentMetrics);
  }

  private populateResultModal(m: TypingMetrics): void {
    const rankEl = document.getElementById('result-rank')!;
    const scoreEl = document.getElementById('result-score')!;
    const tagEl = document.getElementById('result-tag')!;
    const titleEl = document.getElementById('result-title-banner')!;
    const syncRateEl = document.getElementById('stat-sync-rate')!;
    const rhythmHitsEl = document.getElementById('stat-rhythm-hits')!;
    const penaltiesEl = document.getElementById('stat-penalties')!;
    const peakKpsEl = document.getElementById('stat-peak-kps')!;
    const pausesEl = document.getElementById('stat-pauses')!;
    const entersEl = document.getElementById('stat-enters')!;
    const roastEl = document.getElementById('result-roast')!;

    // Update Difficulty badge in result modal
    if (this.resultDiffBadge) {
      this.resultDiffBadge.textContent = `DIFFICULTY: ${m.difficulty} MODE`;
      this.resultDiffBadge.className = `result-diff-badge diff-${m.difficulty.toLowerCase()}`;
    }

    rankEl.textContent = m.rank;
    if (m.rank === 'SSS') rankEl.style.color = '#ffcc00';
    else if (m.rank === 'SS') rankEl.style.color = '#00ffff';
    else if (m.rank === 'S') rankEl.style.color = '#33ff77';
    else if (m.rank === 'A') rankEl.style.color = '#33bbff';
    else if (m.rank === 'B') rankEl.style.color = '#ddaa33';
    else if (m.rank === 'C') rankEl.style.color = '#ff6633';
    else rankEl.style.color = '#ff3333';

    scoreEl.textContent = `${m.score.toLocaleString()} PTS`;
    tagEl.textContent = `[ ${m.styleTag} ]`;
    titleEl.textContent = `称号: ${m.title}`;

    syncRateEl.textContent = `${m.syncRate}%`;
    rhythmHitsEl.textContent = `${m.perfectCount} / ${m.greatCount} / ${this.rhythmEngine.goodCount}`;
    penaltiesEl.textContent = `${m.missCount} / ${m.penaltyCount}`;
    peakKpsEl.textContent = `${m.peakKps} Keys/s`;
    pausesEl.textContent = `${m.dramaticPauses} 回`;
    entersEl.textContent = `${m.enterHits} 回`;
    roastEl.textContent = m.roast;

    this.resultModal.style.display = 'flex';
  }

  private resetGame(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    sound.stopTrack();

    this.state = GameState.START;
    this.timeLeft = this.durationTotal;
    this.totalKeystrokes = 0;
    this.enterHits = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.keyTimestamps = [];
    this.peakKps = 0;
    this.currentKps = 0;
    this.lastKeyTime = 0;
    this.dramaticPauses = 0;
    this.wasHighSpeedBeforePause = false;
    this.snippetIndex = 0;
    this.snippetCharIndex = 0;
    this.triggeredEvents.clear();

    this.rhythmEngine.reset();
    this.clearNoteElements();

    // Clear UI
    this.codeStream.textContent = '';
    this.timerDisplay.textContent = this.formatTime(this.durationTotal);
    this.progressBar.style.width = '0%';
    this.progressText.textContent = '0%';
    this.syncVal.textContent = '100%';
    this.kpsValue.textContent = '0.0';
    this.comboValue.textContent = '0';
    this.keysCount.textContent = '0';
    this.penaltyDisplay.textContent = '0';
    this.targetZoneMain.className = 'rhythm-target-zone target-zone-main';
    this.targetZoneShift.className = 'rhythm-target-zone target-zone-shift';
    this.countdownOverlay.style.display = 'none';

    this.startModal.style.display = 'none';
    this.resultModal.style.display = 'none';
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new HollywoodHackerGame();
});
