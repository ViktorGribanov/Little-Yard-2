// Local preview server for the Little Yard prototype.
//
// Why it exists: prototype/index.html was exported from a Claude Artifact and
// references its photographs through blob URLs (/_blob/<hash>). Those blobs are
// not part of the project, so opening the file directly leaves every photo
// broken. This server answers /_blob/<hash> with a generated, clearly-labelled
// placeholder scene, so the layout, typography and interactions can be reviewed
// locally exactly as they will look once real photos are dropped in.
//
// Usage:  node preview/serve.mjs [--port 4173] [--root .] [--open]
// Nothing is installed; it only uses the Node standard library.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const root = path.resolve(argValue('--root', path.join(here, '..')));
const startPort = Number(argValue('--port', process.env.PORT || 4173));

/* ------------------------------------------------------------------ *
 * Placeholder artwork
 * ------------------------------------------------------------------ */

// Every blob hash used by the prototype, with the scene it is meant to show.
const BLOBS = {
  '73b83d75cdc13d199c904965a97d726c': { kind: 'hero', label: '' },
  '3a86af97b4d3fa12036d54c0ffc97c04': { kind: 'house', label: 'Дом 1' },
  'e8f2ba9c9031d7ec8b4360bbd9154ad8': { kind: 'house', label: 'Дом 2' },
  '7d794bf6cfd535fd0e2e9e102b1aa889': { kind: 'house', label: 'Дом 3' },
  'b96c36f03ecc3b3ae161b5b2127375a0': { kind: 'house', label: 'Дом 4' },
  'd213418973b5175809e64eb03468b5a5': { kind: 'territory', label: 'Территория' },
  'a69326b7de75d9ff082cabb26567feac': { kind: 'family', label: 'С детьми и питомцами' },
  'e467a9594604ab7c825425109b508b75': { kind: 'map', label: 'Схема участка' },
};

const SIZES = {
  hero: [1600, 900],
  house: [1000, 750],
  territory: [1000, 750],
  family: [1000, 750],
  map: [1600, 1000],
};

// Small deterministic PRNG so a given hash always renders the same scene.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v) => Math.round(v * 10) / 10;

function pine(x, baseY, h, w, fill, opacity) {
  const tiers = 3;
  let out = '';
  for (let i = 0; i < tiers; i++) {
    const th = h / tiers;
    const ty = baseY - i * th * 0.62;
    const tw = w * (1 - i * 0.22);
    out += `<path d="M${n(x)} ${n(ty - th)} L${n(x + tw / 2)} ${n(ty + th * 0.15)} L${n(x - tw / 2)} ${n(ty + th * 0.15)} Z" fill="${fill}" opacity="${opacity}"/>`;
  }
  out += `<rect x="${n(x - w * 0.06)}" y="${n(baseY - 2)}" width="${n(w * 0.12)}" height="${n(h * 0.1)}" fill="${fill}" opacity="${opacity}"/>`;
  return out;
}

function treeLine(rnd, y, height, color, opacity, count, width) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = (width / count) * (i + rnd() * 0.8);
    const h = height * (0.55 + rnd() * 0.75);
    out += pine(x, y + rnd() * 6, h, h * 0.42, color, opacity);
  }
  return out;
}

function cabin(x, y, w, h, opts) {
  const roofH = h * 0.55;
  const body = opts.body || '#E7D9C4';
  const roof = opts.roof || '#8E5B44';
  const glow = opts.glow || '#F5C97F';
  return `
    <g>
      <rect x="${n(x)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" fill="${body}"/>
      <path d="M${n(x - w * 0.09)} ${n(y - h)} L${n(x + w / 2)} ${n(y - h - roofH)} L${n(x + w * 1.09)} ${n(y - h)} Z" fill="${roof}"/>
      <rect x="${n(x + w * 0.12)}" y="${n(y - h * 0.72)}" width="${n(w * 0.2)}" height="${n(h * 0.26)}" fill="${glow}"/>
      <rect x="${n(x + w * 0.44)}" y="${n(y - h * 0.72)}" width="${n(w * 0.2)}" height="${n(h * 0.26)}" fill="${glow}"/>
      <rect x="${n(x + w * 0.47)}" y="${n(y - h * 0.34)}" width="${n(w * 0.13)}" height="${n(h * 0.34)}" fill="${opts.door || '#6B4A38'}"/>
    </g>`;
}

