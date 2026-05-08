window.WIZARD_ADVENTURES_LEVEL_1 = {
  meta: {
    title: 'Wizard Adventures',
    levelName: 'Moonstone Meadow 1-1',
    version: 'level1-foundation-0.4-checkpoint-owl-polish'
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
      grimoireGuardian: {
        idleClosed: 'assets/enemies/grimoire_guardian/idle_closed.png',
        idleOpen: 'assets/enemies/grimoire_guardian/idle_open.png',
        roar: 'assets/enemies/grimoire_guardian/roar.png',
        castMoon: 'assets/enemies/grimoire_guardian/cast_moon.png',
        summonPages: 'assets/enemies/grimoire_guardian/summon_pages.png',
        stunned: 'assets/enemies/grimoire_guardian/stunned.png',
        hit: 'assets/enemies/grimoire_guardian/hit.png',
        defeated: 'assets/enemies/grimoire_guardian/defeated.png',
        moonProjectile: 'assets/enemies/grimoire_guardian/moon_projectile.png',
        crescentProjectile: 'assets/enemies/grimoire_guardian/crescent_projectile.png'
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
      { x: 683, y: 290, type: 'crescent', content: 'magicHat' },
      { x: 746, y: 290, type: 'brick' },
      { x: 809, y: 290, type: 'brick' },
      { x: 1460, y: 255, type: 'crescent', content: 'sparkWand' },
      { x: 1523, y: 255, type: 'brick' },
      { x: 1586, y: 255, type: 'brick' },
      { x: 2140, y: 320, type: 'crescent', content: 'coin' },
      { x: 2203, y: 320, type: 'crescent', content: 'starCharm' },
      { x: 3230, y: 255, type: 'brick' },
      { x: 3293, y: 255, type: 'crescent', content: 'potion1Up' },
      { x: 3356, y: 255, type: 'brick' },
      { x: 4580, y: 250, type: 'crescent', content: 'sparkWand' },
      { x: 4643, y: 250, type: 'brick' },
      { x: 4706, y: 250, type: 'brick' },
      { x: 5900, y: 260, type: 'crescent', content: 'coin' },
      { x: 5963, y: 260, type: 'crescent', content: 'magicHat' }
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
      { type: 'scrollLauncher', x: 6480, y: 420, dir: -1 },
      { type: 'cursedBook', x: 6200, y: 410, dir: -1 }
    ],
    goal: { x: 7050, y: 58 }
  }
};

