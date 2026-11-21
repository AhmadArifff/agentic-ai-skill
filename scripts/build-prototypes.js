const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Building Prototypes for Archify & Stack-Diagram ===\n');

// 1. Build Archify Prototype
const archifyProtoDir = path.join(__dirname, '..', 'prototypes', 'archify');
if (!fs.existsSync(archifyProtoDir)) fs.mkdirSync(archifyProtoDir, { recursive: true });

const archifySpec = {
  schema_version: 1,
  diagram_type: "sequence",
  meta: {
    title: "Financial Ledger Driver Withdrawal & Atomic Lock Sequence",
    output: "prototypes/archify/driver-withdrawal-sequence.html",
    viewBox: [1120, 680],
    column_fit: "spread",
    animation: "trace",
    quality_profile: "showcase"
  },
  participants: [
    { id: "driver", type: "external", label: "Driver Mobile", sublabel: "Flutter App" },
    { id: "gateway", type: "frontend", label: "API Gateway", sublabel: "Nginx / Cloudflare" },
    { id: "ledger_svc", type: "backend", label: "Ledger Service", sublabel: "Laravel 4-Layer" },
    { id: "redis_lock", type: "database", label: "Redis Lock", sublabel: "Atomic Mutex (10s)" },
    { id: "db_master", type: "database", label: "MySQL Master", sublabel: "InnoDB Transaction" },
    { id: "bank_gw", type: "messagebus", label: "Bank Gateway", sublabel: "BCA / Mandiri API" }
  ],
  segments: [
    { from: 145, to: 280, label: "Request & Mutex Lock" },
    { from: 290, to: 455, label: "Balance Verification & Bank Transfer" },
    { from: 465, to: 565, label: "Disbursement Ledger & Lock Release" }
  ],
  messages: [
    { id: "m1", from: "driver", to: "gateway", y: 160, label: "POST /api/driver/withdraw", variant: "emphasis" },
    { id: "m2", from: "gateway", to: "ledger_svc", y: 195, label: "Forward request (Bearer Token)", variant: "default" },
    { id: "m3", from: "ledger_svc", to: "redis_lock", y: 230, label: "SET withdraw:driver:{id} NX EX 10", variant: "security" },
    { id: "m4", from: "redis_lock", to: "ledger_svc", y: 265, label: "Lock Acquired (OK)", variant: "return" },
    { id: "m5", from: "ledger_svc", to: "db_master", y: 300, label: "BEGIN; SELECT balance FOR UPDATE", variant: "emphasis" },
    { id: "m6", from: "db_master", to: "ledger_svc", y: 335, label: "Balance: Rp 1.500.000 (Sufficient)", variant: "return" },
    { id: "m7", from: "ledger_svc", to: "db_master", y: 370, label: "INSERT request_withdrawals (PENDING)", variant: "default" },
    { id: "m8", from: "ledger_svc", to: "bank_gw", y: 405, label: "POST /v1/disbursement (width_code)", variant: "emphasis" },
    { id: "m9", from: "bank_gw", to: "ledger_svc", y: 440, label: "HTTP 200 (DISBURSED)", variant: "return" },
    { id: "m10", from: "ledger_svc", to: "db_master", y: 475, label: "INSERT disbursement_withdrawals & COMMIT", variant: "emphasis" },
    { id: "m11", from: "ledger_svc", to: "redis_lock", y: 510, label: "DEL withdraw:driver:{id} (Release Lock)", variant: "dashed" },
    { id: "m12", from: "ledger_svc", to: "driver", y: 545, label: "HTTP 200 (Withdrawal Success)", variant: "return" }
  ],
  activations: [
    { participant: "gateway", from: 160, to: 555, type: "frontend" },
    { participant: "ledger_svc", from: 190, to: 550, type: "backend" },
    { participant: "redis_lock", from: 225, to: 270, type: "database" },
    { participant: "db_master", from: 295, to: 480, type: "database" },
    { participant: "bank_gw", from: 400, to: 445, type: "messagebus" }
  ],
  cards: [
    {
      dot: "emerald",
      title: "Financial Ledger Guard",
      items: [
        "Pemisahan tegas tabel request vs disbursement penarikan insentif.",
        "Atomic locking 10 detik via Redis mencegah klik ganda atau race condition.",
        "Transaksi database InnoDB dengan SELECT ... FOR UPDATE menjamin saldo akurat."
      ]
    },
    {
      dot: "cyan",
      title: "Idempotency & Rollback",
      items: [
        "Gunakan width_code unik per transaksi untuk mencegah double transfer bank.",
        "Jika gateway perbankan timeout, status ditahan di PENDING untuk rekonsiliasi.",
        "Kunci Redis selalu dilepas di blok finally."
      ]
    }
  ]
};

