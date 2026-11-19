// Leonida Ledger — GTA VI trophy guide & tracker.
// Plain ES module, no dependencies, no network requests at run time beyond
// fetching its own data/trophies.json. Progress lives in localStorage.
const KEY = 'leonida-ledger-v1';
const DEMO_EARNED = [2, 3, 8, 16, 20, 21, 33, 35, 44, 46, 51, 53, 55];

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilter');
const statusEl = document.getElementById('statusFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const resultEl = document.getElementById('resultCount');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch { earned = new Set(); }
if (new URLSearchParams(location.search).has('demo')) {
  earned = new Set(DEMO_EARNED.map((id) => trophies.find((t) => t.id === id).name));
  save();
}
let selectedId = null;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', side: 'Side missions', collectible: 'Collectibles', activity: 'Activities',
  combat: 'Combat', heist: 'Heists & robberies', exploration: 'Exploration', economy: 'Money', misc: 'Miscellaneous',
};
const GRADE_COLOR = { platinum: '#dfe8f2', gold: '#e3b94e', silver: '#c3c9d4', bronze: '#d08a5e' };

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.spoiler && !earned.has(t.name);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (statusEl.value === 'earned' && !earned.has(t.name)) return false;
    if (statusEl.value === 'missing' && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  document.getElementById('earnedCount').textContent = n;
  document.getElementById('progressPct').textContent = `${pct}% to platinum`;
  document.getElementById('progressSub').textContent = `${n} earned · ${total - n} to go`;
  const ring = document.getElementById('ringFg');
  const circ = 2 * Math.PI * 52;
  ring.style.strokeDashoffset = String(circ * (1 - n / total));
  const bars = document.getElementById('gradeBars');
  bars.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => earned.has(t.name)).length;
    const row = document.createElement('div');
    row.className = 'bar-row';
    const label = document.createElement('span');
    label.textContent = `${GRADE_LABEL[grade]} ${got}/${all.length}`;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${all.length ? (got / all.length) * 100 : 0}%`;
    fill.style.background = GRADE_COLOR[grade];
    track.append(fill);
    row.append(label, track);
    bars.append(row);
  }
}

function renderList() {
  const shown = visibleTrophies();
  resultEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  listEl.replaceChildren();
  for (const t of shown) {
    const card = document.createElement('article');
    card.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    if (isSpoilerHidden(t)) card.classList.add('spoiler-hidden');
    card.dataset.id = t.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${t.name}, ${GRADE_LABEL[t.grade]}${earned.has(t.name) ? ', earned' : ''}. Activate to read the guide.`);
    const top = document.createElement('div');
    top.className = 'card-top';
    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = isSpoilerHidden(t) ? 'Hidden trophy — earn it to reveal' : t.name;
    const box = document.createElement('button');
    box.type = 'button';
    box.className = 'checkbox';
    box.textContent = '✓';
    box.setAttribute('aria-label', earned.has(t.name) ? `Mark ${t.name} as not earned` : `Mark ${t.name} as earned`);
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEarned(t);
    });
    top.append(name, box);
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = isSpoilerHidden(t) ? 'Story trophy hidden by the spoiler setting.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const gradeChip = document.createElement('span');
    gradeChip.className = `chip grade-${t.grade}`;
    gradeChip.textContent = GRADE_LABEL[t.grade];
    meta.append(gradeChip);
    const kindChip = document.createElement('span');
    kindChip.className = 'chip';
    kindChip.textContent = KIND_LABEL[t.kind] ?? t.kind;
    meta.append(kindChip);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'chip missable';
      m.textContent = '⚠ Missable';
      meta.append(m);
    }
    if (t.spoiler && !earned.has(t.name)) {
      const s = document.createElement('span');
      s.className = 'chip spoiler';
      s.textContent = 'Story spoiler';
      meta.append(s);
    }
    card.append(top, desc, meta);
    if (t.target) {
      const tg = document.createElement('p');
      tg.className = 'card-target';
      tg.textContent = `Target: ${t.target.toLocaleString('en-US')}`;
      card.append(tg);
    }
    card.addEventListener('click', () => openDetail(t.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(t.id); }
    });
    listEl.append(card);
  }
  if (!shown.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'No trophies match these filters. Clear the search or widen the filters.';
    listEl.append(empty);
  }
}

function toggleEarned(t) {
  if (earned.has(t.name)) earned.delete(t.name);
  else earned.add(t.name);
  save();
  renderAll();
}

