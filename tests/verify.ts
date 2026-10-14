import { evaluateTyping } from '../src/evaluator.ts';
import { HACKER_CODE_SNIPPETS, TERMINAL_LOGS, DRAMATIC_EVENTS, generateHexDumpLine } from '../src/hackerData.ts';

console.log('=== TEST 1: Hacker Data & Generator ===');
console.assert(HACKER_CODE_SNIPPETS.length >= 4, 'Should have at least 4 code snippets');
console.assert(TERMINAL_LOGS.length >= 10, 'Should have at least 10 terminal logs');
console.assert(DRAMATIC_EVENTS.length >= 4, 'Should have at least 4 dramatic events');

const hex = generateHexDumpLine();
console.log('Sample Hex Dump Line:', hex);
console.assert(hex.startsWith('0x7FFF'), 'Hex dump line should start with 0x7FFF');
console.log('✓ Hacker Data test passed\n');

console.log('=== TEST 2: Evaluator Scenarios ===');

// Scenario A: Fast Hollywood typist with dramatic pauses
const resultA = evaluateTyping(240, 30, 14.5, 4, 6, 85);
console.log('Scenario A (Hollywood Master):', resultA);
console.assert(resultA.rank === 'SSS' || resultA.rank === 'SS', 'Expected high rank for scenario A');
console.assert(resultA.title.includes('ハリウッド') || resultA.title.includes('天才'), 'Expected Hollywood title');

// Scenario B: Enter smasher
const resultB = evaluateTyping(180, 30, 9.0, 1, 15, 40);
console.log('Scenario B (Enter Smasher):', resultB);
console.assert(resultB.title.includes('Enter'), 'Expected Enter title');

// Scenario C: Super fast gatling typist
const resultC = evaluateTyping(450, 30, 18.2, 0, 2, 190);
console.log('Scenario C (Gatling Typist):', resultC);
console.assert(resultC.title.includes('ガトリング') || resultC.title.includes('連打'), 'Expected Gatling title');

// Scenario D: Slow typist (one finger)
const resultD = evaluateTyping(45, 30, 2.5, 0, 1, 10);
console.log('Scenario D (Slow Typist):', resultD);
console.assert(resultD.rank === 'F' || resultD.rank === 'C', 'Expected low rank for scenario D');
console.assert(resultD.title.includes('人差し指'), 'Expected one-finger title');

console.log('✓ All Evaluator tests passed!\n');