function grain(id) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>`;
}

function caption(label, w, h, tone) {
  if (!label) return '';
  // Centred horizontally: the image is used with object-fit: cover inside
  // containers of varying aspect ratio, which crops both sides, so anything
  // anchored to an edge can be cut in half.
  return `<text x="${w / 2}" y="${h - 30}" text-anchor="middle"
      font-family="'Golos Text','PT Sans',system-ui,sans-serif" font-size="17"
      letter-spacing="2.6" fill="${tone}" opacity=".5">${label.toUpperCase()} · ФОТО УТОЧНЯЕТСЯ</text>`;
}

function sceneHero(seed) {
  const rnd = mulberry32(seed);
  const [w, h] = SIZES.hero;
  const horizon = h * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7E7CE"/>
      <stop offset="48%" stop-color="#EEC9A0"/>
      <stop offset="72%" stop-color="#B98A63"/>
      <stop offset="100%" stop-color="#6E5B44"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFF3D6" stop-opacity=".95"/>
      <stop offset="55%" stop-color="#F6CFA0" stop-opacity=".45"/>
      <stop offset="100%" stop-color="#F6CFA0" stop-opacity="0"/>
    </radialGradient>
    ${grain('grain')}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${n(w * 0.22)}" cy="${n(horizon - 40)}" r="${n(h * 0.42)}" fill="url(#sun)"/>
  ${treeLine(rnd, horizon - 6, h * 0.26, '#7C8A6B', 0.55, 16, w)}
  ${treeLine(rnd, horizon + 26, h * 0.34, '#5C6350', 0.8, 12, w)}
  <path d="M0 ${n(horizon + 30)} Q ${n(w * 0.3)} ${n(horizon + 6)} ${n(w * 0.62)} ${n(horizon + 34)} T ${w} ${n(horizon + 18)} L${w} ${h} L0 ${h} Z" fill="#6F7452"/>
  ${treeLine(rnd, h * 0.99, h * 0.42, '#2F2A20', 0.92, 5, w)}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".06" style="mix-blend-mode:multiply"/>
</svg>`;
}

function sceneHouse(seed, label) {
  const rnd = mulberry32(seed);
  const [w, h] = SIZES.house;
  const ground = h * 0.7;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBF4E8"/>
      <stop offset="70%" stop-color="#F1E2CC"/>
      <stop offset="100%" stop-color="#E6D6BF"/>
    </linearGradient>
    ${grain('grain')}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${treeLine(rnd, ground - 8, h * 0.22, '#93A17F', 0.5, 9, w)}
  <rect y="${n(ground)}" width="${w}" height="${n(h - ground)}" fill="#8D9165"/>
  <path d="M0 ${n(ground + 6)} Q ${n(w * 0.4)} ${n(ground - 14)} ${w} ${n(ground + 18)} L${w} ${h} L0 ${h} Z" fill="#7C8460"/>
  ${cabin(w * 0.26, ground + 44, w * 0.36, h * 0.26, { body: '#EADCC6', roof: '#8E5B44', glow: '#F8E0B0' })}
  ${treeLine(rnd, ground + 60, h * 0.2, '#4E5540', 0.85, 3, w)}
  ${caption(label, w, h, '#2B2620')}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".05" style="mix-blend-mode:multiply"/>
</svg>`;
}

function sceneTerritory(seed, label) {
  const rnd = mulberry32(seed);
  const [w, h] = SIZES.territory;
  const ground = h * 0.55;
  let houses = '';
  const spots = [0.08, 0.34, 0.6, 0.82];
  spots.forEach((s, i) => {
    houses += cabin(w * s, ground + 96, w * 0.15, h * 0.13, {
      body: i % 2 ? '#E2D2BA' : '#EADCC6',
      roof: i % 2 ? '#7A503F' : '#8E5B44',
      glow: '#F8E0B0',
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FAF2E4"/>
      <stop offset="100%" stop-color="#EEDFC8"/>
    </linearGradient>
    ${grain('grain')}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${treeLine(rnd, ground - 4, h * 0.3, '#8A9878', 0.45, 14, w)}
  <rect y="${n(ground)}" width="${w}" height="${n(h - ground)}" fill="#93A17F"/>
  <path d="M${n(w * 0.46)} ${n(ground)} L${n(w * 0.53)} ${n(ground)} L${n(w * 0.72)} ${h} L${n(w * 0.3)} ${h} Z" fill="#C9BFA6" opacity=".75"/>
  ${houses}
  ${treeLine(rnd, h * 0.995, h * 0.16, '#4E5540', 0.6, 4, w)}
  ${caption(label, w, h, '#2B2620')}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".05" style="mix-blend-mode:multiply"/>
</svg>`;
}

