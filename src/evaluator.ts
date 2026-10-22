import { Difficulty } from './rhythmEngine';

export interface TypingMetrics {
  totalKeystrokes: number;
  durationSeconds: number;
  avgKps: number;
  peakKps: number;
  dramaticPauses: number;
  enterHits: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  penaltyCount: number;
  syncRate: number;
  difficulty: Difficulty;
  score: number;
  rank: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'F';
  title: string;
  roast: string;
  styleTag: string;
}

export function evaluateTyping(
  totalKeystrokes: number,
  durationSeconds: number,
  peakKps: number,
  dramaticPauses: number,
  enterHits: number,
  maxCombo: number,
  perfectCount: number,
  greatCount: number,
  goodCount: number,
  missCount: number,
  penaltyCount: number,
  syncRate: number,
  difficulty: Difficulty = 'NORMAL'
): TypingMetrics {
  const effectiveDuration = Math.max(durationSeconds, 1);
  const avgKps = parseFloat((totalKeystrokes / effectiveDuration).toFixed(1));

  // Base raw components
  const baseScore = totalKeystrokes * 70;
  const burstBonus = Math.round(peakKps * 450);
  const rhythmBonus = (perfectCount * 1400) + (greatCount * 800) + (goodCount * 350);
  const rhythmDeductions = (missCount * 700) + (penaltyCount * 1000);
  const syncBonus = Math.round(syncRate * 200);
  const comboBonus = maxCombo * 25;
  const pauseBonus = dramaticPauses * 1800;

  // Difficulty multipliers
  const diffMultiplier = difficulty === 'HARD' ? 1.4 : (difficulty === 'NORMAL' ? 1.15 : 1.0);

  const rawScore = (baseScore + burstBonus + rhythmBonus + syncBonus + comboBonus + pauseBonus - rhythmDeductions) * diffMultiplier;
  const score = Math.max(0, Math.min(99999, Math.round(rawScore)));

  // Rank determination
  let rank: TypingMetrics['rank'] = 'F';

  if (difficulty === 'HARD') {
    if (score >= 82000 && syncRate >= 88 && missCount <= 1 && penaltyCount <= 2) rank = 'SSS';
    else if (score >= 68000 && syncRate >= 72 && missCount <= 3) rank = 'SS';
    else if (score >= 50000 && syncRate >= 58) rank = 'S';
    else if (score >= 36000 && syncRate >= 42) rank = 'A';
    else if (score >= 22000) rank = 'B';
    else if (score >= 12000) rank = 'C';
    else rank = 'F';
  } else if (difficulty === 'NORMAL') {
    if (score >= 76000 && syncRate >= 85 && missCount <= 1 && penaltyCount <= 2 && avgKps >= 5.5) rank = 'SSS';
    else if (score >= 62000 && syncRate >= 70 && missCount <= 3) rank = 'SS';
    else if (score >= 46000 && syncRate >= 55) rank = 'S';
    else if (score >= 32000 && syncRate >= 40) rank = 'A';
    else if (score >= 20000) rank = 'B';
    else if (score >= 10000) rank = 'C';
    else rank = 'F';
  } else { // EASY
    if (score >= 65000 && syncRate >= 80 && missCount <= 2) rank = 'SSS';
    else if (score >= 52000 && syncRate >= 65) rank = 'SS';
    else if (score >= 38000 && syncRate >= 50) rank = 'S';
    else if (score >= 26000) rank = 'A';
    else if (score >= 16000) rank = 'B';
    else if (score >= 8000) rank = 'C';
    else rank = 'F';
  }

  // Titles & Roasts
  let title = '見習いサイバー戦士';
  let roast = 'キーボードを一生懸命叩きましたが、まだドラマのエキストラレベルです。';
  let styleTag = 'NEOPHYTE';

  if (rank === 'SSS') {
    if (difficulty === 'HARD') {
      title = '全宇宙統括ゴッドマエストロ（HARD神速完全制覇）';
      roast = '常人には視認不可能なHARD譜面の16分トリルとEnter強打を完全掌握！もはや人間をやめてサイバー空間の神霊として存在しています。全米驚愕！';
      styleTag = 'GOD MAESTRO';
    } else {
      title = '神速サイバーマエストロ（完全調律クラッカー）';
      roast = '怒涛の打鍵と完璧な拍子取り！もはやハッキングではなくサイバー空間のオーケストラ指揮者。映画のクライマックスでスタンディングオベーション！';
      styleTag = 'CYBER MAESTRO';
    }
  } else if (penaltyCount >= 5) {
    title = '警報サイレン乱れ鳴らしマン（誤爆マスター）';
    roast = 'Space、Shift、Enterのキーがパニックで大混乱！防犯カメラの前でデタラメにキーを叩いて警報を鳴らしまくるお騒がせハッカーです。';
    styleTag = 'ALARM TRIPPER';
  } else if (difficulty === 'HARD' && rank === 'F') {
    title = 'HARD特攻・指先粉砕玉砕クラッカー';
    roast = '果敢にもHARDモードの電脳嵐に飛び込みましたが、あえなくキーボードごと返り討ちに遭いました。まずはNORMALで修行を積もう！';
    styleTag = 'OVERCLOCKED CRASH';
  } else if (avgKps >= 10.0 && syncRate < 50) {
    title = '音痴なガトリング打鍵サイバーゴリラ';
    roast = '打鍵の勢いはハリウッド最強ですが、リズム感は完全に回線切断中！指示を無視してキーボードを粉砕しています。';
    styleTag = 'DEAF GATLING';
  } else if (perfectCount >= 10 && syncRate >= 80) {
    title = '映画『マトリックス』直系オペレーター';
    roast = '緑の文字列のビートを見事に読み切り、寸分の狂いもなくファイアウォールを突破。サングラスを装着する資格があります。';
    styleTag = 'NEO OPERATOR';
  } else if (dramaticPauses >= 2 && enterHits >= 8) {
    title = 'ハリウッド公認・劇場型Enter強打神';
    roast = '猛烈な連打からのスッ…と息を潜めるタメ、そしてラストの「ターンッ！」。映画の尺稼ぎと見せ場を完全に理解しています。';
    styleTag = 'CINEMATIC ENTER';
  } else if (avgKps >= 7.0) {
    title = '深夜2時の国家機密クラッカー';
    roast = '冷めた缶コーヒーとエナジードリンクを胃に流し込みながら、ペンタゴンの裏口を暴くベテランの風格があります。';
    styleTag = 'NIGHT OPERATOR';
  } else if (avgKps >= 4.0) {
    title = '映画『ダイ・ハード』序盤の巻き込まれハッカー';
    roast = '悪くはないですが、主人公が部屋のドアを蹴破って突入してきた瞬間に両手を挙げて降伏するポジションです。';
    styleTag = 'ACTION EXTRA';
  } else {
    title = '人差し指一本打法のおじいちゃんサイバー';
    roast = 'キーボードを探しながらポツリポツリ…。「インターネットが止まったぞ！」と叫んでルーターの電源を抜くタイプ。';
    styleTag = 'ANALOG RESISTER';
  }

  return {
    totalKeystrokes,
    durationSeconds: parseFloat(durationSeconds.toFixed(1)),
    avgKps,
    peakKps: parseFloat(peakKps.toFixed(1)),
    dramaticPauses,
    enterHits,
    maxCombo,
    perfectCount,
    greatCount,
    goodCount,
    missCount,
    penaltyCount,
    syncRate,
    difficulty,
    score,
    rank,
    title,
    roast,
    styleTag
  };
}

