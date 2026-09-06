/**
 * Sinh assets/stack.svg — grid tech stack, self-hosted, KHÔNG gọi service icon ngoài.
 * Path logo lấy từ package `simple-icons` (icon set CC0) rồi nhúng thẳng vào SVG.
 *
 *   npm i -D simple-icons
 *   node scripts/gen-stack.js
 *
 * Nền trong suốt + màu chữ theo prefers-color-scheme => hợp cả GitHub light lẫn dark.
 * Sửa mảng SECTIONS bên dưới để thêm/bớt công nghệ.
 */
const si = require('simple-icons');
const fs = require('path') && require('fs');
const path = require('path');

// Logo gần như đen/trắng -> để adaptive, đổi màu theo theme thay vì hardcode
const ADAPTIVE = new Set(['nextdotjs', 'vercel', 'express', 'github', 'radixui', 'socketdotio', 'prisma']);

function icon(slug) {
  const k = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const i = si[k];
  if (!i) throw new Error('missing icon: ' + slug);
  return i;
}

const SECTIONS = [
  { label: 'Frontend', items: [
    ['react','React'], ['nextdotjs','Next.js'], ['typescript','TypeScript'], ['javascript','JavaScript'],
    ['tailwindcss','Tailwind'], ['sass','Sass'], ['html5','HTML5'], ['css','CSS'],
    ['vite','Vite'], ['framer','Framer Motion'],
  ]},
  { label: 'State · Data · Forms', items: [
    ['redux','Redux'], ['tanstack','TanStack Query'], ['__zustand','Zustand'], ['zod','Zod'],
    ['reacthookform','React Hook Form'], ['graphql','GraphQL'], ['axios','Axios'], ['radixui','Radix UI'],
  ]},
  { label: 'Backend · Database', items: [
    ['nodedotjs','Node.js'], ['express','Express'], ['nestjs','NestJS'], ['prisma','Prisma'],
    ['postgresql','PostgreSQL'], ['mongodb','MongoDB'], ['redis','Redis'], ['socketdotio','Socket.IO'],
  ]},
  { label: 'Tooling · Quality', items: [
    ['git','Git'], ['github','GitHub'], ['githubactions','Actions'], ['docker','Docker'],
    ['vercel','Vercel'], ['figma','Figma'], ['postman','Postman'], ['vitest','Vitest'],
    ['eslint','ESLint'], ['storybook','Storybook'],
  ]},
];

const W = 920, SLOT = 88, ICON = 30, ROW_H = 62;
const SEC_TITLE_H = 26, SEC_GAP = 30, PAD_TOP = 8, PAD_BOTTOM = 4;

let y = PAD_TOP, body = '';

for (const sec of SECTIONS) {
  body += `  <text class="sec" x="0" y="${y + 10}">${sec.label}</text>\n`;
  body += `  <line class="rule" x1="${sec.label.length * 6.6 + 14}" y1="${y + 6}" x2="${W}" y2="${y + 6}"/>\n`;
  y += SEC_TITLE_H;

  const n = sec.items.length;
  const startX = (W - (n * SLOT)) / 2;

  sec.items.forEach(([slug, label], i) => {
    const cx = +(startX + i * SLOT + SLOT / 2).toFixed(2);
    let mark;

    if (slug === '__zustand') {
      mark = `<g transform="translate(${cx}, ${y + 15})" class="adaptive-s">
      <circle r="13" fill="none" stroke-width="1.8"/>
      <path d="M-6 -5 H6 L-6 5 H6" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
    } else {
      const ic = icon(slug);
      const s = (ICON / 24).toFixed(4);
      const cls = ADAPTIVE.has(slug) ? ' class="adaptive"' : '';
      const fill = ADAPTIVE.has(slug) ? '' : ` fill="#${ic.hex}"`;
      mark = `<g transform="translate(${(cx - ICON / 2).toFixed(2)}, ${y}) scale(${s})"${cls}><path d="${ic.path}"${fill}/></g>`;
    }

    body += `  ${mark}
  <text class="label" x="${cx}" y="${y + ICON + 15}">${label}</text>\n`;
  });

  y += ROW_H + SEC_GAP;
}

const H = Math.round(y - SEC_GAP + PAD_BOTTOM);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="Tech stack">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .sec   { font-size: 11px; font-weight: 600; letter-spacing: 1.6px; fill: #656D76; text-transform: uppercase; }
    .label { font-size: 10px; fill: #8C959F; text-anchor: middle; }
    .rule  { stroke: #D0D7DE; stroke-width: 1; }
    .adaptive path { fill: #1F2328; }
    .adaptive-s { stroke: #1F2328; }
    @media (prefers-color-scheme: dark) {
      .sec   { fill: #7D8590; }
      .label { fill: #7D8590; }
      .rule  { stroke: #30363D; }
      .adaptive path { fill: #E6EDF3; }
      .adaptive-s { stroke: #E6EDF3; }
    }
  </style>
${body}</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'stack.svg'), svg);
console.log('written', W + 'x' + H);