const archifyJsonPath = path.join(archifyProtoDir, 'driver-withdrawal-sequence.json');
fs.writeFileSync(archifyJsonPath, JSON.stringify(archifySpec, null, 2), 'utf8');

const archifyHtmlPath = path.join(archifyProtoDir, 'driver-withdrawal-sequence.html');
const archifyBin = path.join(__dirname, '..', 'skills', 'archify', 'bin', 'archify.mjs');

try {
  execSync(`node "${archifyBin}" render sequence "${archifyJsonPath}" "${archifyHtmlPath}"`, { stdio: 'inherit' });
  console.log('✅ Archify sequence prototype generated at:', archifyHtmlPath);
} catch (err) {
  console.error('❌ Archify generation error:', err.message);
  process.exit(1);
}

// 2. Build Stack-Diagram Prototype
const stackProtoDir = path.join(__dirname, '..', 'prototypes', 'stack-diagram');
if (!fs.existsSync(stackProtoDir)) fs.mkdirSync(stackProtoDir, { recursive: true });

const iconDir = path.join(stackProtoDir, 'icons');
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

const genericSrc = path.join(__dirname, '..', 'skills', 'stack-diagram', 'assets', 'generic');
['user.svg', 'server.svg', 'device.svg', 'internet.svg'].forEach(file => {
  const src = path.join(genericSrc, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(iconDir, file));
  }
});

const customIcons = {
  'nginx.svg': '<svg viewBox="0 0 24 24" fill="#009639" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L1.6 6v12L12 24l10.4-6V6L12 0zm0 2.2l8.5 4.9v9.8L12 21.8 3.5 16.9V7.1L12 2.2z"/></svg>',
  'laravel.svg': '<svg viewBox="0 0 24 24" fill="#FF2D20" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.6 3.8v7.6L12 19.6 4.4 15.8V8.2L12 4.4z"/></svg>',
  'redis.svg': '<svg viewBox="0 0 24 24" fill="#DC382D" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/></svg>',
  'mysql.svg': '<svg viewBox="0 0 24 24" fill="#4479A1" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>',
  'docker.svg': '<svg viewBox="0 0 24 24" fill="#2496ED" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="20" height="10" rx="3"/></svg>'
};

Object.entries(customIcons).forEach(([fn, content]) => {
  fs.writeFileSync(path.join(iconDir, fn), content, 'utf8');
});

const templateSrc = path.join(__dirname, '..', 'skills', 'stack-diagram', 'assets', 'template.html');
let draftHtml = fs.readFileSync(templateSrc, 'utf8');

draftHtml = draftHtml.replace('<!-- TITLE -->', 'AdminShuttle High-Concurrency Architecture');
draftHtml = draftHtml.replace('<!-- KICKER: e.g. stack-diagram / author / 2026-08 -->', 'Architecture / AdminShuttleV3 / 2026');
draftHtml = draftHtml.replace('<!-- LEDE: 1-2 short sentences, or delete this <p> -->', 'High-concurrency ticket booking, seat reservation mutex locking, and financial ledger transaction flow.');
draftHtml = draftHtml.replace('<!-- FOOT-LEFT: author / one-liner -->', 'AdminShuttle System Architecture');
draftHtml = draftHtml.replace('<!-- FOOT-RIGHT: icon sources actually used, from manifest.json, e.g. "icons: svgl / devicon / Lucide" -->', 'icons: devicon / generic');

