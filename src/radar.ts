// Interactive Cyber Radar canvas visualization

export class CyberRadar {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animId: number | null = null;
  private angle: number = 0;
  private blips: Array<{ x: number; y: number; life: number; size: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.initBlips();
  }

  private initBlips() {
    this.blips = [
      { x: 0.35, y: -0.25, life: 1.0, size: 4 },
      { x: -0.45, y: 0.3, life: 0.7, size: 5 },
      { x: 0.2, y: 0.55, life: 0.9, size: 3.5 },
      { x: -0.3, y: -0.4, life: 0.5, size: 4.5 }
    ];
  }

  public start() {
    if (this.animId) return;
    const render = () => {
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  public stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public triggerActivity() {
    // Add dynamic threat blip on high typing activity
    if (this.blips.length < 8) {
      const r = 0.2 + Math.random() * 0.65;
      const th = Math.random() * Math.PI * 2;
      this.blips.push({
        x: Math.cos(th) * r,
        y: Math.sin(th) * r,
        life: 1.0,
        size: 3 + Math.random() * 4
      });
    }
  }

  private draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#060d12';
    ctx.fillRect(0, 0, w, h);

    // Radar concentric circles
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.25)';
    ctx.lineWidth = 1;

    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Radar Sweep Line
    this.angle += 0.04;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

    const sweepX = cx + Math.cos(this.angle) * radius;
    const sweepY = cy + Math.sin(this.angle) * radius;

    // Sweep cone gradient
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
    grad.addColorStop(1, 'rgba(0, 255, 136, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, this.angle - 0.4, this.angle);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.fill();
    ctx.restore();

    // Sweep line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.stroke();

    // Threat Blips
    for (let i = this.blips.length - 1; i >= 0; i--) {
      const blip = this.blips[i];
      const bx = cx + blip.x * radius;
      const by = cy + blip.y * radius;

      ctx.fillStyle = `rgba(255, 68, 68, ${blip.life})`;
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(bx, by, blip.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ping ring
      ctx.strokeStyle = `rgba(255, 68, 68, ${blip.life * 0.5})`;
      ctx.beginPath();
      ctx.arc(bx, by, blip.size * (2 - blip.life), 0, Math.PI * 2);
      ctx.stroke();

      blip.life -= 0.003;
      if (blip.life <= 0) {
        this.blips.splice(i, 1);
      }
    }

    // Labels
    ctx.fillStyle = '#00ff88';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('TRACE-RADAR v4.2', 12, 16);
    ctx.fillStyle = '#ff4444';
    ctx.fillText(`NODES: ${this.blips.length}`, w - 60, 16);
  }
}
