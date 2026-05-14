Wizard Adventures - Level 1 Foundation Build

Serve this folder with a local or static web server, then open index.html to play Moonstone Meadow 1-1.
Because the game uses ES module imports for Firebase, opening index.html directly as file:// is not supported.

One local option:
- python -m http.server 8000
- open http://localhost:8000/

Controls:
- F: choose Finn on the title screen
- N: choose Nora on the title screen
- A/D or Arrow Keys: move
- Space, W, or Up: jump / double jump
- S or Down: crouch / duck
- X: cast fireballs after becoming White Wizard
- R: restart level

This build is structured as the real starting point for the game, not a disposable test page.
It includes:
- double jump
- crouch / low-clearance hitbox behavior
- iPad-friendly semi-transparent touch controls
- real canvas rendering
- character select
- player physics
- collision
- camera scrolling
- coin collection
- crescent blocks
- breakable old bricks
- Magic Hat power-up
- Spark Wand power-up
- White Wizard fireball casting
- Star Charm invincibility
- Potion 1-Up
- cursed book enemies
- armored beetle enemies
- snapping vine well enemy
- goblin spell thrower
- cursed scroll launcher
- owl helper prop
- floating bell tower rope goal
- Web Audio generated sound effects
- local and Firestore-backed global leaderboards

Main files:
- index.html
- src/styles.css
- src/level1-data.js
- src/game.js

Asset folders:
- assets/characters
- assets/enemies
- assets/items
- assets/tiles
- assets/backgrounds
- assets/raw

Notes:
The current art has been split from the generated sprite sheets into individual PNGs. Some assets may need cleaner hand-cropping later, but the code already uses the final-style file structure and individual asset references.

Touch controls:
- D-pad appears on the lower left on touch devices.
- A appears lower and closer to the center; it jumps and double jumps.
- B appears higher and closer to the screen edge; it casts fireballs when White Wizard.
- B stays visible but dimmed when the player cannot cast.
- On the title screen, A starts Finn and B starts Nora.
- The CSS already includes a future flipped layout option.

Leaderboards:
- Local scores are stored in localStorage under wizardAdventuresHighScores and keep the top 10.
- Global scores are read from and written to Firestore at leaderboards/wizard-adventure/scores.
- Global score documents contain only playerName, score, gameId, and createdAt.
- The browser does not use Firebase Authentication and only reads global scores or creates new score documents.
- Named scores are saved locally first, then queued in localStorage under wizardAdventuresPendingGlobalScores for global sync.
- If Firebase is unavailable or the player is offline, local scores still work and pending global scores sync later.
- Pending global scores are uploaded only if they still qualify for the global top 10 at sync time; otherwise they are removed from the pending queue without deleting Firestore documents.
