/**
 * Sinh assets/stack.svg — grid tech stack, self-hosted, KHÔNG gọi service icon ngoài.
 * Path logo lấy từ package `simple-icons` (icon set CC0) rồi nhúng thẳng vào SVG.
 *
 *   npm i -D simple-icons
 *   node scripts/gen-stack.js
 *
 * Sửa mảng SECTIONS bên dưới để thêm/bớt công nghệ.
 */

const si = require('simple-icons');
const fs = require('fs');

// màu brand quá tối trên nền dark -> thay bằng biến thể sáng
const OVERRIDE = {
  nextdotjs: 'FFFFFF', vercel: 'FFFFFF', express: 'E2E8F0', github: 'E6EDF3',
  radixui: 'E2E8F0', socketdotio: 'E2E8F0', prisma: 'C7D2FE', css: '8B5CF6',
  tanstack: 'FF6B4A', eslint: '8B7BE8',
};

function icon(slug) {
  const k = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const i = si[k];
  if (!i) throw new Error('missing icon: ' + slug);
  return { path: i.path, hex: OVERRIDE[slug] || i.hex, title: i.title };
}

const SECTIONS = [
  { label: 'FRONTEND', items: [
    ['react','React'], ['nextdotjs','Next.js'], ['typescript','TypeScript'], ['javascript','JavaScript'],
    ['tailwindcss','Tailwind'], ['sass','Sass'], ['html5','HTML5'], ['css','CSS'],
    ['vite','Vite'], ['framer','Framer Motion'],
  ]},
  { label: 'STATE · DATA · FORMS', items: [
    ['redux','Redux'], ['tanstack','TanStack Query'], ['__zustand','Zustand'], ['zod','Zod'],
    ['reacthookform','RHF'], ['graphql','GraphQL'], ['axios','Axios'], ['radixui','Radix UI'],
  ]},
  { label: 'BACKEND · DATABASE', items: [
    ['nodedotjs','Node.js'], ['express','Express'], ['nestjs','NestJS'], ['prisma','Prisma'],
    ['postgresql','PostgreSQL'], ['mongodb','MongoDB'], ['redis','Redis'], ['socketdotio','Socket.IO'],
  ]},
  { label: 'TOOLING · QUALITY', items: [
    ['git','Git'], ['github','GitHub'], ['githubactions','Actions'], ['docker','Docker'],
    ['vercel','Vercel'], ['figma','Figma'], ['postman','Postman'], ['vitest','Vitest'],
    ['eslint','ESLint'], ['storybook','Storybook'],
  ]},
];

const W = 1000, MARGIN = 30, TW = 78, TH = 86, GAP = 17.78;
const SEC_TITLE_H = 30, SEC_GAP = 26, PAD_TOP = 30, PAD_BOTTOM = 26;

let y = PAD_TOP, body = '', delay = 0;

for (const sec of SECTIONS) {
  body += `  <g transform="translate(${MARGIN}, ${y})">
    <rect x="0" y="4" width="3" height="12" rx="1.5" fill="url(#accent)"/>
    <text class="mono" x="12" y="14" font-size="11.5" fill="#6E78A0" letter-spacing="3.2">${sec.label}</text>
  </g>\n`;
  y += SEC_TITLE_H;

  const n = sec.items.length;
  const rowW = n * TW + (n - 1) * GAP;
  const startX = (W - rowW) / 2;

  sec.items.forEach(([slug, label], i) => {
    const x = +(startX + i * (TW + GAP)).toFixed(2);
    const d = (delay++ * 0.045).toFixed(3);

    let mark;
    let hex;
    if (slug === '__zustand') {
      hex = 'FFB020';
      mark = `<g transform="translate(${TW / 2}, 30)">
        <circle r="13" fill="none" stroke="#${hex}" stroke-width="2"/>
        <path d="M-6 -5 H6 L-6 5 H6" fill="none" stroke="#${hex}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
    } else {
      const ic = icon(slug);
      hex = ic.hex;
      // simple-icons dùng viewBox 24x24 -> scale 1.3, canh giữa tile ở y=30
      mark = `<g transform="translate(${(TW / 2 - 15.6).toFixed(2)}, 14.4) scale(1.3)"><path d="${ic.path}" fill="#${hex}"/></g>`;
    }

    // g ngoai giu vi tri (presentation attr), g trong chay animation (CSS transform)
    body += `  <g transform="translate(${x}, ${y})">
    <g class="tile" style="animation-delay:${d}s">
      <rect width="${TW}" height="${TH}" rx="15" fill="#${hex}" fill-opacity="0.07" stroke="#${hex}" stroke-opacity="0.24"/>
      ${mark}
      <text class="sans" x="${TW / 2}" y="70" font-size="9.5" font-weight="600" text-anchor="middle" fill="#98A2C8" letter-spacing="0.3">${label}</text>
    </g>
  </g>\n`;
  });

  y += TH + SEC_GAP;
}

const H = Math.round(y - SEC_GAP + PAD_BOTTOM);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="Tech stack">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#8B93FF" fill-opacity="0.07"/>
    </pattern>
    <style>
      .mono { font-family: "SFMono-Regular","JetBrains Mono",Consolas,Menlo,monospace; }
      .sans { font-family: "Segoe UI",-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif; }
      .tile { animation: pop .55s cubic-bezier(.22,1,.36,1) both; }
      @keyframes pop { from { opacity:0; transform: translateY(10px) } }
      @media (prefers-reduced-motion: reduce) { .tile { animation: none } }
    </style>
  </defs>
  <rect width="${W}" height="${H}" rx="18" fill="#0B1020"/>
  <rect width="${W}" height="${H}" rx="18" fill="url(#dots)"/>
${body}  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="#2A3358"/>
</svg>
`;

fs.writeFileSync(require('path').join(__dirname, '..', 'assets', 'stack.svg'), svg);
console.log('written', W + 'x' + H, delay + ' tiles');
