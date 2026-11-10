# Duine Eile

**Short a player? Find one more.**

Duine Eile (Irish for "another person") helps people in the Republic of Ireland find someone to play, walk, swim or game with, sorted by county. Post a game that's short a player, or join one near you in two taps.

This repository is a **clickable web demo**. It runs entirely in the browser on GitHub Pages: sample games and venues are generated for all 26 counties, and your account, joins, posts and chats are saved only in your browser's local storage.

## What you can try

- **Sign up** with a username, county and the activities you're into (18+ only).
- **County feed** of games in the next 7 days, filtered by activity, day and level. Games needing one more player go to the top.
- **Venues** page showing what actually exists in your county. Activities only appear where there's somewhere to do them.
- **I'm in** takes a spot and opens a group chat for that game.
- **Temporary chat** that deletes at midnight the day after the game. Messages can be reported, and reported messages are kept for review.
- **Post a game** by picking a venue from your county's list, the date, how many you need, level and cost.
- **Profile** to change county or activities at any time.

## Skill levels

| Players (5-a-side, padel, board games) | Routes (hiking, swimming, running, cycling) |
| --- | --- |
| Beginner, Casual, Intermediate, Advanced, Competitive | Easy, Moderate, Hard |

## Running it

No build step. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

GitHub Pages serves it from the `main` branch root.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Page shell |
| `css/styles.css` | Styles (phone and desktop) |
| `js/data.js` | Counties, activities, levels, venues and sample game generator |
| `js/app.js` | Routing, views, browser storage and chat |

## Not in the demo yet

Real accounts (email sign-in link), shared games between people, live chat and the scheduled chat clean-up. The plan is Supabase (EU region) behind this same front end, with venue data pulled from OpenStreetMap and Sport Ireland by a scheduled GitHub Action.

Venues and games in the demo are sample data.
