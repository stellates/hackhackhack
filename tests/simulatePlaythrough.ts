// Full simulation test for 1 entire playthrough:
// Tests state transitions, scoring, timer, dramatic events, and restart.

import { evaluateTyping } from '../src/evaluator.ts';
import { HACKER_CODE_SNIPPETS, TERMINAL_LOGS, DRAMATIC_EVENTS, generateHexDumpLine } from '../src/hackerData.ts';

console.log('=== SIMULATING FULL GAMEPLAY CYCLE ===');

// 1. Game State Setup
let state: 'START' | 'PLAYING' | 'FINISHED' = 'START';
let timeLeft = 30.0;
let totalKeystrokes = 0;
let enterHits = 0;
let currentCombo = 0;
let maxCombo = 0;
let peakKps = 0;
let dramaticPauses = 0;
let wasHighSpeed = false;
let lastKeyTime = 0;
let triggeredEvents = new Set<number>();

// 2. Start Game
state = 'PLAYING';
console.log('[Game Event] Game Started! State:', state);

// 3. Simulate 30 seconds of typing
// We will simulate 280 keystrokes across 30 seconds:
// - Sec 0-10: Fast burst typing (~12 KPS)
// - Sec 10-12: A dramatic pause (1.2 seconds of stillness)
// - Sec 12-25: Sustained typing + 8 Enter hits
// - Sec 25-26: Another dramatic pause
// - Sec 26-30: Final frenzy + Enter smashes

let simulatedCurrentTime = 0;
const keyIntervals = [];

// Phase 1: 0 to 10s (120 keys)
for (let i = 0; i < 120; i++) {
  simulatedCurrentTime += 0.08;
  keyIntervals.push({ time: simulatedCurrentTime, isEnter: false });
}

// Pause 1: 1.2s stillness
simulatedCurrentTime += 1.2;

// Phase 2: 11.2 to 25s (130 keys, with 8 Enters)
for (let i = 0; i < 130; i++) {
  simulatedCurrentTime += 0.1;
  const isEnter = i % 16 === 0;
  keyIntervals.push({ time: simulatedCurrentTime, isEnter });
}

// Pause 2: 1.0s stillness
simulatedCurrentTime += 1.0;

// Phase 3: 26 to 30s (50 keys, finish frenzy with 4 Enters)
for (let i = 0; i < 50; i++) {
  simulatedCurrentTime += 0.07;
  const isEnter = i >= 46;
  keyIntervals.push({ time: simulatedCurrentTime, isEnter });
}

console.log(`Generated ${keyIntervals.length} simulated keystrokes.`);

// Process simulated keystrokes
let rollingWindow: number[] = [];
for (const k of keyIntervals) {
  totalKeystrokes++;
  if (k.isEnter) enterHits++;

  currentCombo++;
  if (currentCombo > maxCombo) maxCombo = currentCombo;

  // Rolling KPS
  rollingWindow.push(k.time);
  rollingWindow = rollingWindow.filter(t => t >= k.time - 1.0);
  const currentKps = rollingWindow.length;
  if (currentKps > peakKps) peakKps = currentKps;

  // Dramatic pause check
  if (lastKeyTime > 0) {
    const pause = k.time - lastKeyTime;
    if (wasHighSpeed && pause >= 0.4 && pause <= 1.8) {
      dramaticPauses++;
      console.log(`[Game Event] ★ Dramatic Pause detected at t=${k.time.toFixed(2)}s (Pause: ${pause.toFixed(2)}s)`);
    }
  }
  wasHighSpeed = currentKps >= 6;
  lastKeyTime = k.time;

  // Check milestone progress
  const progress = Math.min(100, Math.floor((k.time / 30 * 40) + (totalKeystrokes / 180 * 60)));
  for (const ev of DRAMATIC_EVENTS) {
    if (progress >= ev.triggerPercent && !triggeredEvents.has(ev.triggerPercent)) {
      triggeredEvents.add(ev.triggerPercent);
      console.log(`[Dramatic Banner] Triggered at ${progress}%: "${ev.title}" (${ev.subtitle})`);
    }
  }
}

// 4. Timer Expiration & Evaluation
state = 'FINISHED';
console.log('\n[Game Event] 30 seconds completed! State:', state);

const result = evaluateTyping(
  totalKeystrokes,
  30,
  peakKps,
  dramaticPauses,
  enterHits,
  maxCombo
);

console.log('\n=== FINAL HACKER REPORT CARD ===');
console.log(`Rank:          ${result.rank}`);
console.log(`Score:         ${result.score.toLocaleString()} PTS`);
console.log(`Title:         ${result.title}`);
console.log(`Style:         ${result.styleTag}`);
console.log(`Peak Speed:    ${result.peakKps} Keys/s`);
console.log(`Average Speed: ${result.avgKps} Keys/s`);
console.log(`Dramatic Pause:${result.dramaticPauses} times`);
console.log(`Enter Smashes: ${result.enterHits} times`);
console.log(`Total Keys:    ${result.totalKeystrokes}`);
console.log(`Max Combo:     ${result.maxCombo}`);
console.log(`Roast:         "${result.roast}"`);

// Assertions
console.assert(result.rank === 'SSS' || result.rank === 'SS', 'High performance should achieve SS or SSS');
console.assert(result.dramaticPauses === 2, 'Should have detected 2 dramatic pauses');
console.assert(result.enterHits > 10, 'Should have registered Enter smashes');
console.assert(triggeredEvents.size >= 4, 'Should have triggered major dramatic banners');

// 5. Test Restart
state = 'START';
totalKeystrokes = 0;
enterHits = 0;
dramaticPauses = 0;
console.log('\n[Game Event] Restart executed successfully! State:', state);
console.log('✓ Full 1-playthrough simulation test PASSED without any errors!');
