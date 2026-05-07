window.WIZARD_ADVENTURES_LEVEL_1 = {
  meta: {
    title: 'Wizard Adventures',
    levelName: 'Moonstone Meadow 1-1',
    version: 'level1-foundation-0.3-title-bell-star-touch'
  },
  display: {
    width: 960,
    height: 540,
    tile: 64,
    worldWidth: 7600,
    floorY: 476
  },
  assets: {
    backgrounds: {
      far: 'assets/backgrounds/moonstone_meadow_far.png',
      mid: 'assets/backgrounds/moonstone_meadow_mid.png'
    },
    characters: {
      finn: {
        baby: {
          idle: ['assets/characters/finn/baby_idle_01.png','assets/characters/finn/baby_idle_02.png'],
          run: ['assets/characters/finn/baby_run_01.png','assets/characters/finn/baby_run_02.png','assets/characters/finn/baby_run_03.png'],
          jump: ['assets/characters/finn/baby_jump.png'],
          fall: ['assets/characters/finn/baby_fall.png'],
          hurt: ['assets/characters/finn/baby_hurt.png'],
          victory: ['assets/characters/finn/baby_victory.png']
        },
        old: {
          idle: ['assets/characters/finn/old_idle_01.png','assets/characters/finn/old_idle_02.png'],
          run: ['assets/characters/finn/old_run_01.png','assets/characters/finn/old_run_02.png','assets/characters/finn/old_run_03.png'],
          jump: ['assets/characters/finn/old_jump.png'],
          fall: ['assets/characters/finn/old_fall.png'],
          hurt: ['assets/characters/finn/old_hurt.png'],
          victory: ['assets/characters/finn/old_victory.png']
        },
        white: {
          idle: ['assets/characters/finn/white_idle_01.png','assets/characters/finn/white_idle_02.png'],
          run: ['assets/characters/finn/white_run_01.png','assets/characters/finn/white_run_02.png','assets/characters/finn/white_run_03.png'],
          jump: ['assets/characters/finn/white_jump.png'],
          fall: ['assets/characters/finn/white_fall.png'],
          hurt: ['assets/characters/finn/white_hurt.png'],
          victory: ['assets/characters/finn/white_victory.png']
        }
      },
      nora: {
        baby: {
          idle: ['assets/characters/nora/baby_idle_01.png','assets/characters/nora/baby_idle_02.png'],
          run: ['assets/characters/nora/baby_run_01.png','assets/characters/nora/baby_run_02.png','assets/characters/nora/baby_run_03.png'],
          jump: ['assets/characters/nora/baby_jump.png'],
          fall: ['assets/characters/nora/baby_fall.png'],
          hurt: ['assets/characters/nora/baby_hurt.png'],
          victory: ['assets/characters/nora/baby_victory.png']
        },
        old: {
          idle: ['assets/characters/nora/old_idle_01.png','assets/characters/nora/old_idle_02.png'],
          run: ['assets/characters/nora/old_run_01.png','assets/characters/nora/old_run_02.png','assets/characters/nora/old_run_03.png'],
          jump: ['assets/characters/nora/old_jump.png'],
          fall: ['assets/characters/nora/old_fall.png'],
          hurt: ['assets/characters/nora/old_hurt.png'],
          victory: ['assets/characters/nora/old_victory.png']
        },
        white: {
          idle: ['assets/characters/nora/white_idle_01.png','assets/characters/nora/white_idle_02.png'],
          run: ['assets/characters/nora/white_run_01.png','assets/characters/nora/white_run_02.png','assets/characters/nora/white_run_03.png'],
          jump: ['assets/characters/nora/white_jump.png'],
          fall: ['assets/characters/nora/white_fall.png'],
          hurt: ['assets/characters/nora/white_hurt.png'],
          victory: ['assets/characters/nora/white_victory.png']
        }
      }
    },
    tiles: {
      groundGrass: 'assets/tiles/ground_grass_span.png',
      groundStone: 'assets/tiles/ground_stone_span.png',
      floatingPlatform: 'assets/tiles/ground_floating_platform.png',
      oldBrick: 'assets/tiles/old_brick_block.png',
      brokenBrick: 'assets/tiles/broken_brick_fragments.png',
      crescentGlowing: 'assets/tiles/crescent_block_glowing.png',
      crescentSpent: 'assets/tiles/crescent_block_spent.png',
      well: 'assets/tiles/stone_well_empty.png',
      wellFlowers: 'assets/tiles/stone_well_flowers.png',
      mossyRock: 'assets/tiles/mossy_rock.png',
      shrub: 'assets/tiles/shrub.png',
      signpost: 'assets/tiles/signpost.png',
      bellTower: 'assets/tiles/floating_bell_tower.png',
      bellRope: 'assets/tiles/bell_rope.png',
      bellRing: 'assets/tiles/bell_ring_effect.png',
      checkpoint: 'assets/tiles/checkpoint_banner.png'
    },
    items: {
      coin: ['assets/items/coin_01.png','assets/items/coin_02.png','assets/items/coin_03.png','assets/items/coin_04.png'],
      magicHat: 'assets/items/magic_hat.png',
      sparkWand: 'assets/items/spark_wand.png',
      starCharm: 'assets/items/star_charm.png',
      potion1Up: 'assets/items/potion_1up.png',
      fireball: ['assets/items/fireball_01.png','assets/items/fireball_02.png','assets/items/fireball_03.png'],
      sparkle: ['assets/items/sparkle_hit_01.png','assets/items/sparkle_hit_02.png']
    },
    enemies: {
      cursedBook: {
        walk: ['assets/enemies/cursed_book/walk_01.png','assets/enemies/cursed_book/walk_02.png'],
        squashed: 'assets/enemies/cursed_book/squashed.png',
        hit: 'assets/enemies/cursed_book/fireball_hit.png'
      },
      armoredBeetle: {
        walk: ['assets/enemies/armored_beetle/walk_01.png','assets/enemies/armored_beetle/walk_02.png'],
        shell: 'assets/enemies/armored_beetle/shell.png',
        slide: 'assets/enemies/armored_beetle/slide.png',
        flipped: 'assets/enemies/armored_beetle/flipped.png'
      },
      snappingVine: {
        hidden: 'assets/enemies/snapping_vine/well_empty.png',
        rise: ['assets/enemies/snapping_vine/rise_01.png','assets/enemies/snapping_vine/rise_02.png'],
        attack: 'assets/enemies/snapping_vine/attack.png',
        retreat: 'assets/enemies/snapping_vine/retreat.png'
      },
      goblin: {
        idle: 'assets/enemies/goblin_spell_thrower/idle.png',
        jump: 'assets/enemies/goblin_spell_thrower/jump.png',
        throw: 'assets/enemies/goblin_spell_thrower/throw.png',
        hurt: 'assets/enemies/goblin_spell_thrower/hurt.png',
        orb: ['assets/enemies/goblin_spell_thrower/orb_01.png','assets/enemies/goblin_spell_thrower/orb_02.png']
      },
      scrollRocket: {
        frames: ['assets/enemies/cursed_scroll_rocket/rocket_01.png','assets/enemies/cursed_scroll_rocket/rocket_02.png'],
        launcher: 'assets/enemies/cursed_scroll_rocket/launcher.png'
      },
      owl: {
        perched: 'assets/enemies/owl_helper/perched.png',
        flap: ['assets/enemies/owl_helper/flap_01.png','assets/enemies/owl_helper/flap_02.png'],
        point: 'assets/enemies/owl_helper/point.png',
        sign: 'assets/enemies/owl_helper/hint_sign.png'
      }
    }
  },
  level: {
    spawn: { x: 120, y: 360 },
    solids: [
      { x: 0, y: 476, w: 7600, h: 80, kind: 'ground' },
      { x: 820, y: 356, w: 260, h: 42, kind: 'platform' },
      { x: 1220, y: 292, w: 210, h: 42, kind: 'platform' },
      { x: 1710, y: 392, w: 210, h: 42, kind: 'platform' },
      { x: 2380, y: 356, w: 300, h: 42, kind: 'platform' },
      { x: 2930, y: 292, w: 300, h: 42, kind: 'platform' },
      { x: 3740, y: 410, w: 220, h: 42, kind: 'platform' },
      { x: 4300, y: 356, w: 390, h: 42, kind: 'platform' },
      { x: 5280, y: 292, w: 220, h: 42, kind: 'platform' },
      { x: 5920, y: 356, w: 310, h: 42, kind: 'platform' }
    ],
    blocks: [
      { x: 620, y: 290, type: 'crescent', content: 'coin' },
      { x: 690, y: 290, type: 'crescent', content: 'magicHat' },
      { x: 760, y: 290, type: 'brick' },
      { x: 830, y: 290, type: 'brick' },
      { x: 1460, y: 255, type: 'crescent', content: 'sparkWand' },
      { x: 1530, y: 255, type: 'brick' },
      { x: 1600, y: 255, type: 'brick' },
      { x: 2140, y: 320, type: 'crescent', content: 'coin' },
      { x: 2210, y: 320, type: 'crescent', content: 'starCharm' },
      { x: 3230, y: 255, type: 'brick' },
      { x: 3300, y: 255, type: 'crescent', content: 'potion1Up' },
      { x: 3370, y: 255, type: 'brick' },
      { x: 4580, y: 250, type: 'crescent', content: 'sparkWand' },
      { x: 4650, y: 250, type: 'brick' },
      { x: 4720, y: 250, type: 'brick' },
      { x: 5900, y: 260, type: 'crescent', content: 'coin' },
      { x: 5970, y: 260, type: 'crescent', content: 'magicHat' }
    ],
    coins: [
      [300, 410], [360, 410], [420, 410], [900, 305], [960, 305], [1020, 305],
      [1290, 240], [1350, 240], [1830, 345], [1890, 345], [2450, 305], [2510, 305], [2570, 305],
      [3000, 240], [3060, 240], [3120, 240], [3810, 360], [3870, 360], [4390, 305], [4450, 305], [4510, 305],
      [5350, 240], [5410, 240], [5990, 305], [6050, 305], [6110, 305], [6660, 410], [6720, 410], [6780, 410]
    ],
    props: [
      { type: 'sign', x: 260, y: 388 },
      { type: 'shrub', x: 1120, y: 408 },
      { type: 'rock', x: 2050, y: 400 },
      { type: 'well', x: 2500, y: 368 },
      { type: 'checkpoint', x: 3490, y: 320 },
      { type: 'wellFlowers', x: 5060, y: 368 },
      { type: 'owl', x: 5550, y: 310 },
      { type: 'rock', x: 6280, y: 400 }
    ],
    enemies: [
      { type: 'cursedBook', x: 1050, y: 410, dir: -1 },
      { type: 'armoredBeetle', x: 1780, y: 416, dir: -1 },
      { type: 'snappingVine', x: 2500, y: 368 },
      { type: 'cursedBook', x: 2840, y: 410, dir: 1 },
      { type: 'goblin', x: 4350, y: 285, dir: -1 },
      { type: 'armoredBeetle', x: 4820, y: 416, dir: 1 },
      { type: 'scrollLauncher', x: 5580, y: 420, dir: -1 },
      { type: 'cursedBook', x: 6200, y: 410, dir: -1 }
    ],
    goal: { x: 7050, y: 58 }
  }
};
