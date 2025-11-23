class PeregrinoScene extends Phaser.Scene {
  constructor() {
    super({ key: "PeregrinoScene" });
  }

  preload() {
    // Aquí cargar assets si los tuviéramos (imágenes, sonidos)
    // Por ahora, usamos dibujos manuales como antes
  }

  create() {
    // Config
    this.TILE_SIZE = 40;
    this.GRID_W = 20;
    this.GRID_H = 15;

    // Game State
    this.state = {
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

    this.player = { x: 1, y: 1 };
    this.entities = [];
    this.particles = [];
    this.map = [];
    this.moveCooldown = 0;
    this.lastDx = 0;
    this.lastDy = 0;
    this.lastMoveTime = 0;
    this.DAYS = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    // Questions Database
    this.questions = [
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
    this.currentQuiz = null;

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,S,A,D,SPACE");

    // Mobile controls (si es necesario, agregar botones)
    // this.btnUp = this.add.sprite(...).setInteractive();

    // Graphics for drawing
    this.graphics = this.add.graphics();

    // Generate initial map
    this.generateMap();

    // UI (mantener HTML para simplicidad)
    // Actualizar UI in update

    // Auto-start the game
    this.peregrinoStart();
  }

  generateMap() {
    this.map = [];
    this.entities = [];
    let wallProb = 0.85 - this.state.level * 0.02;
    this.state.lampsNeeded = Math.floor((2 + this.state.level) * 0.7);
    this.player.x = 1;
    this.player.y = 1;
    this.state.lamps = 0;

    for (let y = 0; y < this.GRID_H; y++) {
      let row = [];
      for (let x = 0; x < this.GRID_W; x++) {
        if (
          x === 0 ||
          x === this.GRID_W - 1 ||
          y === 0 ||
          y === this.GRID_H - 1
        )
          row.push(1);
        else row.push(Math.random() > wallProb ? 1 : 0);
      }
      this.map.push(row);
    }

    let cx = 1,
      cy = 1;
    while (cx !== this.GRID_W - 2 || cy !== this.GRID_H - 2) {
      this.map[cy][cx] = 0;
      if (cx < this.GRID_W - 2 && cy < this.GRID_H - 2)
        Math.random() > 0.5 ? cx++ : cy++;
      else if (cx < this.GRID_W - 2) cx++;
      else cy++;
    }
    this.map[1][1] = 0;
    this.map[this.GRID_H - 2][this.GRID_W - 2] = 9;
    this.map[this.GRID_H - 2][this.GRID_W - 3] = 0;
    this.map[this.GRID_H - 3][this.GRID_W - 2] = 0;

    this.spawnEntity("lamp", 2 + this.state.level);
    this.spawnEntity("wolf", this.state.level);
    this.spawnEntity("fruit", Math.max(1, 6 - this.state.level));
    this.spawnEntity("scroll", 3);
  }

  spawnEntity(type, count) {
    for (let i = 0; i < count; i++) {
      let placed = false,
        att = 0;
      while (!placed && att < 100) {
        let rx = Math.floor(Math.random() * (this.GRID_W - 2)) + 1;
        let ry = Math.floor(Math.random() * (this.GRID_H - 2)) + 1;
        if (
          this.map[ry][rx] === 0 &&
          !(rx === this.player.x && ry === this.player.y)
        ) {
          if (!this.entities.find((e) => e.x === rx && e.y === ry)) {
            this.entities.push({ type: type, x: rx, y: ry });
            placed = true;
          }
        }
        att++;
      }
    }
  }

  update(time, delta) {
    // Clear graphics
    this.graphics.clear();

    // Movement cooldown
    if (this.moveCooldown > 0) this.moveCooldown--;

    if (this.state.mode === "PLAY") {
      this.state.dayTime += this.state.isSabbath ? 0.5 : 0.1;
      if (this.state.dayTime >= 100) {
        this.state.dayTime = 0;
        this.state.dayIndex = (this.state.dayIndex + 1) % 7;
      }

      let isFriEve = this.state.dayIndex === 5 && this.state.dayTime > 80;
      let isSat = this.state.dayIndex === 6 && this.state.dayTime < 80;
      this.state.isSabbath = isFriEve || isSat;

      // UI Overlay
      document.getElementById("sabbath-overlay").style.display = this.state
        .isSabbath
        ? "flex"
        : "none";

      // Enemies
      this.enemyTimer = this.enemyTimer || 0;
      this.enemyTimer++;
      if (this.enemyTimer > Math.max(10, 40 - this.state.level * 2)) {
        this.entities
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
            if (this.map[ty][tx] !== 1 && this.map[ty][tx] !== 9) {
              w.x = tx;
              w.y = ty;
            }
            if (w.x === this.player.x && w.y === this.player.y) {
              this.state.faith -= 15;
              this.createParts(this.player.x, this.player.y, "red", 10);
            }
          });
        this.enemyTimer = 0;
      }

      // Particles
      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.1;
      });
      this.particles = this.particles.filter((p) => p.life > 0);

      if (this.state.faith <= 0) this.endGame(false);
    }

    // Handle input
    if (this.state.mode === "PLAY" || this.state.mode === "SABBATH") {
      this.handleInput(time);
    }

    // Draw
    this.drawMap();
    this.drawEntities();
    this.drawParticles();

    // Lighting
    let alpha = 0;
    if (this.state.dayTime > 70) alpha = (this.state.dayTime - 70) / 60;
    if (alpha > 0) {
      this.cameras.main.setAlpha(1 - alpha);
    }

    // Update HTML UI
    document.getElementById("faith-display").innerText = `Fe: ${Math.floor(
      this.state.faith
    )}%`;
    document.getElementById("day-display").innerText =
      this.DAYS[this.state.dayIndex];
    document.getElementById("time-display").innerText =
      this.state.dayTime > 80 ? "Noche" : "Día";
    document.getElementById(
      "lamps-display"
    ).innerText = `Lámparas: ${this.state.lamps}/${this.state.lampsNeeded}`;
    document.getElementById(
      "level-display"
    ).innerText = `Nivel ${this.state.level}`;
  }

  handleInput(time) {
    if (this.state.mode === "QUIZ") return;

    // Hide message if pressing direction keys
    if (
      isMessageVisible &&
      (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
        Phaser.Input.Keyboard.JustDown(this.keys.W) ||
        Phaser.Input.Keyboard.JustDown(this.keys.S) ||
        Phaser.Input.Keyboard.JustDown(this.keys.A) ||
        Phaser.Input.Keyboard.JustDown(this.keys.D))
    ) {
      hideMessage();
    }

    let moved = false;
    let dx = 0,
      dy = 0;

    if (this.state.isSabbath) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
        this.state.faith = Math.min(100, this.state.faith + 5);
        this.createParts(this.player.x, this.player.y, "gold", 5);
        return;
      }
    }

    // Check each direction
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      (this.cursors.up.isDown && this.moveTimer > 3)
    ) {
      dy = -1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      (this.cursors.down.isDown && this.moveTimer > 3)
    ) {
      dy = 1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
      (this.cursors.left.isDown && this.moveTimer > 3)
    ) {
      dx = -1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
      (this.cursors.right.isDown && this.moveTimer > 3)
    ) {
      dx = 1;
    }

    if (dx !== 0 || dy !== 0) {
      if (this.state.isSabbath) {
        this.state.faith -= 5;
        this.createParts(this.player.x, this.player.y, "red", 3);
      }
      let tx = this.player.x + dx;
      let ty = this.player.y + dy;
      if (this.map[ty][tx] !== 1) {
        this.player.x = tx;
        this.player.y = ty;
        this.checkCol();
        moved = true;
      }
    }

    if (moved) {
      this.moveTimer = 0;
      this.lastDx = dx;
      this.lastDy = dy;
    }
  }

  checkCol() {
    let idx = this.entities.findIndex(
      (e) => e.x === this.player.x && e.y === this.player.y
    );
    if (idx > -1) {
      let e = this.entities[idx];
      if (e.type === "lamp") {
        this.state.lamps++;
        this.entities.splice(idx, 1);
        this.createParts(this.player.x, this.player.y, "gold", 10);
        showMessage("¡Encontraste una lámpara! +1");
      }
      if (e.type === "fruit") {
        this.state.faith = Math.min(100, this.state.faith + 20);
        this.entities.splice(idx, 1);
        showMessage("¡Fruta espiritual! +20 Fe");
      }
      if (e.type === "wolf") {
        this.state.faith -= 20;
        this.player.x = 1;
        this.player.y = 1;
        this.createParts(this.player.x, this.player.y, "red", 10);
        showMessage("¡Atacado por lobo! -20 Fe");
      }
      if (e.type === "scroll") {
        this.entities.splice(idx, 1);
        this.startQuiz();
        showMessage("Pergamino de doctrina encontrado");
      }
    }
    if (this.map[this.player.y][this.player.x] === 9) {
      if (this.state.lamps >= this.state.lampsNeeded) this.nextLevel();
      else {
        showMessage(
          `Necesitas ${
            this.state.lampsNeeded - this.state.lamps
          } lámparas más para entrar al Santuario.`
        );
        this.player.y--;
      }
    }
  }

  nextLevel() {
    if (this.state.level >= this.state.maxLevels) this.endGame(true);
    else {
      this.state.level++;
      this.generateMap();
      showMessage(`¡Nivel ${this.state.level} completado!`);
      const ind = document.getElementById("level-indicator");
      ind.innerText = "NIVEL " + this.state.level;
      ind.style.opacity = 1;
      setTimeout(() => (ind.style.opacity = 0), 2000);
    }
  }

  startQuiz() {
    this.state.mode = "QUIZ";
    let q = this.questions[Math.floor(Math.random() * this.questions.length)];
    this.currentQuiz = q;
    document.getElementById("quiz-question").innerText = q.q;
    const box = document.getElementById("quiz-options");
    box.innerHTML = "";
    q.options.forEach((o, i) => {
      let b = document.createElement("button");
      b.className = "bg-blue-600 text-white p-2 m-1 rounded hover:bg-blue-500";
      b.innerText = o;
      b.onclick = () => this.resolveQuiz(i);
      box.appendChild(b);
    });
    document.getElementById("quiz-modal").style.display = "block";
  }

  resolveQuiz(i) {
    document.getElementById("quiz-modal").style.display = "none";
    if (i === this.currentQuiz.a) {
      this.state.faith = Math.min(100, this.state.faith + 15);
      showMessage("¡Respuesta correcta! +15 Fe");
    } else {
      this.state.faith -= 10;
      showMessage("Respuesta incorrecta. -10 Fe");
    }
    this.state.mode = "PLAY";
  }

  createParts(x, y, c, n) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: x * 40 + 20,
        y: y * 40 + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        c: c,
      });
    }
  }

  endGame(win) {
    this.state.mode = "MENU";
    document.getElementById("end-modal").style.display = "block";
    document.getElementById("end-title").innerText = win
      ? "¡VICTORIA!"
      : "FE AGOTADA";
    document.getElementById("end-msg").innerText = win
      ? "Has llegado a la Tierra Nueva."
      : "Inténtalo de nuevo.";
  }

  drawMap() {
    for (let y = 0; y < this.GRID_H; y++) {
      for (let x = 0; x < this.GRID_W; x++) {
        let px = x * 40,
          py = y * 40;
        if (this.map[y][x] === 1) {
          this.graphics.fillStyle(0x1e293b);
          this.graphics.fillRect(px, py, 40, 40);
          this.graphics.fillStyle(0x334155);
          this.graphics.fillRect(px + 4, py + 4, 32, 32);
          this.graphics.fillStyle(0x0f172a);
          this.graphics.fillRect(px + 12, py + 12, 16, 16);
        } else if (this.map[y][x] === 9) {
          this.graphics.fillStyle(0x6b46c1);
          this.graphics.fillRect(px, py, 40, 40);
          this.graphics.fillStyle(0xffd700);
          this.graphics.fillRect(px, py, 5, 40);
          this.graphics.fillRect(px + 35, py, 5, 40);
        } else {
          let color = (x + y) % 2 === 0 ? 0x78716c : 0x57534e;
          this.graphics.fillStyle(color);
          this.graphics.fillRect(px, py, 40, 40);
        }
      }
    }
  }

  drawEntities() {
    this.entities.forEach((e) => {
      let px = e.x * 40,
        py = e.y * 40;
      if (e.type === "wolf") {
        this.graphics.fillStyle(0x718096);
        this.graphics.fillTriangle(
          px + 10,
          py + 30,
          px + 30,
          py + 30,
          px + 20,
          py + 10
        );
        this.graphics.fillStyle(0xffffff);
        this.graphics.fillCircle(px + 18, py + 18, 1);
      } else if (e.type === "lamp") {
        this.graphics.fillStyle(0xd69e2e);
        this.graphics.fillEllipse(px + 20, py + 25, 16, 8);
        this.graphics.fillStyle(0xffff00);
        this.graphics.fillCircle(px + 20, py + 15, 4);
      } else if (e.type === "fruit") {
        this.graphics.fillStyle(0xf87171);
        this.graphics.fillCircle(px + 20, py + 20, 8);
        this.graphics.fillStyle(0x48bb78);
        this.graphics.fillRect(px + 20, py + 10, 4, 4);
      } else if (e.type === "scroll") {
        this.graphics.fillStyle(0xf7fafc);
        this.graphics.fillRect(px + 10, py + 10, 20, 20);
        this.graphics.lineStyle(1, 0x000000);
        this.graphics.strokeRect(px + 10, py + 10, 20, 20);
        this.graphics.fillStyle(0x000000);
        this.add.text(px + 16, py + 25, "?", {
          fontSize: "14px",
          color: "#000",
        });
      }
    });

    // Draw player
    let px = this.player.x * 40,
      py = this.player.y * 40;
    let color = this.state.isSabbath ? 0x90cdf4 : 0x3b82f6;
    this.graphics.fillStyle(color);
    this.graphics.fillCircle(px + 20, py + 20, 12);
    if (this.state.faith > 50) {
      this.graphics.lineStyle(2, 0xffd700);
      this.graphics.strokeEllipse(px + 20, py + 5, 20, 6);
    }
  }

  drawParticles() {
    this.particles.forEach((p) => {
      this.graphics.fillStyle(p.c === "gold" ? 0xffd700 : 0xff0000);
      this.graphics.fillRect(p.x, p.y, 4, 4);
    });
  }

  peregrinoStart() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("end-modal").style.display = "none";
    this.state.faith = 100;
    this.state.level = 1;
    this.state.lamps = 0;
    this.state.dayTime = 40;
    this.state.dayIndex = 5;
    this.generateMap();
    this.state.mode = "PLAY";
  }

  peregrinoReset() {
    this.peregrinoStart();
  }
}

// Message system
function showMessage(msg) {
  const overlay = document.getElementById("message-overlay");
  overlay.querySelector("div").innerText = msg;
  overlay.style.display = "flex";
  setTimeout(() => (overlay.style.display = "none"), 3000);
}

// Global functions for HTML onclick
window.peregrinoStart = function () {
  if (game && game.scene.getScene("PeregrinoScene")) {
    game.scene.getScene("PeregrinoScene").peregrinoStart();
  }
};

window.peregrinoReset = function () {
  if (game && game.scene.getScene("PeregrinoScene")) {
    game.scene.getScene("PeregrinoScene").peregrinoReset();
  }
};

// Message system
let isMessageVisible = false;

function showMessage(msg) {
  const overlay = document.getElementById("message-overlay");
  overlay.querySelector("div").innerText = msg;
  overlay.style.display = "flex";
  isMessageVisible = true;
  setTimeout(() => {
    if (isMessageVisible) {
      overlay.style.display = "none";
      isMessageVisible = false;
    }
  }, 3000);
}

function hideMessage() {
  const overlay = document.getElementById("message-overlay");
  overlay.style.display = "none";
  isMessageVisible = false;
}

// Export for use in main.js
window.PeregrinoScene = PeregrinoScene;
