# Wizard Adventures - Development Handoff

This is the current handoff document for the **Wizard Adventures** game project. It is meant to be placed in the project root as `HANDOFF.md` and used by Codex for ongoing development.

---

## 1. Current project goal

Build **Wizard Adventures** into a real browser-based 2D side-scrolling platformer.

The current target is a polished, playable **World 1-1: Moonstone Meadow**. This is not a throwaway mockup and should not be rebuilt from scratch.

The existing game should be improved incrementally.

---

## 2. Game identity

**Title:** Wizard Adventures  
**Genre:** 2D side-scrolling fantasy platformer  
**First world:** Moonstone Meadow  
**First level:** Moonstone Meadow 1-1  
**Playable characters:** Finn and Nora  
**Story goal:** recover the stolen spell book  
**Level goal:** reach the floating bell tower and pull the rope  

Tone should be whimsical, colorful, friendly fantasy. The mechanics are classic side-scrolling platformer mechanics, but the characters, items, enemies, worlds, and visual identity should remain original to Wizard Adventures.

---

## 3. Expected project structure

The project should continue to use a real game structure:

```text
index.html
src/
  game.js
  styles.css
  level1-data.js
assets/
  backgrounds/
  characters/
  enemies/
  items/
  tiles/
HANDOFF.md
```

The game currently uses plain HTML, CSS, and JavaScript with canvas rendering.

Keep level data separate from the main game logic where possible. Do not hard-code every object directly into rendering logic.

---

## 4. Patch history and current file state

The project has been developed through a base Level 1 build plus focused patches.

### Base build

`WizardAdventures_Level1.zip`

Created the first real canvas game foundation with:

- playable Level 1
- assets
- keyboard controls
- enemies
- blocks
- items
- player states
- bell goal

### Movement / touch / title / bell / star patch

Changed:

```text
index.html
src/game.js
src/styles.css
src/level1-data.js
```

Added or improved:

- double jump
- crouch / duck
- iPad-style touch controls
- clickable Finn/Nora character cards
- improved bell tower and rope goal logic
- stronger star-power flashing
- upbeat generated star-power tune

### Nora + Armored Beetle asset patch

Changed:

```text
assets/characters/nora/
assets/enemies/armored_beetle/
```

Fixed:

- Nora was showing as the armored beetle on the character select screen
- Armored Beetle was showing as Nora in gameplay

### Enemy-fix asset patch

Changed:

```text
assets/enemies/cursed_book/
assets/enemies/snapping_vine/
```

Fixed:

- Cursed Book enemy art was wrong
- Snapping Vine near the well was wrong

### Owl helper patch

Changed:

```text
src/game.js
```

Intended to add:

- owl proximity speech bubble
- click/tap owl interaction
- Up/W interaction near owl
- owl as a friendly helper, not an enemy

### Important verification note

Before making more changes, Codex should verify that the latest working folder includes all patches.

The latest `src/game.js` should include:

- title screen character selection
- touch controls
- double jump
- crouch
- stronger star power
- bell tower/rope goal update
- owl helper behavior

If any patch overwrote another patch, merge the intended behaviors rather than dropping features.

---

## 5. Playable characters

### Finn

Boy apprentice wizard.

### Nora

Girl apprentice wizard.

Nora’s asset folder was previously mixed up with the armored beetle. This has been corrected in a later asset patch.

### Character select

The title screen should show clickable/tappable cards for:

- Finn
- Nora

Keyboard shortcuts should remain:

```text
F = start as Finn
N = start as Nora
```

---

## 6. Character forms

Each playable character has three power states.

### Baby Wizard

Small starting form.

Behavior:

- can run
- can jump
- can double jump
- can crouch
- can stomp enemies
- cannot break old bricks from below
- dies or loses a life when hit

### Old Wizard

Powered-up form gained from the **Magic Hat**.

Behavior:

- larger body
- black cloak
- magic hat
- can break old bricks by jumping into them from below
- can crouch down to roughly Baby Wizard height
- if hit, shrinks back to Baby Wizard

### White Wizard

Projectile form gained from the **Spark Wand** when already Old Wizard.

Behavior:

- larger body
- glowing white cloak
- can shoot bouncing fireballs
- can crouch down to roughly Baby Wizard height
- if hit, shrinks directly back to Baby Wizard

---

## 7. Power-up rules

### Magic Hat