function openDetail(id) {
  selectedId = id;
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  detailEl.hidden = false;
  detailEl.replaceChildren();
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.textContent = 'Close ✕';
  close.addEventListener('click', () => {
    selectedId = null;
    detailEl.hidden = true;
    renderList();
  });
  const title = document.createElement('h2');
  title.textContent = isSpoilerHidden(t) ? 'Hidden story trophy' : t.name;
  const meta = document.createElement('p');
  meta.className = 'card-meta';
  const gradeChip = document.createElement('span');
  gradeChip.className = `chip grade-${t.grade}`;
  gradeChip.textContent = GRADE_LABEL[t.grade];
  const kindChip = document.createElement('span');
  kindChip.className = 'chip';
  kindChip.textContent = KIND_LABEL[t.kind] ?? t.kind;
  meta.append(gradeChip, kindChip);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isSpoilerHidden(t)
    ? 'Official description hidden by the spoiler setting.'
    : `Official description: “${t.description}”`;
  const earnedState = document.createElement('p');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.name) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => toggleEarned(t));
  earnedState.append(toggle);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-callout';
    warn.textContent = '⚠ Missable: do the Chapter 1 meditation before Chapter 1 ends — see the guide below.';
    detailEl.append(warn);
  }
  if (isSpoilerHidden(t)) {
    // The spoiler setting hides story trophies until earned — the detail pane
    // must respect it too, or the toggle would be pointless.
    const hidden = document.createElement('p');
    hidden.className = 'detail-guide';
    hidden.textContent = 'This is a story trophy and the spoiler setting is on. Earn it in the game (or turn the spoiler setting off) to read its guide here.';
    const sources = document.createElement('p');
    sources.className = 'detail-sources';
    const strong = document.createElement('strong');
    strong.textContent = 'Sources: ';
    sources.append(strong, document.createTextNode('Official trophy list via Exophase and PSNProfiles.'));
    detailEl.append(close, title, meta, official, earnedState, hidden, sources);
    renderList();
    detailEl.scrollIntoView({ block: 'start' });
    return;
  }
  const guide = document.createElement('div');
  guide.className = 'detail-guide';
  for (const para of t.guide.split(/(?<=[.!?])\s+(?=[A-Z“])/)) {
    const p = document.createElement('p');
    p.textContent = para;
    guide.append(p);
  }
  const sources = document.createElement('p');
  sources.className = 'detail-sources';
  const strong = document.createElement('strong');
  strong.textContent = 'Sources: ';
  sources.append(strong, document.createTextNode((t.sources ?? []).join('; ') + '.'));
  detailEl.append(close, title, meta, official, earnedState, guide, sources);
  renderList();
  detailEl.scrollIntoView({ block: 'start' });
}

// Roadmap phases, with done-state from the checklist.
const PHASES = [
  { id: 'story', title: 'Phase 1 — Play the story', time: '60–80 hours',
    items: ['Finish all 5 chapters and the final mission (14 story trophies).', 'Do the Chapter 1 balcony meditation with Lucia — the one potentially missable trophy.', 'Keep a manual save at the start of every chapter (no mission replay).', 'Scan vehicles and study animals as you travel (200 of 277 vehicles, 100 of 255 animals for 100%).'],
    test: () => trophies.filter((t) => t.kind === 'story').every((t) => earned.has(t.name)) },
  { id: 'side', title: 'Phase 2 — Side strands & activities', time: '20–30 hours',
    items: ['Finish the character strands (Andy, Kenton, Billy, Randy, Tyrone) and 8 Strangers & Freaks strands.', 'Try every activity type once; win races, fish with Cal, bowl, play an arcade game.', 'Start the robbery trophies: shops with your partner, armored trucks, jewelry store stealth.'],
    test: () => trophies.filter((t) => t.kind === 'side').every((t) => earned.has(t.name)) },
  { id: 'grind', title: 'Phase 3 — The long grinds', time: '60–80 hours',
    items: ['42 Shooting Range gold medals (The Shootist) and 42 drone time trials at 14 Top Fun locations.', '250 stunts, 70 of the 80 Challenges, 18 meditation spots.', '100 vehicles discovered, 100 WAiNK locations, 3 card sets, 52 areas explored.'],
    test: () => ['Cunning Stunts', 'The Shootist', 'Top Fun'].every((n) => earned.has(n)) },
  { id: 'cleanup', title: 'Phase 4 — Money & cleanup', time: '10–20 hours',
    items: ['Rob 5 bank vaults, launder $250,000 in Marked Bills, spend $100,000 in shops.', 'Buy all 8 garage properties, register 10 vehicles to Scooter Bros.', 'Finish the 100% checklist (A Long Road) — then the platinum pops.'],
    test: () => earned.has('A Long Road') },
];

