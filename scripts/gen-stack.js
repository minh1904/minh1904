/**
 * Generates assets/icons/*.svg — one standalone file per technology, plus the
 * <img> block to paste into README.md.
 *
 *   npm i -D simple-icons
 *   node scripts/gen-stack.js
 *
 * One file per icon (rather than a single strip image) means the README lays them
 * out itself: they wrap on narrow screens and scale with the `height` attribute
 * instead of being locked into one fixed-size picture.
 *
 * Paths come from `simple-icons` (CC0). Files are committed to this repo, so the
 * README makes no request to any icon CDN. Near-black logos carry a
 * prefers-color-scheme rule so they stay visible on GitHub dark.
 *
 * Edit the ICONS array below to add or drop a technology.
 */
const si = require('simple-icons');
const fs = require('fs');
const path = require('path');

// Near-black/white logos go adaptive: recoloured per theme instead of hardcoded.
const ADAPTIVE = new Set(['nextdotjs', 'vercel', 'github', 'threedotjs', 'animedotjs', 'prisma']);

// [simple-icons slug, output file name]
const ICONS = [
  // core frontend
  ['react', 'react'], ['nextdotjs', 'nextjs'], ['typescript', 'typescript'], ['javascript', 'javascript'],
  ['html5', 'html5'], ['css', 'css'], ['tailwindcss', 'tailwind'], ['sass', 'sass'], ['vite', 'vite'],
  // creative / motion
  ['threedotjs', 'threejs'], ['gsap', 'gsap'], ['animedotjs', 'animejs'], ['framer', 'motion'],
  // data, forms, routing
  ['tanstack', 'tanstack-query'], ['reactrouter', 'react-router'], ['reacthookform', 'react-hook-form'],
  ['zod', 'zod'], ['graphql', 'graphql'], ['axios', 'axios'],
  // backend
  ['nestjs', 'nestjs'], ['prisma', 'prisma'], ['supabase', 'supabase'],
  // tooling
  ['git', 'git'], ['github', 'github'], ['githubactions', 'github-actions'], ['docker', 'docker'],
  ['vercel', 'vercel'], ['figma', 'figma'], ['storybook', 'storybook'], ['vitest', 'vitest'],
  ['eslint', 'eslint'],
];

const ICON_DIR = path.join(__dirname, '..', 'assets', 'icons');

function icon(slug) {
  const key = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const i = si[key];
  if (!i) throw new Error(`simple-icons has no "${slug}"`);
  return i;
}

fs.mkdirSync(ICON_DIR, { recursive: true });

// Xoá icon cũ không còn trong danh sách, tránh file mồ côi.
const keep = new Set(ICONS.map(([, file]) => `${file}.svg`));
for (const f of fs.readdirSync(ICON_DIR)) {
  if (f.endsWith('.svg') && !keep.has(f)) fs.unlinkSync(path.join(ICON_DIR, f));
}

const imgTags = [];

for (const [slug, file] of ICONS) {
  const ic = icon(slug);
  const adaptive = ADAPTIVE.has(slug);

  const style = adaptive
    ? `\n  <style>path { fill: #1F2328; } @media (prefers-color-scheme: dark) { path { fill: #E6EDF3; } }</style>`
    : '';
  const fill = adaptive ? '' : ` fill="#${ic.hex}"`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="${ic.title}"><title>${ic.title}</title>${style}
  <path d="${ic.path}"${fill}/>
</svg>
`;
  fs.writeFileSync(path.join(ICON_DIR, `${file}.svg`), svg);
  imgTags.push(`<img src="./assets/icons/${file}.svg" alt="${ic.title}" title="${ic.title}" height="40" />`);
}

// Rewrite the block between the markers in README.md, so the two never drift apart.
const block = imgTags.join('&nbsp;\n');
const readmePath = path.join(__dirname, '..', 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
const START = '<!-- stack:start -->', END = '<!-- stack:end -->';
const from = readme.indexOf(START), to = readme.indexOf(END);

if (from === -1 || to === -1) {
  throw new Error(`README.md is missing the ${START} / ${END} markers`);
}

fs.writeFileSync(
  readmePath,
  readme.slice(0, from + START.length) + '\n\n' + block + '\n\n' + readme.slice(to)
);

console.log(`wrote ${ICONS.length} icons to assets/icons/ and refreshed the README block`);
