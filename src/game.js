(() => {
  'use strict';

  const DATA = window.WIZARD_ADVENTURES_LEVEL_1;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const loadingEl = document.getElementById('loading');
  const pauseButton = document.getElementById('pauseButton');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const canvasWrap = document.querySelector('.canvas-wrap');
  const W = DATA.display.width;
  const H = DATA.display.height;
  const TILE = DATA.display.tile;
  let worldW = DATA.display.worldWidth;
  const FLOOR_Y = DATA.display.floorY;

  const keys = new Set();
  const pressed = new Set();
  const images = new Map();
  let audioCtx = null;
  const touchControls = document.getElementById('touchControls');
  const touchButtonB = document.querySelector('[data-touch=\"buttonB\"]');
  const virtualPointers = new Map();
  let starMusicStep = 0;
  const titleChoices = {
    finn: { x: 170, y: 232, w: 260, h: 238, label: 'Finn' },
    nora: { x: 530, y: 232, w: 260, h: 238, label: 'Nora' }
  };
  const testBossButton = { x: 758, y: 170, w: 152, h: 38, label: 'Test Boss' };
  const titleResumeButton = { x: 350, y: 474, w: 260, h: 42, label: 'Resume Saved Game' };
  const pauseMenuButtons = {
    resume: { x: 360, y: 228, w: 240, h: 48, label: 'Resume' },
    save: { x: 360, y: 292, w: 240, h: 48, label: 'Save Game' }
  };
  const levelCompleteButtons = {
    next: { x: 360, y: 292, w: 240, h: 48, label: 'Next Level' },
    replay: { x: 360, y: 356, w: 240, h: 42, label: 'Replay Level' }
  };
  const endGameButtons = {
    restart: { x: 360, y: 304, w: 240, h: 48, label: 'Restart' }
  };
  const hudPauseButton = { x: 765, y: 9, w: 82, h: 30, label: 'Pause' };
  const levels = DATA.levels || [DATA.level];
  const SAVE_KEY = 'wizardAdventuresSave';
  const HIGH_SCORE_KEY = 'wizardAdventuresHighScores';
  const PENDING_GLOBAL_SCORE_KEY = 'wizardAdventuresPendingGlobalScores';
  const LEADERBOARD_LIMIT = 10;
  const GAME_ID = 'wizard-adventure';
  const firebaseConfig = {
    apiKey: 'AIzaSyASExWcY08MBQApypJPwPLsmHQtlyAwb5Q',
    authDomain: 'beau-games.firebaseapp.com',
    projectId: 'beau-games',
    storageBucket: 'beau-games.firebasestorage.app',
    messagingSenderId: '683259848665',
    appId: '1:683259848665:web:33ab5572b30af9634d5bc8'
  };
  let leaderboardCollection = null;
  let firestoreApi = null;
  const globalLeaderboard = {
    scores: [],
    status: 'loading',
    message: 'Loading...'
  };

  const firebaseReadyPromise = initFirebaseLeaderboard();

  async function initFirebaseLeaderboard() {
    try {
      const [{ initializeApp }, firestore] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore')
      ]);
      const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } = firestore;
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      leaderboardCollection = collection(db, 'leaderboards', 'wizard-adventure', 'scores');
      firestoreApi = { addDoc, getDocs, query, orderBy, limit, serverTimestamp };
    } catch (error) {
      globalLeaderboard.status = 'unavailable';
      globalLeaderboard.message = 'Global scores unavailable';
      console.warn('Firebase initialization failed:', error);
    }
  }

  function currentLevel() {
    return levels[state.levelIndex] || levels[0];
  }

  const state = {
    mode: 'loading',
    selectedCharacter: 'finn',
    frame: 0,
    cameraX: 0,
    cameraTargetX: 0,
    score: 0,
    coins: 0,
    lives: 3,
    levelIndex: 0,
    levelComplete: false,
    bellScore: 0,
    runComplete: false,
    scoreSubmitted: false,
    message: '',
    messageTimer: 0,
    particles: [],
    checkpoint: { x: DATA.level.spawn.x, y: DATA.level.spawn.y, active: false },
    owlHint: { active: false, expanded: false, timer: 0, owl: null }
  };

  const player = {
    x: DATA.level.spawn.x,
    y: DATA.level.spawn.y,
    w: 42,
    h: 62,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    power: 'baby',
    invincible: 0,
    hurtTimer: 0,
    fireCooldown: 0,
    respawnTimer: 0,
    victoryTimer: 0,
    jumpsUsed: 0,
    maxJumps: 2,
    crouching: false,
    crouchLocked: false
  };

  const world = {
    solids: [],
    blocks: [],
    coins: [],
    items: [],
    enemies: [],
    projectiles: [],
    props: [],
    goal: null
  };

  function allAssetPaths(obj, out = new Set()) {
    if (!obj) return out;
    if (typeof obj === 'string') out.add(obj);
    else if (Array.isArray(obj)) obj.forEach(v => allAssetPaths(v, out));
    else if (typeof obj === 'object') Object.values(obj).forEach(v => allAssetPaths(v, out));
    return out;
  }

  function loadImages() {
    const paths = Array.from(allAssetPaths(DATA.assets));
    let loaded = 0;
    return Promise.all(paths.map(path => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { images.set(path, img); loaded++; loadingEl.textContent = `Loading assets ${loaded}/${paths.length}...`; resolve(); };
      img.onerror = () => { console.warn('Missing asset:', path); resolve(); };
      img.src = path;
    })));
  }

  function img(path) { return images.get(path); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function titleChoiceAt(x, y) {
    for (const [key, box] of Object.entries(titleChoices)) {
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) return key;
    }
    return null;
  }

  function pointInBox(x, y, box) {
    return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
  }

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function savedGame() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function hasSavedGame() {
    const save = savedGame();
    return !!save && Array.isArray(save.levels) && save.levels.length === levels.length && save.state && save.player && save.world;
  }

  function highScores() {
    try {
      const scores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) || '[]');
      return Array.isArray(scores) ? sortScores(scores).slice(0, LEADERBOARD_LIMIT) : [];
    } catch (_) {
      return [];
    }
  }

  function sortScores(scores) {
    return scores
      .filter(entry => entry && Number.isFinite(Number(entry.score)))
      .sort((a, b) => {
        const scoreDiff = Number(b.score) - Number(a.score);
        if (scoreDiff) return scoreDiff;
        return String(a.createdAt || a.date || '').localeCompare(String(b.createdAt || b.date || ''));
      });
  }

  function cleanPlayerName(name) {
    return (name || 'Wizard').trim().slice(0, 12) || 'Wizard';
  }

  function qualifiesForScoreList(score, scores) {
    const cleanScores = sortScores(scores);
    if (score <= 0) return false;
    if (cleanScores.length < LEADERBOARD_LIMIT) return true;
    return score > Number(cleanScores[LEADERBOARD_LIMIT - 1].score || 0);
  }

  function scoreIsEligible(score) {
    if (qualifiesForScoreList(score, highScores())) return true;
    if (globalLeaderboard.status !== 'ready') return true;
    return qualifiesForScoreList(score, globalLeaderboard.scores);
  }

  function saveHighScore(name, score) {
    const scores = highScores();
    scores.push({ name: cleanPlayerName(name), score: Math.floor(score), date: new Date().toISOString() });
    try {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(sortScores(scores).slice(0, LEADERBOARD_LIMIT)));
    } catch (error) {
      console.warn('Local high score save failed:', error);
    }
  }

  function pendingGlobalScores() {
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_GLOBAL_SCORE_KEY) || '[]');
      return Array.isArray(pending) ? pending : [];
    } catch (_) {
      return [];
    }
  }

  function savePendingGlobalScores(pending) {
    try {
      localStorage.setItem(PENDING_GLOBAL_SCORE_KEY, JSON.stringify(pending));
    } catch (error) {
      console.warn('Pending global score queue save failed:', error);
    }
  }

  function queueGlobalScore(name, score) {
    const pending = pendingGlobalScores();
    pending.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      playerName: cleanPlayerName(name),
      score: Math.floor(score),
      gameId: GAME_ID,
      queuedAt: new Date().toISOString()
    });
    savePendingGlobalScores(pending);
  }

  function timestampMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function firestoreScoreFromDoc(doc) {
    const data = doc.data();
    return {
      playerName: typeof data.playerName === 'string' ? data.playerName.slice(0, 12) : 'Wizard',
      name: typeof data.playerName === 'string' ? data.playerName.slice(0, 12) : 'Wizard',
      score: Number.isFinite(Number(data.score)) ? Math.floor(Number(data.score)) : 0,
      gameId: data.gameId,
      createdAt: timestampMillis(data.createdAt)
    };
  }

  async function fetchGlobalScores() {
    await firebaseReadyPromise;
    if (!leaderboardCollection || !firestoreApi) return [];
    const { getDocs, query, orderBy, limit } = firestoreApi;
    try {
      const rankedQuery = query(
        leaderboardCollection,
        orderBy('score', 'desc'),
        orderBy('createdAt', 'asc'),
        limit(LEADERBOARD_LIMIT)
      );
      const snapshot = await getDocs(rankedQuery);
      return sortScores(snapshot.docs.map(firestoreScoreFromDoc)).slice(0, LEADERBOARD_LIMIT);
    } catch (error) {
      console.warn('Global score query with createdAt tie-breaker failed:', error);
      const fallbackQuery = query(leaderboardCollection, orderBy('score', 'desc'), limit(LEADERBOARD_LIMIT));
      const snapshot = await getDocs(fallbackQuery);
      return sortScores(snapshot.docs.map(firestoreScoreFromDoc)).slice(0, LEADERBOARD_LIMIT);
    }
  }

  async function refreshGlobalScores() {
    await firebaseReadyPromise;
    if (!leaderboardCollection) return;
    globalLeaderboard.status = 'loading';
    globalLeaderboard.message = 'Loading...';
    try {
      globalLeaderboard.scores = await fetchGlobalScores();
      globalLeaderboard.status = 'ready';
      globalLeaderboard.message = '';
    } catch (error) {
      globalLeaderboard.status = 'unavailable';
      globalLeaderboard.message = 'Global scores unavailable';
      console.warn('Global score refresh failed:', error);
    }
  }

  async function syncPendingGlobalScores() {
    await firebaseReadyPromise;
    if (!leaderboardCollection || !firestoreApi) return;
    const { addDoc, serverTimestamp } = firestoreApi;
    let pending = pendingGlobalScores();
    if (!pending.length) return;
    try {
      const currentGlobalScores = await fetchGlobalScores();
      const remaining = [];
      for (const entry of pending) {
        const score = Math.floor(Number(entry.score));
        const playerName = cleanPlayerName(entry.playerName || entry.name);
        if (!qualifiesForScoreList(score, currentGlobalScores)) continue;
        try {
          await addDoc(leaderboardCollection, {
            playerName,
            score,
            gameId: GAME_ID,
            createdAt: serverTimestamp()
          });
          currentGlobalScores.push({ playerName, name: playerName, score, gameId: GAME_ID, createdAt: Date.now() });
          sortScores(currentGlobalScores);
        } catch (error) {
          console.warn('Global score upload failed:', error);
          remaining.push(entry);
        }
      }
      savePendingGlobalScores(remaining);
      await refreshGlobalScores();
    } catch (error) {
      console.warn('Pending global score sync failed:', error);
    }
  }

  function bossLevelIndex() {
    const index = levels.findIndex(level => level.id === '1-Boss');
    return index >= 0 ? index : levels.length - 1;
  }

  function startBossTest(character = state.selectedCharacter || 'finn') {
    resetLevel(character, bossLevelIndex(), false);
  }

  function returnToTitle() {
    state.mode = 'title';
    state.cameraX = 0;
    state.cameraTargetX = 0;
    state.message = '';
    state.messageTimer = 0;
    state.owlHint = { active: false, expanded: false, timer: 0, owl: null };
  }

  function pauseGame() {
    if (state.mode !== 'playing') return;
    state.mode = 'paused';
  }

  function resumeGame() {
    if (state.mode !== 'paused') return;
    state.mode = 'playing';
  }

  function saveGame() {
    const saveState = clonePlain(state);
    saveState.mode = 'playing';
    saveState.owlHint = { active: false, expanded: false, timer: 0, owl: null };
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      levels: levels.map(level => level.id),
      state: saveState,
      player: clonePlain(player),
      world: clonePlain(world)
    }));
    showMessage('Game saved on this browser.', 150);
  }

  function loadSavedGame() {
    const save = savedGame();
    if (!save || !save.state || !save.player || !save.world) return false;
    Object.assign(state, save.state);
    state.mode = 'playing';
    state.owlHint = { active: false, expanded: false, timer: 0, owl: null };
    state.message = 'Saved game loaded.';
    state.messageTimer = 150;
    Object.assign(player, save.player);
    Object.assign(world, save.world);
    DATA.level = currentLevel();
    worldW = currentLevel().worldWidth || DATA.display.worldWidth;
    return true;
  }

  function submitHighScoreIfNeeded() {
    if (state.scoreSubmitted || !scoreIsEligible(state.score)) return;
    state.scoreSubmitted = true;
    const name = window.prompt('New high score! Enter your name:', state.selectedCharacter === 'nora' ? 'Nora' : 'Finn');
    saveHighScore(name, state.score);
    queueGlobalScore(name, state.score);
    syncPendingGlobalScores();
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function fullscreenSupported() {
    return !!(canvasWrap && (canvasWrap.requestFullscreen || canvasWrap.webkitRequestFullscreen));
  }

  function updateFullscreenButton() {
    if (!fullscreenButton) return;
    if (!fullscreenSupported()) {
      fullscreenButton.classList.add('hidden');
      return;
    }
    const active = fullscreenElement() === canvasWrap;
    fullscreenButton.classList.remove('hidden');
    fullscreenButton.classList.toggle('exit-mode', active);
    fullscreenButton.textContent = active ? 'X' : 'Full Screen';
    fullscreenButton.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
  }

  function toggleFullscreen() {
    if (!fullscreenSupported()) return;
    if (fullscreenElement()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else if (canvasWrap.requestFullscreen) {
      canvasWrap.requestFullscreen().catch(() => {});
    } else if (canvasWrap.webkitRequestFullscreen) {
      canvasWrap.webkitRequestFullscreen();
    }
  }

  function normalPlayerSize(power = player.power) {
    if (power === 'baby') return { w: 42, h: 62 };
    if (power === 'old') return { w: 48, h: 80 };
    return { w: 50, h: 82 };
  }

  function crouchPlayerSize(power = player.power) {
    const size = normalPlayerSize(power);
    return { w: size.w, h: power === 'baby' ? 52 : 62 };
  }

  function applyPlayerSize(size) {
    const bottom = player.y + player.h;
    player.w = size.w;
    player.h = size.h;
    player.y = bottom - player.h;
  }

  function canPlayerOccupy(x, y, w, h) {
    const test = { x, y, w, h };
    return !solidRects().some(s => rectsOverlap(test, s));
  }

  function setCrouch(wantsCrouch) {
    const shouldCrouch = wantsCrouch && player.onGround && player.victoryTimer <= 0 && player.respawnTimer <= 0;
    if (shouldCrouch && !player.crouching) {
      player.crouching = true;
      applyPlayerSize(crouchPlayerSize());
      return;
    }
    if (!shouldCrouch && player.crouching) {
      const normal = normalPlayerSize();
      const bottom = player.y + player.h;
      const newY = bottom - normal.h;
      if (canPlayerOccupy(player.x, newY, normal.w, normal.h)) {
        player.crouching = false;
        player.crouchLocked = false;
        applyPlayerSize(normal);
      } else {
        player.crouchLocked = true;
      }
    }
  }

  function resetLevel(character = state.selectedCharacter, levelIndex = state.levelIndex || 0, keepRunStats = false) {
    state.levelIndex = clamp(levelIndex, 0, levels.length - 1);
    const level = currentLevel();
    DATA.level = level;
    worldW = level.worldWidth || DATA.display.worldWidth;
    state.selectedCharacter = character;
    state.mode = 'playing';
    state.frame = 0;
    state.cameraX = 0;
    state.cameraTargetX = 0;
    if (!keepRunStats) {
      state.score = 0;
      state.coins = 0;
      state.lives = 3;
    }
    state.levelComplete = false;
    state.bellScore = 0;
    state.runComplete = false;
    state.scoreSubmitted = false;
    state.message = level.intro || `${level.id}: ${level.name}`;
    state.messageTimer = 180;
    state.particles = [];
    state.checkpoint = { x: level.spawn.x, y: level.spawn.y, active: false };
    state.owlHint = { active: false, expanded: false, timer: 0, owl: null };

    Object.assign(player, {
      x: level.spawn.x,
      y: level.spawn.y,
      w: 42,
      h: 62,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      power: 'baby',
      invincible: 0,
      hurtTimer: 0,
      fireCooldown: 0,
      respawnTimer: 0,
      victoryTimer: 0,
      jumpsUsed: 0,
      maxJumps: 2,
      crouching: false,
      crouchLocked: false
    });

    world.solids = level.solids.map(s => ({ ...s }));
    world.blocks = level.blocks.map(b => ({ ...b, w: 62, h: 58, spent: false, broken: false, bump: 0 }));
    world.coins = level.coins.map(([x, y], i) => ({ id: i, x, y, w: 30, h: 30, collected: false, bob: Math.random() * 100 }));
    world.items = [];
    world.projectiles = [];
    world.props = level.props.map(p => ({ ...p, activated: false }));
    world.goal = { ...level.goal, w: 130, h: 250, ringing: 0, locked: !!level.goalLocked };
    world.enemies = level.enemies.map((e, i) => makeEnemy(e, i));
  }

  function advanceLevel() {
    if (state.levelIndex >= levels.length - 1) {
      state.runComplete = true;
      state.mode = 'complete';
      return;
    }
    resetLevel(state.selectedCharacter, state.levelIndex + 1, true);
  }

  function makeEnemy(e, i) {
    const base = { id: i, type: e.type, x: e.x, y: e.y, dir: e.dir || -1, vx: 0, vy: 0, alive: true, stomped: false, timer: 0, state: 'walk', cooldown: rand(60, 160) };
    if (e.type === 'cursedBook') return { ...base, w: 48, h: 48, vx: (e.dir || -1) * 1.05 };
    if (e.type === 'armoredBeetle') return { ...base, w: 60, h: 36, vx: (e.dir || -1) * .85 };
    if (e.type === 'snappingVine') return { ...base, w: 70, h: 130, vx: 0, cycle: rand(0, 180) };
    if (e.type === 'goblin') return { ...base, w: 62, h: 74, vx: 0, throwTimer: 90 };
    if (e.type === 'scrollLauncher') return { ...base, w: 64, h: 45, vx: 0, shootTimer: 120 };
    if (e.type === 'grimoireBoss') return { ...base, w: 154, h: 126, vx: 0, hp: 6, maxHp: 6, baseX: e.x, baseY: e.y, throwTimer: 140, phaseTimer: 0, hurtFlash: 0 };
    return base;
  }

  function solidRects() {
    const blockRects = world.blocks
      .filter(b => !b.broken)
      .map(b => ({ ...b, kind: 'block' }));
    return world.solids.concat(blockRects);
  }

  function setPlayerPower(power) {
    player.power = power;
    applyPlayerSize(player.crouching ? crouchPlayerSize(power) : normalPlayerSize(power));
    showMessage(power === 'white' ? 'White Wizard! Press X or B to cast fireballs.' : power === 'old' ? 'Old Wizard! You can break old bricks and crouch through low spaces.' : 'Baby Wizard');
  }

  function showMessage(text, frames = 180) {
    state.message = text;
    state.messageTimer = frames;
  }

  function addScore(n, x, y) {
    state.score += n;
    state.particles.push({ type: 'text', text: `+${n}`, x, y, vx: 0, vy: -0.7, life: 60 });
  }

  function playTone(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      gain.connect(audioCtx.destination);
      const osc = audioCtx.createOscillator();
      osc.type = type === 'hurt' ? 'sawtooth' : 'triangle';
      const map = {
        jump: [260, 420], coin: [720, 980], stomp: [180, 90], power: [440, 880], cast: [540, 220], hurt: [220, 120], bell: [520, 1040]
      };
      const [a, b] = map[type] || [400, 500];
      osc.frequency.setValueAtTime(a, now);
      osc.frequency.exponentialRampToValueAtTime(b, now + 0.16);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }


  function playStarBlip() {
    try {
      if (!audioCtx) return;
      const notes = [659, 784, 988, 1175, 988, 784, 659, 523];
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      gain.connect(audioCtx.destination);
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(notes[starMusicStep % notes.length], now);
      starMusicStep++;
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.085);
    } catch (_) {}
  }

  function consumePressed(code) {
    if (pressed.has(code)) { pressed.delete(code); return true; }
    return false;
  }

  function handleInput() {
    if (state.mode === 'title') {
      if (consumePressed('KeyF') || consumePressed('Space') || consumePressed('Enter')) resetLevel('finn');
      if (consumePressed('KeyN') || consumePressed('KeyX')) resetLevel('nora');
      if (consumePressed('KeyB')) startBossTest();
      if (consumePressed('KeyC')) loadSavedGame();
      return;
    }
    if (state.mode === 'complete') {
      if (!state.runComplete && (consumePressed('Space') || consumePressed('Enter'))) advanceLevel();
      if (consumePressed('KeyR')) {
        if (state.runComplete) returnToTitle();
        else resetLevel(state.selectedCharacter, state.levelIndex, true);
      }
      return;
    }
    if (state.mode === 'gameover') {
      if (consumePressed('KeyR') || consumePressed('Enter') || consumePressed('Space')) returnToTitle();
      return;
    }
    if (state.mode === 'paused') {
      if (consumePressed('Escape') || consumePressed('KeyP') || consumePressed('Enter')) resumeGame();
      if (consumePressed('KeyS')) saveGame();
      return;
    }
    if (consumePressed('Escape') || consumePressed('KeyP')) {
      pauseGame();
      return;
    }
    if (consumePressed('KeyR')) resetLevel(state.selectedCharacter, state.levelIndex, false);
    if (state.mode !== 'playing') return;

    const left = keys.has('ArrowLeft') || keys.has('KeyA');
    const right = keys.has('ArrowRight') || keys.has('KeyD');
    const down = keys.has('ArrowDown') || keys.has('KeyS');
    const upPressed = consumePressed('ArrowUp') || consumePressed('KeyW');
    const jumpPressed = consumePressed('Space') || upPressed;
    const castPressed = consumePressed('KeyX');

    if (upPressed && state.owlHint.active) expandOwlHint();

    if (player.victoryTimer > 0 || player.respawnTimer > 0) return;

    setCrouch(down);

    const running = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const accel = running ? 0.72 : 0.55;
    let maxSpeed = running ? 5.2 : 4.0;
    if (player.crouching) maxSpeed *= 0.42;
    if (left) { player.vx -= accel; player.facing = -1; }
    if (right) { player.vx += accel; player.facing = 1; }
    if (!left && !right && player.onGround) player.vx *= 0.78;
    player.vx = clamp(player.vx, -maxSpeed, maxSpeed);

    if (jumpPressed) {
      if (player.onGround) {
        player.vy = player.power === 'baby' ? -14.2 : -13.7;
        player.onGround = false;
        player.jumpsUsed = 1;
        playTone('jump');
      } else if (player.jumpsUsed < player.maxJumps) {
        if (player.jumpsUsed === 0) player.jumpsUsed = 1;
        player.vy = player.power === 'baby' ? -13.2 : -12.8;
        player.onGround = false;
        player.jumpsUsed = 2;
        for (let i = 0; i < 8; i++) state.particles.push({ type: 'spark', x: player.x + player.w / 2, y: player.y + player.h, vx: rand(-2.4, 2.4), vy: rand(-2.8, .4), life: 26 });
        playTone('jump');
      }
    }
    if (!(keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')) && player.vy < -5.6) {
      player.vy *= .82;
    }
    if (castPressed && player.power === 'white' && player.fireCooldown <= 0) {
      spawnFireball();
      player.fireCooldown = 22;
      playTone('cast');
    }
  }

  function spawnFireball() {
    world.projectiles.push({
      type: 'playerFireball',
      x: player.x + (player.facing > 0 ? player.w - 4 : -18),
      y: player.y + player.h * .45,
      w: 26,
      h: 22,
      vx: player.facing * 7.2,
      vy: -2.5,
      life: 160,
      bounce: 0
    });
  }


  function nearestOwlProp() {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    let best = null;
    let bestDist = Infinity;
    for (const p of world.props) {
      if (p.type !== 'owl') continue;
      const ox = p.x + 45;
      const oy = p.y + 52;
      const dx = Math.abs(px - ox);
      const dy = Math.abs(py - oy);
      const dist = dx + dy * 1.2;
      if (dx < 170 && dy < 135 && dist < bestDist) {
        best = p;
        bestDist = dist;
      }
    }
    return best;
  }

  function updateOwlHelper() {
    if (state.mode !== 'playing') {
      state.owlHint.active = false;
      return;
    }
    const owl = nearestOwlProp();
    if (!owl) {
      state.owlHint.active = false;
      state.owlHint.expanded = false;
      state.owlHint.owl = null;
      return;
    }
    state.owlHint.active = true;
    state.owlHint.owl = owl;
    if (!state.owlHint.expanded) state.owlHint.timer++;
  }

  function expandOwlHint() {
    if (!state.owlHint.active) return;
    state.owlHint.expanded = true;
    state.owlHint.timer = 0;
    const hint = player.power === 'white'
      ? 'Owl helper: White Wizards can cast bouncing fireballs with X or B.'
      : player.power === 'old'
        ? 'Owl helper: Crouch as an Old Wizard to fit through low spaces.'
        : 'Owl helper: Double jump to reach high ledges.';
    showMessage(hint, 180);
    playTone('coin');
  }

  function owlPropAtWorldPoint(x, y) {
    for (const p of world.props) {
      if (p.type !== 'owl') continue;
      if (x >= p.x - 10 && x <= p.x + 105 && y >= p.y - 10 && y <= p.y + 120) return p;
    }
    return null;
  }

  function updatePlayer() {
    if (player.invincible > 0) {
      player.invincible--;
      if (state.frame % 7 === 0) playStarBlip();
    }
    if (player.hurtTimer > 0) player.hurtTimer--;
    if (player.fireCooldown > 0) player.fireCooldown--;
    if (player.respawnTimer > 0) {
      player.respawnTimer--;
      if (player.respawnTimer === 0) respawnPlayer();
      return;
    }
    if (player.victoryTimer > 0) {
      player.victoryTimer--;
      player.vx *= 0.92;
      if (player.victoryTimer === 0) {
        state.mode = 'complete';
        if (state.runComplete) submitHighScoreIfNeeded();
      }
    }

    player.vy += 0.78;
    player.vy = Math.min(player.vy, 16);
    moveAndCollide(player, true);
    if (player.onGround) player.jumpsUsed = 0;
    setCrouch(keys.has('ArrowDown') || keys.has('KeyS'));

    if (player.y > H + 220) hurtPlayer(true);
    player.x = clamp(player.x, 0, worldW - player.w);
    state.cameraTargetX = clamp(player.x + player.w / 2 - W * .42, 0, Math.max(0, worldW - W));
    state.cameraX += (state.cameraTargetX - state.cameraX) * 0.12;
  }

  function moveAndCollide(obj, isPlayer = false) {
    obj.x += obj.vx;
    for (const s of solidRects()) {
      if (!rectsOverlap(obj, s)) continue;
      if (obj.vx > 0) obj.x = s.x - obj.w;
      else if (obj.vx < 0) obj.x = s.x + s.w;
      if (!isPlayer && obj.type !== 'playerFireball') obj.vx *= -1;
    }

    obj.y += obj.vy;
    obj.onGround = false;
    for (const s of solidRects()) {
      if (!rectsOverlap(obj, s)) continue;
      if (obj.vy > 0) {
        obj.y = s.y - obj.h;
        obj.vy = 0;
        obj.onGround = true;
        if (isPlayer) obj.jumpsUsed = 0;
      } else if (obj.vy < 0) {
        obj.y = s.y + s.h;
        obj.vy = 0;
        if (isPlayer && s.kind === 'block') hitBlock(s);
      }
    }
  }

  function hitBlock(block) {
    const original = world.blocks.find(b => b.x === block.x && b.y === block.y && !b.broken);
    if (!original) return;
    original.bump = 12;
    if (original.type === 'crescent' && !original.spent) {
      original.spent = true;
      if (original.content === 'coin') {
        collectCoin({ x: original.x + 14, y: original.y - 8, w: 30, h: 30 });
      } else {
        spawnItem(original.content, original.x + 8, original.y - 42);
      }
      playTone('coin');
    }
    if (original.type === 'brick' && player.power !== 'baby') {
      original.broken = true;
      playTone('stomp');
      addScore(50, original.x, original.y);
      for (let i = 0; i < 8; i++) {
        state.particles.push({ type: 'debris', x: original.x + 28, y: original.y + 20, vx: rand(-3, 3), vy: rand(-7, -2), life: 42 });
      }
    }
  }

  function spawnItem(type, x, y) {
    world.items.push({
      type,
      x,
      y,
      w: 40,
      h: 40,
      vx: type === 'potion1Up' ? 1.1 : .8,
      vy: -1.2,
      rise: 28,
      life: 720,
      collected: false
    });
  }

  function updateItems() {
    for (const item of world.items) {
      if (item.collected) continue;
      if (item.rise <= 0) {
        item.life--;
        if (item.life <= 0) {
          item.collected = true;
          continue;
        }
      }
      if (item.rise > 0) { item.y -= 1.2; item.rise--; }
      else {
        item.vy += .45;
        item.vy = Math.min(item.vy, 9);
        moveAndCollide(item, false);
      }
      if (rectsOverlap(player, item)) collectItem(item);
    }
    world.items = world.items.filter(i => !i.collected);
  }

  function collectItem(item) {
    item.collected = true;
    if (item.type === 'magicHat') {
      if (player.power === 'baby') setPlayerPower('old');
      addScore(1000, item.x, item.y);
      playTone('power');
    }
    if (item.type === 'sparkWand') {
      if (player.power === 'baby') setPlayerPower('old');
      else setPlayerPower('white');
      addScore(1000, item.x, item.y);
      playTone('power');
    }
    if (item.type === 'starCharm') {
      player.invincible = 620;
      starMusicStep = 0;
      showMessage('Star Charm! Fiery invincibility!');
      addScore(1000, item.x, item.y);
      playTone('power');
    }
    if (item.type === 'potion1Up') {
      state.lives++;
      addScore(1000, item.x, item.y);
      showMessage('Extra life!');
      playTone('power');
    }
  }

  function collectCoin(coin) {
    state.coins++;
    state.score += 100;
    if (state.coins >= 100) {
      state.coins -= 100;
      state.lives++;
      showMessage('100 coins! Extra life!');
    }
    state.particles.push({ type: 'coinText', text: '+100', x: coin.x, y: coin.y, vx: 0, vy: -1, life: 45 });
  }

  function updateCoins() {
    for (const coin of world.coins) {
      if (coin.collected) continue;
      coin.bob += .08;
      if (rectsOverlap(player, coin)) {
        coin.collected = true;
        collectCoin(coin);
        playTone('coin');
      }
    }
  }

  function updateEnemies() {
    for (const e of world.enemies) {
      e.timer++;
      if (!e.alive) continue;
      if (e.type === 'snappingVine') {
        e.cycle = (e.cycle + 1) % 240;
        const phase = e.cycle;
        let visible = 0;
        if (phase < 60) visible = 0;
        else if (phase < 110) visible = (phase - 60) / 50;
        else if (phase < 165) visible = 1;
        else if (phase < 220) visible = 1 - (phase - 165) / 55;
        e.visible = visible;
        e.h = 38 + 105 * visible;
        e.y = 476 - e.h;
      } else if (e.type === 'goblin') {
        e.throwTimer--;
        if (e.throwTimer <= 0) {
          world.projectiles.push({ type: 'enemyOrb', x: e.x + (e.dir > 0 ? e.w : -20), y: e.y + 24, w: 24, h: 24, vx: e.dir * 3.2, vy: -5.8, life: 190 });
          e.throwTimer = 150;
        }
      } else if (e.type === 'scrollLauncher') {
        e.shootTimer--;
        if (e.shootTimer <= 0) {
          world.projectiles.push({ type: 'scrollRocket', x: e.x - 10, y: e.y - 25, w: 60, h: 34, vx: e.dir * 5.2, vy: 0, life: 260 });
          e.shootTimer = 180;
        }
      } else if (e.type === 'grimoireBoss') {
        e.phaseTimer++;
        if (e.hurtFlash > 0) e.hurtFlash--;
        e.x = e.baseX + Math.sin(e.phaseTimer * 0.018) * 150;
        e.y = e.baseY - 32 + Math.sin(e.phaseTimer * 0.035) * 58;
        e.dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
        e.throwTimer--;
        if (e.throwTimer <= 0) {
          const burst = e.hp <= 3 ? 3 : 2;
          for (let i = 0; i < burst; i++) {
            const targetX = player.x + player.w / 2;
            const dx = targetX - (e.x + e.w / 2);
            const speed = clamp(dx / 90, -4.4, 4.4);
            world.projectiles.push({
              type: 'bossMoon',
              x: e.x + e.w / 2 - 15,
              y: e.y + 46 + i * 18,
              w: 40,
              h: 36,
              vx: speed,
              vy: -5.2 + i * 1.9,
              life: 315,
              bounce: 0
            });
          }
          e.throwTimer = e.hp <= 3 ? 190 : 250;
        }
      } else {
        if (e.type === 'armoredBeetle' && e.state === 'shell') e.vx = 0;
        if (e.type === 'armoredBeetle' && e.state === 'slide') e.vx = e.dir * 6.2;
        e.vy += .6;
        e.vy = Math.min(e.vy, 12);
        moveAndCollide(e, false);
      }

      if (rectsOverlap(player, enemyHitbox(e))) handlePlayerEnemyCollision(e);
    }

    // Sliding beetles can defeat other enemies.
    for (const slider of world.enemies.filter(e => e.alive && e.type === 'armoredBeetle' && e.state === 'slide')) {
      for (const e of world.enemies) {
        if (e === slider || !e.alive || e.type === 'scrollLauncher') continue;
        if (rectsOverlap(slider, enemyHitbox(e))) defeatEnemy(e, 'shell');
      }
    }
  }

  function enemyHitbox(e) {
    if (e.type === 'snappingVine') return { x: e.x + 12, y: e.y + 6, w: 46, h: e.h - 12 };
    if (e.type === 'armoredBeetle') return { x: e.x, y: e.y - 12, w: e.w, h: e.h + 12 };
    if (e.type === 'grimoireBoss') return { x: e.x - 2, y: e.y - 28, w: e.w + 4, h: e.h + 38 };
    return e;
  }

  function bossStompZone(e) {
    const hitbox = enemyHitbox(e);
    return { x: hitbox.x + 8, y: hitbox.y, w: hitbox.w - 16, h: 74 };
  }

  function handlePlayerEnemyCollision(e) {
    if (player.hurtTimer > 0 || player.respawnTimer > 0 || player.victoryTimer > 0) return;
    if (player.invincible > 0 && e.type !== 'scrollLauncher') {
      defeatEnemy(e, 'star');
      return;
    }
    if (e.type === 'armoredBeetle' && e.state === 'shell') {
      const hitbox = enemyHitbox(e);
      const pBottom = player.y + player.h;
      if (player.vy > 1 && pBottom - hitbox.y < 34) {
        stompEnemy(e);
        player.vy = -9.6;
        player.onGround = false;
      } else {
        e.state = 'slide';
        e.dir = player.x + player.w / 2 < e.x + e.w / 2 ? 1 : -1;
        e.vx = e.dir * 6.2;
        player.vx = -e.dir * 3.4;
      }
      playTone('stomp');
      return;
    }

    if (e.type === 'grimoireBoss') {
      const zone = bossStompZone(e);
      const pBottom = player.y + player.h;
      const playerCenter = player.x + player.w / 2;
      if (player.vy >= 0 && playerCenter >= zone.x && playerCenter <= zone.x + zone.w && pBottom >= zone.y && pBottom <= zone.y + zone.h) {
        damageBoss(e, 'stomp');
        player.vy = -12.5;
        player.onGround = false;
        playTone('stomp');
      } else {
        hurtPlayer(false);
      }
      return;
    }

    const stompable = e.type === 'cursedBook' || e.type === 'armoredBeetle' || e.type === 'goblin';
    const pBottom = player.y + player.h;
    const eTop = enemyHitbox(e).y;
    const stompWindow = e.type === 'armoredBeetle' ? 36 : 28;
    if (stompable && player.vy > 1 && pBottom - eTop < stompWindow) {
      stompEnemy(e);
      player.vy = -9.6;
      player.onGround = false;
      playTone('stomp');
    } else if (e.type !== 'scrollLauncher') {
      hurtPlayer(false);
    }
  }

  function stompEnemy(e) {
    if (e.type === 'armoredBeetle') {
      if (e.state === 'walk') {
        e.state = 'shell';
        e.vx = 0;
        e.h = 30;
        e.y += 6;
        addScore(200, e.x, e.y);
      } else if (e.state === 'shell') {
        e.state = 'slide';
        e.dir = player.x < e.x ? 1 : -1;
        e.vx = e.dir * 6.2;
        addScore(400, e.x, e.y);
      } else if (e.state === 'slide') {
        e.state = 'shell';
        e.vx = 0;
      }
      return;
    }
    defeatEnemy(e, 'stomp');
  }

  function defeatEnemy(e, reason) {
    if (e.type === 'grimoireBoss') {
      damageBoss(e, reason);
      return;
    }
    e.alive = false;
    e.stomped = true;
    e.vx = 0;
    e.vy = 0;
    addScore(reason === 'star' ? 400 : 200, e.x, e.y);
    for (let i = 0; i < 6; i++) state.particles.push({ type: 'spark', x: e.x + e.w/2, y: e.y + e.h/2, vx: rand(-3, 3), vy: rand(-4, 1), life: 35 });
  }

  function damageBoss(e, reason) {
    if (!e.alive || e.hurtFlash > 0) return;
    e.hp--;
    e.hurtFlash = 28;
    e.throwTimer = Math.min(e.throwTimer, 55);
    addScore(reason === 'fireball' ? 300 : 500, e.x + e.w / 2, e.y + 20);
    for (let i = 0; i < 12; i++) {
      state.particles.push({ type: 'spark', x: e.x + e.w / 2, y: e.y + e.h / 2, vx: rand(-4, 4), vy: rand(-5, 2), life: 42 });
    }
    playTone('hurt');
    if (e.hp <= 0) {
      e.alive = false;
      e.stomped = true;
      e.vx = 0;
      e.vy = 0;
      if (world.goal) world.goal.locked = false;
      addScore(5000, e.x + e.w / 2, e.y);
      showMessage('Grimoire Guardian defeated! Ring the bell!', 260);
      playTone('bell');
    }
  }

  function updateProjectiles() {
    for (const p of world.projectiles) {
      p.life--;
      if (p.type === 'enemyOrb') p.vy += .18;
      if (p.type === 'bossMoon') p.vy += .22;
      if (p.type === 'playerFireball') p.vy += .45;
      p.x += p.vx;
      p.y += p.vy;

      for (const s of solidRects()) {
        if (!rectsOverlap(p, s)) continue;
        if (p.type === 'playerFireball') {
          if (p.vy > 0 && p.y + p.h - s.y < 22) {
            p.y = s.y - p.h;
            p.vy = -7.5;
            p.bounce++;
          } else {
            p.life = 0;
          }
        } else if (p.type === 'bossMoon') {
          if (p.vy > 0 && p.y + p.h - s.y < 28) {
            p.y = s.y - p.h;
            p.vy = -7.2;
            p.vx *= 0.84;
            p.bounce++;
          } else {
            p.vx *= -0.76;
            p.x += p.vx;
          }
        } else {
          p.life = 0;
        }
      }

      if (p.type === 'playerFireball') {
        for (const e of world.enemies) {
          if (!e.alive || e.type === 'scrollLauncher') continue;
          if (rectsOverlap(p, enemyHitbox(e))) {
            defeatEnemy(e, 'fireball');
            p.life = 0;
            playTone('stomp');
          }
        }
      } else if (rectsOverlap(player, p) && player.hurtTimer <= 0 && player.invincible <= 0) {
        hurtPlayer(false);
        p.life = 0;
      }
    }
    world.projectiles = world.projectiles.filter(p => {
      const margin = p.type === 'bossMoon' ? 800 : 400;
      return p.life > 0 && p.x > state.cameraX - margin && p.x < state.cameraX + W + margin && p.y < H + 260;
    });
  }

  function updateCheckpoints() {
    for (const p of world.props) {
      if (p.type !== 'checkpoint' || p.activated) continue;
      const playerCenter = player.x + player.w / 2;
      if (playerCenter >= p.x + 24) {
        p.activated = true;
        state.checkpoint = { x: p.x + 56, y: currentLevel().spawn.y, active: true };
        showMessage('Checkpoint reached!', 160);
        addScore(500, p.x + 30, p.y);
        playTone('power');
      }
    }
  }

  function hurtPlayer(fell) {
    if (player.invincible > 0 && !fell) return;
    playTone('hurt');
    if (player.power !== 'baby' && !fell) {
      setPlayerPower('baby');
      player.hurtTimer = 100;
      player.vx = -player.facing * 3.2;
      player.vy = -5.5;
      return;
    }
    state.lives--;
    player.respawnTimer = 70;
    player.hurtTimer = 70;
    showMessage(state.lives > 0 ? 'Careful! Try again.' : 'Game over.', 200);
    if (state.lives <= 0) {
      state.mode = 'gameover';
      submitHighScoreIfNeeded();
    }
  }

  function respawnPlayer() {
    player.x = state.checkpoint.active ? state.checkpoint.x : Math.max(80, state.cameraX + 120);
    player.y = state.checkpoint.active ? state.checkpoint.y : 260;
    player.vx = 0;
    player.vy = 0;
    player.power = 'baby';
    player.crouching = false;
    player.crouchLocked = false;
    applyPlayerSize(normalPlayerSize('baby'));
    player.jumpsUsed = 0;
    player.hurtTimer = 120;
  }

  function goalLayout() {
    const g = world.goal;
    const towerW = 188;
    const towerH = 270;
    const towerX = g.x - 72;
    const towerY = g.y - 46;
    const ropeX = g.x + 18;
    const ropeTop = towerY + 184;
    const ropeBottom = FLOOR_Y + 28;
    return { towerX, towerY, towerW, towerH, ropeX, ropeTop, ropeBottom, ropeW: 22 };
  }

  function updateGoal() {
    if (!world.goal || state.levelComplete) return;
    if (world.goal.locked && world.enemies.some(e => e.type === 'grimoireBoss' && e.alive)) {
      const nearGoal = Math.abs((player.x + player.w / 2) - world.goal.x) < 320;
      if (nearGoal && state.messageTimer <= 0) showMessage('The bell is sealed until the Grimoire Guardian falls.', 120);
      return;
    }
    const layout = goalLayout();
    const rope = {
      x: layout.ropeX - layout.ropeW / 2,
      y: layout.ropeTop,
      w: layout.ropeW,
      h: layout.ropeBottom - layout.ropeTop
    };
    if (rectsOverlap(player, rope)) {
      const grabY = player.y + player.h * .35;
      const t = clamp(1 - (grabY - rope.y) / rope.h, 0, 1);
      const points = t > .78 ? 5000 : t > .55 ? 2000 : t > .32 ? 800 : 200;
      state.bellScore = points;
      state.score += points;
      state.levelComplete = true;
      world.goal.ringing = 120;
      player.victoryTimer = 150;
      player.vx = 0;
      player.vy = 0;
      const lastLevel = state.levelIndex >= levels.length - 1;
      if (lastLevel) state.runComplete = true;
      showMessage(lastLevel ? `Moonstone Meadow complete! Height bonus: ${points}` : `Bell rung! Height bonus: ${points}`, 260);
      playTone('bell');
    }
  }

  function updateParticles() {
    for (const p of state.particles) {
      p.life--;
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.type === 'debris') p.vy += .45;
    }
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function update() {
    state.frame++;
    handleInput();
    if (state.mode === 'playing') {
      updatePlayer();
      updateCoins();
      updateItems();
      updateEnemies();
      updateProjectiles();
      updateOwlHelper();
      updateCheckpoints();
      updateGoal();
      updateParticles();
      for (const b of world.blocks) if (b.bump > 0) b.bump--;
      if (state.messageTimer > 0) state.messageTimer--;
    } else {
      updateParticles();
    }
  }

  function drawRepeated(path, speed, y = 0, height = H, alpha = 1) {
    const image = img(path);
    if (!image) return;
    const scaledW = Math.ceil(image.width * (height / image.height));
    const offset = -((state.cameraX * speed) % scaledW);
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let x = offset - scaledW; x < W + scaledW; x += scaledW) {
      ctx.drawImage(image, x, y, scaledW, height);
    }
    ctx.restore();
  }

  function drawImageWorld(path, x, y, w, h, flip = false, alpha = 1) {
    const image = img(path);
    if (!image) return;
    const sx = Math.round(x - state.cameraX);
    if (sx + w < -160 || sx > W + 160) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (flip) {
      ctx.translate(sx + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, w, h);
    } else ctx.drawImage(image, sx, y, w, h);
    ctx.restore();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#56b9ff');
    sky.addColorStop(.58, '#9fe4ff');
    sky.addColorStop(1, '#e6fbff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    drawRepeated(DATA.assets.backgrounds.far, 0.12, 0, H, .92);
    drawRepeated(DATA.assets.backgrounds.mid, 0.32, 48, H - 48, .72);
  }


  function drawStarFlashOverlay() {
    if (player.invincible <= 0 || state.mode === 'title') return;
    const colors = ['#fff06a', '#ff7a3d', '#74f7ff', '#ffffff', '#ffcf40', '#ff5e9d'];
    const phase = Math.floor(state.frame / 5) % colors.length;
    const alpha = player.power === 'white' ? 0.24 : 0.18;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = colors[phase];
    ctx.fillRect(0, 0, W, H);
    const sx = player.x - state.cameraX + player.w / 2;
    const sy = player.y + player.h / 2;
    const glow = ctx.createRadialGradient(sx, sy, 20, sx, sy, 180);
    glow.addColorStop(0, 'rgba(255,255,180,.55)');
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.globalAlpha = player.power === 'white' ? 0.65 : 0.45;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawWorld() {
    // Decorative props behind gameplay tiles.
    for (const p of world.props) {
      if (p.type === 'well' || p.type === 'wellFlowers') continue;
      if (p.type === 'sign') drawImageWorld(DATA.assets.tiles.signpost, p.x, p.y, 90, 110);
      if (p.type === 'shrub') drawImageWorld(DATA.assets.tiles.shrub, p.x, p.y, 76, 66);
      if (p.type === 'rock') drawImageWorld(DATA.assets.tiles.mossyRock, p.x, p.y, 78, 72);
      if (p.type === 'checkpoint') {
        if (p.activated) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.28 + Math.sin(state.frame * 0.12) * 0.08;
          ctx.fillStyle = '#fff36d';
          ctx.beginPath();
          ctx.ellipse(p.x - state.cameraX + 48, p.y + 60, 46, 86, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        drawImageWorld(DATA.assets.tiles.checkpoint, p.x, p.y, 95, 165);
      }
      if (p.type === 'owl') {
        let owlPath = DATA.assets.enemies.owl.perched;
        if (state.owlHint.owl === p && state.owlHint.expanded) owlPath = DATA.assets.enemies.owl.point || owlPath;
        else if (state.owlHint.owl === p && DATA.assets.enemies.owl.flap) owlPath = DATA.assets.enemies.owl.flap[Math.floor(state.frame / 18) % DATA.assets.enemies.owl.flap.length];
        drawImageWorld(owlPath, p.x, p.y, 90, 105);
      }
    }

    for (const s of world.solids) drawSolid(s);
    for (const b of world.blocks) drawBlock(b);
    for (const p of world.props) {
      if (p.type === 'well') drawImageWorld(DATA.assets.tiles.well, p.x, p.y, 115, 108);
      if (p.type === 'wellFlowers') drawImageWorld(DATA.assets.tiles.wellFlowers, p.x, p.y, 115, 108);
    }
    drawGoal();
  }

  function drawSolid(s) {
    if (s.kind === 'ground') {
      // Draw top grass as repeated spans, then stone below.
      for (let x = s.x; x < s.x + s.w; x += 600) {
        drawImageWorld(DATA.assets.tiles.groundGrass, x, s.y - 36, 620, 88);
        drawImageWorld(DATA.assets.tiles.groundStone, x, s.y + 12, 620, 84);
      }
    } else {
      for (let x = s.x; x < s.x + s.w; x += 180) {
        const w = Math.min(210, s.x + s.w - x + 30);
        drawImageWorld(DATA.assets.tiles.floatingPlatform, x, s.y - 34, w, 100);
      }
    }
  }

  function drawBlock(b) {
    if (b.broken) return;
    const y = b.y - Math.sin((12 - b.bump) / 12 * Math.PI) * (b.bump > 0 ? 9 : 0);
    const drawPad = 0;
    const drawH = 58;
    const drawW = 62;
    if (b.type === 'crescent') drawImageWorld(b.spent ? DATA.assets.tiles.crescentSpent : DATA.assets.tiles.crescentGlowing, b.x - drawPad, y - drawPad, drawW + drawPad * 2, drawH + drawPad * 2);
    else drawImageWorld(DATA.assets.tiles.oldBrick, b.x - drawPad, y - drawPad, drawW + drawPad * 2, drawH + drawPad * 2);
  }

  function drawGoal() {
    const g = world.goal;
    if (!g) return;
    const layout = goalLayout();
    const sx = Math.round(layout.towerX - state.cameraX);
    if (sx + layout.towerW < -220 || sx > W + 220) return;

    drawImageWorld(DATA.assets.tiles.bellTower, layout.towerX, layout.towerY, layout.towerW, layout.towerH);

    const ropeImage = img(DATA.assets.tiles.bellRope);
    const rx = Math.round(layout.ropeX - state.cameraX);
    if (ropeImage) {
      ctx.save();
      const ropeW = layout.ropeW;
      const segmentH = 170;
      for (let y = layout.ropeTop; y < layout.ropeBottom; y += segmentH - 18) {
        const h = Math.min(segmentH, layout.ropeBottom - y + 14);
        ctx.drawImage(ropeImage, rx - ropeW / 2, y, ropeW, h);
      }
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = '#6b431f';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rx, layout.ropeTop);
      ctx.lineTo(rx, layout.ropeBottom);
      ctx.stroke();
      ctx.restore();
    }

    if (g.ringing > 0) {
      g.ringing--;
      const alpha = Math.min(1, g.ringing / 45);
      drawImageWorld(DATA.assets.tiles.bellRing, layout.towerX + 34, layout.towerY + 96, 124, 118, false, alpha);
    }
  }

  function drawCoinsItems() {
    const coinFrames = DATA.assets.items.coin;
    for (const coin of world.coins) {
      if (coin.collected) continue;
      const frame = Math.floor((state.frame + coin.id * 7) / 8) % coinFrames.length;
      drawImageWorld(coinFrames[frame], coin.x, coin.y + Math.sin(coin.bob) * 4, 32, 32);
    }
    for (const item of world.items) {
      let path = DATA.assets.items.magicHat;
      if (item.type === 'sparkWand') path = DATA.assets.items.sparkWand;
      if (item.type === 'starCharm') path = DATA.assets.items.starCharm;
      if (item.type === 'potion1Up') path = DATA.assets.items.potion1Up;
      if (item.life < 180) {
        const interval = item.life < 60 ? 4 : item.life < 120 ? 8 : 14;
        if (Math.floor(item.life / interval) % 2 === 0) continue;
      }
      drawImageWorld(path, item.x, item.y, 46, 46);
    }
  }

  function drawEnemies() {
    for (const e of world.enemies) {
      if (!e.alive) {
        if (e.type === 'cursedBook') drawImageWorld(DATA.assets.enemies.cursedBook.squashed, e.x, e.y + 18, 52, 25);
        if (e.type === 'armoredBeetle') drawImageWorld(DATA.assets.enemies.armoredBeetle.flipped, e.x, e.y, 62, 44);
        if (e.type === 'grimoireBoss') {
          const bossArt = DATA.assets.enemies.grimoireGuardian;
          const path = bossArt ? bossArt.defeated : DATA.assets.enemies.cursedBook.squashed;
          drawImageWorld(path, e.x - 38, e.y - 12, 235, 150, e.dir > 0, .85);
        }
        continue;
      }
      if (e.type === 'cursedBook') {
        const frames = DATA.assets.enemies.cursedBook.walk;
        drawImageWorld(frames[Math.floor(e.timer / 16) % frames.length], e.x, e.y - 12, 58, 58, e.dir > 0);
      }
      if (e.type === 'armoredBeetle') {
        let path = DATA.assets.enemies.armoredBeetle.walk[Math.floor(e.timer / 16) % 2];
        if (e.state === 'shell') path = DATA.assets.enemies.armoredBeetle.shell;
        if (e.state === 'slide') path = DATA.assets.enemies.armoredBeetle.slide;
        drawImageWorld(path, e.x, e.y - 12, 70, 50, e.dir > 0);
      }
      if (e.type === 'snappingVine') {
        const visible = e.visible || 0;
        let path = DATA.assets.enemies.snappingVine.hidden;
        if (visible > .75) path = DATA.assets.enemies.snappingVine.attack;
        else if (visible > .35) path = DATA.assets.enemies.snappingVine.rise[1];
        else if (visible > .05) path = DATA.assets.enemies.snappingVine.rise[0];
        drawImageWorld(path, e.x - 12, e.y - 3, 105, Math.max(90, e.h + 40));
      }
      if (e.type === 'goblin') {
        const throwing = e.throwTimer < 30;
        drawImageWorld(throwing ? DATA.assets.enemies.goblin.throw : DATA.assets.enemies.goblin.idle, e.x, e.y - 26, 96, 100, e.dir > 0);
      }
      if (e.type === 'scrollLauncher') {
        drawImageWorld(DATA.assets.enemies.scrollRocket.launcher, e.x, e.y, 70, 42);
      }
      if (e.type === 'grimoireBoss') {
        const bossArt = DATA.assets.enemies.grimoireGuardian;
        let path = bossArt ? bossArt.idleOpen : DATA.assets.enemies.cursedBook.walk[Math.floor(e.timer / 12) % DATA.assets.enemies.cursedBook.walk.length];
        if (bossArt) {
          if (e.hurtFlash > 0) path = bossArt.hit;
          else if (e.throwTimer < 32) path = e.hp <= 3 ? bossArt.summonPages : bossArt.castMoon;
          else if (e.hp <= 2 && Math.floor(e.timer / 24) % 2 === 0) path = bossArt.roar;
          else if (Math.floor(e.timer / 36) % 2 === 0) path = bossArt.idleClosed;
        }
        const alpha = e.hurtFlash > 0 && Math.floor(e.hurtFlash / 4) % 2 === 0 ? .55 : 1;
        ctx.save();
        const sx = e.x - state.cameraX + e.w / 2;
        const sy = e.y + e.h / 2;
        const glow = ctx.createRadialGradient(sx, sy, 20, sx, sy, 140);
        glow.addColorStop(0, 'rgba(157, 113, 255, .35)');
        glow.addColorStop(1, 'rgba(45, 18, 105, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(sx - 150, sy - 150, 300, 300);
        ctx.restore();
        drawImageWorld(path, e.x - 38, e.y - 48, 235, 215, e.dir > 0, alpha);
        drawBossHealth(e);
      }
    }
  }

  function drawBossHealth(e) {
    const barW = 280;
    const barH = 14;
    const x = W / 2 - barW / 2;
    const y = 60;
    const fill = clamp(e.hp / e.maxHp, 0, 1);
    ctx.save();
    ctx.fillStyle = 'rgba(17, 15, 42, .78)';
    ctx.fillRect(x - 10, y - 26, barW + 20, 48);
    ctx.strokeStyle = '#f4d86a';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 10, y - 26, barW + 20, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GRIMOIRE GUARDIAN', W / 2, y - 7);
    ctx.fillStyle = '#28184f';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = fill > .34 ? '#9e7cff' : '#ff706d';
    ctx.fillRect(x, y, barW * fill, barH);
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of world.projectiles) {
      if (p.type === 'playerFireball') {
        const frames = DATA.assets.items.fireball;
        drawImageWorld(frames[Math.floor(state.frame / 5) % frames.length], p.x, p.y, 36, 30, p.vx < 0);
      }
      if (p.type === 'enemyOrb') {
        const frames = DATA.assets.enemies.goblin.orb;
        drawImageWorld(frames[Math.floor(state.frame / 8) % frames.length], p.x, p.y, 34, 30, p.vx < 0);
      }
      if (p.type === 'bossMoon') {
        const bossArt = DATA.assets.enemies.grimoireGuardian;
        const path = bossArt ? (p.bounce % 2 === 0 ? bossArt.moonProjectile : bossArt.crescentProjectile) : DATA.assets.enemies.goblin.orb[Math.floor(state.frame / 6) % DATA.assets.enemies.goblin.orb.length];
        drawImageWorld(path, p.x - 10, p.y - 10, 58, 54, p.vx < 0);
      }
      if (p.type === 'scrollRocket') {
        const frames = DATA.assets.enemies.scrollRocket.frames;
        drawImageWorld(frames[Math.floor(state.frame / 8) % frames.length], p.x, p.y, 70, 40, p.vx < 0);
      }
    }
  }

  function currentPlayerFrame() {
    const charData = DATA.assets.characters[state.selectedCharacter][player.power];
    if (player.hurtTimer > 0 && Math.floor(player.hurtTimer / 7) % 2 === 0) return charData.hurt[0];
    if (player.victoryTimer > 0) return charData.victory[0];
    if (player.crouching && player.onGround) return charData.idle[0];
    if (!player.onGround) return player.vy < 0 ? charData.jump[0] : charData.fall[0];
    if (Math.abs(player.vx) > .35) {
      const frames = charData.run;
      return frames[Math.floor(state.frame / 6) % frames.length];
    }
    return charData.idle[Math.floor(state.frame / 30) % charData.idle.length];
  }

  function drawPlayer() {
    if (player.respawnTimer > 0 && Math.floor(state.frame / 6) % 2 === 0) return;
    if (player.invincible > 0) {
      ctx.save();
      const sx = player.x - state.cameraX + player.w / 2;
      const sy = player.y + player.h / 2;
      const pulse = Math.sin(state.frame * .45) * .5 + .5;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .55 + pulse * .25;
      ctx.strokeStyle = player.invincible % 12 < 6 ? '#fff36d' : '#ff7b39';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(player.w, player.h) * (.65 + pulse * .12), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = .32;
      ctx.fillStyle = player.invincible % 10 < 5 ? '#fff36d' : '#ff6b30';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(player.w, player.h) * (.7 + pulse * .18), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const path = currentPlayerFrame();
    const drawW = player.power === 'baby' ? 78 : 100;
    const drawH = player.crouching ? (player.power === 'baby' ? 74 : 88) : (player.power === 'baby' ? 95 : 122);
    const drawX = player.x + player.w / 2 - drawW / 2;
    const drawY = player.y + player.h - drawH + 8;
    drawImageWorld(path, drawX, drawY, drawW, drawH, player.facing < 0);
  }

  function drawParticles() {
    for (const p of state.particles) {
      const x = p.x - state.cameraX;
      const y = p.y;
      ctx.save();
      ctx.globalAlpha = clamp(p.life / 40, 0, 1);
      if (p.type === 'text' || p.type === 'coinText') {
        ctx.fillStyle = '#fff3a8';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = '#342400';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, x, y);
        ctx.fillText(p.text, x, y);
      } else if (p.type === 'debris') {
        ctx.fillStyle = '#8b6a47';
        ctx.fillRect(x, y, 8, 8);
      } else {
        ctx.fillStyle = '#fff1a8';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }


  function wrapTextToLines(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (test.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawOwlHint() {
    if (!state.owlHint.active || !state.owlHint.owl) return;
    const p = state.owlHint.owl;
    const sx = p.x - state.cameraX + 45;
    const sy = p.y - 20;
    const text = state.owlHint.expanded
      ? 'Double jump to reach high ledges. Old Wizards can crouch through low spaces. White Wizards cast fireballs with X or B.'
      : 'Hoot! Tap me or press Up for a hint.';
    const lines = wrapTextToLines(text, state.owlHint.expanded ? 34 : 28);
    const bw = state.owlHint.expanded ? 360 : 250;
    const bh = 38 + lines.length * 20;
    const bx = clamp(sx - bw / 2, 18, W - bw - 18);
    const by = clamp(sy - bh, 72, H - bh - 20);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, .93)';
    ctx.strokeStyle = '#2b3b74';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.fill();
    ctx.stroke();

    // Speech-bubble tail.
    ctx.beginPath();
    ctx.moveTo(clamp(sx - 12, bx + 18, bx + bw - 18), by + bh - 2);
    ctx.lineTo(clamp(sx + 4, bx + 18, bx + bw - 18), by + bh + 18);
    ctx.lineTo(clamp(sx + 22, bx + 18, bx + bw - 18), by + bh - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#18224b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    lines.forEach((line, i) => ctx.fillText(line, bx + 18, by + 28 + i * 20));
    ctx.restore();
  }

  function drawHud() {
    ctx.save();
    ctx.fillStyle = 'rgba(12,18,45,.72)';
    ctx.fillRect(0, 0, W, 48);
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(W, 48);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`SCORE ${String(state.score).padStart(6, '0')}`, 24, 30);
    ctx.fillText(`COINS ${String(state.coins).padStart(2, '0')}`, 220, 30);
    ctx.fillText(`LIVES ${state.lives}`, 350, 30);
    ctx.fillText(`${state.selectedCharacter.toUpperCase()} - ${player.power.toUpperCase()} WIZARD`, 460, 30);
    ctx.fillStyle = state.mode === 'paused' ? 'rgba(126,200,255,.32)' : 'rgba(255,214,110,.18)';
    ctx.strokeStyle = state.mode === 'paused' ? '#7ec8ff' : '#ffd66e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(hudPauseButton.x, hudPauseButton.y, hudPauseButton.w, hudPauseButton.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff6c9';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state.mode === 'paused' ? 'Resume' : 'Pause', hudPauseButton.x + hudPauseButton.w / 2, 29);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(currentLevel().id, W - 24, 30);
    if (state.messageTimer > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#fff1a8';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#1d2756';
      ctx.lineWidth = 4;
      ctx.strokeText(state.message, W / 2, 78);
      ctx.fillText(state.message, W / 2, 78);
    }
    ctx.restore();
  }

  function drawTitleChoice(character, box) {
    const isFinn = character === 'finn';
    const idlePath = DATA.assets.characters[character].old.idle[0] || DATA.assets.characters[character].baby.idle[0];
    const image = img(idlePath);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.strokeStyle = isFinn ? '#7ec8ff' : '#ff9ad9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(10,18,46,.5)';
    ctx.beginPath();
    ctx.roundRect(box.x + 12, box.y + 12, box.w - 24, box.h - 70, 18);
    ctx.fill();
    if (image) {
      const drawW = 125;
      const drawH = 160;
      ctx.drawImage(image, box.x + box.w / 2 - drawW / 2, box.y + 22, drawW, drawH);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(box.label, box.x + box.w / 2, box.y + box.h - 34);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#dce6ff';
    ctx.fillText(isFinn ? 'Boy Wizard' : 'Girl Wizard', box.x + box.w / 2, box.y + box.h - 12);
    ctx.restore();
  }

  function drawMenuButton(box, fill = 'rgba(255, 211, 106, .18)', stroke = '#ffd66e') {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff6c9';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(box.label, box.x + box.w / 2, box.y + 29);
    ctx.restore();
  }

  function drawTitle() {
    drawBackground();
    ctx.save();
    ctx.fillStyle = 'rgba(11, 16, 38, .54)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd66e';
    ctx.font = 'bold 56px Arial';
    ctx.strokeStyle = '#17224d';
    ctx.lineWidth = 6;
    ctx.strokeText('Wizard Adventures', W / 2, 122);
    ctx.fillText('Wizard Adventures', W / 2, 122);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Choose Your Wizard', W / 2, 174);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#dce6ff';
    ctx.fillText('Click or tap a character to begin Moonstone Meadow', W / 2, 205);
    ctx.restore();

    drawTitleChoice('finn', titleChoices.finn);
    drawTitleChoice('nora', titleChoices.nora);
    if (hasSavedGame()) drawMenuButton(titleResumeButton, 'rgba(126, 200, 255, .20)', '#7ec8ff');
    drawMenuButton(testBossButton);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff1a8';
    ctx.fillText(hasSavedGame() ? 'F = Finn, N = Nora, C = Continue, B = Test Boss' : 'F = Finn, N = Nora, B = Test Boss', W / 2, 532);
    ctx.restore();
  }

  function drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 24, .62)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(18, 25, 58, .94)';
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(310, 160, 340, 225, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd66e';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', W / 2, 205);
    drawMenuButton(pauseMenuButtons.resume, 'rgba(126, 200, 255, .20)', '#7ec8ff');
    drawMenuButton(pauseMenuButtons.save);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Saved games stay on this browser.', W / 2, 366);
    ctx.restore();
  }

  function drawHighScores() {
    const localScores = highScores();
    const globalScores = globalLeaderboard.scores;
    if (!localScores.length && !globalScores.length && globalLeaderboard.status !== 'loading') return;

    function drawScoreColumn(title, scores, x, statusMessage = '') {
      ctx.fillStyle = '#ffd66e';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(title, x, 356);
      ctx.font = '15px Arial';
      ctx.fillStyle = '#ffffff';
      if (scores.length) {
        scores.slice(0, LEADERBOARD_LIMIT).forEach((entry, i) => {
          const name = entry.playerName || entry.name || 'Wizard';
          ctx.fillText(`${i + 1}. ${name}  ${entry.score}`, x, 382 + i * 15);
        });
      } else {
        ctx.fillStyle = '#dce6ff';
        ctx.fillText(statusMessage || 'No scores yet', x, 382);
      }
    }

    ctx.save();
    ctx.textAlign = 'center';
    drawScoreColumn('Local Top 10', localScores, 285);
    drawScoreColumn('Global Top 10', globalScores, 675, globalLeaderboard.message);
    ctx.restore();
  }

  function drawLevelCompletePrompt() {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 25, 58, .94)';
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(320, 232, 320, 190, 18);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd66e';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${currentLevel().id} Complete!`, W / 2, 274);
    drawMenuButton(levelCompleteButtons.next, 'rgba(126, 200, 255, .20)', '#7ec8ff');
    drawMenuButton(levelCompleteButtons.replay, 'rgba(255, 211, 106, .14)', '#ffd66e');
    ctx.restore();
  }

  function drawEndOverlay(title, subtitle) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 25, .65)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd66e';
    ctx.font = 'bold 52px Arial';
    ctx.fillText(title, W/2, 210);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(subtitle, W/2, 260);
    ctx.fillStyle = '#dce6ff';
    ctx.font = '20px Arial';
    if (state.mode === 'complete' && !state.runComplete) {
      ctx.fillText('Tap Next Level to continue.', W/2, 318);
    } else {
      drawMenuButton(endGameButtons.restart, 'rgba(126, 200, 255, .20)', '#7ec8ff');
    }
    ctx.restore();
  }

  function draw() {
    if (state.mode === 'title') { drawTitle(); return; }
    drawBackground();
    drawStarFlashOverlay();
    drawWorld();
    drawCoinsItems();
    drawEnemies();
    drawProjectiles();
    drawPlayer();
    drawOwlHint();
    drawParticles();
    drawHud();
    if (state.mode === 'paused') drawPauseOverlay();
    if (state.mode === 'complete') {
      drawEndOverlay(state.runComplete ? 'Moonstone Meadow Complete!' : `${currentLevel().id} Complete!`, `Bell bonus: ${state.bellScore} - Score: ${state.score}`);
      if (!state.runComplete) drawLevelCompletePrompt();
      else drawHighScores();
    }
    if (state.mode === 'gameover') {
      drawEndOverlay('Game Over', `Score: ${state.score}`);
      drawHighScores();
    }
  }

  function syncTouchControls() {
    if (!touchControls) return;
    touchControls.classList.toggle('on-title', state.mode !== 'playing');
    if (pauseButton) {
      pauseButton.disabled = !(state.mode === 'playing' || state.mode === 'paused');
      pauseButton.textContent = state.mode === 'paused' ? 'Resume' : 'Pause';
    }
    if (touchButtonB) {
      const bDisabled = state.mode !== 'title' && !(state.mode === 'playing' && player.power === 'white' && player.respawnTimer <= 0 && player.victoryTimer <= 0);
      touchButtonB.classList.toggle('disabled', bDisabled);
      touchButtonB.setAttribute('aria-disabled', bDisabled ? 'true' : 'false');
    }
  }

  function tick() {
    update();
    syncTouchControls();
    draw();
    requestAnimationFrame(tick);
  }

  function pressCode(code) {
    if (!keys.has(code)) pressed.add(code);
    keys.add(code);
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function releaseCode(code) {
    keys.delete(code);
  }

  function bindTouchControls() {
    if (!touchControls) return;
    const buttons = touchControls.querySelectorAll('[data-key]');
    buttons.forEach(btn => {
      const code = btn.getAttribute('data-key');
      const start = (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        virtualPointers.set(e.pointerId, { code, btn });
        pressCode(code);
      };
      const end = (e) => {
        e.preventDefault();
        const active = virtualPointers.get(e.pointerId);
        if (!active) return;
        active.btn.classList.remove('pressed');
        releaseCode(active.code);
        virtualPointers.delete(e.pointerId);
      };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', end);
      btn.addEventListener('pointercancel', end);
      btn.addEventListener('pointerleave', end);
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPoint(e);
    if (state.mode === 'title') {
      if (hasSavedGame() && pointInBox(p.x, p.y, titleResumeButton)) {
        e.preventDefault();
        if (loadSavedGame()) playTone('power');
        return;
      }
      if (pointInBox(p.x, p.y, testBossButton)) {
        e.preventDefault();
        startBossTest();
        playTone('power');
        return;
      }
      const choice = titleChoiceAt(p.x, p.y);
      if (choice) {
        e.preventDefault();
        resetLevel(choice);
        playTone('power');
      }
      return;
    }
    if (state.mode === 'paused') {
      if (pointInBox(p.x, p.y, hudPauseButton)) {
        e.preventDefault();
        resumeGame();
        playTone('coin');
        return;
      }
      if (pointInBox(p.x, p.y, pauseMenuButtons.resume)) {
        e.preventDefault();
        resumeGame();
        playTone('coin');
      } else if (pointInBox(p.x, p.y, pauseMenuButtons.save)) {
        e.preventDefault();
        saveGame();
        playTone('power');
      }
      return;
    }
    if (state.mode === 'complete' && !state.runComplete) {
      if (pointInBox(p.x, p.y, levelCompleteButtons.next)) {
        e.preventDefault();
        advanceLevel();
        playTone('power');
      } else if (pointInBox(p.x, p.y, levelCompleteButtons.replay)) {
        e.preventDefault();
        resetLevel(state.selectedCharacter, state.levelIndex, true);
        playTone('coin');
      }
      return;
    }
    if ((state.mode === 'complete' && state.runComplete) || state.mode === 'gameover') {
      if (pointInBox(p.x, p.y, endGameButtons.restart)) {
        e.preventDefault();
        returnToTitle();
        playTone('coin');
      }
      return;
    }
    if (state.mode === 'playing') {
      if (pointInBox(p.x, p.y, hudPauseButton)) {
        e.preventDefault();
        pauseGame();
        playTone('coin');
        return;
      }
      const owl = owlPropAtWorldPoint(p.x + state.cameraX, p.y);
      if (owl) {
        e.preventDefault();
        state.owlHint.active = true;
        state.owlHint.owl = owl;
        expandOwlHint();
      }
    }
  });

  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      if (state.mode === 'playing') pauseGame();
      else if (state.mode === 'paused') resumeGame();
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  canvas.addEventListener('dblclick', e => e.preventDefault());
  canvasWrap.addEventListener('dblclick', e => e.preventDefault());
  canvasWrap.addEventListener('touchend', e => e.preventDefault(), { passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => {
    window.addEventListener(type, e => e.preventDefault(), { passive: false });
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);

  window.addEventListener('blur', () => {
    keys.clear();
    pressed.clear();
    virtualPointers.clear();
    document.querySelectorAll('.touch-btn.pressed').forEach(btn => btn.classList.remove('pressed'));
  });
  window.addEventListener('online', () => {
    refreshGlobalScores();
    syncPendingGlobalScores();
  });

  window.addEventListener('keydown', (e) => {
    const usable = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Escape','KeyA','KeyB','KeyC','KeyD','KeyF','KeyN','KeyP','KeyR','KeyS','KeyW','KeyX','ShiftLeft','ShiftRight'];
    if (usable.includes(e.code)) e.preventDefault();
    pressCode(e.code);
  });
  window.addEventListener('keyup', e => releaseCode(e.code));

  bindTouchControls();
  updateFullscreenButton();
  refreshGlobalScores().then(() => syncPendingGlobalScores());

  loadImages().then(() => {
    loadingEl.classList.add('hidden');
    state.mode = 'title';
    tick();
  });
})();
