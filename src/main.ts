import './style.css';
import { sound } from './sound';
import { HACKER_CODE_SNIPPETS, TERMINAL_LOGS, DRAMATIC_EVENTS, generateHexDumpLine } from './hackerData';
import { evaluateTyping, TypingMetrics } from './evaluator';
import { CyberRadar } from './radar';
import { downloadReportCard } from './canvasExporter';

enum GameState {
  START,
  PLAYING,
  FINISHED
}

class HollywoodHackerGame {
  private state: GameState = GameState.START;
  private durationTotal: number = 30; // 30 seconds
  private timeLeft: number = 30;
  private timerIntervalId: number | null = null;
  private lastTimestamp: number = 0;

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
  private kpsValue!: HTMLElement;
  private comboValue!: HTMLElement;
  private keysCount!: HTMLElement;
  private codeStream!: HTMLElement;
  private terminalScrollArea!: HTMLElement;
  private hexStream!: HTMLElement;
  private logsStream!: HTMLElement;
  private eventBanner!: HTMLElement;
  private eventTitle!: HTMLElement;
  private eventSub!: HTMLElement;
  private startModal!: HTMLElement;
  private resultModal!: HTMLElement;
  private btnSoundToggle!: HTMLButtonElement;
  private btnStartGame!: HTMLButtonElement;
  private btnDownloadPng!: HTMLButtonElement;
  private btnRestart!: HTMLButtonElement;
  private btnShareCopy!: HTMLButtonElement;
  private mobileHackBtn!: HTMLButtonElement;
  private mainTerminal!: HTMLElement;

  constructor() {
    this.bindDom();
    this.initRadar();
    this.setupEventListeners();
    this.fillInitialBackgroundStreams();
  }

  private bindDom(): void {
    this.timerDisplay = document.getElementById('timer-display')!;
    this.timerBox = document.getElementById('timer-box')!;
    this.progressBar = document.getElementById('progress-bar')!;
    this.progressText = document.getElementById('progress-text')!;
    this.kpsValue = document.getElementById('kps-value')!;
    this.comboValue = document.getElementById('combo-value')!;
    this.keysCount = document.getElementById('keys-count')!;
    this.codeStream = document.getElementById('code-stream')!;
    this.terminalScrollArea = document.getElementById('terminal-scroll-area')!;
    this.hexStream = document.getElementById('hex-stream')!;
    this.logsStream = document.getElementById('logs-stream')!;
    this.eventBanner = document.getElementById('event-banner')!;
    this.eventTitle = document.getElementById('event-title')!;
    this.eventSub = document.getElementById('event-sub')!;
    this.startModal = document.getElementById('start-modal')!;
    this.resultModal = document.getElementById('result-modal')!;
    this.btnSoundToggle = document.getElementById('btn-sound-toggle') as HTMLButtonElement;
    this.btnStartGame = document.getElementById('btn-start-game') as HTMLButtonElement;
    this.btnDownloadPng = document.getElementById('btn-download-png') as HTMLButtonElement;
    this.btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
    this.btnShareCopy = document.getElementById('btn-share-copy') as HTMLButtonElement;
    this.mobileHackBtn = document.getElementById('mobile-hack-btn') as HTMLButtonElement;
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
    // Fill a few lines of hex memory
    for (let i = 0; i < 5; i++) {
      this.addHexLine();
    }
    // Fill a few initial logs
    this.addLogLine("[SYS] Target connected: MAINFRAME::VAULT-07");
    this.addLogLine("[NET] Proxy chain active: 7 hops routed");
    this.addLogLine("[RDY] Press keys to start injection payload...");
  }