Growth power-up.

Rules:

```text
Baby Wizard + Magic Hat = Old Wizard
Old Wizard + Magic Hat = optional points or no change
White Wizard + Magic Hat = optional points or no change
```

Current preferred behavior: Magic Hat upgrades Baby Wizard to Old Wizard.

### Spark Wand

Projectile power-up.

Rules:

```text
Baby Wizard + Spark Wand = Old Wizard
Old Wizard + Spark Wand = White Wizard
White Wizard + Spark Wand = optional points or refresh
```

White Wizard can shoot bouncing fireballs.

### Star Charm

Temporary invincibility.

Rules:

- player gets fiery aura
- player becomes temporarily invincible
- enemies are defeated on contact
- upbeat generated invincibility music should play
- visual flashing should be obvious, especially for White Wizard
- after timer ends, player returns to their previous form

Recent design decision: star power should be much more obvious visually and should have a faster, happier generated tune.

### Potion Bottle

1-Up item.

Rules:

- grants one extra life
- should be rare
- can appear from crescent blocks or secret areas

---

## 8. Keyboard controls

```text
A / Left Arrow = move left
D / Right Arrow = move right
W / Up Arrow / Space = jump or double jump
S / Down Arrow = crouch
X = cast fireball when White Wizard
R = restart
F = choose Finn on title screen
N = choose Nora on title screen
```

---

## 9. Touch controls / iPad support

The game should support both keyboard and iPad/touchscreen controls.

### Preferred standard layout

```text
Bottom left: D-pad / arrows
Bottom right: A and B buttons
```

### D-pad

Should include four arrows:

- left
- right
- up
- down

Current uses:

- left/right = movement
- down = crouch
- up = interaction, wells, owl, doors, etc.

### A and B button layout

On the right side of the screen:

```text
B = closer to the outer screen edge and higher
A = closer to the middle of the screen and lower
```

Meaning:

```text
A = jump / double jump
B = shoot fireball when White Wizard
```

Buttons should be semi-transparent with a clear outline so they do not block gameplay too much.

### B button when inactive

If the player is Baby Wizard or Old Wizard:

- B button should remain visible
- B button should be dimmed / greyed out
- pressing B should do nothing or play a subtle inactive sound

Do not hide B completely because controls should not move or disappear during gameplay.

### Future flipped layout

Future option: left-handed/flipped layout.

If flipped:

```text
D-pad moves to bottom right
A/B move to bottom left
```

The stagger should mirror correctly:

- the button closer to the outer screen edge is always B and higher
- the button closer to the screen middle is always A and lower

This does not need to be a visible settings menu yet, but code/CSS should not prevent it from being added later.

---

## 10. Movement rules

### Double jump

Double jump is intended and should remain.

Rules:

- first jump happens from ground
- second jump can be triggered once while in the air
- double jump resets on landing
- some platforms may intentionally require double jump

Do not automatically lower Level 1 geometry just because something seems too high for a single jump. Some areas are intended to teach or require double jump.

### Crouch / duck

Rules:

- holding Down or S crouches
- Old Wizard and White Wizard crouch down to roughly Baby Wizard height
- crouch should allow access through low passages
- player should not be able to stand up into a solid block
- if there is not enough headroom, the player should remain crouched until clear

### Fireball casting

White Wizard can cast bouncing fireballs.

Rules:

- keyboard: X
- touch: B button
- fireballs bounce along ground
- fireballs defeat enemies
- fireball use should have cooldown

---

## 11. Level 1: Moonstone Meadow 1-1

### Purpose

Level 1 should establish the core gameplay language without feeling like a lecture or static tutorial screen.

It should introduce:

- movement
- jump
- double jump
- crouch
- coins
- crescent blocks
- Magic Hat
- old bricks
- Spark Wand
- White Wizard fireballs
- enemy stomping
- snapping vine wells
- owl helper
- bell tower goal

### Level geometry note

The level currently has some high platforms. This is acceptable because double jump is intended.

Do not make all geometry reachable with a single jump. It is okay for Level 1 to contain required double-jump sections.

### End goal

The end of the level should be a floating bell tower high above the player.

Correct layout:

- bell tower sits up high, higher than the player can jump
- rope extends from bell tower all the way down to ground level
- player jumps and grabs rope
- higher grab gives more points
- bell rings once
- level completes