function sceneFamily(seed, label) {
  const rnd = mulberry32(seed);
  const [w, h] = SIZES.family;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F3E9DA"/>
      <stop offset="100%" stop-color="#E4D5BF"/>
    </linearGradient>
    <linearGradient id="view" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CBD3BC"/>
      <stop offset="100%" stop-color="#8B9A78"/>
    </linearGradient>
    ${grain('grain')}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#wall)"/>
  <rect x="${n(w * 0.08)}" y="${n(h * 0.12)}" width="${n(w * 0.44)}" height="${n(h * 0.46)}" fill="url(#view)"/>
  <rect x="${n(w * 0.08)}" y="${n(h * 0.12)}" width="${n(w * 0.44)}" height="${n(h * 0.46)}" fill="none" stroke="#B9A88F" stroke-width="6"/>
  <line x1="${n(w * 0.3)}" y1="${n(h * 0.12)}" x2="${n(w * 0.3)}" y2="${n(h * 0.58)}" stroke="#B9A88F" stroke-width="6"/>
  ${treeLine(rnd, h * 0.5, h * 0.16, '#5F6A50', 0.55, 5, w * 0.5)}
  <rect x="${n(w * 0.14)}" y="${n(h * 0.6)}" width="${n(w * 0.3)}" height="${n(h * 0.16)}" rx="14" fill="#B5633B" opacity=".85"/>
  <rect x="${n(w * 0.14)}" y="${n(h * 0.56)}" width="${n(w * 0.3)}" height="${n(h * 0.07)}" rx="12" fill="#C97C50" opacity=".9"/>
  <rect x="${n(w * 0.62)}" y="${n(h * 0.34)}" width="${n(w * 0.24)}" height="${n(h * 0.36)}" rx="8" fill="#DCC9AE"/>
  <rect x="${n(w * 0.66)}" y="${n(h * 0.24)}" width="${n(w * 0.04)}" height="${n(h * 0.13)}" rx="4" fill="#8E5B44" opacity=".6"/>
  <circle cx="${n(w * 0.68)}" cy="${n(h * 0.1)}" r="${n(h * 0.03)}" fill="#F8E0B0" opacity=".9"/>
  ${caption(label, w, h, '#2B2620')}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".05" style="mix-blend-mode:multiply"/>
</svg>`;
}

function sceneMap(seed, label) {
  const rnd = mulberry32(seed);
  const [w, h] = SIZES.map;
  const plots = [
    [0.27, 0.3], [0.55, 0.18], [0.3, 0.62], [0.6, 0.52],
  ];
  let houses = '';
  plots.forEach((p, i) => {
    houses += `<rect x="${n(w * p[0])}" y="${n(h * p[1])}" width="${n(w * 0.07)}" height="${n(h * 0.07)}" fill="#E7D9C4" stroke="#8E5B44" stroke-width="4"/>
      <text x="${n(w * p[0] + w * 0.035)}" y="${n(h * p[1] + h * 0.048)}" text-anchor="middle" font-family="'Golos Text',system-ui,sans-serif" font-size="22" fill="#6B4A38">${i + 1}</text>`;
  });
  let trees = '';
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    if (x > w * 0.18 && x < w * 0.78 && y > h * 0.1 && y < h * 0.78) continue;
    trees += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(10 + rnd() * 16)}" fill="#5F6A50" opacity="${n(0.35 + rnd() * 0.3)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>${grain('grain')}</defs>
  <rect width="${w}" height="${h}" fill="#7E8A64"/>
  <rect x="${n(w * 0.14)}" y="${n(h * 0.06)}" width="${n(w * 0.68)}" height="${n(h * 0.84)}" fill="#9BA87C" stroke="#DED2C0" stroke-width="8"/>
  ${trees}
  <path d="M${n(w * 0.8)} ${n(h * 0.05)} C ${n(w * 0.72)} ${n(h * 0.35)} ${n(w * 0.9)} ${n(h * 0.62)} ${n(w * 0.78)} ${h}" stroke="#9CB6C2" stroke-width="26" fill="none" opacity=".85"/>
  <path d="M${n(w * 0.14)} ${n(h * 0.72)} L${n(w * 0.82)} ${n(h * 0.72)}" stroke="#C9BFA6" stroke-width="14" opacity=".8"/>
  ${houses}
  ${caption(label, w, h, '#F6F1E6')}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".07" style="mix-blend-mode:multiply"/>
</svg>`;
}