// Clean replacement of the entire canvas
const customCanvasInner = `
    <!-- GROUPS -->
    <div class="group" style="left:200px; top:40px; width:760px; height:440px;">
      <div class="g-label"><span>Docker Cloud Cluster</span></div>
      
      <div class="group" style="left:20px; top:60px; width:340px; height:340px;">
        <div class="g-label"><span>Application Layer</span></div>
      </div>
      <div class="group" style="left:390px; top:60px; width:340px; height:340px;">
        <div class="g-label"><span>Persistence & Cache Layer</span></div>
      </div>
    </div>

    <!-- NODES -->
    <!-- Client -->
    <div class="node" style="left:30px; top:180px;">
      <div class="tile"><img src="%%ICON_user%%" alt="Client"></div>
      <div class="name"><span>Passenger & Driver</span></div>
      <div class="role"><span>web / mobile clients</span></div>
    </div>

    <!-- Reverse Proxy Nginx -->
    <div class="node" style="left:240px; top:130px;">
      <div class="tile"><img src="%%ICON_nginx%%" alt="Nginx"></div>
      <div class="name"><span>Nginx Gateway</span></div>
      <div class="role"><span>ssl / reverse proxy</span></div>
    </div>

    <!-- Backend Laravel -->
    <div class="node" style="left:240px; top:280px;">
      <div class="tile"><img src="%%ICON_laravel%%" alt="Laravel"></div>
      <div class="name"><span>Laravel API</span></div>
      <div class="role"><span>4-layer service & repo</span></div>
    </div>

    <!-- Redis Cache & Lock -->
    <div class="node" style="left:610px; top:130px;">
      <div class="tile"><img src="%%ICON_redis%%" alt="Redis"></div>
      <div class="name"><span>Redis Atomic Lock</span></div>
      <div class="role"><span>10s ticket mutex & cache</span></div>
    </div>

    <!-- MySQL Database -->
    <div class="node" style="left:610px; top:280px;">
      <div class="tile"><img src="%%ICON_mysql%%" alt="MySQL"></div>
      <div class="name"><span>MySQL 8.0 Master</span></div>
      <div class="role"><span>innodb ledger & views</span></div>
    </div>

    <!-- EDGES -->
    <svg class="edges" viewBox="0 0 1000 540" aria-hidden="true">
      <defs>
        <marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/>
        </marker>
      </defs>
      <!-- Client to Nginx -->
      <path class="e" d="M 162 210 L 240 160" marker-end="url(#ar)"/>
      <!-- Nginx to Laravel -->
      <path class="e" d="M 306 215 L 306 280" marker-end="url(#ar)"/>
      <!-- Laravel to Redis Lock -->
      <path class="e" d="M 372 300 L 610 160" marker-end="url(#ar)"/>
      <!-- Laravel to MySQL -->
      <path class="e" d="M 372 310 L 610 310" marker-end="url(#ar)"/>
      <!-- Text labels -->
      <text x="180" y="175" class="el a">HTTPS</text>
      <text x="320" y="250" class="el">fastcgi</text>
      <text x="460" y="210" class="el a">SET NX EX 10</text>
      <text x="460" y="300" class="el a">SELECT ... FOR UPDATE</text>
    </svg>
  `;

const canvasStartTag = '<div class="canvas">';
const legendTag = '<div class="legend">';

const p1 = draftHtml.indexOf(canvasStartTag);
const p2 = draftHtml.indexOf(legendTag);

if (p1 !== -1 && p2 !== -1) {
  draftHtml = draftHtml.substring(0, p1 + canvasStartTag.length) +
              '\n' + customCanvasInner + '\n  </div>\n  </div>\n\n  ' +
              draftHtml.substring(p2);
}

const draftPath = path.join(stackProtoDir, 'admin-shuttle-architecture.draft.html');
fs.writeFileSync(draftPath, draftHtml, 'utf8');

const stackHtmlPath = path.join(stackProtoDir, 'admin-shuttle-architecture.html');
const buildPy = path.join(__dirname, '..', 'skills', 'stack-diagram', 'scripts', 'build.py');
const fontsDir = path.join(__dirname, '..', 'skills', 'stack-diagram', 'assets', 'fonts');

try {
  execSync(`python "${buildPy}" "${draftPath}" "${iconDir}" "${stackHtmlPath}" --fonts "${fontsDir}"`, { stdio: 'inherit' });
  console.log('✅ Stack-Diagram prototype generated at:', stackHtmlPath);
} catch (err) {
  console.error('❌ Stack-Diagram build error:', err.message);
  process.exit(1);
}

console.log('\n🎉 Both prototypes generated successfully!');