Previous issue: rope looked like it was coming out of the ground or floating by itself. This was corrected conceptually and should remain fixed.

Suggested scoring:

```text
Top grab = 5000 points
High grab = 2000 points
Middle grab = 800 points
Low grab = 200 points
```

Exact values can be tuned later.

---

## 12. Friendly owl helper

### Role

The owl is a friendly guide, not an enemy.

The owl should:

- sit near signs/checkpoints
- provide hints
- warn about mechanics
- point toward secrets
- help the player learn double jump, crouch, and power-ups

The owl should not:

- hurt the player
- throw anything
- act as a projectile source
- be classified as an enemy

### Current intended behavior

The owl should no longer just sit there. A later patch was intended to add helper behavior.

Expected behavior:

- when the player gets close, a speech bubble appears automatically
- pressing Up or W near the owl expands the hint
- clicking/tapping the owl also expands the hint
- owl may flap or point if frames are available
- owl remains non-solid and non-damaging

Suggested first hint:

```text
Double jump to reach high ledges. White Wizards can cast fireballs with X or B.
```

### Important note

If something seems to attack near the owl, check nearby enemy/projectile placement. It is probably a nearby Goblin Spell Thrower, scroll launcher, or projectile. The owl itself should not attack.

---

## 13. Enemies

### Cursed Book

Basic walking enemy.

Behavior:

- walks along ground
- turns around at walls or edges
- can be stomped
- hurts player from side
- can be defeated by fireball

Asset issue fixed: Cursed Book was previously mapped to wrong art. A later enemy-fix patch corrected it.

### Armored Beetle

Shell-style enemy.

Behavior:

- walks along ground
- first stomp changes it into shell state
- shell can slide
- sliding shell can defeat enemies
- sliding shell can hurt player

Asset issue fixed: armored beetle was previously mixed up with Nora. A later patch corrected it.

### Snapping Vine

Well enemy.

Behavior:

- hides in stone well
- rises periodically
- attacks by occupying vertical space
- should not be safely stompable
- can be defeated by fireball if desired

Asset issue fixed: snapping vine was previously mapped to wrong art. A later enemy-fix patch corrected it.

### Goblin Spell Thrower

Advanced enemy.

Behavior:

- stands on platform or ground
- throws magic orb projectiles
- may jump later
- can be stomped or defeated by fireball

Verify placement and projectile behavior.

### Cursed Scroll Rocket

Projectile enemy.

Behavior:

- launches horizontally from launcher
- flies across screen
- should be clearly visually distinct from owl helper

Verify that it does not visually appear to come from the owl.

### Enemy verification status

Known corrected:

- Nora character assets
- Armored Beetle assets
- Cursed Book assets
- Snapping Vine assets
- Owl helper art appears correct

Still worth verifying:

- Goblin Spell Thrower placement and projectile behavior
- Cursed Scroll Rocket launcher placement
- whether any enemy spawns too close to the owl helper

---

## 14. Blocks, items, and world objects

### Gold coins

Standard collectible.

Rules:

- collect for score
- 100 coins should eventually give extra life

### Glowing crescent block

Mystery block.

Visual:

- stone block with glowing crescent moon

Behavior:

- can contain coin, Magic Hat, Spark Wand, Star Charm, or Potion Bottle
- after hit, becomes spent non-glowing block

### Spent crescent block

Same stone block but glow is removed.

### Old brick block

Breakable block.

Rules:

- Baby Wizard bumps it but cannot break it
- Old Wizard and White Wizard can break it from below

### Stone wells

Replacement for pipe/tube concept.

Uses:

- decorative object
- snapping vine container
- future secret portal or level transition

### Checkpoint banner

Current/future role:

- marks progress
- may become respawn point later

### Stolen spell book

Main story objective.

Future use:

- major collectible
- final world goal
- chapter/page collection between worlds

---

## 15. Assets and known asset problems

### Asset source

Many current individual PNGs were extracted from generated sprite sheets. This allowed the first real build to come together quickly, but it caused some wrong crops and wrong mappings.

### Known asset correction patches

Nora + Beetle patch corrected:

```text
assets/characters/nora/
assets/enemies/armored_beetle/
```

Enemy-fix patch corrected:

```text
assets/enemies/cursed_book/
assets/enemies/snapping_vine/
```

Owl helper patch changed:

```text
src/game.js
```

Expected effect:

