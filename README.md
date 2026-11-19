# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nofrizal05/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nofrizal05/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI**: every trophy with its official name, description and grade, a full guide in our own words with sources cited, a checklist saved in your browser, a roadmap to the platinum, and the one missable trophy called out loud.

## What it does

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — with exact official names, descriptions and grades, plus a guide to each (what to do, where and how, when it can be missed).
- **Tracker** — tick trophies off as you earn them; progress is saved in localStorage, with export to JSON and import back.
- **Filters** — by grade, by kind (story, side missions, collectibles, activities, combat, heists, exploration, money, misc), by earned/missing, and free-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to platinum** — four phases (story → side strands → long grinds → money & cleanup), about 200 hours, plus a "Next up for you" list computed from your progress.
- **Missables** — only one trophy in the game can be missed (Positive Mental Attitude, the Chapter 1 meditation). It is flagged everywhere, with the exact moment to do it.
- **Fully offline** — static files, no network requests, no external fonts or images, no Rockstar logo or official artwork. Your progress never leaves your browser.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Then serve the built app and open it:

```sh
npx serve out/app
# or: python3 -m http.server --directory out/app
```

Or run it straight from this repo during development:

```sh
node serve.ts
# open http://localhost:8080
```

Requires Node.js 22 or later. No build step, no dependencies.

## Sources

Names, descriptions and grades are the official PS5 list (Exophase and PSNProfiles, 2026-11-18). Counts and roadmap figures come from PSNProfiles and the early community guides (PowerPyx, KeenGamer). Every guide is written in our own words for this entry, and where a hidden trophy's trigger is not yet confirmed, the guide says so instead of inventing one.

## License

MIT — see [LICENSE](LICENSE).

---

Built for [make.fun](https://make.fun/?ref=31w76kz9&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)'s "Build the best GTA 6 trophy guide" bounty. If you build your own entry, use referral code `31w76kz9` — https://make.fun/r/31w76kz9