function renderBlob(hash) {
  const def = BLOBS[hash] || { kind: 'house', label: '' };
  const seed = parseInt(hash.slice(0, 8), 16) || 1;
  switch (def.kind) {
    case 'hero': return sceneHero(seed);
    case 'territory': return sceneTerritory(seed, def.label);
    case 'family': return sceneFamily(seed, def.label);
    case 'map': return sceneMap(seed, def.label);
    default: return sceneHouse(seed, def.label);
  }
}

/* ------------------------------------------------------------------ *
 * Static files
 * ------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

// prototype/index.html was exported from an artifact as an HTML fragment: it
// starts with <meta> and has neither <!DOCTYPE html> nor a viewport meta. A
// browser then renders it in quirks mode and lays phones out at 980px wide.
// Both are injected here rather than patched into the file, because that file
// is re-synced from the artifact and would lose the edit.
function withDocumentPreamble(html) {
  let out = html;
  if (!/^\s*<!doctype/i.test(out)) out = '<!DOCTYPE html>\n' + out;
  if (!/name\s*=\s*["']viewport["']/i.test(out)) {
    out = out.replace(
      /^(<!DOCTYPE html>\s*)/i,
      '$1<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    );
  }
  return out;
}

function serveStatic(req, res, urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
  }
  fs.stat(abs, (err, st) => {
    if (err) return send(res, 404, 'text/plain; charset=utf-8', 'Not found: ' + rel);
    if (st.isDirectory()) {
      const index = path.join(abs, 'index.html');
      if (fs.existsSync(index)) return serveStatic(req, res, urlPath.replace(/\/?$/, '/') + 'index.html');
      return send(res, 404, 'text/plain; charset=utf-8', 'Directory listing is off');
    }
    const type = MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream';
    if (type.startsWith('text/html')) {
      fs.readFile(abs, 'utf8', (readErr, html) => {
        if (readErr) return send(res, 500, 'text/plain; charset=utf-8', 'Read error');
        return send(res, 200, type, withDocumentPreamble(html));
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    fs.createReadStream(abs).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'text/plain; charset=utf-8', 'Method not allowed');
  }
  if (p === '/' || p === '') {
    res.writeHead(302, { Location: '/prototype/index.html' });
    return res.end();
  }
  const blob = p.match(/^\/_blob\/([a-f0-9]{16,})$/);
  if (blob) {
    const svg = renderBlob(blob[1]);
    return send(res, 200, 'image/svg+xml; charset=utf-8', svg);
  }
  serveStatic(req, res, p);
});

// Opens the preview in the default browser. A convenience for the
// double-click launcher: if the opener fails, the server keeps running and the
// address is still printed in the console.
function openBrowser(url) {
  if (process.env.LY_NO_OPEN) return;
  const [file, args] =
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]]
    : ['xdg-open', [url]];
  try {
    const child = spawn(file, args, { detached: true, stdio: 'ignore', windowsHide: true });
    child.on('error', () => {});
    child.unref();
  } catch {
    /* ignore: printing the URL is enough */
  }
}

function listen(port, attemptsLeft) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });
  server.listen(port, '127.0.0.1', () => {
    const url = 'http://127.0.0.1:' + port + '/prototype/index.html';
    console.log('Little Yard prototype: ' + url);
    console.log('Serving root: ' + root);
    if (argv.includes('--open')) openBrowser(url);
  });
}
listen(startPort, 20);
