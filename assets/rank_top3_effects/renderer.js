(function () {
  const TAU = Math.PI * 2;

  function hashText(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    let x = seed >>> 0;
    return function () {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967295;
    };
  }

  function rgba(hex, alpha) {
    const raw = hex.replace("#", "");
    const n = parseInt(raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }

  function fitTextSize(ctx, text, maxWidth, startSize) {
    let size = startSize;
    while (size > 32) {
      ctx.font = `900 ${size}px "Microsoft JhengHei","Noto Serif TC","KaiTi",serif`;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 2;
    }
    return size;
  }

  function gradientStroke(ctx, x0, y0, x1, y1, colors) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    colors.forEach(([pos, color]) => g.addColorStop(pos, color));
    return g;
  }

  function drawGlowCore(ctx, effect, t, w, h, strength = 1) {
    // Keep the reward effect transparent against any page background.
    // The large radial underlay looked like a separate mask, so all visible
    // prestige detail now comes from ribbons, particles, strokes, and text glow.
    void ctx;
    void effect;
    void t;
    void w;
    void h;
    void strength;
  }

  function bezierRibbon(ctx, t, y, amp, colorA, colorB, width, phase, alpha) {
    const w = ctx.canvas.width;
    const cx = w / 2;
    const x0 = cx - 220 + Math.sin(t * 0.9 + phase) * 26;
    const x3 = cx + 220 + Math.cos(t * 0.8 + phase) * 26;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = gradientStroke(ctx, x0, y, x3, y, [
      [0, "rgba(255,255,255,0)"],
      [0.22, colorA],
      [0.5, colorB],
      [0.78, colorA],
      [1, "rgba(255,255,255,0)"]
    ]);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.shadowColor = colorB;
    ctx.shadowBlur = width * 3;
    ctx.beginPath();
    ctx.moveTo(x0, y + Math.sin(t + phase) * amp);
    ctx.bezierCurveTo(
      cx - 145, y - amp * 2.4 + Math.sin(t * 1.2 + phase) * amp,
      cx + 145, y + amp * 2.0 + Math.cos(t * 1.1 + phase) * amp,
      x3, y + Math.cos(t + phase) * amp
    );
    ctx.stroke();
    ctx.restore();
  }

  function drawCalligraphyQi(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.25);
    const levels = effect.rank === 1 ? 4 : effect.rank === 2 ? 3 : 2;
    for (let i = 0; i < levels; i += 1) {
      const y = 118 + i * 28 + Math.sin(t * 0.9 + i) * 16;
      bezierRibbon(ctx, t * (0.9 + i * 0.04), y, 18 + i * 5, rgba(i % 2 ? c2 : c1, 0.26), rgba(c0, 0.52), 5.2 + effect.intensity * 2.8, i * 0.8, 0.68);
    }
  }

  function petal(ctx, x, y, s, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -11 * s);
    ctx.bezierCurveTo(13 * s, -7 * s, 10 * s, 12 * s, 0, 16 * s);
    ctx.bezierCurveTo(-10 * s, 12 * s, -13 * s, -7 * s, 0, -11 * s);
    ctx.fill();
    ctx.restore();
  }

  function spark(ctx, x, y, s, color, alpha, blades = 4) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(x * 0.01 + y * 0.02 + blades) * 0.28);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * 0.72;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, s * 0.16);
    ctx.beginPath();
    ctx.moveTo(-s * 0.72, 0);
    ctx.lineTo(s * 0.72, 0);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.22;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.42, s * 0.14, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.82, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawSurfaceDetail(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    const random = rng(hashText(effect.id) + 701);
    const cx = w / 2;
    const cy = h / 2 + 10;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const count = effect.rank === 1 ? 14 : effect.rank === 2 ? 10 : 7;
    for (let i = 0; i < count; i += 1) {
      const angle = random() * TAU + Math.sin(t * 0.55 + i) * 0.55;
      const rx = 62 + random() * 190;
      const ry = 18 + random() * 70;
      const x = cx + Math.cos(angle + t * 0.18) * rx;
      const y = cy + Math.sin(angle * 1.2 + t * 0.26) * ry;
      const a = 0.10 + effect.intensity * 0.18 + Math.sin(t * 2.2 + i) * 0.05;
      if (effect.family === "wardLight") {
        ctx.strokeStyle = rgba(i % 2 ? c2 : c0, a);
        ctx.lineWidth = 1.15;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - 8, y + Math.sin(t + i) * 2);
        ctx.lineTo(x + 8, y - Math.sin(t + i) * 2);
        ctx.stroke();
      } else if (effect.family === "treasurySurge" || effect.family === "brocadeWealth") {
        ctx.strokeStyle = rgba(i % 2 ? c1 : c4, a);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, 5 + random() * 9, 0, TAU);
        ctx.stroke();
      } else if (effect.family === "vowJadeMist") {
        ctx.fillStyle = rgba(i % 2 ? c4 : c0, a * 0.65);
        ctx.beginPath();
        ctx.ellipse(x, y, 22 + random() * 28, 5 + random() * 9, angle, 0, TAU);
        ctx.fill();
      } else if (effect.family === "silkPetalWind") {
        petal(ctx, x, y, 0.34 + random() * 0.24, angle + t, rgba(i % 2 ? c1 : c0, 0.42), a + 0.06);
      } else if (effect.family === "imperialQi") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + t * 0.35);
        ctx.strokeStyle = rgba(i % 2 ? c0 : c4, a + 0.12);
        ctx.lineWidth = 1.4 + random() * 0.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-7 - random() * 5, 0);
        ctx.lineTo(7 + random() * 7, 0);
        ctx.stroke();
        ctx.fillStyle = rgba(c0, a * 0.65);
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5 + random() * 1.4, 0.85, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else {
        spark(ctx, x, y, 5 + random() * 7, rgba(i % 2 ? c0 : c4, 0.58), a, 4);
      }
    }
    ctx.restore();
  }

  function drawSilkPetalWind(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.05);
    for (let i = 0; i < 3; i += 1) {
      const y = 118 + i * 34;
      bezierRibbon(ctx, t * (0.72 + i * 0.03), y, 26, rgba(c1, 0.20), rgba(i % 2 ? c4 : c2, 0.36), 8.4 - effect.rank * 0.9, i * 0.95, 0.42);
    }
    const random = rng(hashText(effect.id) + 27);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const count = effect.rank === 1 ? 34 : effect.rank === 2 ? 24 : 18;
    for (let i = 0; i < count; i += 1) {
      const p = (random() + t * (0.05 + random() * 0.05)) % 1;
      const lane = random();
      const x = 150 + p * (w - 300);
      const y = 82 + lane * 166 + Math.sin(t * 1.4 + i) * 16;
      petal(ctx, x, y, 0.54 + random() * 0.48, t * 1.2 + i, rgba(i % 3 ? c1 : c0, 0.68), 0.36 + effect.intensity * 0.24);
    }
    ctx.restore();
  }

  function drawWardLight(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.15);
    const cx = w / 2;
    const cy = h / 2 + 10;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i += 1) {
      const a = -0.7 + i * 0.35 + Math.sin(t * 0.8 + i) * 0.04;
      const len = 185 + effect.intensity * 72 - i * 14;
      ctx.strokeStyle = gradientStroke(ctx, cx - len, cy, cx + len, cy, [
        [0, "rgba(255,255,255,0)"],
        [0.22, rgba(i % 2 ? c2 : c1, 0.55)],
        [0.5, rgba(c0, 0.95)],
        [0.78, rgba(c4, 0.50)],
        [1, "rgba(255,255,255,0)"]
      ]);
      ctx.lineWidth = 3.2 - effect.rank * 0.25;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - len * Math.cos(a), cy - len * Math.sin(a) * 0.26);
      ctx.lineTo(cx + len * Math.cos(a), cy + len * Math.sin(a) * 0.26);
      ctx.stroke();
    }
    const columns = effect.rank === 1 ? 7 : effect.rank === 2 ? 5 : 4;
    for (let i = 0; i < columns; i += 1) {
      const x = cx - 226 + i * (452 / (columns - 1));
      const hgt = 46 + Math.sin(t * 2 + i) * 16;
      ctx.strokeStyle = rgba(i % 2 ? c2 : c1, 0.17 + effect.intensity * 0.16);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, cy - hgt);
      ctx.lineTo(x + Math.sin(t + i) * 10, cy + hgt);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBanquetLantern(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 0.95);
    for (let i = 0; i < 3; i += 1) {
      bezierRibbon(ctx, t * (0.55 + i * 0.08), 120 + i * 42, 26, rgba(c1, 0.22), rgba(c2, 0.42), 10 - effect.rank * 1.25, i * 1.25, 0.48);
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const random = rng(hashText(effect.id) + 99);
    const count = effect.rank === 1 ? 14 : effect.rank === 2 ? 10 : 7;
    for (let i = 0; i < count; i += 1) {
      const x = 150 + random() * (w - 300) + Math.sin(t * 0.7 + i) * 22;
      const y = 72 + random() * 190 + Math.cos(t * 0.9 + i) * 12;
      const r = 10 + random() * 18;
      const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.8);
      g.addColorStop(0, rgba(c0, 0.42));
      g.addColorStop(0.38, rgba(i % 2 ? c1 : c4, 0.22));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.68, r, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBrocadeWealth(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.0);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i += 1) {
      const y = 98 + i * 38;
      const x0 = 185 + Math.sin(t + i) * 36;
      const x1 = w - 185 + Math.cos(t + i) * 36;
      ctx.strokeStyle = gradientStroke(ctx, x0, y, x1, y, [
        [0, "rgba(255,255,255,0)"],
        [0.24, rgba(c2, 0.24)],
        [0.5, rgba(c0, 0.48)],
        [0.76, rgba(c1, 0.24)],
        [1, "rgba(255,255,255,0)"]
      ]);
      ctx.lineWidth = 5.2 + effect.intensity * 2.6;
      ctx.shadowColor = rgba(c0, 0.36);
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 18) {
        const wave = Math.sin(x * 0.018 + t * 2.2 + i) * (8 + i);
        if (x === x0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    const count = effect.rank === 1 ? 24 : effect.rank === 2 ? 16 : 11;
    for (let i = 0; i < count; i += 1) {
      const x = 150 + ((i * 73 + t * 42) % (w - 300));
      const y = 84 + (i % 5) * 37 + Math.sin(t + i) * 8;
      ctx.strokeStyle = rgba(i % 2 ? c0 : c4, 0.26 + effect.intensity * 0.2);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, 7 + (i % 3) * 3, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTreasurySurge(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const beams = effect.rank === 1 ? 9 : effect.rank === 2 ? 7 : 5;
    for (let i = 0; i < beams; i += 1) {
      const x = w / 2 - 270 + i * (540 / (beams - 1)) + Math.sin(t * 0.8 + i) * 16;
      const beam = ctx.createLinearGradient(x, 52, x, 260);
      beam.addColorStop(0, "rgba(255,255,255,0)");
      beam.addColorStop(0.42, rgba(i % 2 ? c1 : c2, 0.24 + effect.intensity * 0.20));
      beam.addColorStop(0.62, rgba(c0, 0.55));
      beam.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(x - 10 - effect.intensity * 8, 44, 20 + effect.intensity * 16, 228);
    }
    for (let i = 0; i < 2; i += 1) {
      bezierRibbon(ctx, t * (0.45 + i * 0.06), 142 + i * 44, 18, rgba(c1, 0.18), rgba(c4, 0.42), 4.8, i, 0.45);
    }
    ctx.restore();
  }

  function drawVowJadeMist(ctx, effect, t, w, h) {
    const [c0, c1, c2, , c4] = effect.palette;
    drawGlowCore(ctx, effect, t, w, h, 1.05);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i += 1) {
      const y = 94 + i * 42;
      const drift = Math.sin(t * 0.55 + i) * 22;
      const g = gradientStroke(ctx, 170, y, w - 170, y, [
        [0, "rgba(255,255,255,0)"],
        [0.22, rgba(i % 2 ? c4 : c2, 0.22)],
        [0.5, rgba(c0, 0.46)],
        [0.78, rgba(c1, 0.20)],
        [1, "rgba(255,255,255,0)"]
      ]);
      ctx.strokeStyle = g;
      ctx.lineWidth = 13 - effect.rank * 1.55;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(165, y + drift);
      ctx.bezierCurveTo(300, y - 38 + drift, 660, y + 38 - drift, w - 165, y - drift);
      ctx.stroke();
    }
    const random = rng(hashText(effect.id) + 311);
    const count = effect.rank === 1 ? 15 : effect.rank === 2 ? 11 : 7;
    for (let i = 0; i < count; i += 1) {
      const x = 190 + random() * (w - 380);
      const y = 75 + random() * 190;
      ctx.fillStyle = rgba(i % 2 ? c4 : c0, 0.13 + effect.intensity * 0.10);
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(t + i) * 12, y + Math.cos(t * 0.8 + i) * 8, 18 + random() * 28, 6 + random() * 12, Math.sin(t + i) * 0.45, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  const FAMILY_RENDERERS = {
    imperialQi: drawCalligraphyQi,
    silkPetalWind: drawSilkPetalWind,
    wardLight: drawWardLight,
    banquetLantern: drawBanquetLantern,
    brocadeWealth: drawBrocadeWealth,
    treasurySurge: drawTreasurySurge,
    vowJadeMist: drawVowJadeMist
  };

  function internalTextEffect(maskCtx, effect, t, w, h, cx, cy, textWidth, size) {
    const [c0, c1, c2, , c4] = effect.palette;
    maskCtx.globalCompositeOperation = "source-atop";
    if (effect.family === "treasurySurge") {
      for (let i = 0; i < 8; i += 1) {
        const x = cx - textWidth / 2 + ((t * 120 + i * 48) % (textWidth + 90)) - 45;
        const g = maskCtx.createLinearGradient(x, cy - size, x + 32, cy + size);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, rgba(c0, 0.95));
        g.addColorStop(1, "rgba(255,255,255,0)");
        maskCtx.fillStyle = g;
        maskCtx.fillRect(x - 16, cy - size, 42, size * 2);
      }
    } else if (effect.family === "wardLight") {
      for (let i = 0; i < 5; i += 1) {
        maskCtx.strokeStyle = rgba(i % 2 ? c2 : c0, 0.72);
        maskCtx.lineWidth = 3;
        maskCtx.beginPath();
        const y = cy - size * 0.36 + i * size * 0.18 + Math.sin(t * 2 + i) * 3;
        maskCtx.moveTo(cx - textWidth / 2, y);
        maskCtx.lineTo(cx + textWidth / 2, y + Math.cos(t + i) * 4);
        maskCtx.stroke();
      }
    } else if (effect.family === "silkPetalWind") {
      for (let i = 0; i < 9; i += 1) {
        const x = cx - textWidth / 2 + ((t * 90 + i * 38) % (textWidth + 70)) - 35;
        const y = cy + Math.sin(t * 1.7 + i) * size * 0.28;
        petal(maskCtx, x, y, 0.32, t + i, rgba(i % 2 ? c1 : c0, 0.78), 0.65);
      }
    } else {
      const sweepX = cx - textWidth / 2 + ((t * 140) % (textWidth + 160)) - 80;
      const sweep = maskCtx.createLinearGradient(sweepX - 70, cy, sweepX + 70, cy);
      sweep.addColorStop(0, "rgba(255,255,255,0)");
      sweep.addColorStop(0.5, rgba(effect.family === "vowJadeMist" ? c4 : c0, 0.92));
      sweep.addColorStop(1, "rgba(255,255,255,0)");
      maskCtx.fillStyle = sweep;
      maskCtx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i += 1) {
        const a = t * (1.1 + i * 0.03) + i;
        const x = cx + Math.cos(a) * (textWidth * 0.25 + (i % 4) * 10);
        const y = cy + Math.sin(a * 1.4) * (size * 0.18);
        maskCtx.fillStyle = rgba(i % 2 ? c2 : c4, 0.42);
        maskCtx.beginPath();
        maskCtx.arc(x, y, 1.5 + (i % 3), 0, TAU);
        maskCtx.fill();
      }
    }
  }

  function drawName(ctx, effect, t, w, h, options) {
    const [c0, c1, c2, c3, c4] = effect.palette;
    const text = effect.displayName || "用戶名稱";
    let cx = w / 2;
    const auraScale = Math.max(0.52, Math.min(1.12, Number(options && options.nameAuraScale) || 1));
    const cy = h / 2 + 12 + (Number(options && options.textYOffset) || 0);
    const maxWidthFactor = Number(options && options.nameTextWidthFactor) || 0.72;
    const leftPadding = Number(options && options.nameLeftPadding);
    const maxSize = Number(options && options.nameFontMax) || 76;
    const maxWidth = Number.isFinite(leftPadding) && leftPadding >= 0
      ? Math.max(32, w - leftPadding * 2)
      : w * maxWidthFactor;
    const size = fitTextSize(ctx, text, maxWidth, maxSize);
    const font = `900 ${size}px "Microsoft JhengHei","Noto Serif TC","KaiTi",serif`;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textWidth = ctx.measureText(text).width;
    if (Number.isFinite(leftPadding) && leftPadding >= 0) {
      cx = leftPadding + textWidth / 2;
    }

    ctx.save();
    ctx.lineWidth = Math.max(7, size * 0.16 * auraScale);
    ctx.strokeStyle = rgba(c3, 0.48);
    ctx.shadowColor = rgba(c3, 0.58);
    ctx.shadowBlur = 8 * auraScale;
    ctx.strokeText(text, cx + 2.4, cy + 3.2);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = Math.max(4.8, size * 0.105 * auraScale);
    ctx.strokeStyle = rgba(c3, 0.94);
    ctx.shadowColor = rgba(c1, 0.76);
    ctx.shadowBlur = (24 + effect.intensity * 18) * auraScale;
    ctx.strokeText(text, cx, cy);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = Math.max(2, size * 0.036);
    ctx.strokeStyle = rgba(c0, 0.82);
    ctx.shadowColor = rgba(c0, 0.75);
    ctx.shadowBlur = 8 * auraScale;
    ctx.strokeText(text, cx, cy - 1);
    ctx.restore();

    const fill = ctx.createLinearGradient(cx - textWidth / 2, cy - size / 2, cx + textWidth / 2, cy + size / 2);
    fill.addColorStop(0, c0);
    fill.addColorStop(0.32, c1);
    fill.addColorStop(0.62, c0);
    fill.addColorStop(1, c2);
    ctx.save();
    ctx.fillStyle = fill;
    ctx.shadowColor = rgba(c0, 0.55);
    ctx.shadowBlur = 8 * auraScale;
    ctx.fillText(text, cx, cy);
    ctx.restore();

    const bevel = document.createElement("canvas");
    bevel.width = w;
    bevel.height = h;
    const bctx = bevel.getContext("2d");
    bctx.font = font;
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillStyle = "#fff";
    bctx.fillText(text, cx, cy);
    bctx.globalCompositeOperation = "source-atop";
    const bevelGrad = bctx.createLinearGradient(cx, cy - size * 0.62, cx, cy + size * 0.28);
    bevelGrad.addColorStop(0, "rgba(255,255,255,0.62)");
    bevelGrad.addColorStop(0.38, rgba(c0, 0.20));
    bevelGrad.addColorStop(0.68, "rgba(0,0,0,0)");
    bevelGrad.addColorStop(1, rgba(c3, 0.22));
    bctx.fillStyle = bevelGrad;
    bctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(bevel, 0, 0);
    ctx.restore();

    const layer = document.createElement("canvas");
    layer.width = w;
    layer.height = h;
    const lctx = layer.getContext("2d");
    lctx.font = font;
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    lctx.fillStyle = "#fff";
    lctx.fillText(text, cx, cy);
    internalTextEffect(lctx, effect, t, w, h, cx, cy, textWidth, size);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(layer, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = gradientStroke(ctx, cx - textWidth / 2, cy + size * 0.56, cx + textWidth / 2, cy + size * 0.56, [
      [0, "rgba(255,255,255,0)"],
      [0.18, rgba(c2, 0.45)],
      [0.5, rgba(c0, 0.80)],
      [0.82, rgba(c4, 0.45)],
      [1, "rgba(255,255,255,0)"]
    ]);
    ctx.lineWidth = 2 * auraScale;
    ctx.beginPath();
    ctx.moveTo(cx - textWidth * 0.54 * auraScale, cy + size * 0.58 * auraScale);
    ctx.quadraticCurveTo(cx, cy + size * (0.50 + Math.sin(t * 2) * 0.03) * auraScale, cx + textWidth * 0.54 * auraScale, cy + size * 0.58 * auraScale);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glintCount = effect.rank === 1 ? 3 : effect.rank === 2 ? 2 : 1;
    for (let i = 0; i < glintCount; i += 1) {
      const p = (t * (0.18 + i * 0.03) + i * 0.31) % 1;
      const x = cx - textWidth * 0.52 * auraScale + p * textWidth * 1.04 * auraScale;
      const y = cy - size * 0.34 * auraScale + Math.sin(t * 2 + i) * size * 0.22 * auraScale;
      spark(ctx, x, y, (6 + effect.intensity * 3 - effect.rank * 0.4) * auraScale, rgba(i % 2 ? c0 : c4, 0.82), (0.20 + effect.intensity * 0.14) * auraScale, 4);
    }
    ctx.restore();
  }

  function drawEffectFrame(canvas, effect, seconds, options) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const t = seconds || 0;
    if (!options || options.transparent !== false) ctx.clearRect(0, 0, w, h);
    else {
      ctx.fillStyle = "#100d13";
      ctx.fillRect(0, 0, w, h);
    }
    const render = FAMILY_RENDERERS[effect.family] || drawCalligraphyQi;
    const effectScaleX = Math.max(0.45, Math.min(1.18, Number(options && options.effectScaleX) || Number(options && options.effectScale) || 1));
    const effectScaleY = Math.max(0.45, Math.min(1.18, Number(options && options.effectScaleY) || Number(options && options.effectScale) || 1));
    let effectOffsetX = Number(options && options.effectOffsetX) || 0;
    const effectOffsetY = Number(options && options.effectOffsetY) || 0;
    if (options && options.effectAnchorToName) {
      const text = effect.displayName || "用戶名稱";
      const leftPadding = Math.max(0, Number(options.nameLeftPadding) || 0);
      const maxWidthFactor = Number(options.nameTextWidthFactor) || 0.72;
      const maxSize = Number(options.nameFontMax) || 76;
      const maxWidth = leftPadding >= 0 ? Math.max(32, w - leftPadding * 2) : w * maxWidthFactor;
      ctx.save();
      const size = fitTextSize(ctx, text, maxWidth, maxSize);
      ctx.font = `900 ${size}px "Microsoft JhengHei","Noto Serif TC","KaiTi",serif`;
      const textWidth = ctx.measureText(text).width;
      ctx.restore();
      effectOffsetX += leftPadding + textWidth / 2 - w / 2;
    }
    if (effectScaleX !== 1 || effectScaleY !== 1) {
      ctx.save();
      ctx.translate(w / 2 + effectOffsetX, h / 2 + effectOffsetY);
      ctx.scale(effectScaleX, effectScaleY);
      ctx.translate(-w / 2, -h / 2);
      render(ctx, effect, t, w, h);
      drawSurfaceDetail(ctx, effect, t, w, h);
      ctx.restore();
    } else {
      if (effectOffsetX || effectOffsetY) ctx.save();
      if (effectOffsetX || effectOffsetY) ctx.translate(effectOffsetX, effectOffsetY);
      render(ctx, effect, t, w, h);
      drawSurfaceDetail(ctx, effect, t, w, h);
      if (effectOffsetX || effectOffsetY) ctx.restore();
    }
    if (!options || options.drawCanvasName !== false) {
      drawName(ctx, effect, t, w, h, options);
    }
  }

  function findEffect(id) {
    return (window.RANK_TOP3_EFFECTS || []).find(x => x.id === id);
  }

  async function recordEffect(id, durationMs, fps) {
    const effect = findEffect(id);
    if (!effect) throw new Error(`Missing effect: ${id}`);
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 320;
    const stream = canvas.captureStream(fps || 30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 5200000
    });
    const chunks = [];
    recorder.ondataavailable = event => {
      if (event.data && event.data.size) chunks.push(event.data);
    };
    const started = performance.now();
    let raf = 0;
    function tick(now) {
      drawEffectFrame(canvas, effect, (now - started) / 1000, { transparent: true });
      raf = requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    recorder.start(120);
    await new Promise(resolve => setTimeout(resolve, durationMs || 3600));
    cancelAnimationFrame(raf);
    await new Promise(resolve => {
      recorder.onstop = resolve;
      recorder.stop();
    });
    const blob = new Blob(chunks, { type: mime });
    const buffer = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    }
    return {
      id,
      mime,
      base64: btoa(binary)
    };
  }

  window.drawRankTop3EffectFrame = drawEffectFrame;
  window.recordRankTop3Effect = recordEffect;
})();