function renderRoadmap() {
  const grid = document.getElementById('phaseGrid');
  grid.replaceChildren();
  for (const ph of PHASES) {
    const card = document.createElement('div');
    card.className = 'phase' + (ph.test() ? ' done' : '');
    const h = document.createElement('h3');
    h.textContent = (ph.test() ? '✓ ' : '') + ph.title;
    const time = document.createElement('p');
    time.className = 'phase-time';
    time.textContent = ph.time;
    const ul = document.createElement('ul');
    for (const item of ph.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    card.append(h, time, ul);
    grid.append(card);
  }
  const next = document.getElementById('nextUp');
  next.replaceChildren();
  const suggestions = [];
  if (!earned.has('Positive Mental Attitude')) {
    suggestions.push('Do the Chapter 1 meditation at Jason’s house before Chapter 1 ends — the only missable trophy in the game.');
  }
  const storyLeft = trophies.filter((t) => t.kind === 'story' && !earned.has(t.name)).length;
  if (storyLeft) suggestions.push(`Keep playing the story — ${storyLeft} story trophies are still to come, and they unlock just by finishing missions.`);
  if (!earned.has('Master of None')) suggestions.push('Try each activity type once for Master of None — the quickest bronze on the list.');
  const grindLeft = ['Cunning Stunts', 'The Shootist', 'Top Fun', 'One Last Thing'].filter((n) => !earned.has(n));
  if (grindLeft.length) suggestions.push(`Start the long grinds early so they finish themselves: ${grindLeft.join(', ')}.`);
  if (!earned.has('A Long Road')) suggestions.push('Check the 100% checklist under Progress → Stats after the story — it is the final gate to the platinum.');
  if (!suggestions.length) suggestions.push('Only the platinum itself is left. Congratulations, Leonida Legend.');
  for (const s of suggestions.slice(0, 5)) {
    const li = document.createElement('li');
    li.textContent = s;
    next.append(li);
  }
}

function renderMissables() {
  const wrap = document.getElementById('missableList');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const h = document.createElement('h3');
    h.textContent = `${t.name} — ${GRADE_LABEL[t.grade]}${earned.has(t.name) ? ' ✓ earned' : ''}`;
    const p = document.createElement('p');
    p.textContent = t.guide;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = earned.has(t.name) ? '✓ Earned — mark as not earned' : 'Mark as earned';
    btn.addEventListener('click', () => toggleEarned(t));
    card.append(h, p, btn);
    wrap.append(card);
  }
  const note = document.createElement('p');
  note.className = 'lede small';
  note.textContent = 'Every other trophy can be earned in free roam after the story. If a guide tells you otherwise, it is out of date.';
  wrap.append(note);
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
}

// Views (tabs + hash routing).
const views = ['checklist', 'roadmap', 'missables', 'about'];
function showView(name) {
  for (const v of views) {
    document.getElementById(`view-${v}`).hidden = v !== name;
    document.querySelector(`.tab[data-view="${v}"]`).classList.toggle('active', v === name);
  }
  if (name !== 'checklist') { detailEl.hidden = true; selectedId = null; }
}
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    location.hash = `#/${tab.dataset.view}`;
  });
});
function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const trophyMatch = hash.match(/^trophy-(\d+)$/);
  if (trophyMatch) {
    showView('checklist');
    openDetail(Number(trophyMatch[1]));
    return;
  }
  showView(views.includes(hash) ? hash : 'checklist');
}
window.addEventListener('hashchange', route);

// Controls.
for (const el of [searchEl, gradeEl, kindEl, statusEl]) el.addEventListener('input', renderList);
spoilerEl.addEventListener('change', renderList);
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchEl && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName ?? '')) {
    e.preventDefault();
    searchEl.focus();
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.name));
    const imported = names.filter((n) => valid.has(n));
    if (!imported.length) throw new Error('no recognised trophy names');
    earned = new Set(imported);
    save();
    renderAll();
    resultEl.textContent = `Imported ${imported.length} earned trophies.`;
  } catch {
    resultEl.textContent = 'Import failed: that file does not look like exported Leonida Ledger progress.';
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  selectedId = null;
  detailEl.hidden = true;
  save();
  renderAll();
});

renderAll();
route();
