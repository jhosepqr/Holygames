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

    this.player = { x: 40, y: 40 }; // Pixel coordinates
    this.velocity = { x: 0, y: 0 };

    // Physics Constants
    this.MAX_SPEED = 300;
    this.ACCELERATION = 1500;
    this.FRICTION = 550;
    this.TURN_SPEED = 1500;

    this.entities = [];
    this.particles = [];
    this.map = [];
    // this.moveCooldown = 0; // Removed
    // this.lastDx = 0; // Removed
    // this.lastDy = 0; // Removed
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
    // Graphics for drawing (only for dynamic fog now)
    this.graphics = this.add.graphics();
    this.graphics.setDepth(100);

    // Groups for optimized rendering
    this.mapGroup = this.add.group();
    this.entityGroup = this.add.group();
    // Groups for optimized rendering
    this.mapGroup = this.add.group();
    this.entityGroup = this.add.group();

    // Generate Textures once
    this.createTextures();

    // Generate initial map
    this.generateMap();

    // UI (mantener HTML para simplicidad)
    // Actualizar UI in update

    // Auto-start the game
    this.peregrinoStart();
  }

  createTextures() {
    // 1. Wall Texture
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x1e293b);
    g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x334155);
    g.fillRect(4, 4, 32, 32);
    g.fillStyle(0x0f172a);
    g.fillRect(12, 12, 16, 16);
    g.generateTexture('wall', 40, 40);

    // 2. Floor Texture
    g.clear();
    g.fillStyle(0x78716c);
    g.fillRect(0, 0, 40, 40);
    g.generateTexture('floor1', 40, 40);
    g.clear();
    g.fillStyle(0x57534e);
    g.fillRect(0, 0, 40, 40);
    g.generateTexture('floor2', 40, 40);

    // 3. Exit/Santuario Texture
    g.clear();
    g.fillStyle(0x6b46c1);
    g.fillRect(0, 0, 40, 40);
    g.fillStyle(0xffd700);
    g.fillRect(0, 0, 5, 40);
    g.fillRect(35, 0, 5, 40);
    g.generateTexture('exit', 40, 40);

    // 4. Player Texture (Walker)
    g.clear();
    // Head
    g.fillStyle(0xffdbac);
    g.fillCircle(20, 10, 6);
    // Body
    g.fillStyle(0x3b82f6); // Default blue
    g.fillRect(12, 16, 16, 18);
    // Legs
    g.fillStyle(0x1a202c);
    g.fillRect(14, 34, 4, 6);
    g.fillRect(22, 34, 4, 6);
    g.generateTexture('player', 40, 40);

    // 5. Guard Texture
    g.clear();
    // Skin
    g.fillStyle(0xc68e17);
    g.fillCircle(20, 12, 7);
    // Nemes
    g.fillStyle(0x1a365d);
    g.beginPath();
    g.moveTo(16, 5);
    g.lineTo(24, 5);
    g.lineTo(28, 15);
    g.lineTo(12, 15);
    g.fill();
    g.lineStyle(1, 0xffd700);
    g.beginPath();
    g.moveTo(20, 5);
    g.lineTo(20, 15);
    g.stroke();
    // Body
    g.fillStyle(0xffffff);
    g.fillRect(14, 28, 12, 10);
    g.fillStyle(0xc68e17);
    g.fillRect(13, 18, 14, 10);
    // Collar
    g.fillStyle(0xffd700);
    g.fillCircle(20, 19, 4);
    // Spear
    g.lineStyle(2, 0x5c4033);
    g.beginPath();
    g.moveTo(30, 2);
    g.lineTo(30, 38);
    g.stroke();
    g.fillStyle(0xc0c0c0);
    g.beginPath();
    g.moveTo(30, 0);
    g.lineTo(33, 6);
    g.lineTo(27, 6);
    g.fill();
    g.fill();
    g.generateTexture('wolf', 40, 40);

    // 6. Lamp Texture
    g.clear();
    g.fillStyle(0xffd700);
    g.beginPath();
    g.moveTo(10, 25);
    g.lineTo(15, 32);
    g.lineTo(25, 32);
    g.lineTo(30, 25);
    g.lineTo(10, 25);
    g.fill();
    g.lineStyle(2, 0xffd700);
    g.beginPath();
    g.arc(8, 25, 4, 0, Math.PI, true);
    g.stroke();
    g.fillStyle(0xff4500);
    g.beginPath();
    g.arc(30, 22, 3, 0, Math.PI * 2);
    g.fill();
    g.generateTexture('lamp', 40, 40);

    // 7. Fruit Texture
    g.clear();
    g.fillStyle(0xf87171);
    g.fillCircle(20, 20, 8);
    g.fillStyle(0x48bb78);
    g.fillRect(20, 10, 4, 4);
    g.generateTexture('fruit', 40, 40);

    // 8. Scroll Texture
    g.clear();
    g.fillStyle(0xf7fafc);
    g.fillRect(10, 10, 20, 20);
    g.lineStyle(1, 0x000000);
    g.strokeRect(10, 10, 20, 20);
    g.generateTexture('scroll', 40, 40);

    g.destroy();

    // 10. Fog Texture (Sharper gradient for clearer visible area)
    const fogSize = 2000;
    const fogCanvas = this.textures.createCanvas('fog', fogSize, fogSize);
    const ctx = fogCanvas.context;

    const grd = ctx.createRadialGradient(fogSize / 2, fogSize / 2, 0, fogSize / 2, fogSize / 2, fogSize / 2);
    grd.addColorStop(0, 'rgba(26, 32, 44, 0)');
    grd.addColorStop(0.08, 'rgba(26, 32, 44, 0)'); // Clear radius 80px (at scale 1)
    grd.addColorStop(0.12, 'rgba(26, 32, 44, 0.9)'); // Sharp fade
    grd.addColorStop(0.15, 'rgba(26, 32, 44, 1.0)'); // Full darkness by 150px
    grd.addColorStop(1, 'rgba(26, 32, 44, 1.0)');

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, fogSize, fogSize);
    fogCanvas.refresh();
  }

  generateMap() {
    this.map = [];
    this.entities = [];
    let wallProb = 0.85 - this.state.level * 0.02;
    this.state.lampsNeeded = Math.floor((2 + this.state.level) * 0.7);
    this.player.x = 40;
    this.player.y = 40;
    this.velocity = { x: 0, y: 0 };
    this.state.lamps = 0;

    this.mapGroup.clear(true, true);
    this.entityGroup.clear(true, true);

    for (let y = 0; y < this.GRID_H; y++) {
      let row = [];
      for (let x = 0; x < this.GRID_W; x++) {
        let isWall = false;
        if (x === 0 || x === this.GRID_W - 1 || y === 0 || y === this.GRID_H - 1) isWall = true;
        else isWall = Math.random() > wallProb;

        row.push(isWall ? 1 : 0);
        let key = isWall ? 'wall' : ((x + y) % 2 === 0 ? 'floor1' : 'floor2');
        this.mapGroup.create(x * 40, y * 40, key).setOrigin(0);
      }
      this.map.push(row);
    }

    let cx = 1, cy = 1;
    while (cx !== this.GRID_W - 2 || cy !== this.GRID_H - 2) {
      this.map[cy][cx] = 0;
      let key = (cx + cy) % 2 === 0 ? 'floor1' : 'floor2';
      this.mapGroup.create(cx * 40, cy * 40, key).setOrigin(0);
      if (cx < this.GRID_W - 2 && cy < this.GRID_H - 2) Math.random() > 0.5 ? cx++ : cy++;
      else if (cx < this.GRID_W - 2) cx++;
      else cy++;
    }
    this.map[1][1] = 0;
    this.map[this.GRID_H - 2][this.GRID_W - 2] = 9;
    this.map[this.GRID_H - 2][this.GRID_W - 3] = 0;
    this.map[this.GRID_H - 3][this.GRID_W - 2] = 0;

    this.mapGroup.create((this.GRID_W - 2) * 40, (this.GRID_H - 2) * 40, 'exit').setOrigin(0);

    this.spawnEntity("lamp", 2 + this.state.level);
    this.spawnEntity("wolf", this.state.level);
    this.spawnEntity("fruit", Math.max(1, 6 - this.state.level));
    this.spawnEntity("scroll", 3);
  }

  spawnEntity(type, count) {
    for (let i = 0; i < count; i++) {
      let placed = false, att = 0;
      while (!placed && att < 100) {
        let rx = Math.floor(Math.random() * (this.GRID_W - 2)) + 1;
        let ry = Math.floor(Math.random() * (this.GRID_H - 2)) + 1;
        if (this.map[ry][rx] === 0 && !(rx === this.player.x && ry === this.player.y)) {
          if (!this.entities.find((e) => e.x === rx && e.y === ry)) {
            let sprite = this.entityGroup.create(rx * 40, ry * 40, type).setOrigin(0);
            this.entities.push({ type: type, x: rx, y: ry, sprite: sprite });
            placed = true;
          }
        }
        att++;
      }
    }
  }

  update(time, delta) {
    this.graphics.clear();

    // Physics Movement
    if (this.state.mode === "PLAY" || this.state.mode === "SABBATH") {
      const dt = delta / 1000;

      // Apply Velocity
      let nextX = this.player.x + this.velocity.x * dt;
      let nextY = this.player.y + this.velocity.y * dt;

      // Collision X
      if (!this.checkCollision(nextX, this.player.y)) {
        this.player.x = nextX;
      } else {
        this.velocity.x = 0;
        // Optional: Snap to grid? No, just stop.
      }

      // Collision Y
      if (!this.checkCollision(this.player.x, nextY)) {
        this.player.y = nextY;
      } else {
        this.velocity.y = 0;
      }

      // Update Player Sprite
      if (this.playerSprite) {
        this.playerSprite.setPosition(this.player.x, this.player.y);
      }

      // Handle Input (Calculate velocity for next frame)
      this.handleInput(time, delta);

      // Check Interactions
      this.checkEntityInteractions();
    }

    // Move Timer removed (physics doesn't need it)

    if (this.state.mode === "PLAY") {
      this.state.dayTime += this.state.isSabbath ? 0.5 : 0.1;
      if (this.state.dayTime >= 100) {
        this.state.dayTime = 0;
        this.state.dayIndex = (this.state.dayIndex + 1) % 7;
      }
      let isFriEve = this.state.dayIndex === 5 && this.state.dayTime > 80;
      let isSat = this.state.dayIndex === 6 && this.state.dayTime < 80;
      this.state.isSabbath = isFriEve || isSat;
      document.getElementById("sabbath-overlay").style.display = this.state.isSabbath ? "flex" : "none";

      this.enemyTimer = this.enemyTimer || 0;
      this.enemyTimer++;
      if (this.enemyTimer > Math.max(10, 40 - this.state.level * 2)) {
        this.entities.filter((e) => e.type === "wolf").forEach((w) => {
          let tx = w.x, ty = w.y;
          const chaseChance = this.state.level * 0.1;
          if (Math.random() < chaseChance) {
            // AI Logic needs to convert player pixels to grid
            let pxGrid = Math.floor((this.player.x + 20) / 40);
            let pyGrid = Math.floor((this.player.y + 20) / 40);

            if (w.x < pxGrid) tx++;
            else if (w.x > pxGrid) tx--;
            else if (w.y < pyGrid) ty++;
            else if (w.y > pyGrid) ty--;
          } else {
            let moves = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
            let m = moves[Math.floor(Math.random() * 4)];
            tx += m.x; ty += m.y;
          }
          if (this.map[ty][tx] !== 1 && this.map[ty][tx] !== 9) {
            w.x = tx; w.y = ty;
          }
          // Enemy Collision with Player (Distance check)
          let dist = Phaser.Math.Distance.Between(w.x * 40, w.y * 40, this.player.x, this.player.y);
          if (dist < 30) {
            this.state.faith -= 15;
            this.createParts(this.player.x, this.player.y, "red", 10);
          }
        });
        this.enemyTimer = 0;
      }
      this.entities.forEach(e => { if (e.sprite) e.sprite.setPosition(e.x * 40, e.y * 40); });
      this.particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life -= 0.1; });
      this.particles = this.particles.filter((p) => p.life > 0);
      if (this.state.faith <= 0) this.endGame(false);
    }

    // Input handled inside update loop now
    this.drawParticles();

    // Lighting (Day/Night cycle removed for constant light)
    // We keep the time for Sabbath logic but don't fade the camera
    // let alpha = 0;
    // if (this.state.dayTime > 70) alpha = (this.state.dayTime - 70) / 60;
    // if (alpha > 0) this.cameras.main.setAlpha(1 - alpha);

    document.getElementById("faith-display").innerText = `Fe: ${Math.floor(this.state.faith)}%`;
    document.getElementById("day-display").innerText = this.DAYS[this.state.dayIndex];
    document.getElementById("time-display").innerText = this.state.dayTime > 80 ? "Noche" : "Día";
    document.getElementById("lamps-display").innerText = `Lámparas: ${this.state.lamps}/${this.state.lampsNeeded}`;
    document.getElementById("level-display").innerText = `Nivel ${this.state.level}`;

    this.drawFog();
  }

  handleInput(time, delta) {
    if (this.state.mode === "QUIZ") return;
    if (isMessageVisible && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.S) || Phaser.Input.Keyboard.JustDown(this.keys.A) || Phaser.Input.Keyboard.JustDown(this.keys.D))) {
      hideMessage();
    }

    // Sabbath Prayer
    if (this.state.isSabbath) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.state.faith = Math.min(100, this.state.faith + 5);
        this.createParts(this.player.x, this.player.y, "gold", 5);
        showMessage("Orando... +5 Fe");
        return;
      }
    }

    // Movement Logic
    let input = { x: 0, y: 0 };
    if (this.cursors.left.isDown || this.keys.A.isDown) input.x = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) input.x = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) input.y = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) input.y = 1;

    // Normalize diagonal
    if (input.x !== 0 && input.y !== 0) {
      input.x *= 0.707;
      input.y *= 0.707;
    }

    const dt = delta / 1000; // Delta in seconds

    // Apply Physics (X)
    if (input.x !== 0) {
      let changingDirection = (input.x > 0 && this.velocity.x < 0) || (input.x < 0 && this.velocity.x > 0);
      if (changingDirection) {
        this.velocity.x = this.moveTowards(this.velocity.x, input.x * this.MAX_SPEED, this.TURN_SPEED * dt);
      } else {
        this.velocity.x = this.moveTowards(this.velocity.x, input.x * this.MAX_SPEED, this.ACCELERATION * dt);
      }
    } else {
      this.velocity.x = this.moveTowards(this.velocity.x, 0, this.FRICTION * dt);
    }

    // Apply Physics (Y)
    if (input.y !== 0) {
      let changingDirection = (input.y > 0 && this.velocity.y < 0) || (input.y < 0 && this.velocity.y > 0);
      if (changingDirection) {
        this.velocity.y = this.moveTowards(this.velocity.y, input.y * this.MAX_SPEED, this.TURN_SPEED * dt);
      } else {
        this.velocity.y = this.moveTowards(this.velocity.y, input.y * this.MAX_SPEED, this.ACCELERATION * dt);
      }
    } else {
      this.velocity.y = this.moveTowards(this.velocity.y, 0, this.FRICTION * dt);
    }

    // Sabbath Penalty for movement
    if ((input.x !== 0 || input.y !== 0) && this.state.isSabbath) {
      // Reduce faith slowly if moving on Sabbath
      if (Math.random() < 0.05) {
        this.state.faith -= 1;
        this.createParts(this.player.x, this.player.y, "red", 1);
      }
    }
  }

  moveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) return target;
    return current + Math.sign(target - current) * maxDelta;
  }

  checkCollision(x, y) {
    // Check 4 corners of the player (assuming 20x20 hitbox centered at x+20, y+20)
    // Player sprite is 40x40.
    // Hitbox: x+10, y+10, w=20, h=20
    // This allows "cutting corners" by 10px on each side
    const points = [
      { x: x + 10, y: y + 10 },
      { x: x + 30, y: y + 10 },
      { x: x + 10, y: y + 30 },
      { x: x + 30, y: y + 30 }
    ];

    for (let p of points) {
      let gx = Math.floor(p.x / 40);
      let gy = Math.floor(p.y / 40);

      // Bounds check
      if (gx < 0 || gx >= this.GRID_W || gy < 0 || gy >= this.GRID_H) return true;

      // Wall check
      if (this.map[gy][gx] === 1) return true;
    }
    return false;
  }

  checkEntityInteractions() {
    // Distance check for interactions
    // Player center
    let px = this.player.x + 20;
    let py = this.player.y + 20;

    for (let i = this.entities.length - 1; i >= 0; i--) {
      let e = this.entities[i];
      let ex = e.x * 40 + 20;
      let ey = e.y * 40 + 20;

      if (Phaser.Math.Distance.Between(px, py, ex, ey) < 30) {
        // Interact
        if (e.type === "lamp") {
          this.state.lamps++;
          if (e.sprite) e.sprite.destroy();
          this.entities.splice(i, 1);
          this.createParts(this.player.x, this.player.y, "gold", 10);
          showMessage("¡Encontraste una lámpara! +1");
        } else if (e.type === "fruit") {
          this.state.faith = Math.min(100, this.state.faith + 20);
          if (e.sprite) e.sprite.destroy();
          this.entities.splice(i, 1);
          showMessage("¡Fruta espiritual! +20 Fe");
        } else if (e.type === "scroll") {
          if (e.sprite) e.sprite.destroy();
          this.entities.splice(i, 1);
          this.startQuiz();
          showMessage("Pergamino de doctrina encontrado");
        }
      }
    }

    // Check Exit
    let exitX = (this.GRID_W - 2) * 40 + 20;
    let exitY = (this.GRID_H - 2) * 40 + 20;
    if (Phaser.Math.Distance.Between(px, py, exitX, exitY) < 30) {
      if (this.state.lamps >= this.state.lampsNeeded) this.nextLevel();
      else {
        // Only show message occasionally or push back?
        // Just show message if close
        // showMessage(`Necesitas ${this.state.lampsNeeded - this.state.lamps} lámparas.`);
      }
    }
  }



  drawFog() {
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;
    // Player is already in pixels
    const px = this.player.x + 20; // Center
    const py = this.player.y + 20; // Center

    if (this.fogSprite) {
      this.fogSprite.x = px;
      this.fogSprite.y = py;
      // Base radius 80px (2 blocks) + 40px per lamp
      const targetRadius = 80 + (this.state.lamps * 40);
      // Texture has clear radius of 100px (0.1 * 1000)
      // So scale = targetRadius / 100
      const scale = targetRadius / 100;
      this.fogSprite.setScale(scale);
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
        x: x + 20, y: y + 20, // Already in pixels, just center
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        life: 1, c: c,
      });
    }
  }

  drawParticles() {
    this.particles.forEach((p) => {
      this.graphics.fillStyle(p.c === "gold" ? 0xffd700 : 0xff0000);
      this.graphics.fillRect(p.x, p.y, 4, 4);
    });
  }

  endGame(win) {
    this.state.mode = "MENU";
    document.getElementById("end-modal").style.display = "block";
    document.getElementById("end-title").innerText = win ? "¡VICTORIA!" : "FE AGOTADA";
    document.getElementById("end-msg").innerText = win ? "Has llegado a la Tierra Nueva." : "Inténtalo de nuevo.";
  }

  peregrinoStart() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("end-modal").style.display = "none";
    this.state.faith = 100;
    this.state.level = 1;
    this.state.lamps = 0;
    this.state.dayTime = 40;
    this.state.dayIndex = 5;

    if (this.playerSprite) this.playerSprite.destroy();
    this.playerSprite = this.add.sprite(0, 0, 'player').setOrigin(0);
    this.playerSprite.setDepth(101); // Ensure player is always visible above fog

    if (this.fogSprite) this.fogSprite.destroy();
    this.fogSprite = this.add.image(0, 0, 'fog');
    this.fogSprite.setDepth(100);
    this.fogSprite.setOrigin(0.5);

    this.generateMap();
    this.state.mode = "PLAY";
  }

  peregrinoReset() {
    this.peregrinoStart();
  }
}

// Message system
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
  }, 4500); // Increased to 4.5 seconds
}

function hideMessage() {
  const overlay = document.getElementById("message-overlay");
  overlay.style.display = "none";
  isMessageVisible = false;
}

// Export for use in main.js
window.PeregrinoScene = PeregrinoScene;
