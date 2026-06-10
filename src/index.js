const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXUS // Cursor Test Project</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --cyan: #00f0ff;
      --magenta: #ff00aa;
      --purple: #7b2fff;
      --bg: #020810;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      font-family: 'Share Tech Mono', monospace;
      color: var(--cyan);
    }

    #canvas {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .scanlines {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 240, 255, 0.015) 2px,
        rgba(0, 240, 255, 0.015) 4px
      );
    }

    .vignette {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: radial-gradient(ellipse at center, transparent 40%, rgba(2, 8, 16, 0.85) 100%);
    }

    .hud {
      position: fixed;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 28px 36px;
    }

    .hud-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .hud-title {
      font-family: 'Orbitron', sans-serif;
      font-weight: 900;
      font-size: clamp(1.4rem, 4vw, 2.4rem);
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #fff;
      text-shadow:
        0 0 10px var(--cyan),
        0 0 30px var(--cyan),
        0 0 60px rgba(0, 240, 255, 0.4);
      animation: flicker 4s infinite;
    }

    .hud-subtitle {
      font-size: 0.75rem;
      letter-spacing: 0.5em;
      color: var(--magenta);
      margin-top: 6px;
      opacity: 0.8;
    }

    .hud-status {
      text-align: right;
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      line-height: 1.8;
      color: rgba(0, 240, 255, 0.6);
    }

    .hud-status .online {
      color: #00ff88;
      text-shadow: 0 0 8px #00ff88;
    }

    .hud-center {
      text-align: center;
      pointer-events: none;
    }

    .hud-center p {
      font-size: 0.85rem;
      letter-spacing: 0.3em;
      color: rgba(255, 255, 255, 0.35);
      text-transform: uppercase;
    }

    .hud-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .data-panel {
      border: 1px solid rgba(0, 240, 255, 0.25);
      background: rgba(0, 240, 255, 0.03);
      padding: 14px 18px;
      backdrop-filter: blur(4px);
      position: relative;
    }

    .data-panel::before,
    .data-panel::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border-color: var(--cyan);
      border-style: solid;
    }

    .data-panel::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
    .data-panel::after { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

    .data-panel h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.6rem;
      letter-spacing: 0.4em;
      color: var(--magenta);
      margin-bottom: 10px;
    }

    .data-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      font-size: 0.72rem;
      line-height: 1.9;
      color: rgba(0, 240, 255, 0.7);
    }

    .data-row span:last-child {
      color: #fff;
      text-shadow: 0 0 6px var(--cyan);
    }

    .waveform {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 32px;
    }

    .waveform span {
      display: block;
      width: 4px;
      background: linear-gradient(to top, var(--purple), var(--cyan));
      border-radius: 1px;
      animation: wave 1.2s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { height: 4px; opacity: 0.4; }
      50% { height: 28px; opacity: 1; }
    }

    @keyframes flicker {
      0%, 95%, 100% { opacity: 1; }
      96% { opacity: 0.85; }
      97% { opacity: 1; }
      98% { opacity: 0.7; }
    }

    .corner-bracket {
      position: fixed;
      width: 40px;
      height: 40px;
      z-index: 10;
      pointer-events: none;
    }

    .corner-bracket.tl { top: 16px; left: 16px; border-top: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
    .corner-bracket.tr { top: 16px; right: 16px; border-top: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
    .corner-bracket.bl { bottom: 16px; left: 16px; border-bottom: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
    .corner-bracket.br { bottom: 16px; right: 16px; border-bottom: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div class="scanlines"></div>
  <div class="vignette"></div>

  <div class="corner-bracket tl"></div>
  <div class="corner-bracket tr"></div>
  <div class="corner-bracket bl"></div>
  <div class="corner-bracket br"></div>

  <div class="hud">
    <div class="hud-top">
      <div>
        <div class="hud-title">NEXUS</div>
        <div class="hud-subtitle">// CURSOR TEST PROJECT</div>
      </div>
      <div class="hud-status">
        SYS <span class="online">ONLINE</span><br>
        UPTIME <span id="uptime">00:00:00</span><br>
        FPS <span id="fps">60</span>
      </div>
    </div>

    <div class="hud-center">
      <p>Neural lattice visualization active</p>
    </div>

    <div class="hud-bottom">
      <div class="data-panel">
        <h3>SYSTEM DATA</h3>
        <div class="data-row"><span>NODE</span><span>${process.version}</span></div>
        <div class="data-row"><span>PROJECT</span><span>cursor-test-project</span></div>
        <div class="data-row"><span>PARTICLES</span><span id="particle-count">—</span></div>
        <div class="data-row"><span>CONNECTIONS</span><span id="conn-count">—</span></div>
      </div>
      <div class="data-panel">
        <h3>SIGNAL</h3>
        <div class="waveform" id="waveform"></div>
      </div>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy;
    let mouse = { x: 0, y: 0 };
    let startTime = performance.now();
    let frameCount = 0, lastFpsTime = startTime, fps = 60;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    // Build waveform bars
    const wf = document.getElementById('waveform');
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('span');
      bar.style.animationDelay = (i * 0.07) + 's';
      bar.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      wf.appendChild(bar);
    }

    // Particle network
    const PARTICLE_COUNT = 180;
    const CONNECT_DIST = 140;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random() * 400 - 200,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        hue: Math.random() > 0.5 ? 185 : 310,
      });
    }

    document.getElementById('particle-count').textContent = PARTICLE_COUNT;

    // Perspective grid floor
    function drawGrid(time) {
      const horizon = cy * 0.55;
      const speed = (time * 0.0004) % 1;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;

      // Horizontal lines receding
      for (let i = 0; i < 20; i++) {
        const t = (i / 20 + speed) % 1;
        const y = horizon + t * t * (H - horizon);
        const alpha = t * 0.5;
        ctx.strokeStyle = \`rgba(0, 240, 255, \${alpha * 0.12})\`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Vertical perspective lines
      const vanishX = cx + (mouse.x - cx) * 0.15;
      ctx.strokeStyle = 'rgba(123, 47, 255, 0.08)';
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishX, horizon);
        ctx.lineTo(vanishX + i * 80, H);
        ctx.stroke();
      }
    }

    // Central rotating torus wireframe
    function drawTorus(time) {
      const rotX = time * 0.0008;
      const rotY = time * 0.0012;
      const R = Math.min(W, H) * 0.18;
      const r = R * 0.38;
      const segments = 32;
      const rings = 16;

      const points = [];
      for (let i = 0; i <= rings; i++) {
        const u = (i / rings) * Math.PI * 2;
        for (let j = 0; j <= segments; j++) {
          const v = (j / segments) * Math.PI * 2;
          let x = (R + r * Math.cos(v)) * Math.cos(u);
          let y = (R + r * Math.cos(v)) * Math.sin(u);
          let z = r * Math.sin(v);

          // Rotate X
          let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
          let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
          // Rotate Y
          let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
          let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

          const scale = 600 / (600 + z2);
          points.push({ x: cx + x2 * scale, y: cy + y1 * scale, z: z2, scale });
        }
      }

      const cols = segments + 1;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
          const idx = i * cols + j;
          const a = points[idx];
          const b = points[idx + 1];
          const c = points[(i + 1) * cols + j];
          const depth = (a.z + 600) / 1200;
          const alpha = 0.15 + depth * 0.55;
          ctx.strokeStyle = \`rgba(0, 240, 255, \${alpha})\`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.strokeStyle = \`rgba(255, 0, 170, \${alpha * 0.6})\`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }
    }

    function drawParticles(time) {
      const mx = (mouse.x - cx) * 0.02;
      const my = (mouse.y - cy) * 0.02;
      let connections = 0;

      particles.forEach(p => {
        p.x += p.vx + mx * 0.01;
        p.y += p.vy + my * 0.01;
        p.z += p.vz;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        if (p.z < -200) p.z = 200;
        if (p.z > 200) p.z = -200;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz * 0.5);
          if (dist < CONNECT_DIST) {
            connections++;
            const alpha = (1 - dist / CONNECT_DIST) * 0.35;
            const avgZ = (a.z + b.z) / 2;
            const scale = 600 / (600 + avgZ);
            ctx.strokeStyle = \`hsla(\${a.hue}, 100%, 60%, \${alpha * scale})\`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const scale = 600 / (600 + p.z);
        const size = p.size * scale;
        const alpha = 0.4 + scale * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = \`hsla(\${p.hue}, 100%, 70%, \${alpha})\`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = \`hsla(\${p.hue}, 100%, 60%, \${alpha * 0.15})\`;
        ctx.fill();
      });

      document.getElementById('conn-count').textContent = connections;
    }

    function drawPulseRings(time) {
      for (let i = 0; i < 3; i++) {
        const phase = ((time * 0.0006 + i * 0.33) % 1);
        const radius = phase * Math.min(W, H) * 0.45;
        const alpha = (1 - phase) * 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = \`rgba(0, 240, 255, \${alpha})\`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function animate(time) {
      frameCount++;
      if (time - lastFpsTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsTime = time;
        document.getElementById('fps').textContent = fps;

        const elapsed = Math.floor((time - startTime) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        document.getElementById('uptime').textContent = h + ':' + m + ':' + s;
      }

      ctx.fillStyle = 'rgba(2, 8, 16, 0.25)';
      ctx.fillRect(0, 0, W, H);

      drawGrid(time);
      drawPulseRings(time);
      drawTorus(time);
      drawParticles(time);

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  </script>
</body>
</html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
