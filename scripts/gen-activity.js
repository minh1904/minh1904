/**
 * Sinh assets/activity.svg — dòng số liệu ở mục "03 Activity" của README.
 *
 *   GITHUB_TOKEN=xxx GITHUB_LOGIN=minh1904 node scripts/gen-activity.js
 *   node scripts/gen-activity.js --mock      # render bằng số giả, để xem style
 *
 * Vì sao tự viết thay vì nhúng thẻ của bên thứ ba: các instance công cộng
 * (github-readme-stats...) hay chết vì rate limit. Script này chạy trong
 * GitHub Actions bằng GITHUB_TOKEN, commit ra SVG tĩnh -> README không bao giờ vỡ ảnh.
 */
const fs = require('fs');
const path = require('path');

const QUERY = `
query($login: String!) {
  user(login: $login) {
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function fetchStats(login, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'minh1904-profile-readme',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error('GraphQL: ' + json.errors.map(e => e.message).join('; '));

  const user = json.data && json.data.user;
  if (!user) throw new Error(`No such user: ${login}`);

  const days = user.contributionsCollection.contributionCalendar.weeks
    .flatMap(w => w.contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    repos: user.repositories.totalCount,
    longestStreak: longestStreak(days),
  };
}

// Chuoi ngay lien tiep dai nhat co it nhat 1 contribution.
function longestStreak(days) {
  let best = 0, run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

const nf = n => n.toLocaleString('en-US');
const plural = (n, one, many) => `${nf(n)} ${n === 1 ? one : many}`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render({ contributions, repos, longestStreak }) {
  const line = [
    `${plural(contributions, 'contribution', 'contributions')} in the last year`,
    plural(repos, 'public repo', 'public repos'),
    `longest streak ${plural(longestStreak, 'day', 'days')}`,
  ].join('  \u00b7  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="18" viewBox="0 0 920 18" fill="none" role="img" aria-label="${esc(line)}">
  <style>
    .mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; font-size: 11.5px; fill: #59636E; }
    @media (prefers-color-scheme: dark) { .mono { fill: #8B949E; } }
  </style>
  <text class="mono" x="0" y="13">${esc(line)}</text>
</svg>
`;
}

async function main() {
  const mock = process.argv.includes('--mock');

  let stats;
  if (mock) {
    stats = { contributions: 1204, repos: 38, longestStreak: 24 };
  } else {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is required (or pass --mock)');
    stats = await fetchStats(process.env.GITHUB_LOGIN || 'minh1904', token);
  }

  const out = path.join(__dirname, '..', 'assets', 'activity.svg');
  fs.writeFileSync(out, render(stats));
  console.log(`${mock ? '[mock] ' : ''}wrote ${out}:`, JSON.stringify(stats));
}

main().catch(err => { console.error(err.message); process.exit(1); });