(() => {
  const DATA = window.WIZARD_ADVENTURES_LEVEL_1;
  const ground = w => ({ x: 0, y: 476, w, h: 80, kind: 'ground' });
  const p = (x, y, w) => ({ x, y, w, h: 42, kind: 'platform' });
  const b = (x, y, type = 'crescent', content = 'coin') => ({ x, y, type, ...(content ? { content } : {}) });

  DATA.levels = [
    {
      ...DATA.level,
      id: '1-1',
      name: 'Moonstone Meadow',
      subtitle: 'First Bell',
      intro: 'Moonstone Meadow 1-1: Recover the stolen spell book!',
      worldWidth: 7600
    },
    {
      id: '1-2',
      name: 'Whispering Wells',
      subtitle: 'Vine Lessons',
      intro: 'Moonstone Meadow 1-2: Watch the wells and time your jumps.',
      worldWidth: 7600,
      spawn: { x: 120, y: 360 },
      solids: [
        ground(7600),
        p(720, 370, 280), p(1120, 312, 220), p(1510, 392, 260),
        p(2050, 332, 320), p(2580, 292, 220), p(3100, 382, 330),
        p(3810, 320, 260), p(4380, 365, 260), p(5000, 292, 310),
        p(5750, 350, 300), p(6360, 292, 240)
      ],
      blocks: [
        b(560, 286), b(623, 286, 'crescent', 'magicHat'), b(686, 286, 'brick', null),
        b(1300, 252, 'crescent', 'coin'), b(1363, 252, 'brick', null), b(1426, 252, 'brick', null),
        b(2260, 260, 'crescent', 'sparkWand'), b(2323, 260, 'brick', null),
        b(3340, 285), b(3403, 285, 'crescent', 'starCharm'), b(3466, 285, 'brick', null),
        b(4720, 245, 'crescent', 'coin'), b(4783, 245, 'brick', null), b(4846, 245, 'crescent', 'potion1Up'),
        b(6070, 270, 'crescent', 'sparkWand'), b(6133, 270, 'brick', null)
      ],
      coins: [
        [300, 410], [360, 410], [420, 410], [800, 320], [860, 320], [920, 320],
        [1190, 262], [1250, 262], [1620, 342], [1680, 342], [2150, 282], [2210, 282], [2270, 282],
        [2650, 242], [2710, 242], [3180, 332], [3240, 332], [3900, 270], [3960, 270],
        [4450, 315], [4510, 315], [5090, 242], [5150, 242], [5840, 302], [5900, 302],
        [6440, 242], [6500, 242], [6880, 410], [6940, 410]
      ],
      props: [
        { type: 'sign', x: 250, y: 388 }, { type: 'well', x: 1040, y: 368 },
        { type: 'wellFlowers', x: 1980, y: 368 }, { type: 'rock', x: 2860, y: 400 },
        { type: 'checkpoint', x: 3600, y: 320 }, { type: 'well', x: 4240, y: 368 },
        { type: 'owl', x: 5480, y: 310 }, { type: 'wellFlowers', x: 6240, y: 368 }
      ],
      enemies: [
        { type: 'cursedBook', x: 880, y: 410, dir: -1 },
        { type: 'snappingVine', x: 1040, y: 368 },
        { type: 'armoredBeetle', x: 1740, y: 416, dir: -1 },
        { type: 'snappingVine', x: 1980, y: 368 },
        { type: 'cursedBook', x: 2920, y: 410, dir: 1 },
        { type: 'snappingVine', x: 4240, y: 368 },
        { type: 'goblin', x: 5030, y: 222, dir: -1 },
        { type: 'armoredBeetle', x: 5850, y: 416, dir: 1 },
        { type: 'scrollLauncher', x: 6550, y: 420, dir: -1 }
      ],
      goal: { x: 7050, y: 58 }
    },
    {
      id: '1-3',
      name: 'Owlwood Rise',
      subtitle: 'High Paths',
      intro: 'Moonstone Meadow 1-3: Use the double jump and take the high road.',
      worldWidth: 7800,
      spawn: { x: 120, y: 360 },
      solids: [
        ground(7800),
        p(650, 384, 220), p(980, 326, 210), p(1310, 268, 230),
        p(1710, 350, 250), p(2150, 292, 210), p(2550, 234, 220),
        p(3030, 374, 260), p(3470, 318, 230), p(3890, 260, 230),
        p(4480, 390, 270), p(4960, 330, 260), p(5430, 270, 250),
        p(6010, 348, 260), p(6500, 288, 260)
      ],
      blocks: [
        b(700, 288, 'crescent', 'magicHat'), b(763, 288, 'brick', null),
        b(1370, 202), b(1433, 202, 'crescent', 'sparkWand'), b(1496, 202, 'brick', null),
        b(2210, 226, 'crescent', 'coin'), b(2273, 226, 'brick', null), b(2336, 226, 'crescent', 'starCharm'),
        b(3540, 252, 'crescent', 'potion1Up'), b(3603, 252, 'brick', null),
        b(5020, 264, 'crescent', 'sparkWand'), b(5083, 264, 'brick', null), b(5146, 264, 'brick', null),
        b(6280, 222), b(6343, 222, 'crescent', 'coin')
      ],
      coins: [
        [700, 336], [760, 336], [1030, 276], [1090, 276], [1370, 218], [1430, 218],
        [1780, 300], [1840, 300], [2210, 242], [2270, 242], [2620, 184], [2680, 184],
        [3100, 326], [3160, 326], [3540, 268], [3600, 268], [3960, 210], [4020, 210],
        [4550, 340], [4610, 340], [5030, 280], [5090, 280], [5500, 220], [5560, 220],
        [6080, 298], [6140, 298], [6570, 238], [6630, 238], [7080, 410]
      ],
      props: [
        { type: 'sign', x: 250, y: 388 }, { type: 'owl', x: 1180, y: 172 },
        { type: 'shrub', x: 1980, y: 408 }, { type: 'rock', x: 2840, y: 400 },
        { type: 'checkpoint', x: 3720, y: 320 }, { type: 'owl', x: 5350, y: 160 },
        { type: 'wellFlowers', x: 5840, y: 368 }, { type: 'rock', x: 6900, y: 400 }
      ],
      enemies: [
        { type: 'cursedBook', x: 820, y: 410, dir: -1 },
        { type: 'goblin', x: 1340, y: 198, dir: -1 },
        { type: 'armoredBeetle', x: 1860, y: 416, dir: 1 },
        { type: 'cursedBook', x: 3100, y: 410, dir: -1 },
        { type: 'goblin', x: 3900, y: 190, dir: -1 },
        { type: 'scrollLauncher', x: 4700, y: 420, dir: -1 },
        { type: 'snappingVine', x: 5840, y: 368 },
        { type: 'armoredBeetle', x: 6320, y: 416, dir: -1 }
      ],
      goal: { x: 7250, y: 58 }
    },
    {
      id: '1-4',
      name: 'Spellbook Scramble',
      subtitle: 'Enemy Mix',
      intro: 'Moonstone Meadow 1-4: Keep moving through the enemy scramble.',
      worldWidth: 8200,
      spawn: { x: 120, y: 360 },
      solids: [
        ground(8200),
        p(740, 360, 270), p(1240, 304, 240), p(1830, 372, 300),
        p(2440, 318, 300), p(3030, 270, 240), p(3580, 388, 280),
        p(4150, 330, 270), p(4720, 278, 260), p(5350, 368, 330),
        p(6020, 308, 280), p(6650, 260, 260)
      ],
      blocks: [
        b(620, 286, 'crescent', 'magicHat'), b(683, 286, 'brick', null), b(746, 286, 'brick', null),
        b(1500, 248, 'crescent', 'sparkWand'), b(1563, 248, 'brick', null), b(1626, 248, 'crescent', 'coin'),
        b(2680, 252, 'crescent', 'starCharm'), b(2743, 252, 'brick', null),
        b(3660, 306, 'crescent', 'coin'), b(3723, 306, 'brick', null), b(3786, 306, 'crescent', 'potion1Up'),
        b(4880, 218, 'crescent', 'sparkWand'), b(4943, 218, 'brick', null), b(5006, 218, 'brick', null),
        b(6230, 244, 'crescent', 'coin'), b(6293, 244, 'brick', null), b(6356, 244, 'crescent', 'sparkWand')
      ],
      coins: [
        [310, 410], [370, 410], [790, 310], [850, 310], [910, 310], [1300, 254], [1360, 254],
        [1910, 322], [1970, 322], [2520, 268], [2580, 268], [3100, 220], [3160, 220],
        [3650, 338], [3710, 338], [4230, 280], [4290, 280], [4800, 228], [4860, 228],
        [5440, 318], [5500, 318], [6100, 258], [6160, 258], [6720, 210], [6780, 210],
        [7280, 410], [7340, 410]
      ],
      props: [
        { type: 'sign', x: 250, y: 388 }, { type: 'well', x: 1160, y: 368 },
        { type: 'rock', x: 2200, y: 400 }, { type: 'checkpoint', x: 3920, y: 320 },
        { type: 'wellFlowers', x: 4460, y: 368 }, { type: 'owl', x: 5720, y: 262 },
        { type: 'well', x: 7040, y: 368 }
      ],
      enemies: [
        { type: 'armoredBeetle', x: 940, y: 416, dir: -1 },
        { type: 'snappingVine', x: 1160, y: 368 },
        { type: 'goblin', x: 1280, y: 234, dir: -1 },
        { type: 'cursedBook', x: 2050, y: 410, dir: 1 },
        { type: 'scrollLauncher', x: 2860, y: 420, dir: -1 },
        { type: 'armoredBeetle', x: 3700, y: 416, dir: 1 },
        { type: 'snappingVine', x: 4460, y: 368 },
        { type: 'goblin', x: 4750, y: 208, dir: -1 },
        { type: 'cursedBook', x: 5500, y: 410, dir: -1 },
        { type: 'scrollLauncher', x: 6350, y: 420, dir: -1 },
        { type: 'snappingVine', x: 7040, y: 368 }
      ],
      goal: { x: 7650, y: 58 }
    },
    {
      id: '1-5',
      name: 'Bellroot Gauntlet',
      subtitle: 'Final Meadow Trial',
      intro: 'Moonstone Meadow 1-5: The meadow pulls out every trick.',
      worldWidth: 8600,
      spawn: { x: 120, y: 360 },
      solids: [
        ground(8600),
        p(620, 384, 240), p(1020, 326, 220), p(1420, 268, 240), p(1870, 380, 280),
        p(2420, 322, 250), p(2930, 264, 230), p(3450, 390, 300), p(4050, 332, 260),
        p(4640, 276, 260), p(5240, 372, 330), p(5900, 314, 260), p(6520, 256, 280),
        p(7200, 348, 320)
      ],
      blocks: [
        b(520, 286, 'crescent', 'magicHat'), b(583, 286, 'brick', null), b(646, 286, 'brick', null),
        b(1480, 202, 'crescent', 'sparkWand'), b(1543, 202, 'brick', null), b(1606, 202, 'crescent', 'coin'),
        b(2490, 258, 'crescent', 'starCharm'), b(2553, 258, 'brick', null), b(2616, 258, 'brick', null),
        b(3510, 306, 'crescent', 'coin'), b(3573, 306, 'brick', null), b(3636, 306, 'crescent', 'potion1Up'),
        b(4700, 214, 'crescent', 'sparkWand'), b(4763, 214, 'brick', null), b(4826, 214, 'brick', null),
        b(5960, 248, 'crescent', 'coin'), b(6023, 248, 'brick', null), b(6086, 248, 'crescent', 'sparkWand'),
        b(7280, 282, 'crescent', 'starCharm'), b(7343, 282, 'brick', null)
      ],
      coins: [
        [300, 410], [360, 410], [680, 334], [740, 334], [1080, 276], [1140, 276], [1480, 218], [1540, 218],
        [1940, 330], [2000, 330], [2490, 272], [2550, 272], [2990, 214], [3050, 214], [3520, 340], [3580, 340],
        [4120, 282], [4180, 282], [4700, 226], [4760, 226], [5320, 322], [5380, 322], [5980, 264], [6040, 264],
        [6600, 206], [6660, 206], [7280, 298], [7340, 298], [7840, 410], [7900, 410]
      ],
      props: [
        { type: 'sign', x: 250, y: 388 }, { type: 'well', x: 900, y: 368 },
        { type: 'owl', x: 1330, y: 160 }, { type: 'wellFlowers', x: 2230, y: 368 },
        { type: 'checkpoint', x: 3850, y: 320 }, { type: 'rock', x: 4420, y: 400 },
        { type: 'well', x: 5120, y: 368 }, { type: 'owl', x: 6400, y: 150 },
        { type: 'wellFlowers', x: 7000, y: 368 }
      ],
      enemies: [
        { type: 'snappingVine', x: 900, y: 368 },
        { type: 'goblin', x: 1430, y: 198, dir: -1 },
        { type: 'armoredBeetle', x: 1940, y: 416, dir: 1 },
        { type: 'snappingVine', x: 2230, y: 368 },
        { type: 'scrollLauncher', x: 2750, y: 420, dir: -1 },
        { type: 'cursedBook', x: 3500, y: 410, dir: -1 },
        { type: 'goblin', x: 4070, y: 262, dir: -1 },
        { type: 'snappingVine', x: 5120, y: 368 },
        { type: 'armoredBeetle', x: 5400, y: 416, dir: -1 },
        { type: 'scrollLauncher', x: 6080, y: 420, dir: -1 },
        { type: 'goblin', x: 6540, y: 186, dir: -1 },
        { type: 'snappingVine', x: 7000, y: 368 },
        { type: 'cursedBook', x: 7350, y: 410, dir: 1 }
      ],
      goal: { x: 8050, y: 58 }
    },
    {
      id: '1-Boss',
      name: 'Grimoire Grove',
      subtitle: 'The Grimoire Guardian',
      intro: 'Boss: Defeat the Grimoire Guardian, then ring the bell!',
      worldWidth: 5200,
      goalLocked: true,
      spawn: { x: 120, y: 360 },
      solids: [
        ground(5200),
        p(860, 360, 260), p(1320, 304, 240), p(1860, 364, 300),
        p(2520, 316, 260), p(3160, 372, 310), p(3820, 300, 260)
      ],
      blocks: [
        b(560, 286, 'crescent', 'magicHat'), b(623, 286, 'crescent', 'sparkWand'), b(686, 286, 'brick', null),
        b(1480, 238, 'crescent', 'coin'), b(1543, 238, 'crescent', 'starCharm'),
        b(2680, 252, 'crescent', 'sparkWand'), b(2743, 252, 'brick', null), b(2806, 252, 'crescent', 'potion1Up')
      ],
      coins: [
        [340, 410], [400, 410], [920, 310], [980, 310], [1380, 254], [1440, 254],
        [1940, 314], [2000, 314], [2600, 266], [2660, 266], [3240, 322], [3300, 322],
        [3900, 250], [3960, 250]
      ],
      props: [
        { type: 'sign', x: 250, y: 388 }, { type: 'owl', x: 1160, y: 192 },
        { type: 'checkpoint', x: 2050, y: 320 }, { type: 'wellFlowers', x: 2920, y: 368 },
        { type: 'rock', x: 3420, y: 400 }
      ],
      enemies: [
        { type: 'goblin', x: 1320, y: 234, dir: -1 },
        { type: 'armoredBeetle', x: 1960, y: 416, dir: 1 },
        { type: 'grimoireBoss', x: 3550, y: 286, dir: -1 }
      ],
      goal: { x: 4650, y: 58 }
    }
  ];

  const BLOCK_W = 62;
  const BLOCK_H = 58;
  const MIN_BLOCK_CLEARANCE = 96;
  const MAX_BLOCK_CLEARANCE = 154;
  const TARGET_BLOCK_CLEARANCE = 122;
  const ABS_MIN_BLOCK_Y = 108;
  const ABS_MAX_BLOCK_Y = 330;

  function nearestSurfaceBelow(level, block) {
    const centerX = block.x + BLOCK_W / 2;
    const blockBottom = block.y + BLOCK_H;
    return level.solids
      .filter(solid => centerX >= solid.x && centerX <= solid.x + solid.w && solid.y > blockBottom)
      .sort((a, b) => a.y - b.y)[0] || null;
  }

  function normalizeBlockClearance(level) {
    for (const block of level.blocks) {
      const surface = nearestSurfaceBelow(level, block);
      if (!surface) continue;
      const clearance = surface.y - (block.y + BLOCK_H);
      if (clearance < MIN_BLOCK_CLEARANCE || clearance > MAX_BLOCK_CLEARANCE || block.y < ABS_MIN_BLOCK_Y || block.y > ABS_MAX_BLOCK_Y) {
        block.y = Math.round(clamp(surface.y - BLOCK_H - TARGET_BLOCK_CLEARANCE, ABS_MIN_BLOCK_Y, ABS_MAX_BLOCK_Y));
      }
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  DATA.levels.forEach(normalizeBlockClearance);

  DATA.level = DATA.levels[0];
  DATA.meta.levelName = `${DATA.level.id}: ${DATA.level.name}`;
  DATA.meta.version = 'moonstone-meadow-world-0.1';
})();
