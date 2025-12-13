// Noé y el Arca - Game Entities

// Player (Noé)
class Player {
    constructor() {
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.x = CONFIG.player.startX - this.width / 2;
        this.y = CONFIG.player.startY;
        this.speed = CONFIG.player.speed;
        this.emoji = '👨‍🌾';

        // Movement state
        this.movingLeft = false;
        this.movingRight = false;
    }

    update() {
        if (this.movingLeft) {
            this.x -= this.speed;
        }
        if (this.movingRight) {
            this.x += this.speed;
        }

        // Keep within bounds
        this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.width, this.x));
    }

    draw(ctx) {
        // Draw Noé emoji
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2);

        // Draw catch zone indicator
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.x = CONFIG.player.startX - this.width / 2;
        this.movingLeft = false;
        this.movingRight = false;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Animal class
class Animal {
    constructor() {
        const randomType = CONFIG.animals.types[Math.floor(Math.random() * CONFIG.animals.types.length)];

        this.type = randomType.name;
        this.emoji = randomType.emoji;
        this.points = randomType.points;
        this.baseSpeed = randomType.speed;

        this.size = CONFIG.animals.size;
        this.x = Math.random() * (CONFIG.canvas.width - this.size);
        this.y = -this.size;
        this.speed = this.baseSpeed;

        this.caught = false;
        this.missed = false;

        // Slight horizontal wobble
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05;
    }

    update(speedMultiplier = 1) {
        this.y += this.speed * speedMultiplier;

        // Wobble effect
        this.wobbleOffset += this.wobbleSpeed;
        this.x += Math.sin(this.wobbleOffset) * 0.5;

        // Keep within horizontal bounds
        this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.size, this.x));

        // Check if missed (fell below screen)
        if (this.y > CONFIG.canvas.height) {
            this.missed = true;
        }
    }

    draw(ctx) {
        if (this.caught) return;

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.size / 2, this.y + this.size / 2);
    }

    collidesWith(player) {
        if (this.caught) return false;

        const bounds = player.getBounds();
        return (
            this.x < bounds.x + bounds.width &&
            this.x + this.size > bounds.x &&
            this.y < bounds.y + bounds.height &&
            this.y + this.size > bounds.y
        );
    }

    catch() {
        this.caught = true;
        audioManager.playCollect(this.points);
        return this.points;
    }
}

// Rainbow bonus
class Rainbow {
    constructor() {
        this.emoji = CONFIG.rainbow.emoji;
        this.points = CONFIG.rainbow.points;
        this.size = 60;
        this.x = Math.random() * (CONFIG.canvas.width - this.size);
        this.y = -this.size;
        this.speed = CONFIG.rainbow.speed;
        this.caught = false;

        // Float effect
        this.floatOffset = 0;
    }

    update(speedMultiplier = 1) {
        this.y += this.speed * speedMultiplier;
        this.floatOffset += 0.1;
        this.x += Math.sin(this.floatOffset) * 2;

        this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.size, this.x));
    }

    draw(ctx) {
        if (this.caught) return;

        // Glow effect
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 20;

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.size / 2, this.y + this.size / 2);

        ctx.shadowBlur = 0;
    }

    collidesWith(player) {
        if (this.caught) return false;

        const bounds = player.getBounds();
        return (
            this.x < bounds.x + bounds.width &&
            this.x + this.size > bounds.x &&
            this.y < bounds.y + bounds.height &&
            this.y + this.size > bounds.y
        );
    }

    catch() {
        this.caught = true;
        audioManager.playRainbow();
        return this.points;
    }

    isOffScreen() {
        return this.y > CONFIG.canvas.height || this.caught;
    }
}

// Rain particle
class Raindrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * CONFIG.canvas.width;
        this.y = Math.random() * -100;
        this.speed = CONFIG.rain.minSpeed + Math.random() * (CONFIG.rain.maxSpeed - CONFIG.rain.minSpeed);
        this.length = 10 + Math.random() * 15;
        this.opacity = 0.3 + Math.random() * 0.4;
    }

    update() {
        this.y += this.speed;
        this.x -= 1; // Slight wind effect

        if (this.y > CONFIG.canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 150, 255, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 2, this.y + this.length);
        ctx.stroke();
    }
}

// Ark (background decoration and catch indicator)
class Ark {
    constructor() {
        this.emoji = '🚢';
        this.width = CONFIG.ark.width;
        this.height = CONFIG.ark.height;
        this.x = CONFIG.canvas.width / 2 - this.width / 2;
        this.y = CONFIG.canvas.height - this.height - 20;

        // Bobbing animation
        this.bobOffset = 0;
    }

    update() {
        this.bobOffset += 0.03;
    }

    draw(ctx) {
        const bobY = Math.sin(this.bobOffset) * 3;

        // Draw ark
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2 + bobY);
    }
}

// Caught animal counter display
class AnimalCounter {
    constructor() {
        this.counts = {};
        CONFIG.animals.types.forEach(type => {
            this.counts[type.name] = 0;
        });
        this.pairs = 0;
    }

    addAnimal(typeName) {
        if (this.counts[typeName] !== undefined) {
            this.counts[typeName]++;

            // Check for pair bonus
            if (this.counts[typeName] % 2 === 0) {
                this.pairs++;
                audioManager.playPairBonus();
                return CONFIG.scoring.pairBonus;
            }
        }
        return 0;
    }

    reset() {
        Object.keys(this.counts).forEach(key => {
            this.counts[key] = 0;
        });
        this.pairs = 0;
    }

    draw(ctx, x, y) {
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'left';

        let offsetY = 0;
        Object.entries(this.counts).forEach(([name, count]) => {
            if (count > 0) {
                const type = CONFIG.animals.types.find(t => t.name === name);
                ctx.fillText(`${type.emoji} x${count}`, x, y + offsetY);
                offsetY += 20;
            }
        });

        if (this.pairs > 0) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`Parejas: ${this.pairs}`, x, y + offsetY);
        }
    }
}

// Floating text for points
class FloatingText {
    constructor(x, y, text, color = '#ffd700') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.opacity = 1;
        this.life = 60; // frames
    }

    update() {
        this.y -= 1.5;
        this.life--;
        this.opacity = this.life / 60;
    }

    draw(ctx) {
        ctx.font = 'bold 24px Orbitron';
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}
