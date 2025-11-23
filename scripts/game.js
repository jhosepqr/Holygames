/* --- GAME ENGINE: EL PEREGRINO --- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameLoopRunning = false;

// Config
const TILE_SIZE = 40;
const GRID_W = 20;
const GRID_H = 15;

// Game State
let state = {
  mode: "MENU",
  faith: 100,
  lamps: 0,
  lampsNeeded: 3,
  level: 1,
  maxLevels: 7,
  dayTime: 0,
  dayIndex: 0,
  isSabbath: false,
};

let player = { x: 1, y: 1 };
let entities = [];
let particles = [];
let map = [];
const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Questions Database (Expanded)
const questions = [
  {
    q: "¿Día bíblico de reposo?",
    options: ["Domingo", "Sábado", "Viernes"],
    a: 1,
  },
  {
    q: "¿Año del Juicio Investigador?",
    options: ["1844", "1798", "34 DC"],
    a: 0,
  },
  {
    q: "¿El cuerpo es templo de...?",
    options: ["Nadie", "Espíritu Santo", "Alma"],
    a: 1,
  },
  {
    q: "¿Señal de Jonás?",
    options: ["3 días en el pez", "Fuego del cielo", "Terremoto"],
    a: 0,
  },
  {
    q: "¿Animal de Roma en Daniel 7?",
    options: ["León", "Bestia terrible", "Oso"],
    a: 1,
  },
  {
    q: "¿Dieta original (Génesis)?",
    options: ["Carne", "Vegetariana", "Omnívora"],
    a: 1,
  },
  { q: "¿Número de mandamientos?", options: ["10", "2", "100"], a: 0 },
  {
    q: "¿Quién abrió el Mar Rojo?",
    options: ["Moisés (por Dios)", "Faraón", "Aarón"],
    a: 0,
  },
];
let currentQuiz = null;

// Assets
const SPRITES = {
  player: (x, y, rest) => {
    ctx.fillStyle = rest ? "#90cdf4" : "#3b82f6";
    ctx.beginPath();
    ctx.arc(x + 20, y + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    if (state.faith > 50) {
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + 20, y + 5, 10, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  wolf: (x, y) => {
    ctx.fillStyle = "#718096"; // Grey Fox
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 30);
    ctx.lineTo(x + 30, y + 30);
    ctx.lineTo(x + 20, y + 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 18, y + 18, 2, 2);
  },
  lamp: (x, y) => {
    ctx.fillStyle = "#d69e2e";
    ctx.beginPath();
    ctx.arc(x + 20, y + 25, 8, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(x + 20, y + 15, 4, 0, Math.PI * 2);
    ctx.fill();
  },
  fruit: (x, y) => {
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#48bb78";
    ctx.fillRect(x + 20, y + 10, 4, 4);
  },
  scroll: (x, y) => {
    ctx.fillStyle = "#f7fafc";
    ctx.fillRect(x + 10, y + 10, 20, 20);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x + 10, y + 10, 20, 20);
    ctx.fillStyle = "#000";
    ctx.font = "14px serif";
    ctx.fillText("?", x + 16, y + 25);
  },
  sanctuary: (x, y) => {
    ctx.fillStyle = "#6b46c1";
    ctx.fillRect(x, y, 40, 40);
    ctx.fillStyle = "gold";
    ctx.fillRect(x, y, 5, 40);
    ctx.fillRect(x + 35, y, 5, 40);
  },
};

function generateMap() {
  map = [];
  entities = [];
  let wallProb = 0.85 - state.level * 0.02;
  state.lampsNeeded = Math.floor((2 + state.level) * 0.7);
  player.x = 1;
  player.y = 1;
  state.lamps = 0;

  // Noise
  for (let y = 0; y < GRID_H; y++) {
    let row = [];
    for (let x = 0; x < GRID_W; x++) {
      if (x === 0 || x === GRID_W - 1 || y === 0 || y === GRID_H - 1)
        row.push(1);
      else row.push(Math.random() > wallProb ? 1 : 0);
    }
    map.push(row);
  }

  // Path Excavator
  let cx = 1,
    cy = 1;
  while (cx !== GRID_W - 2 || cy !== GRID_H - 2) {
    map[cy][cx] = 0;
    if (cx < GRID_W - 2 && cy < GRID_H - 2) Math.random() > 0.5 ? cx++ : cy++;
    else if (cx < GRID_W - 2) cx++;
    else cy++;
  }
  map[1][1] = 0;
  map[GRID_H - 2][GRID_W - 2] = 9;
  map[GRID_H - 2][GRID_W - 3] = 0;
  map[GRID_H - 3][GRID_W - 2] = 0;

  // Spawns
  spawnEntity("lamp", 2 + state.level);
  spawnEntity("wolf", state.level);
  spawnEntity("fruit", Math.max(1, 6 - state.level));
  spawnEntity("scroll", 3);
}

function spawnEntity(type, count) {
  for (let i = 0; i < count; i++) {
    let placed = false,
      att = 0;
    while (!placed && att < 100) {
      let rx = Math.floor(Math.random() * (GRID_W - 2)) + 1;
      let ry = Math.floor(Math.random() * (GRID_H - 2)) + 1;
      if (map[ry][rx] === 0 && !(rx === player.x && ry === player.y)) {
        if (!entities.find((e) => e.x === rx && e.y === ry)) {
          entities.push({ type: type, x: rx, y: ry });
          placed = true;
        }
      }
      att++;
    }
  }
}

// Input Logic
const keys = {};
window.addEventListener("keydown", (e) => {
  if (!gameLoopRunning) return;
  keys[e.code] = true;
  if (state.mode === "PLAY" || state.mode === "SABBATH") handleInput(e.code);
});
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// Mobile bindings
document.getElementById("btn-up").onclick = () => handleInput("ArrowUp");
document.getElementById("btn-down").onclick = () => handleInput("ArrowDown");
document.getElementById("btn-left").onclick = () => handleInput("ArrowLeft");
document.getElementById("btn-right").onclick = () => handleInput("ArrowRight");
document.getElementById("btn-action").onclick = () => handleInput("Space");

function handleInput(code) {
  if (state.mode === "QUIZ") return;

  // Sabbath Logic
  if (state.isSabbath) {
    if (code === "Space" || code === "Enter") {
      state.faith = Math.min(100, state.faith + 5);
      createParts(player.x, player.y, "gold", 5);
      return;
    }
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code) ||
      ["KeyW", "KeyS", "KeyA", "KeyD"].includes(code)
    ) {
      state.faith -= 5;
      createParts(player.x, player.y, "red", 3);
    }
  }

  let dx = 0,
    dy = 0;
  if (code === "ArrowUp" || code === "KeyW") dy = -1;
  if (code === "ArrowDown" || code === "KeyS") dy = 1;
  if (code === "ArrowLeft" || code === "KeyA") dx = -1;
  if (code === "ArrowRight" || code === "KeyD") dx = 1;

  if (dx !== 0 || dy !== 0) {
    let tx = player.x + dx;
    let ty = player.y + dy;
    if (map[ty][tx] !== 1) {
      player.x = tx;
      player.y = ty;
      checkCol();
    }
  }
}

function checkCol() {
  let idx = entities.findIndex((e) => e.x === player.x && e.y === player.y);
  if (idx > -1) {
    let e = entities[idx];
    if (e.type === "lamp") {
      state.lamps++;
      entities.splice(idx, 1);
      createParts(player.x, player.y, "gold", 10);
    }
    if (e.type === "fruit") {
      state.faith = Math.min(100, state.faith + 20);
      entities.splice(idx, 1);
    }
    if (e.type === "wolf") {
      state.faith -= 20;
      player.x = 1;
      player.y = 1;
      createParts(player.x, player.y, "red", 10);
    }
    if (e.type === "scroll") {
      entities.splice(idx, 1);
      startQuiz();
    }
  }
  if (map[player.y][player.x] === 9) {
    if (state.lamps >= state.lampsNeeded) nextLevel();
    else player.y--; // Bounce back
  }
}

function nextLevel() {
  if (state.level >= state.maxLevels) endGame(true);
  else {
    state.level++;
    generateMap();
    const ind = document.getElementById("level-indicator");
    ind.innerText = "NIVEL " + state.level;
    ind.style.opacity = 1;
    setTimeout(() => (ind.style.opacity = 0), 2000);
  }
}

function startQuiz() {
  state.mode = "QUIZ";
  let q = questions[Math.floor(Math.random() * questions.length)];
  currentQuiz = q;
  document.getElementById("quiz-question").innerText = q.q;
  const box = document.getElementById("quiz-options");
  box.innerHTML = "";
  q.options.forEach((o, i) => {
    let b = document.createElement("button");
    b.className = "bg-blue-600 text-white p-2 m-1 rounded hover:bg-blue-500";
    b.innerText = o;
    b.onclick = () => resolveQuiz(i);
    box.appendChild(b);
  });
  document.getElementById("quiz-modal").style.display = "block";
}

function resolveQuiz(i) {
  document.getElementById("quiz-modal").style.display = "none";
  state.faith =
    i === currentQuiz.a ? Math.min(100, state.faith + 15) : state.faith - 10;
  state.mode = "PLAY";
}

function createParts(x, y, c, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x * 40 + 20,
      y: y * 40 + 20,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      c: c,
    });
  }
}

function endGame(win) {
  state.mode = "MENU";
  document.getElementById("end-modal").style.display = "block";
  document.getElementById("end-title").innerText = win
    ? "¡VICTORIA!"
    : "FE AGOTADA";
  document.getElementById("end-msg").innerText = win
    ? "Has llegado a la Tierra Nueva."
    : "Inténtalo de nuevo.";
}

// Game Management
function peregrinoStart() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("end-modal").style.display = "none";
  state.faith = 100;
  state.level = 1;
  state.lamps = 0;
  state.dayTime = 40;
  state.dayIndex = 5;
  generateMap();
  state.mode = "PLAY";
}

function peregrinoReset() {
  peregrinoStart();
}

// Loop
let enemyTimer = 0;
function loop() {
  if (!gameLoopRunning) return;

  if (state.mode === "PLAY") {
    // Time
    state.dayTime += 0.1;
    if (state.dayTime >= 100) {
      state.dayTime = 0;
      state.dayIndex = (state.dayIndex + 1) % 7;
    }

    let isFriEve = state.dayIndex === 5 && state.dayTime > 80;
    let isSat = state.dayIndex === 6 && state.dayTime < 80; // ends sat evening
    state.isSabbath = isFriEve || isSat;

    // UI Overlay for Sabbath
    document.getElementById("sabbath-overlay").style.display = state.isSabbath
      ? "flex"
      : "none";
    if (state.isSabbath) {
      document.getElementById(
        "sabbath-overlay"
      ).style.background = `rgba(25,25,112, ${
        Math.sin(Date.now() / 500) * 0.2 + 0.4
      })`;
    }

    // Enemies
    enemyTimer++;
    if (enemyTimer > Math.max(10, 40 - state.level * 2)) {
      entities
        .filter((e) => e.type === "wolf")
        .forEach((w) => {
          let moves = [
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
          ];
          let m = moves[Math.floor(Math.random() * 4)];
          let tx = w.x + m.x,
            ty = w.y + m.y;
          if (map[ty][tx] !== 1 && map[ty][tx] !== 9) {
            w.x = tx;
            w.y = ty;
          }
          if (w.x === player.x && w.y === player.y) {
            state.faith -= 15;
            createParts(player.x, player.y, "red", 10);
          }
        });
      enemyTimer = 0;
    }

    // Particles
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.1;
    });
    particles = particles.filter((p) => p.life > 0);

    if (state.faith <= 0) endGame(false);
  }

  // Draw
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Map
  if (map.length > 0) {
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        let px = x * 40,
          py = y * 40;
        if (map[y][x] === 1) {
          // WALLS: Diseño de bloque sólido con borde
          ctx.fillStyle = "#1e293b"; // Base oscura
          ctx.fillRect(px, py, 40, 40);

          // Borde 3D simulado (Top light)
          ctx.fillStyle = "#334155";
          ctx.fillRect(px + 4, py + 4, 32, 32);

          // Detalle central
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px + 12, py + 12, 16, 16);
        } else if (map[y][x] === 9) {
          SPRITES.sanctuary(px, py);
        } else {
          // GROUND: Tonos tierra/piedra más claros para contraste
          ctx.fillStyle = (x + y) % 2 === 0 ? "#78716c" : "#57534e";
          ctx.fillRect(px, py, 40, 40);
        }
      }
    }
  }

  entities.forEach((e) => SPRITES[e.type](e.x * 40, e.y * 40));
  SPRITES.player(player.x * 40, player.y * 40, state.isSabbath);

  particles.forEach((p) => {
    ctx.fillStyle = p.c;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 4, 4);
    ctx.globalAlpha = 1;
  });

  // Lighting Effect
  let alpha = 0;
  if (state.dayTime > 70) alpha = (state.dayTime - 70) / 60;
  if (alpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Update HTML UI
  document.getElementById("faith-display").innerText = `Fe: ${Math.floor(
    state.faith
  )}%`;
  document.getElementById("day-display").innerText = DAYS[state.dayIndex];
  document.getElementById("time-display").innerText =
    state.dayTime > 80 ? "Noche" : "Día";
  document.getElementById(
    "lamps-display"
  ).innerText = `Lámparas: ${state.lamps}/${state.lampsNeeded}`;
  document.getElementById("level-display").innerText = `Nivel ${state.level}`;

  requestAnimationFrame(loop);
}