  private setupEventListeners(): void {
    // Sound toggle
    this.btnSoundToggle.addEventListener('click', () => {
      sound.init();
      const isMuted = sound.toggleMute();
      this.btnSoundToggle.textContent = isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
    });

    // Start Button
    this.btnStartGame.addEventListener('click', () => {
      sound.init();
      this.startGame();
    });

    // Global Key Listener
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent browser default behavior for F5 or space scrolling during game
      if (this.state === GameState.PLAYING) {
        if (e.key === ' ' || e.key === 'Tab') {
          e.preventDefault();
        }
      }

      if (this.state === GameState.START) {
        sound.init();
        this.startGame();
        return;
      }

      if (this.state === GameState.PLAYING) {
        this.handleKeystroke(e.key === 'Enter');
      }
    });

    // Mobile hack button
    this.mobileHackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.state === GameState.START) {
        sound.init();
        this.startGame();
      } else if (this.state === GameState.PLAYING) {
        this.handleKeystroke(false);
      }
    });

    // Touch tap on main terminal area for mobile furious tapping
    this.mainTerminal.addEventListener('touchstart', (e) => {
      if (this.state === GameState.PLAYING) {
        e.preventDefault();
        sound.init();
        this.handleKeystroke(false);
      }
    }, { passive: false });

    // Download PNG
    this.btnDownloadPng.addEventListener('click', () => {
      if (this.currentMetrics) {
        downloadReportCard(this.currentMetrics);
      }
    });

    // Restart Button
    this.btnRestart.addEventListener('click', () => {
      this.resetGame();
      this.startGame();
    });

    // Share / Copy button
    this.btnShareCopy.addEventListener('click', () => {
      if (!this.currentMetrics) return;
      const text = `【THE HOLLYWOOD HACKER】ハッカー適性診断\n` +
        `ランク: ${this.currentMetrics.rank} (${this.currentMetrics.score.toLocaleString()} PTS)\n` +
        `称号: ${this.currentMetrics.title}\n` +
        `最高打鍵速度: ${this.currentMetrics.peakKps} Keys/s\n` +
        `劇的タメ: ${this.currentMetrics.dramaticPauses}回 / Enter強打: ${this.currentMetrics.enterHits}回\n` +
        `寸評: ${this.currentMetrics.roast}\n` +
        `#HollywoodHacker #ハッカータイピング`;

      navigator.clipboard.writeText(text).then(() => {
        const orig = this.btnShareCopy.textContent;
        this.btnShareCopy.textContent = '✓ コピー完了！';
        setTimeout(() => {
          this.btnShareCopy.textContent = orig;
        }, 2000);
      });
    });
  }

  private startGame(): void {
    if (this.state === GameState.PLAYING) return;
    this.state = GameState.PLAYING;
    this.startModal.style.display = 'none';
    this.resultModal.style.display = 'none';

    this.timeLeft = this.durationTotal;
    this.lastTimestamp = performance.now();
    this.triggeredEvents.clear();
    this.timerBox.classList.remove('timer-warning');

    // Run game loop
    this.timerIntervalId = window.setInterval(() => {
      this.updateTimer();
    }, 50);

    // Initial audio blip
    sound.playLogBeep();
  }

  private handleKeystroke(isEnter: boolean): void {
    const now = performance.now();

    // 1. Audio feedback
    sound.playKeyClick(isEnter);

    // 2. Keystroke counts
    this.totalKeystrokes++;
    if (isEnter) this.enterHits++;

    // 3. Combo tracking
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

    // 4. KPS and Dramatic Pause calculation
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

    // Dramatic Pause Detection:
    // If player had high speed (> 6 KPS) and stopped for 0.4s to 1.6s, count as a dramatic Hollywood pause!
    if (this.lastKeyTime > 0) {
      const pauseDuration = (now - this.lastKeyTime) / 1000;
      if (this.wasHighSpeedBeforePause && pauseDuration >= 0.4 && pauseDuration <= 1.8) {
        this.dramaticPauses++;
        this.showDramaticPauseNotice();
      }
    }
    this.wasHighSpeedBeforePause = this.currentKps >= 6;
    this.lastKeyTime = now;

    // 5. Visual Effects & Code Streaming
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

    // Keep scroll at bottom
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
    // Subtle visual indicator for Hollywood Pause
    const flash = document.createElement('span');
    flash.style.position = 'absolute';
    flash.style.right = '20px';
    flash.style.bottom = '60px';
    flash.style.color = '#ffff00';
    flash.style.fontSize = '12px';
    flash.style.fontWeight = 'bold';
    flash.style.textShadow = '0 0 8px #ffff00';
    flash.textContent = '★ DRAMATIC PAUSE BONUS! (+2500)';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);
  }

  private updateTimer(): void {
    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.timeLeft = Math.max(0, this.timeLeft - delta);

    // Format mm:ss.ms
    const totalMs = Math.floor(this.timeLeft * 100);
    const sec = Math.floor(totalMs / 100);
    const ms = totalMs % 100;
    this.timerDisplay.textContent = `00:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

    // Intrusion progress calculation (0 - 100%)
    const timeProgress = (this.durationTotal - this.timeLeft) / this.durationTotal; // 0 to 1
    const keyProgress = Math.min(1.0, this.totalKeystrokes / 180); // 180 keys for 100%
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
    this.state = GameState.FINISHED;

    // Access granted triumphant sound!
    sound.playAccessGranted();

    // Calculate metrics
    this.currentMetrics = evaluateTyping(
      this.totalKeystrokes,
      this.durationTotal,
      this.peakKps,
      this.dramaticPauses,
      this.enterHits,
      this.maxCombo
    );

    // Populate result modal
    this.populateResultModal(this.currentMetrics);
  }

  private populateResultModal(m: TypingMetrics): void {
    const rankEl = document.getElementById('result-rank')!;
    const scoreEl = document.getElementById('result-score')!;
    const tagEl = document.getElementById('result-tag')!;
    const titleEl = document.getElementById('result-title-banner')!;
    const peakKpsEl = document.getElementById('stat-peak-kps')!;
    const avgKpsEl = document.getElementById('stat-avg-kps')!;
    const pausesEl = document.getElementById('stat-pauses')!;
    const entersEl = document.getElementById('stat-enters')!;
    const roastEl = document.getElementById('result-roast')!;

    rankEl.textContent = m.rank;
    // Color rank based on level
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
    peakKpsEl.textContent = `${m.peakKps} Keys/s`;
    avgKpsEl.textContent = `${m.avgKps} Keys/s`;
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

    // Clear UI
    this.codeStream.textContent = '';
    this.timerDisplay.textContent = '00:30.00';
    this.progressBar.style.width = '0%';
    this.progressText.textContent = '0%';
    this.kpsValue.textContent = '0.0';
    this.comboValue.textContent = '0';
    this.keysCount.textContent = '0';
    this.timerBox.classList.remove('timer-warning');

    this.startModal.style.display = 'none';
    this.resultModal.style.display = 'none';
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new HollywoodHackerGame();
});
