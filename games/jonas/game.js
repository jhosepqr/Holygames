// Jonás y la Ballena - Main Game Engine

class Game {
    constructor() {
        console.log('[GAME] Constructor started...');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;

        // Game state
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameSpeed = CONFIG.obstacles.speed;

        // Entities
        this.player = new Player();
        this.obstacles = [];
        this.collectibles = [];
        this.bubbles = [];
        this.whale = new Whale();

        // Timing
        this.lastObstacleX = CONFIG.canvas.width;
        this.frameCount = 0;

        // Initialize particles
        for (let i = 0; i < CONFIG.particles.bubbles.count; i++) {
            this.bubbles.push(new BubbleParticle());
        }

        // Input handling
        this.setupInput();

        // Start menu
        this.showMenu();

        console.log('[GAME] Constructor completed successfully');
    }

    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }

            if (e.code === 'Escape' && this.state === 'PLAYING') {
                this.togglePause();
            }
        });

        // Mouse/Touch
        this.canvas.addEventListener('click', () => {
            this.handleInput();
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
    }

    handleInput() {
        // Resume audio context on first interaction (mobile requirement)
        audioManager.resume();

        if (this.state === 'MENU') {
            this.startGame();
        } else if (this.state === 'PLAYING') {
            this.player.swim();
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

        // Start game loop
        this.gameLoop();
    }

    resetGame() {
        this.score = 0;
        this.gameSpeed = CONFIG.obstacles.speed;
        this.obstacles = [];
        this.collectibles = [];
        this.lastObstacleX = CONFIG.canvas.width;
        this.frameCount = 0;
        this.player.reset();

        this.startGame();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.showPause();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
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

        // Check if player died
        if (!this.player.alive) {
            this.gameOver();
            return;
        }

        // Update particles
        this.bubbles.forEach(bubble => bubble.update());

        // Update whale
        this.whale.update();
        this.whale.moveCloser(this.score);

        // Spawn obstacles - SIMPLIFIED SPAWN LOGIC
        // Check if we need to spawn a new obstacle
        const shouldSpawn = this.obstacles.length === 0 ||
            this.obstacles[this.obstacles.length - 1].x < CONFIG.canvas.width - CONFIG.obstacles.spacing;

        if (shouldSpawn) {
            const obstacle = new Obstacle(CONFIG.canvas.width);
            this.obstacles.push(obstacle);

            // Spawn collectible randomly
            if (Math.random() < CONFIG.collectibles.spawnChance) {
                const type = Math.random() < 0.8 ? 'fish' : 'scroll';
                const y = obstacle.gapTop + (obstacle.gapBottom - obstacle.gapTop) / 2;
                const collectible = new Collectible(CONFIG.canvas.width + 150, y, type);
                this.collectibles.push(collectible);
            }
        }

        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.update(this.gameSpeed);

            // Check collision
            if (obstacle.collidesWith(this.player)) {
                this.player.alive = false;
            }

            // Check if passed
            if (obstacle.isPassed(this.player)) {
                this.addScore(CONFIG.scoring.pointsPerObstacle);
            }
        });

        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update(this.gameSpeed);

            // Check collection
            if (collectible.collidesWith(this.player)) {
                const points = collectible.collect();
                this.addScore(points);
            }
        });

        // Remove off-screen obstacles and collectibles
        this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
        this.collectibles = this.collectibles.filter(c => !c.isOffScreen());

        // Update difficulty
        this.updateDifficulty();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.canvas.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001f3f');
        gradient.addColorStop(0.5, '#003f7f');
        gradient.addColorStop(1, '#001f3f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw whale (background)
        this.whale.draw(this.ctx);

        // Draw bubbles
        this.bubbles.forEach(bubble => bubble.draw(this.ctx));

        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

        // Draw collectibles
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                collectible.draw(this.ctx);
            }
        });

        // Draw player
        this.player.draw(this.ctx);

        // Update HUD
        this.updateHUD();
    }

    addScore(points) {
        this.score += points;

        // Check for milestone
        if (this.score % 50 === 0 && this.score > 0) {
            audioManager.playMilestone();
        }

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    updateDifficulty() {
        // Increase speed based on score
        const targetSpeed = CONFIG.obstacles.speed +
            Math.floor(this.score / CONFIG.scoring.difficultyStep) * CONFIG.obstacles.speedIncrement;

        this.gameSpeed = Math.min(targetSpeed, CONFIG.obstacles.maxSpeed);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
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
        audioManager.playHit();

        // Show game over screen
        document.getElementById('gameover-overlay').classList.add('active');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('gameover-high-score').textContent = this.highScore;

        // Check if new high score
        if (this.score >= this.highScore) {
            document.getElementById('new-high-score-badge').classList.remove('hidden');
        } else {
            document.getElementById('new-high-score-badge').classList.add('hidden');
        }
    }

    hideGameOver() {
        document.getElementById('gameover-overlay').classList.remove('active');
    }

    loadHighScore() {
        const saved = localStorage.getItem('jonasHighScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('jonasHighScore', this.highScore.toString());
    }
}

// Audio controls
function toggleMute() {
    const isMuted = audioManager.toggleMute();
    const btn = document.getElementById('mute-btn');
    btn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
}

function goBack() {
    window.location.href = '../../index.html';
}

// Initialize game when page loads
let game;

window.addEventListener('load', () => {
    console.log('[INIT] Page loaded, initializing...');

    // Initialize audio manager
    audioManager.init();

    console.log('[INIT] Creating game instance...');
    // Create game instance
    game = new Game();

    console.log('[INIT] Drawing initial frame...');
    // Draw initial frame
    try {
        game.draw();
        console.log('[INIT] Game initialized successfully!');
    } catch (error) {
        console.error('[INIT] Error drawing initial frame:', error);
    }
});