- owl proximity hint
- click/tap owl interaction
- friendly non-enemy behavior

### Remaining asset concerns

The current art is good enough for foundation testing but not final production quality.

Known issues:

- some sprite crops may include extra whitespace
- some animation frames may not line up perfectly
- some background seams are visible
- some sprites may have checkerboard artifacts or imperfect transparent backgrounds
- current backgrounds are not true seamless parallax loops

### Long-term asset direction

Eventually replace rough sheet-derived sprites with clean individual PNG files created intentionally for gameplay.

Preferred structure:

```text
assets/
  characters/
    finn/
    nora/
  enemies/
    cursed_book/
    armored_beetle/
    snapping_vine/
    goblin_spell_thrower/
    cursed_scroll_rocket/
    owl_helper/
  items/
  tiles/
  backgrounds/
```

Recommended character frame set over time:

```text
baby_idle_01.png
baby_idle_02.png
baby_run_01.png
baby_run_02.png
baby_run_03.png
baby_jump.png
baby_double_jump.png
baby_fall.png
baby_crouch.png
baby_hurt.png
baby_victory.png

old_idle_01.png
old_idle_02.png
old_run_01.png
old_run_02.png
old_run_03.png
old_jump.png
old_double_jump.png
old_fall.png
old_crouch.png
old_hurt.png
old_victory.png

white_idle_01.png
white_idle_02.png
white_run_01.png
white_run_02.png
white_run_03.png
white_jump.png
white_double_jump.png
white_fall.png
white_crouch.png
white_cast.png
white_hurt.png
white_victory.png
```

---

## 16. Backgrounds and parallax

### Current background issue

The initial background art looked good but was not suitable as a full side-scrolling level background. It was too short and not loopable.

### Correct long-term direction

Use layered parallax backgrounds.

Suggested layers:

```text
Layer 1: sky / clouds / distant magical atmosphere
Layer 2: distant hills / floating islands / far academy
Layer 3: midground meadow / trees / fences / hills
Layer 4: gameplay tiles and platforms
Layer 5: props, coins, blocks, enemies, player
```

Future asset names:

```text
assets/backgrounds/moonstone_sky_loop.png
assets/backgrounds/moonstone_far_hills_loop.png
assets/backgrounds/moonstone_midground_loop.png
assets/backgrounds/moonstone_clouds_loop.png
```

The current background art can remain as placeholder/title/menu art, but it should eventually be replaced with loopable parallax layers.

---

## 17. Audio plan

### Sound effects

Use generated Web Audio sound effects for small effects:

- jump
- double jump
- coin pickup
- block bump
- brick break
- enemy stomp
- fireball cast
- power-up
- hurt
- bell ring

### Music

For now, music can remain optional.

Long-term recommendation:

- generated simple invincibility tune for Star Charm
- optional MP3 or loopable music files for world themes later

Possible future music files:

```text
assets/music/moonstone_meadow_loop.mp3
assets/music/star_charm_loop.mp3
assets/music/level_clear.mp3
```

---

## 18. Code organization guidance

### Keep data separate

Level data should remain in data files such as:

```text
src/level1-data.js
```

Do not hard-code every enemy, coin, platform, or block inside rendering logic.

### Future separation

Recommended separation over time:

```text
src/game.js              main loop / orchestration
src/level1-data.js       level data
src/player.js            player movement and state
src/enemies.js           enemy behavior
src/collisions.js        collision helpers
src/assets.js            loader
src/audio.js             generated audio
src/touch-controls.js    touch input
src/render.js            drawing helpers
```

This does not all need to happen immediately, but future development should move in this direction.

### Do not break current playable behavior

When refactoring, preserve:

- character select
- keyboard controls
- touch controls
- double jump
- crouch
- power-up state changes
- enemy interactions
- bell goal
- owl helper behavior

---

## 19. Immediate checklist

Before expanding the game, verify:

1. Latest patches are applied cleanly.
2. Nora appears correctly on title screen and in gameplay.
3. Armored Beetle appears correctly in gameplay.
4. Cursed Book appears correctly in gameplay.
5. Snapping Vine appears correctly near wells.
6. Owl is friendly and interactive.
7. Touch controls appear and work on desktop and iPad.
8. B button is dimmed unless White Wizard.
9. Double jump reaches intended platforms.
10. Crouch works for Old Wizard and White Wizard.
11. Star power is visually obvious.
12. Bell tower rope extends from high tower to ground.
13. Goblin Spell Thrower does not appear to be the owl.
14. Cursed Scroll Rocket launcher does not visually confuse the player near the owl.

