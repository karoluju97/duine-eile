# Duine Eile

**Short a player? Find one more.**

Duine Eile (Irish for "another person") helps people in the Republic of Ireland find someone to play, walk, swim or game with, sorted by county. Post a game that's short a player, or join one near you in two taps.

This repository is a **clickable web demo**. It runs entirely in the browser on GitHub Pages: sample games and venues are generated for all 26 counties, and your account, joins, posts and chats are saved only in your browser's local storage.

## What you can try

- **Log in or create an account** with email and password, or continue with Apple, Google or Facebook (simulated in the demo; passwords are never saved).
- **Sign-up, one question per screen**: username, age group (18–21 up to 56+, optional on your profile), your county on a clickable map of Ireland or from a list, the activities you're into, then your level for each one.
- **County feed** of games in the next 7 days, filtered by activity, day and level. Games needing one more player go to the top.
- **Venues** page showing what actually exists in your county. Activities only appear where there's somewhere to do them.
- **I'm in** takes a spot and opens a group chat for that game.
- **Temporary chat** that deletes at midnight the day after the game. Messages can be reported, and reported messages are kept for review.
- **Report and block**: report a chat message, a game post or a person with a reason, optionally blocking them. Blocked people's games and messages disappear for you. Reports about unsafe behaviour or under-18s show the emergency numbers.
- **Review queue** (Profile → Demo): a mock moderator page. Reported messages are kept with the messages around them even after the chat deletes; urgent reports go first; anyone reported by 3+ people is hidden until reviewed. Actions are dismiss, warn, remove, suspend or ban, and each one writes the statement of reasons sent to the person (EU Digital Services Act, Art. 17).
- **Post a game** by picking a venue from your county's list, the date, how many you need, level and cost.
- **Profile** to change county or activities at any time.

## Skill levels

| Players (5-a-side, Gaelic football, hurling, hockey, basketball, volleyball, tennis, padel, pickleball, badminton, pitch & putt, gym, climbing, surfing, dancing, board games, chess, table quiz, darts, pool, online gaming) | Routes and classes (open-water swim, pool swimming, running, walking, hiking, cycling, yoga) |
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
| `js/data.js` | Counties, provinces, activities, levels, age groups, venues and sample game generator |
| `js/map-data.js` | County outlines for the sign-up map |
| `js/app.js` | Routing, views, browser storage and chat |

## Not in the demo yet

Real accounts (email and password, Apple, Google and Facebook sign-in), shared games between people, live chat and the scheduled chat clean-up. The plan is Supabase (EU region) behind this same front end, with venue data pulled from OpenStreetMap and Sport Ireland by a scheduled GitHub Action.

## Colours

Palette "Floodlight": navy `#16213A` for text and trust, warm sand `#F7F3EC` background, floodlight orange `#C2410C` for actions, teal `#0F766E` for "you're in" and open spots. All text pairs meet WCAG AA contrast.

## Credits

County map outlines derived from [Natural Earth](https://www.naturalearthdata.com/) admin-1 boundaries (public domain).

Venues and games in the demo are sample data.
