// Hacker typing metrics evaluator, scoring system, comedy titles, and roasts

export interface TypingMetrics {
  totalKeystrokes: number;
  durationSeconds: number;
  avgKps: number;
  peakKps: number;
  dramaticPauses: number;
  enterHits: number;
  maxCombo: number;
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
  maxCombo: number
): TypingMetrics {
  const effectiveDuration = Math.max(durationSeconds, 1);
  const avgKps = parseFloat((totalKeystrokes / effectiveDuration).toFixed(1));

  // Score calculation:
  // - Keystrokes base: totalKeystrokes * 140
  // - Burst speed bonus: peakKps * 700
  // - Hollywood dramatic pause bonus: dramaticPauses * 4000 (Crucial for Hollywood flair!)
  // - Enter slam bonus: enterHits * 500
  // - Max combo bonus: maxCombo * 20
  const baseScore = totalKeystrokes * 140;
  const burstBonus = Math.round(peakKps * 700);
  const pauseBonus = dramaticPauses * 4000;
  const enterBonus = enterHits * 500;
  const comboBonus = maxCombo * 20;

  const rawScore = baseScore + burstBonus + pauseBonus + enterBonus + comboBonus;
  const score = Math.max(1200, Math.min(99999, rawScore));

  // Rank determination
  let rank: TypingMetrics['rank'] = 'F';
  if (score >= 75000) rank = 'SSS';
  else if (score >= 60000) rank = 'SS';
  else if (score >= 45000) rank = 'S';
  else if (score >= 30000) rank = 'A';
  else if (score >= 18000) rank = 'B';
  else if (score >= 9000) rank = 'C';
  else rank = 'F';

  // Title and Roast determination
  let title = '見習いサイバー戦士';
  let roast = 'キーボードを一生懸命叩きましたが、まだドラマのエキストラレベルです。';
  let styleTag = 'NEOPHYTE';

  if (dramaticPauses >= 3 && avgKps >= 6) {
    title = 'ハリウッド公認・劇場型天才ハッカー';
    roast = '猛烈な連打の後にスッと手を止め、「…ビンゴ」と呟くあの間（タメ）が完璧。全米映画協会からスカウトが来ます。';
    styleTag = 'CINEMATIC MASTER';
  } else if (enterHits >= 10) {
    title = 'Enterキー粉砕神（ターンッ！の求道者）';
    roast = '打鍵圧の90%がEnterキーに集中しています。映画終盤でメインフレームを落とす時の最後のターンッ！だけは超一流！';
    styleTag = 'ENTER SLAMMER';
  } else if (peakKps >= 15 || avgKps >= 12) {
    title = '音速のガトリング打鍵サイバーゴリラ';
    roast = 'もはやハッキングではなく連射速度でサーバーの吸気ファンを壊す戦法。キーボードの軸が悲鳴を上げています！';
    styleTag = 'GATLING TYPIST';
  } else if (avgKps >= 8.5) {
    title = '深夜2時の国家機密クラッカー';
    roast = '冷めた缶コーヒーとエナジードリンクを胃に流し込みながら、ペンタゴンの裏口を暴くベテランの風格があります。';
    styleTag = 'NIGHT OPERATOR';
  } else if (avgKps >= 5.5) {
    title = '映画『ダイ・ハード』序盤の巻き込まれハッカー';
    roast = 'それっぽいタイピング速度ですが、主人公が部屋に突入してきた瞬間に両手を挙げて降伏するタイプです。';
    styleTag = 'ACTION EXTRA';
  } else if (avgKps >= 3) {
    title = 'F5連打でサーバーを落とす職人';
    roast = 'ハッキングというより、コンサートの先行予約チケットを意地でも勝ち取ろうとする一般人の必死さが出ています。';
    styleTag = 'F5 WARRIOR';
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
    score,
    rank,
    title,
    roast,
    styleTag
  };
}
