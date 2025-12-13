// Noé y el Arca - Main Game Engine

class Game {
    constructor() {
        console.log('[GAME] Initializing Noé y el Arca...');

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;

        // Game state
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.missedAnimals = 0;
        this.maxMissed = 5;

        // Entities
        this.player = new Player();
        this.ark = new Ark();
        this.animals = [];
        this.rainbows = [];
        this.raindrops = [];
        this.floatingTexts = [];
        this.animalCounter = new AnimalCounter();

        // Timing
        this.lastAnimalSpawn = 0;
        this.spawnInterval = CONFIG.animals.spawnInterval;
        this.frameCount = 0;
        this.speedMultiplier = 1;

        // Initialize rain
        for (let i = 0; i < CONFIG.rain.dropCount; i++) {
            this.raindrops.push(new Raindrop());
        }

        // Setup input
        this.setupInput();

        // Show menu
        this.showMenu();

        console.log('[GAME] Initialization complete');
    }

    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.player.movingLeft = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.player.movingRight = true;
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleAction();
            }
            if (e.code === 'Escape' && this.state === 'PLAYING') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.player.movingLeft = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.player.movingRight = false;
            }
        });

        // Touch controls
        const leftBtn = document.getElementById('btn-left');
        const rightBtn = document.getElementById('btn-right');

        if (leftBtn && rightBtn) {
            // Left button
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.player.movingLeft = true;
            });
            leftBtn.addEventListener('touchend', () => {
                this.player.movingLeft = false;
            });
            leftBtn.addEventListener('mousedown', () => {
                this.player.movingLeft = true;
            });
            leftBtn.addEventListener('mouseup', () => {
                this.player.movingLeft = false;
            });

            // Right button
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.player.movingRight = true;
            });
            rightBtn.addEventListener('touchend', () => {
                this.player.movingRight = false;
            });
            rightBtn.addEventListener('mousedown', () => {
                this.player.movingRight = true;
            });
            rightBtn.addEventListener('mouseup', () => {
                this.player.movingRight = false;
            });
        }
    }

    handleAction() {
        audioManager.resume();

        if (this.state === 'MENU') {
            this.startGame();
        } else if (this.state === 'GAMEOVER') {
            this.resetGame();
        }
    }

    startGame() {
        this.state = 'PLAYING';
        this.hideMenu();
        this.hideGameOver();

        // Initialize audio
        if (!audioManager.initialized) {
            audioManager.init();
        }
        audioManager.startMusic();

        // Start game loop
        this.gameLoop();
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.missedAnimals = 0;
        this.speedMultiplier = 1;
        this.spawnInterval = CONFIG.animals.spawnInterval;
        this.animals = [];
        this.rainbows = [];
        this.floatingTexts = [];
        this.animalCounter.reset();
        this.player.reset();

        this.startGame();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            audioManager.stopMusic();
            this.showPause();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            audioManager.startMusic();
            this.hidePause();
            this.gameLoop();
        }
    }

    gameLoop() {
        if (this.state !== 'PLAYING') return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.frameCount++;

        // Update player
        this.player.update();

        // Update ark
        this.ark.update();

        // Update rain
        this.raindrops.forEach(drop => drop.update());

        // Spawn animals
        const now = Date.now();
        if (now - this.lastAnimalSpawn > this.spawnInterval) {
            this.spawnAnimal();
            this.lastAnimalSpawn = now;
        }

        // Spawn rainbow occasionally
        if (Math.random() < CONFIG.rainbow.spawnChance / 100) {
            this.rainbows.push(new Rainbow());
        }

        // Update animals
        this.animals.forEach(animal => {
            animal.update(this.speedMultiplier);

            // Check collision with player
            if (animal.collidesWith(this.player)) {
                const points = animal.catch();
                const bonus = this.animalCounter.addAnimal(animal.type);
                this.addScore(points + bonus, animal.x + animal.size / 2, animal.y);
            }
        });

        // Check for missed animals
        this.animals.forEach(animal => {
            if (animal.missed && !animal.counted) {
                animal.counted = true;
                this.missedAnimals++;
                audioManager.playMiss();

                if (this.missedAnimals >= this.maxMissed) {
                    this.gameOver();
                }
            }
        });

        // Update rainbows
        this.rainbows.forEach(rainbow => {
            rainbow.update(this.speedMultiplier);

            if (rainbow.collidesWith(this.player)) {
                const points = rainbow.catch();
                this.addScore(points, rainbow.x + rainbow.size / 2, rainbow.y, '#00ff88');
            }
        });

        // Update floating texts
        this.floatingTexts.forEach(text => text.update());

        // Cleanup
        this.animals = this.animals.filter(a => !a.caught && !a.missed);
        this.rainbows = this.rainbows.filter(r => !r.isOffScreen());
        this.floatingTexts = this.floatingTexts.filter(t => !t.isDead());

        // Update difficulty
        this.updateDifficulty();
    }

    spawnAnimal() {
        this.animals.push(new Animal());
    }

    addScore(points, x, y, color = '#ffd700') {
        this.score += points;

        // Floating text
        this.floatingTexts.push(new FloatingText(x, y, `+${points}`, color));

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Check level up
        const newLevel = Math.floor(this.score / CONFIG.scoring.levelThreshold) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            audioManager.playLevelUp();
            this.floatingTexts.push(new FloatingText(
                CONFIG.canvas.width / 2,
                CONFIG.canvas.height / 2,
                `¡NIVEL ${this.level}!`,
                '#00ffff'
            ));
        }
    }

    updateDifficulty() {
        // Increase speed
        this.speedMultiplier = 1 + (this.score * CONFIG.difficulty.speedIncrement);

        // Decrease spawn interval
        this.spawnInterval = Math.max(
            CONFIG.animals.minSpawnInterval,
            CONFIG.animals.spawnInterval - (this.level * CONFIG.difficulty.spawnDecrease * 10)
        );
    }

    draw() {
        // Background gradient (stormy sky)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw rain (background layer)
        this.raindrops.forEach(drop => drop.draw(this.ctx));

        // Draw ark
        this.ark.draw(this.ctx);

        // Draw animals
        this.animals.forEach(animal => animal.draw(this.ctx));

        // Draw rainbows
        this.rainbows.forEach(rainbow => rainbow.draw(this.ctx));

        // Draw player
        this.player.draw(this.ctx);

        // Draw floating texts
        this.floatingTexts.forEach(text => text.draw(this.ctx));

        // Draw animal counter
        this.animalCounter.draw(this.ctx, 10, 120);

        // Update HUD
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;
        document.getElementById('missed').textContent = `${this.missedAnimals}/${this.maxMissed}`;
    }

    showMenu() {
        document.getElementById('menu-overlay').classList.add('active');
        document.getElementById('menu-high-score').textContent = this.highScore;
    }

    hideMenu() {
        document.getElementById('menu-overlay').classList.remove('active');
    }

    showPause() {
        document.getElementById('pause-overlay').classList.add('active');
    }

    hidePause() {
        document.getElementById('pause-overlay').classList.remove('active');
    }

    gameOver() {
        this.state = 'GAMEOVER';
        audioManager.stopMusic();
        audioManager.playGameOver();

        document.getElementById('gameover-overlay').classList.add('active');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('gameover-high-score').textContent = this.highScore;
        document.getElementById('animals-saved').textContent = this.animalCounter.pairs * 2;

        if (this.score >= this.highScore && this.score > 0) {
            document.getElementById('new-record-badge').classList.remove('hidden');
        } else {
            document.getElementById('new-record-badge').classList.add('hidden');
        }
    }

    hideGameOver() {
        document.getElementById('gameover-overlay').classList.remove('active');
    }

    loadHighScore() {
        const saved = localStorage.getItem('noeHighScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('noeHighScore', this.highScore.toString());
    }
}

// Control functions
function toggleMute() {
    const isMuted = audioManager.toggleMute();
    const btn = document.getElementById('mute-btn');
    btn.textContent = isMuted ? '🔇 Sonido' : '🔊 Sonido';
}

function goBack() {
    window.location.href = '../../index.html';
}

// Initialize game
let game;

window.addEventListener('load', () => {
    console.log('[INIT] Page loaded');

    audioManager.init();
    game = new Game();

    // Draw initial frame
    game.draw();

    console.log('[INIT] Game ready!');
});
