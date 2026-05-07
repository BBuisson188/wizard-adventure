Wizard Adventures - Level 1 Foundation Build

Open index.html in a browser to play Moonstone Meadow 1-1.

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
