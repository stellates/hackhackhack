// Canvas PNG Exporter for Hacker Certificate & Incident Report

import { TypingMetrics } from './evaluator';

export function generateReportCardCanvas(metrics: TypingMetrics): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 675;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Dark Futuristic Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#04080e');
  bgGrad.addColorStop(0.5, '#071018');
  bgGrad.addColorStop(1, '#020408');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Cyber Grid lines
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Cyber Corner brackets
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  const margin = 24;
  const bracketLen = 40;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketLen);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketLen, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketLen, margin);
  ctx.lineTo(width - margin, margin);
  ctx.lineTo(width - margin, margin + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, height - margin - bracketLen);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(margin + bracketLen, height - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketLen, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.lineTo(width - margin, height - margin - bracketLen);
  ctx.stroke();

  // Outer border with subtle neon glow
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 6, margin + 6, width - (margin + 6) * 2, height - (margin + 6) * 2);

  // 4. Header Bar
  ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
  ctx.fillRect(margin + 10, margin + 10, width - (margin + 10) * 2, 54);

  ctx.fillStyle = '#ff3366';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('TOP SECRET // MAINFRAME INTRUSION REPORT', margin + 25, margin + 34);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.textAlign = 'right';
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  ctx.fillText(`INCIDENT TIMESTAMP: ${now} UTC`, width - margin - 25, margin + 34);
  ctx.textAlign = 'left';

  // 5. Title & Game Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('THE HOLLYWOOD HACKER', margin + 30, margin + 110);

  // Difficulty badge on certificate
  const diff = metrics.difficulty || 'NORMAL';
  let diffBadgeColor = '#00e5ff';
  if (diff === 'EASY') diffBadgeColor = '#00ff88';
  else if (diff === 'HARD') diffBadgeColor = '#ff0055';

  ctx.fillStyle = diffBadgeColor;
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`[ DIFFICULTY: ${diff} MODE ]`, width - margin - 30, margin + 110);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('MISSION DEBRIEFING & APTITUDE CERTIFICATION', margin + 30, margin + 135);

  // 6. Left Column: Rank Badge & Score
  // Rank Box
  const rankBoxX = margin + 30;
  const rankBoxY = margin + 160;
  const rankBoxW = 280;
  const rankBoxH = 340;

  ctx.fillStyle = 'rgba(0, 20, 30, 0.7)';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.fillRect(rankBoxX, rankBoxY, rankBoxW, rankBoxH);
  ctx.strokeRect(rankBoxX, rankBoxY, rankBoxW, rankBoxH);

  // Subtitle
  ctx.fillStyle = '#88a0b0';
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER APTITUDE RANK', rankBoxX + rankBoxW / 2, rankBoxY + 36);

  // Giant Rank Letters
  let rankColor = '#00ff88';
  if (metrics.rank === 'SSS') rankColor = '#ffcc00';
  else if (metrics.rank === 'SS') rankColor = '#00ffff';
  else if (metrics.rank === 'S') rankColor = '#33ff77';
  else if (metrics.rank === 'A') rankColor = '#33bbff';
  else if (metrics.rank === 'B') rankColor = '#ddaa33';
  else if (metrics.rank === 'C') rankColor = '#ff6633';
  else rankColor = '#ff3333';

  ctx.fillStyle = rankColor;
  ctx.font = '900 86px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.shadowColor = rankColor;
  ctx.shadowBlur = 18;
  ctx.fillText(metrics.rank, rankBoxX + rankBoxW / 2, rankBoxY + 140);
  ctx.shadowBlur = 0; // reset

  // Score
  ctx.fillStyle = '#88a0b0';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('TOTAL SCORE', rankBoxX + rankBoxW / 2, rankBoxY + 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillText(`${metrics.score.toLocaleString()} PTS`, rankBoxX + rankBoxW / 2, rankBoxY + 235);

  // Style Tag
  ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
  ctx.fillRect(rankBoxX + 20, rankBoxY + 270, rankBoxW - 40, 32);
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText(`[ ${metrics.styleTag} ]`, rankBoxX + rankBoxW / 2, rankBoxY + 291);

  ctx.textAlign = 'left';

  // 7. Right Column: Title, Metrics, Roast
  const rightX = rankBoxX + rankBoxW + 30;
  const rightW = width - rightX - margin - 30;

  // Title Box
  ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
  ctx.fillRect(rightX, rankBoxY, rightW, 64);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
  ctx.strokeRect(rightX, rankBoxY, rightW, 64);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText('DESIGNATED TITLE (ハッカー称号):', rightX + 16, rankBoxY + 24);

  ctx.fillStyle = '#ffff66';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(metrics.title, rightX + 16, rankBoxY + 52);

  // Metrics Grid (6 items in 2x3 grid)
  const metricY = rankBoxY + 76;
  const gridW = (rightW - 15) / 2;
  const gridH = 54;

  const stats = [
    { label: 'SYNC RATE (同期率)', val: `${metrics.syncRate}%` },
    { label: 'PEAK / AVG SPEED', val: `${metrics.peakKps} / ${metrics.avgKps} KPS` },
    { label: 'PERFECT / GREAT', val: `${metrics.perfectCount} / ${metrics.greatCount}` },
    { label: 'MISS / PENALTY', val: `${metrics.missCount} / ${metrics.penaltyCount}` },
    { label: 'DRAMATIC PAUSE (劇的タメ)', val: `${metrics.dramaticPauses} 回` },
    { label: 'ENTER SMASH (Enter強打)', val: `${metrics.enterHits} 回` }
  ];

  stats.forEach((st, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = rightX + col * (gridW + 15);
    const boxY = metricY + row * (gridH + 8);

    ctx.fillStyle = 'rgba(10, 20, 30, 0.6)';
    ctx.fillRect(boxX, boxY, gridW, gridH);
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.2)';
    ctx.strokeRect(boxX, boxY, gridW, gridH);

    ctx.fillStyle = '#88a0b0';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(st.label, boxX + 10, boxY + 18);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.fillText(st.val, boxX + 10, boxY + 42);
  });

  // Roast / Critique Box
  const roastY = metricY + 3 * (gridH + 8) + 4;
  const roastH = 76;
  ctx.fillStyle = 'rgba(255, 51, 102, 0.08)';
  ctx.fillRect(rightX, roastY, rightW, roastH);
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.3)';
  ctx.strokeRect(rightX, roastY, rightW, roastH);

  ctx.fillStyle = '#ff6688';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('AI INTRUSION CRITIQUE (AIによるツッコミ寸評):', rightX + 16, roastY + 20);

  ctx.fillStyle = '#e0e8f0';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';

  // Wrap text to fit
  wrapText(ctx, metrics.roast, rightX + 16, roastY + 44, rightW - 32, 20);

  // 8. Footer Bar
  ctx.fillStyle = '#556677';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('VERIFIED BY: HOLLYWOOD MAINFRAME CYBER-SECURITY DIVISION // NO ACTUAL SYSTEM WAS HARMED', margin + 30, height - margin - 15);

  ctx.textAlign = 'right';
  ctx.fillText('#HollywoodHacker #ハッカータイピング', width - margin - 30, height - margin - 15);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const chars = text.split('');
  let line = '';

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = chars[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

export function downloadReportCard(metrics: TypingMetrics): void {
  const canvas = generateReportCardCanvas(metrics);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `hacker_report_${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
