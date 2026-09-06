/**
 * Generates assets/stack.svg — the tech-stack strip, self-hosted, with no external icon service.
 * Logo paths come from the `simple-icons` package (CC0 icon set) and are inlined into the SVG.
 *
 *   npm i -D simple-icons
 *   node scripts/gen-stack.js
 *
 * Layout follows the classic "Languages and Tools" strip: large icons, no labels,
 * left-aligned and wrapped. Transparent background; near-black logos flip colour
 * with prefers-color-scheme so they stay visible on GitHub light and dark.
 * Edit the ICONS array below to add or drop a technology.
 */
const si = require('simple-icons');
const fs = require('fs');
const path = require('path');

// Near-black/white logos go adaptive: recoloured per theme instead of hardcoded.
const ADAPTIVE = new Set(['nextdotjs', 'vercel', 'github', 'threedotjs', 'animedotjs', 'prisma', 'express']);

// Grouped by intent, rendered as one continuous wrapped strip.
const ICONS = [
  // core frontend
  'react', 'nextdotjs', 'typescript', 'javascript', 'html5', 'css', 'tailwindcss', 'sass', 'vite',
  // creative / motion
  'threedotjs', 'gsap', 'animedotjs', 'framer',
  // data, forms, routing
  'tanstack', 'reactrouter', 'reacthookform', 'zod', 'graphql', 'axios',
  // backend
  'nestjs', 'prisma', 'supabase',
  // tooling
  'git', 'github', 'githubactions', 'docker', 'vercel', 'figma', 'storybook', 'vitest', 'eslint',
];

const W = 920, SIZE = 40, GAP = 22, PER_ROW = 11;

function icon(slug) {
  const key = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const i = si[key];
  if (!i) throw new Error(`simple-icons has no "${slug}"`);
  return i;
}

const rows = Math.ceil(ICONS.length / PER_ROW);
const H = rows * SIZE + (rows - 1) * GAP;
const scale = (SIZE / 24).toFixed(4);

const body = ICONS.map((slug, i) => {
  const ic = icon(slug);
  const x = (i % PER_ROW) * (SIZE + GAP);
  const y = Math.floor(i / PER_ROW) * (SIZE + GAP);
  const adaptive = ADAPTIVE.has(slug);
  const cls = adaptive ? ' class="adaptive"' : '';
  const fill = adaptive ? '' : ` fill="#${ic.hex}"`;
  return `  <g transform="translate(${x}, ${y}) scale(${scale})"${cls}><title>${ic.title}</title><path d="${ic.path}"${fill}/></g>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="${ICONS.map(s => icon(s).title).join(', ')}">
  <style>
    .adaptive path { fill: #1F2328; }
    @media (prefers-color-scheme: dark) { .adaptive path { fill: #E6EDF3; } }
  </style>
${body}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'stack.svg'), svg);
console.log(`written ${W}x${H} — ${ICONS.length} icons, ${rows} rows`);
