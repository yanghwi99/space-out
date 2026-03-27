const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Clouds ──────────────────────────────────────────────────────────
const clouds = Array.from({ length: 6 }, (_, i) => ({
  x: Math.random() * W * 1.5,
  y: H * (0.05 + Math.random() * 0.28),
  speed: 0.12 + Math.random() * 0.18,
  size: 55 + Math.random() * 90,
  opacity: 0.72 + Math.random() * 0.25,
}));

function drawCloud(c) {
  ctx.save();
  ctx.globalAlpha = c.opacity;
  ctx.fillStyle = '#FFFFFF';
  const s = c.size;
  ctx.beginPath();
  ctx.arc(c.x, c.y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(c.x + s * 0.42, c.y + s * 0.05, s * 0.42, 0, Math.PI * 2);
  ctx.arc(c.x - s * 0.35, c.y + s * 0.05, s * 0.36, 0, Math.PI * 2);
  ctx.arc(c.x + s * 0.12, c.y - s * 0.32, s * 0.44, 0, Math.PI * 2);
  ctx.arc(c.x - s * 0.08, c.y + s * 0.18, s * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Flowers ─────────────────────────────────────────────────────────
const FLOWER_COLORS = [
  '#FF7BAE',
  '#FFD966',
  '#FF9EC4',
  '#FFF07C',
  '#AEE9A0',
  '#FFB347',
];
const flowers = Array.from({ length: 38 }, () => ({
  x: Math.random() * W,
  y: 0,
  color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)],
  size: 2.8 + Math.random() * 2.8,
  phase: Math.random() * Math.PI * 2,
}));

function initFlowers() {
  flowers.forEach((f) => {
    f.x = Math.random() * W;
    f.y = H * (0.73 + Math.random() * 0.24);
  });
}
initFlowers();
window.addEventListener('resize', initFlowers);

function drawFlowers(t) {
  flowers.forEach((f) => {
    const stemLen = f.size * 3.5;
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.x, f.y - stemLen);
    ctx.stroke();

    const cx = f.x,
      cy = f.y - stemLen;
    const PETALS = 5;
    ctx.fillStyle = f.color;
    for (let i = 0; i < PETALS; i++) {
      const a = (i / PETALS) * Math.PI * 2 + f.phase;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * f.size * 1.6,
        cy + Math.sin(a) * f.size * 1.6,
        f.size,
        f.size * 0.6,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = '#FFE033';
    ctx.beginPath();
    ctx.arc(cx, cy, f.size * 0.75, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ── Sheep ────────────────────────────────────────────────────────────
class Sheep {
  constructor(idx) {
    this.size = 0.65 + Math.random() * 0.55;
    this.woolTint = Math.random() < 0.15 ? '#C8D8C0' : '#F3F0E6';
    this.x = 80 + Math.random() * (W - 160);
    this.y = 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 0.4 + Math.random() * 0.45;
    this.walkTime = Math.random() * Math.PI * 2;
    this.facing = Math.random() < 0.5 ? 1 : -1;
    this.state = 'idle';
    this.stateTimer = Math.random() * 3000;
    this.stateDuration = 1500 + Math.random() * 4000;
    this.initY();
  }

  initY() {
    this.y = H * (0.72 + Math.random() * 0.2);
    this.targetY = this.y;
  }

  pickNewTarget() {
    const r = Math.random();
    if (r < 0.18) {
      this.targetX = -(80 + Math.random() * 120);
    } else if (r < 0.36) {
      this.targetX = W + 80 + Math.random() * 120;
    } else {
      this.targetX = 60 + Math.random() * (W - 120);
    }
    this.targetY = H * (0.72 + Math.random() * 0.2);
  }

  update(dt) {
    this.stateTimer += dt;

    if (this.stateTimer >= this.stateDuration) {
      this.stateTimer = 0;
      this.stateDuration = 1200 + Math.random() * 5000;
      const r = Math.random();
      if (r < 0.55) {
        this.state = 'walk';
        this.pickNewTarget();
      } else if (r < 0.8) {
        this.state = 'graze';
      } else {
        this.state = 'idle';
      }
    }

    if (this.state === 'walk') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        const step = this.speed * dt * 0.048;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.facing = dx > 0 ? 1 : -1;
        this.walkTime += dt * 0.0048;
      } else {
        this.state = 'idle';
      }
    }

    this.x = Math.max(-250, Math.min(W + 250, this.x));
    this.y = Math.max(H * 0.7, Math.min(H * 0.93, this.y));
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size, this.size);
    if (this.facing < 0) ctx.scale(-1, 1);

    const grazing = this.state === 'graze';
    const headTip = grazing ? 0.55 : 0.0;
    const swing = this.state === 'walk' ? Math.sin(this.walkTime) * 0.28 : 0;

    this.drawLegs(swing);
    this.drawBody();
    this.drawHead(headTip);

    ctx.restore();
  }

  drawBody() {
    const w = this.woolTint;
    ctx.fillStyle = w;
    const blobs = [
      [0, -14, 20],
      [16, -10, 17],
      [-16, -10, 16],
      [8, -26, 15],
      [-8, -24, 14],
      [22, -22, 13],
      [-20, -20, 12],
      [0, -4, 16],
    ];
    blobs.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = w;
    ctx.beginPath();
    ctx.arc(-25, -10, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHead(tipAngle) {
    ctx.save();
    ctx.translate(26, -20);
    ctx.rotate(tipAngle);

    ctx.fillStyle = '#D4C8B0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C2B09A';
    ctx.beginPath();
    ctx.ellipse(3, -10, 5, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E8A0A0';
    ctx.beginPath();
    ctx.ellipse(3, -10, 3, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2A2010';
    ctx.beginPath();
    ctx.arc(8, -2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(9, -3, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#A87860';
    ctx.beginPath();
    ctx.ellipse(12, 3, 3.5, 2.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawLegs(swing) {
    const pairs = [
      { x: -10, phase: swing },
      { x: 2, phase: -swing },
      { x: 12, phase: swing },
      { x: 20, phase: -swing },
    ];
    pairs.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, -4);
      ctx.rotate(p.phase);
      ctx.fillStyle = '#4A3020';
      ctx.beginPath();
      ctx.roundRect(-3.5, 0, 7, 22, 2);
      ctx.fill();
      ctx.fillStyle = '#2A1A0C';
      ctx.beginPath();
      ctx.roundRect(-4, 18, 8, 6, 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

// ── Border Collie ────────────────────────────────────────────────────
class BorderCollie {
  constructor(shepherdRef) {
    this.shepherd = shepherdRef;
    this.x = W * 0.45;
    this.y = H * 0.82;
    this.facing = 1;
    this.speed = 1.3;
    this.walkTime = 0;
    this.state = 'follow';
    this.stateTimer = 0;
    this.stateDuration = 2000 + Math.random() * 3000;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= this.stateDuration) {
      this.stateTimer = 0;
      this.stateDuration = 1500 + Math.random() * 3000;
      const r = Math.random();
      if (r < 0.5) {
        this.state = 'follow';
      } else if (r < 0.8 && sheepList.length > 0) {
        this.state = 'herd';
        const target = sheepList[Math.floor(Math.random() * sheepList.length)];
        this.targetX = target.x + (Math.random() - 0.5) * 40;
        this.targetY = target.y;
      } else {
        this.state = 'idle';
      }
    }
    if (this.state === 'follow') {
      this.targetX = this.shepherd.x + (this.shepherd.facing > 0 ? -55 : 55);
      this.targetY = this.shepherd.y + 10;
    }
    if (this.state !== 'idle') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      const spd = this.state === 'herd' ? this.speed * 1.8 : this.speed;
      if (dist > 5) {
        const step = spd * dt * 0.048;
        this.x += (dx / dist) * Math.min(step, dist);
        this.y += (dy / dist) * Math.min(step, dist);
        this.facing = dx > 0 ? 1 : -1;
        this.walkTime += dt * (this.state === 'herd' ? 0.009 : 0.006);
      }
    }
    this.x = Math.max(-120, Math.min(W + 120, this.x));
    this.y = Math.max(H * 0.7, Math.min(H * 0.93, this.y));
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.facing < 0) ctx.scale(-1, 1);
    const swing = this.state !== 'idle' ? Math.sin(this.walkTime) * 0.32 : 0;

    [
      [-10, swing],
      [2, -swing],
      [13, swing],
      [21, -swing],
    ].forEach(([lx, ph]) => {
      ctx.save();
      ctx.translate(lx, -3);
      ctx.rotate(ph);
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.roundRect(-2.5, 0, 5, 17, 1);
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(5, -14, 23, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EFEFEF';
    ctx.beginPath();
    ctx.ellipse(18, -10, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.ellipse(4, -6, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, -12);
    ctx.quadraticCurveTo(-32, -30, -24, -36);
    ctx.stroke();
    ctx.strokeStyle = '#EEE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-26, -32);
    ctx.quadraticCurveTo(-28, -38, -24, -36);
    ctx.stroke();
    ctx.save();
    ctx.translate(28, -22);
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EEE';
    ctx.beginPath();
    ctx.ellipse(4, 1, 3, 5.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.ellipse(10, 3, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(14, 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4A3010';
    ctx.beginPath();
    ctx.arc(5, -3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(6, -4, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(-2, -8, 4, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}

// ── Shepherd ─────────────────────────────────────────────────────────
class Shepherd {
  constructor() {
    const fromLeft = Math.random() < 0.5;
    this.x = fromLeft ? -50 : W + 50;
    this.y = H * (0.74 + Math.random() * 0.1);
    this.facing = fromLeft ? 1 : -1;
    this.speed = 0.22 + Math.random() * 0.1;
    this.walkTime = 0;
    this.state = 'walk';
    this.stateTimer = 0;
    this.stateDuration = 3000 + Math.random() * 5000;
    this.targetX = fromLeft
      ? W * 0.25 + Math.random() * W * 0.55
      : W * 0.2 + Math.random() * W * 0.55;
    this.targetY = this.y;
    this.hatColor = ['#5C3A1E', '#2C4A1E', '#3A2C5C'][
      Math.floor(Math.random() * 3)
    ];
    this.coatColor = ['#8B7355', '#6B8B55', '#7B6B45'][
      Math.floor(Math.random() * 3)
    ];
  }

  isOffScreen() {
    return this.x < -90 || this.x > W + 90;
  }

  update(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= this.stateDuration) {
      this.stateTimer = 0;
      this.stateDuration = 2000 + Math.random() * 5000;
      const r = Math.random();
      if (r < 0.6) {
        this.state = 'walk';
        if (Math.random() < 0.2) {
          this.targetX = this.facing > 0 ? W + 70 : -70;
        } else {
          this.targetX = 80 + Math.random() * (W - 160);
        }
        this.targetY = H * (0.74 + Math.random() * 0.1);
      } else {
        this.state = 'idle';
      }
    }
    if (this.state === 'walk') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        const step = this.speed * dt * 0.048;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.facing = dx > 0 ? 1 : -1;
        this.walkTime += dt * 0.004;
      } else {
        this.state = 'idle';
      }
    }
    this.x = Math.max(-120, Math.min(W + 120, this.x));
    this.y = Math.max(H * 0.7, Math.min(H * 0.93, this.y));
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.facing < 0) ctx.scale(-1, 1);
    const swing = this.state === 'walk' ? Math.sin(this.walkTime) * 0.22 : 0;

    ctx.save();
    ctx.translate(26, -12);
    ctx.rotate(-0.15 + swing * 0.25);
    ctx.strokeStyle = '#6B4423';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -68);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-6, -68, 6, 0, Math.PI, true);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(-7, -8);
    ctx.rotate(-swing);
    ctx.fillStyle = '#3A2C1E';
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 30, 2);
    ctx.fill();
    ctx.fillStyle = '#2A1A0C';
    ctx.beginPath();
    ctx.roundRect(-5, 26, 10, 8, 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(7, -8);
    ctx.rotate(swing);
    ctx.fillStyle = '#3A2C1E';
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 30, 2);
    ctx.fill();
    ctx.fillStyle = '#2A1A0C';
    ctx.beginPath();
    ctx.roundRect(-5, 26, 10, 8, 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = this.coatColor;
    ctx.beginPath();
    ctx.roundRect(-14, -50, 28, 42, 4);
    ctx.fill();

    ctx.save();
    ctx.translate(14, -44);
    ctx.rotate(swing * 0.5);
    ctx.fillStyle = this.coatColor;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 24, 3);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(-14, -44);
    ctx.rotate(-swing * 0.5);
    ctx.fillStyle = this.coatColor;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 24, 3);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#C8A882';
    ctx.beginPath();
    ctx.roundRect(-5, -58, 10, 11, 2);
    ctx.fill();
    ctx.fillStyle = '#D4AA82';
    ctx.beginPath();
    ctx.ellipse(0, -68, 11, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3A2010';
    ctx.beginPath();
    ctx.arc(6, -68, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.hatColor;
    ctx.beginPath();
    ctx.ellipse(0, -79, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-10, -96, 20, 18, [4, 4, 0, 0]);
    ctx.fill();

    ctx.restore();
  }
}

// ── Wolf ─────────────────────────────────────────────────────────────
class Wolf {
  constructor() {
    this.cycleTime = Math.random() * 120000; // 랜덤 위상으로 시작
    this.cycleDuration = 120000;
    this.visibleDuration = 60000;
    this.visible = false;
    this.x = -100;
    this.y = H * 0.62;
    this.facing = 1;
    this.speed = 0.55;
    this.walkTime = 0;
    this.targetX = W * 0.5;
  }

  reset() {
    this.facing = -1;
    this.x = W + 90;
    this.y = H * (0.59 + Math.random() * 0.05);
    this.targetX = 80 + Math.random() * (W - 160);
    this.walkTime = 0;
  }

  update(dt) {
    this.cycleTime += dt;
    if (this.cycleTime >= this.cycleDuration)
      this.cycleTime -= this.cycleDuration;

    const wasVisible = this.visible;
    this.visible = this.cycleTime >= this.cycleDuration - this.visibleDuration;

    if (this.visible && !wasVisible) this.reset();

    if (this.visible) {
      const dx = this.targetX - this.x;
      const dist = Math.abs(dx);
      if (dist > 4) {
        const step = this.speed * dt * 0.048;
        this.x += (dx / dist) * step;
        this.facing = dx > 0 ? 1 : -1;
        this.walkTime += dt * 0.005;
      } else {
        // 목표 도달 시 반대편으로 빠져나가거나 새 목표
        if (Math.random() < 0.45) {
          this.targetX = W + 110;
        } else {
          this.targetX = 80 + Math.random() * (W - 160);
        }
      }
    }
  }

  draw() {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.facing < 0) ctx.scale(-1, 1);
    ctx.scale(0.72, 0.72);

    const swing = Math.sin(this.walkTime) * 0.3;

    // 다리
    [
      [-10, swing],
      [0, -swing],
      [10, swing],
      [18, -swing],
    ].forEach(([lx, ph]) => {
      ctx.save();
      ctx.translate(lx, -2);
      ctx.rotate(ph);
      ctx.fillStyle = '#3A3530';
      ctx.beginPath();
      ctx.roundRect(-3, 0, 6, 19, 1);
      ctx.fill();
      ctx.restore();
    });

    // 몸통
    ctx.fillStyle = '#5A5248';
    ctx.beginPath();
    ctx.ellipse(2, -16, 22, 11, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 꼬리
    ctx.strokeStyle = '#5A5248';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, -13);
    ctx.quadraticCurveTo(-34, -26, -28, -36);
    ctx.stroke();

    // 목
    ctx.fillStyle = '#5A5248';
    ctx.beginPath();
    ctx.ellipse(20, -22, 8, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 머리
    ctx.save();
    ctx.translate(26, -26);
    ctx.fillStyle = '#5A5248';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // 주둥이
    ctx.fillStyle = '#4A4540';
    ctx.beginPath();
    ctx.ellipse(10, 4, 8, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // 코
    ctx.fillStyle = '#2A2020';
    ctx.beginPath();
    ctx.ellipse(16, 3, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // 눈
    ctx.fillStyle = '#E8C040';
    ctx.beginPath();
    ctx.arc(4, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(5, -3, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(6, -4, 0.7, 0, Math.PI * 2);
    ctx.fill();
    // 귀
    ctx.fillStyle = '#4A4540';
    ctx.beginPath();
    ctx.moveTo(-4, -9);
    ctx.lineTo(-9, -21);
    ctx.lineTo(2, -13);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

// ── Sheep 관리 ───────────────────────────────────────────────────────
const MAX_SHEEP = 10;
let sheepList = [];
let spawnCooldown = 0;

function spawnFromEdge() {
  const s = new Sheep();
  const fromLeft = Math.random() < 0.5;
  s.x = fromLeft ? -60 : W + 60;
  s.y = H * (0.72 + Math.random() * 0.2);
  s.targetY = s.y;
  s.targetX = fromLeft
    ? 120 + Math.random() * (W * 0.75)
    : W * 0.25 + Math.random() * (W * 0.75);
  s.facing = fromLeft ? 1 : -1;
  s.state = 'walk';
  s.stateTimer = 0;
  s.stateDuration = 2000 + Math.random() * 4000;
  return s;
}

sheepList = Array.from({ length: 7 }, () => {
  const s = new Sheep();
  s.initY();
  return s;
});

let shepherd = new Shepherd();
const collie = new BorderCollie(shepherd);
const wolf = new Wolf();

// ── Draw scene ───────────────────────────────────────────────────────
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.75);
  g.addColorStop(0.0, '#5BA8CC');
  g.addColorStop(0.5, '#8FCDE0');
  g.addColorStop(1.0, '#BDE8F4');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawSun() {
  const sx = W * 0.84,
    sy = H * 0.1;
  const glow = ctx.createRadialGradient(sx, sy, 20, sx, sy, 90);
  glow.addColorStop(0, 'rgba(255,235,100,0.38)');
  glow.addColorStop(1, 'rgba(255,235,100,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 90, sy - 90, 180, 180);

  const sunG = ctx.createRadialGradient(sx, sy, 0, sx, sy, 36);
  sunG.addColorStop(0, '#FFFBC0');
  sunG.addColorStop(0.5, '#FFD700');
  sunG.addColorStop(1, '#FFA500');
  ctx.fillStyle = sunG;
  ctx.beginPath();
  ctx.arc(sx, sy, 36, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills() {
  ctx.fillStyle = '#79C268';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.bezierCurveTo(W * 0.1, H * 0.52, W * 0.32, H * 0.48, W * 0.52, H * 0.57);
  ctx.bezierCurveTo(W * 0.72, H * 0.65, W * 0.85, H * 0.5, W, H * 0.58);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#5BB849';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.bezierCurveTo(W * 0.18, H * 0.6, W * 0.38, H * 0.56, W * 0.58, H * 0.64);
  ctx.bezierCurveTo(W * 0.75, H * 0.7, W * 0.88, H * 0.59, W, H * 0.64);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#4CAF3C';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.72);
  ctx.bezierCurveTo(W * 0.22, H * 0.68, W * 0.48, H * 0.72, W * 0.74, H * 0.69);
  ctx.bezierCurveTo(W * 0.87, H * 0.67, W * 1.0, H * 0.7, W, H * 0.7);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3D9A30';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.73);
  ctx.bezierCurveTo(W * 0.3, H * 0.705, W * 0.65, H * 0.735, W, H * 0.715);
  ctx.lineTo(W, H * 0.745);
  ctx.bezierCurveTo(W * 0.65, H * 0.765, W * 0.3, H * 0.735, 0, H * 0.755);
  ctx.closePath();
  ctx.fill();
}

function drawGrassBlades(t) {
  ctx.strokeStyle = '#3A9C28';
  ctx.lineWidth = 1.2;
  const baseY = H * 0.72;
  for (let x = 0; x < W; x += 18) {
    const by = baseY + Math.sin(x * 0.08) * 4;
    const sway = Math.sin(t * 0.0006 + x * 0.04) * 3;
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.quadraticCurveTo(x + sway, by - 12, x + sway * 1.6, by - 20);
    ctx.stroke();
  }
}

// ── Main loop ────────────────────────────────────────────────────────
let lastTS = 0;
function animate(ts) {
  const dt = Math.min(ts - lastTS, 60);
  lastTS = ts;

  ctx.clearRect(0, 0, W, H);

  drawSky();
  drawSun();

  clouds.forEach((c) => {
    c.x += c.speed;
    if (c.x > W + c.size * 2) c.x = -c.size * 2;
    drawCloud(c);
  });

  drawHills();
  drawGrassBlades(ts);
  drawFlowers(ts);

  sheepList = sheepList.filter((s) => s.x > -220 && s.x < W + 220);

  spawnCooldown -= dt;
  if (sheepList.length < MAX_SHEEP && spawnCooldown <= 0) {
    sheepList.push(spawnFromEdge());
    spawnCooldown = 2500 + Math.random() * 3000;
  }

  if (shepherd.isOffScreen()) {
    shepherd = new Shepherd();
    collie.shepherd = shepherd;
  }
  shepherd.update(dt);
  collie.update(dt);

  sheepList.forEach((s) => s.update(dt));
  wolf.update(dt);

  const allEntities = [
    ...sheepList,
    shepherd,
    collie,
    ...(wolf.visible ? [wolf] : []),
  ];
  allEntities.sort((a, b) => a.y - b.y);
  allEntities.forEach((e) => e.draw());

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// ── 오디오 컨트롤 ─────────────────────────────────────────────────────
const bgm = document.getElementById('bgm');
const muteBtn = document.getElementById('mute-btn');
const volSlider = document.getElementById('vol-slider');

bgm.volume = 0.5;

function startBgm() {
  bgm.play().catch(() => {});
  document.removeEventListener('click', startBgm);
  document.removeEventListener('keydown', startBgm);
}
document.addEventListener('click', startBgm);
document.addEventListener('keydown', startBgm);

volSlider.addEventListener('input', () => {
  bgm.volume = parseFloat(volSlider.value);
  bgm.muted = bgm.volume === 0;
  muteBtn.textContent = bgm.muted ? '🔇' : '🔊';
});

muteBtn.addEventListener('click', () => {
  bgm.muted = !bgm.muted;
  muteBtn.textContent = bgm.muted ? '🔇' : '🔊';
  if (!bgm.muted && bgm.paused) bgm.play().catch(() => {});
});