---

## 20. Near-term polish tasks

- improve jump feel
- tune double-jump height
- tune acceleration/deceleration
- tune enemy spacing
- tune fireball cooldown
- improve stomp bounce
- make star power unmistakable
- improve bell rope scoring/animation
- improve touch controls on iPad
- reduce confusion between owl and nearby projectiles
- add true crouch frames
- add true double-jump frames

---

## 21. Medium-term plan

### Phase 1: solid Level 1 foundation

Goal: make Moonstone Meadow 1-1 feel playable, understandable, and fun.

Tasks:

- fix remaining asset mapping issues
- polish movement
- polish touch controls
- complete owl helper behavior
- finish bell goal behavior
- make level completable without bugs

### Phase 2: better Level 1 assets

Goal: replace rough extracted sprite-sheet art with clean individual runtime assets.

Tasks:

- clean Finn frames
- clean Nora frames
- clean all enemies
- clean all items
- clean tile set
- create seamless parallax backgrounds

### Phase 3: Level 1 polish

Goal: make the first level feel like an actual game level.

Tasks:

- better coin placement
- intentional power-up placement
- readable enemy introductions
- secret area or optional bonus route
- checkpoint behavior
- improved HUD
- pause/restart menu

### Phase 4: build World 1

Possible levels:

```text
1-1 Moonstone Meadow
1-2 Whispering Wells
1-3 Owlwood Crossing
1-4 Moonstone Gatehouse
```

World 1 should gradually introduce all core mechanics.

### Phase 5: expand into full game

Potential worlds:

```text
World 1: Moonstone Meadow
World 2: Crystal Cellars
World 3: Owlwood Forest
World 4: Stormcloud Spires
World 5: Shadow Tower
```

---

## 22. Design principles going forward

### Keep the game readable

Every object should be visually obvious:

- coins are collectible
- glowing crescent blocks are hittable
- spent blocks are inactive
- old bricks are breakable only when powered
- wells may be dangerous or secret
- owl is friendly
- enemies are dangerous
- bell rope is the goal

### Avoid confusing enemy/helper overlap

The owl must never look like it is attacking. Do not place enemy projectile launchers so close to the owl that the player thinks the owl is hostile.

### Teach mechanics naturally

Do not rely only on text instructions.

Examples:

- place coins in arcs that teach jump paths
- place a safe double-jump challenge before a dangerous one
- put a low tunnel after the player gets Old Wizard
- introduce enemies one at a time before combining them

### Keep controls simple

For now the game should only need:

- movement
- crouch
- jump / double jump
- shoot
- interact

No extra buttons unless absolutely necessary.

---

## 23. Notes for future Codex sessions

When handing this project to Codex, make sure Codex understands:

1. This is not a mockup anymore.
2. Preserve the current project structure unless there is a good reason to refactor.
3. Use `HANDOFF.md` as the source of truth for current direction.
4. Do not replace the game with a new demo.
5. Do not remove touch support.
6. Do not remove keyboard support.
7. Do not treat owl as an enemy.
8. Do not lower level geometry just because double jump is required.
9. Keep the game original and avoid using copyrighted Mario or Harry Potter assets/names.
10. Prefer small, focused patches over large rewrites.
11. Verify behavior after every patch.
12. Maintain asset folders and file paths unless intentionally updating all references.

---

## 24. Recommended first Codex prompt

Use this when starting the next Codex session:

```text
Read HANDOFF.md first. This is the current source of truth for Wizard Adventures. Then inspect the current project files. Confirm the current state of Level 1, verify that the latest asset and code patches are applied, and make a short checklist of remaining issues before changing code. Do not rewrite the game from scratch. Preserve the existing architecture and improve it incrementally.
```

---

## 25. Final summary

Wizard Adventures is currently at the stage where the core idea is strong and the first real Level 1 foundation exists. The main needs now are cleanup, verification, and polish.

The game should continue moving toward:

- a polished Level 1
- reliable keyboard and touch controls
- clean individual PNG assets
- friendly owl helper guidance
- strong wizard power-up mechanics
- readable enemy behavior
- loopable parallax backgrounds
- eventual expansion into multiple worlds
