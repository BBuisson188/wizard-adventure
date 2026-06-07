const CACHE_VERSION = 'wizard-adventures-v1';
const APP_CACHE = `${CACHE_VERSION}-app`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles.css',
  './src/level1-data.js',
  './src/game.js',
  './assets/backgrounds/moonstone_meadow_far.png',
  './assets/backgrounds/moonstone_meadow_mid.png',
  './assets/characters/finn/baby_fall.png',
  './assets/characters/finn/baby_hurt.png',
  './assets/characters/finn/baby_idle_01.png',
  './assets/characters/finn/baby_idle_02.png',
  './assets/characters/finn/baby_jump.png',
  './assets/characters/finn/baby_run_01.png',
  './assets/characters/finn/baby_run_02.png',
  './assets/characters/finn/baby_run_03.png',
  './assets/characters/finn/baby_victory.png',
  './assets/characters/finn/old_fall.png',
  './assets/characters/finn/old_hurt.png',
  './assets/characters/finn/old_idle_01.png',
  './assets/characters/finn/old_idle_02.png',
  './assets/characters/finn/old_jump.png',
  './assets/characters/finn/old_run_01.png',
  './assets/characters/finn/old_run_02.png',
  './assets/characters/finn/old_run_03.png',
  './assets/characters/finn/old_victory.png',
  './assets/characters/finn/white_fall.png',
  './assets/characters/finn/white_hurt.png',
  './assets/characters/finn/white_idle_01.png',
  './assets/characters/finn/white_idle_02.png',
  './assets/characters/finn/white_jump.png',
  './assets/characters/finn/white_run_01.png',
  './assets/characters/finn/white_run_02.png',
  './assets/characters/finn/white_run_03.png',
  './assets/characters/finn/white_victory.png',
  './assets/characters/nora/baby_fall.png',
  './assets/characters/nora/baby_hurt.png',
  './assets/characters/nora/baby_idle_01.png',
  './assets/characters/nora/baby_idle_02.png',
  './assets/characters/nora/baby_jump.png',
  './assets/characters/nora/baby_run_01.png',
  './assets/characters/nora/baby_run_02.png',
  './assets/characters/nora/baby_run_03.png',
  './assets/characters/nora/baby_victory.png',
  './assets/characters/nora/old_fall.png',
  './assets/characters/nora/old_hurt.png',
  './assets/characters/nora/old_idle_01.png',
  './assets/characters/nora/old_idle_02.png',
  './assets/characters/nora/old_jump.png',
  './assets/characters/nora/old_run_01.png',
  './assets/characters/nora/old_run_02.png',
  './assets/characters/nora/old_run_03.png',
  './assets/characters/nora/old_victory.png',
  './assets/characters/nora/white_cast_fireball.png',
  './assets/characters/nora/white_fall.png',
  './assets/characters/nora/white_hurt.png',
  './assets/characters/nora/white_idle_01.png',
  './assets/characters/nora/white_idle_02.png',
  './assets/characters/nora/white_jump.png',
  './assets/characters/nora/white_run_01.png',
  './assets/characters/nora/white_run_02.png',
  './assets/characters/nora/white_run_03.png',
  './assets/characters/nora/white_victory.png',
  './assets/enemies/armored_beetle/flipped.png',
  './assets/enemies/armored_beetle/shell.png',
  './assets/enemies/armored_beetle/slide.png',
  './assets/enemies/armored_beetle/walk_01.png',
  './assets/enemies/armored_beetle/walk_02.png',
  './assets/enemies/cursed_book/angry_idle.png',
  './assets/enemies/cursed_book/fireball_hit.png',
  './assets/enemies/cursed_book/squashed.png',
  './assets/enemies/cursed_book/walk_01.png',
  './assets/enemies/cursed_book/walk_02.png',
  './assets/enemies/cursed_scroll_rocket/launcher.png',
  './assets/enemies/cursed_scroll_rocket/rocket_01.png',
  './assets/enemies/cursed_scroll_rocket/rocket_02.png',
  './assets/enemies/goblin_spell_thrower/hurt.png',
  './assets/enemies/goblin_spell_thrower/idle.png',
  './assets/enemies/goblin_spell_thrower/jump.png',
  './assets/enemies/goblin_spell_thrower/orb_01.png',
  './assets/enemies/goblin_spell_thrower/orb_02.png',
  './assets/enemies/goblin_spell_thrower/throw.png',
  './assets/enemies/grimoire_guardian/cast_moon.png',
  './assets/enemies/grimoire_guardian/crescent_projectile.png',
  './assets/enemies/grimoire_guardian/defeated.png',
  './assets/enemies/grimoire_guardian/hit.png',
  './assets/enemies/grimoire_guardian/idle_closed.png',
  './assets/enemies/grimoire_guardian/idle_open.png',
  './assets/enemies/grimoire_guardian/moon_projectile.png',
  './assets/enemies/grimoire_guardian/roar.png',
  './assets/enemies/grimoire_guardian/stunned.png',
  './assets/enemies/grimoire_guardian/summon_pages.png',
  './assets/enemies/owl_helper/flap_01.png',
  './assets/enemies/owl_helper/flap_02.png',
  './assets/enemies/owl_helper/hint_sign.png',
  './assets/enemies/owl_helper/perched.png',
  './assets/enemies/owl_helper/point.png',
  './assets/enemies/snapping_vine/attack.png',
  './assets/enemies/snapping_vine/retreat.png',
  './assets/enemies/snapping_vine/rise_01.png',
  './assets/enemies/snapping_vine/rise_02.png',
  './assets/enemies/snapping_vine/well_empty.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.ico',
  './assets/icons/favicon-32.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/items/coin_01.png',
  './assets/items/coin_02.png',
  './assets/items/coin_03.png',
  './assets/items/coin_04.png',
  './assets/items/fireball_01.png',
  './assets/items/fireball_02.png',
  './assets/items/fireball_03.png',
  './assets/items/hud_coin.png',
  './assets/items/hud_potion.png',
  './assets/items/hud_star.png',
  './assets/items/hud_wand.png',
  './assets/items/magic_hat.png',
  './assets/items/potion_1up.png',
  './assets/items/spark_wand.png',
  './assets/items/sparkle_hit_01.png',
  './assets/items/sparkle_hit_02.png',
  './assets/items/star_charm.png',
  './assets/items/stolen_spell_book.png',
  './assets/tiles/bell_ring_effect.png',
  './assets/tiles/bell_rope.png',
  './assets/tiles/broken_brick_fragments.png',
  './assets/tiles/checkpoint_banner.png',
  './assets/tiles/crescent_block_glowing.png',
  './assets/tiles/crescent_block_spent.png',
  './assets/tiles/floating_bell_tower.png',
  './assets/tiles/ground_floating_platform.png',
  './assets/tiles/ground_grass_span.png',
  './assets/tiles/ground_left_edge.png',
  './assets/tiles/ground_right_edge.png',
  './assets/tiles/ground_stone_span.png',
  './assets/tiles/mossy_rock.png',
  './assets/tiles/old_brick_block.png',
  './assets/tiles/shrub.png',
  './assets/tiles/signpost.png',
  './assets/tiles/stone_well_empty.png',
  './assets/tiles/stone_well_flowers.png',
  './assets/wiz-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => ![APP_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (requestUrl.hostname === 'www.gstatic.com') {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    throw error;
  }
}
