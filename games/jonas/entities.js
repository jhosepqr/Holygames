// Jonás y la Ballena - Game Entities

// ============= PLAYER CLASS =============
class Player {
    constructor() {
        this.x = CONFIG.player.x;
        this.y = CONFIG.player.startY;
        this.velocityY = 0;
        this.size = CONFIG.player.size;
        this.rotation = 0;
        this.alive = true;
    }

    swim() {
        this.velocityY = CONFIG.player.swimForce;
        audioManager.playSwim();
    }

    update() {
        // Apply gravity
        this.velocityY += CONFIG.player.gravity;

        // Limit velocity
        this.velocityY = Math.max(
            -CONFIG.player.maxVelocityY,
            Math.min(CONFIG.player.maxVelocityY, this.velocityY)
        );

        // Update position
        this.y += this.velocityY;

        // Update rotation based on velocity
        const targetRotation = this.velocityY * CONFIG.player.rotationSpeed;
        this.rotation += (targetRotation - this.rotation) * 0.2;

        // Check boundaries
        if (this.y - this.size / 2 < 0 || this.y + this.size / 2 > CONFIG.canvas.height) {
            this.alive = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Rotate based on velocity + 90 degrees to make him horizontal (swimming forward)
        ctx.rotate(this.rotation + Math.PI / 2);

        // Draw player as a small swimming human (Jonás)
        const headSize = this.size * 0.3;
        const bodyWidth = this.size * 0.25;
        const bodyHeight = this.size * 0.4;

        // Skin color
        ctx.fillStyle = '#FFDBAC';

        // Head (circle) - Now "top" is right because of rotation
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, headSize, 0, Math.PI * 2);
        ctx.fill();

        // Face details (Eyes)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-headSize * 0.3, -this.size * 0.35, headSize * 0.15, 0, Math.PI * 2);
        ctx.arc(headSize * 0.3, -this.size * 0.35, headSize * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Body (tunic/robe)
        ctx.fillStyle = CONFIG.player.color; // Orange/brown tunic
        ctx.fillRect(-bodyWidth, -this.size * 0.05, bodyWidth * 2, bodyHeight);

        // Arms (360 degree swimming animation - Freestyle/Crawl)
        const swimCycle = Date.now() / 150; // Speed of rotation

        ctx.strokeStyle = '#FFDBAC';
        ctx.lineWidth = this.size * 0.12;
        ctx.lineCap = 'round';

        // Shoulder position (approximate)
        const shoulderY = -this.size * 0.05;
        const shoulderX_Left = -bodyWidth;
        const shoulderX_Right = bodyWidth;
        const armLength = this.size * 0.4;

        // Right arm (Front crawl)
        ctx.beginPath();
        ctx.moveTo(bodyWidth, shoulderY);
        // Calculate end point based on circular motion
        const rightArmAngle = swimCycle;
        ctx.lineTo(
            bodyWidth + Math.cos(rightArmAngle) * armLength,
            shoulderY + Math.sin(rightArmAngle) * armLength
        );
        ctx.stroke();

        // Left arm (Front crawl - offset by 180 degrees/PI)
        ctx.beginPath();
        ctx.moveTo(-bodyWidth, shoulderY);
        const leftArmAngle = swimCycle + Math.PI;
        ctx.lineTo(
            -bodyWidth + Math.cos(leftArmAngle) * armLength,
            shoulderY + Math.sin(leftArmAngle) * armLength
        );
        ctx.stroke();

        // Legs (kicking animation)
        const legKick = Math.cos(swimCycle * 2) * 0.2; // Faster kick

        ctx.beginPath();
        ctx.moveTo(-bodyWidth * 0.3, bodyHeight - this.size * 0.05);
        ctx.lineTo(-bodyWidth * 0.5, bodyHeight + this.size * 0.2 + legKick * this.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bodyWidth * 0.3, bodyHeight - this.size * 0.05);
        ctx.lineTo(bodyWidth * 0.5, bodyHeight + this.size * 0.15 - legKick * this.size);
        ctx.stroke();

        ctx.restore();
    }

    getBounds() {
        return {
            left: this.x - this.size / 2,
            right: this.x + this.size / 2,
            top: this.y - this.size / 2,
            bottom: this.y + this.size / 2
        };
    }

    reset() {
        this.y = CONFIG.player.startY;
        this.velocityY = 0;
        this.rotation = 0;
        this.alive = true;
    }
}

// ============= OBSTACLE CLASS =============
class Obstacle {
    constructor(x) {
        this.x = x;
        this.width = CONFIG.obstacles.width;

        // Random gap size and position
        const gapSize = CONFIG.obstacles.minGap +
            Math.random() * (CONFIG.obstacles.maxGap - CONFIG.obstacles.minGap);

        const gapY = gapSize / 2 + Math.random() * (CONFIG.canvas.height - gapSize);

        this.gapTop = gapY - gapSize / 2;
        this.gapBottom = gapY + gapSize / 2;

        this.passed = false;
        this.speed = CONFIG.obstacles.speed;
    }

    update(gameSpeed) {
        this.x -= gameSpeed;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradient.addColorStop(0, CONFIG.obstacles.color);
        gradient.addColorStop(0.5, '#34495E');
        gradient.addColorStop(1, CONFIG.obstacles.color);

        ctx.fillStyle = gradient;

        // Top obstacle (coral/rock)
        this.drawCoral(ctx, this.x, 0, this.width, this.gapTop);

        // Bottom obstacle
        this.drawCoral(ctx, this.x, this.gapBottom, this.width, CONFIG.canvas.height - this.gapBottom);
    }

    drawCoral(ctx, x, y, width, height) {
        ctx.fillRect(x, y, width, height);

        // Add some texture
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + width * 0.3, y + height * (i + 1) / 4);
            ctx.lineTo(x + width * 0.7, y + height * (i + 1) / 4);
            ctx.stroke();
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        const pb = player.getBounds();

        // Check if player is horizontally aligned with obstacle
        if (pb.right > this.x && pb.left < this.x + this.width) {
            // Check if player hits top or bottom obstacle
            if (pb.top < this.gapTop || pb.bottom > this.gapBottom) {
                return true;
            }
        }

        return false;
    }

    isPassed(player) {
        if (!this.passed && player.x > this.x + this.width) {
            this.passed = true;
            return true;
        }
        return false;
    }
}

// ============= COLLECTIBLE CLASS =============
class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'fish' or 'scroll'
        this.size = CONFIG.collectibles.size;
        this.collected = false;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
    }

    update(gameSpeed) {
        this.x -= gameSpeed;
        this.floatOffset += this.floatSpeed;
    }

    draw(ctx) {
        const floatY = this.y + Math.sin(this.floatOffset) * 10;

        const config = CONFIG.collectibles.types[this.type];

        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, floatY, 0, this.x, floatY, this.size);
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(0.5, config.color + '80');
        gradient.addColorStop(1, config.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, floatY, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji
        ctx.font = `${this.size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.emoji, this.x, floatY);
    }

    isOffScreen() {
        return this.x + this.size < 0;
    }

    collidesWith(player) {
        if (this.collected) return false;

        const pb = player.getBounds();
        const distance = Math.sqrt(
            Math.pow(player.x - this.x, 2) +
            Math.pow(player.y - this.y, 2)
        );

        return distance < (player.size / 2 + this.size);
    }

    collect() {
        this.collected = true;
        const config = CONFIG.collectibles.types[this.type];
        audioManager.playCollect(config.points);
        return config.points;
    }
}

// ============= PARTICLE SYSTEM =============
class BubbleParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * CONFIG.canvas.width;
        this.y = CONFIG.canvas.height + Math.random() * 100;
        this.size = 2 + Math.random() * CONFIG.particles.bubbles.maxSize;
        this.speed = CONFIG.particles.bubbles.speed * (0.5 + Math.random() * 0.5);
        this.opacity = 0.2 + Math.random() * 0.3;
    }

    update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y * 0.01) * 0.5;

        if (this.y < -10) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(173, 216, 230, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============= WHALE (Background Element) =============
class Whale {
    constructor() {
        this.x = CONFIG.whale.x;
        this.y = CONFIG.whale.y;
        this.size = CONFIG.whale.size;
        this.pulse = 0;
    }

    update() {
        this.pulse += CONFIG.whale.pulseSpeed;
    }

    draw(ctx) {
        const scale = 1 + Math.sin(this.pulse) * 0.1;

        ctx.save();
        ctx.globalAlpha = 0.6; // More visible!
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        // Simple whale shape
        ctx.fillStyle = CONFIG.whale.color;

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-this.size * 1.2, 0);
        ctx.lineTo(-this.size * 1.6, -this.size * 0.4);
        ctx.lineTo(-this.size * 1.6, this.size * 0.4);
        ctx.closePath();
        ctx.fill();

        // Eye (menacing!)
        ctx.fillStyle = 'rgba(255, 50, 50, 0.8)'; // Red eye for threat
        ctx.beginPath();
        ctx.arc(this.size * 0.7, -this.size * 0.2, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.size * 0.75, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    moveCloser(progress) {
        // Whale chases player more aggressively!
        // Starts at -50 (partially visible), moves to +100 over time
        this.x = -50 + Math.min(progress * 4, 150);
        // Move up/down slightly to follow player
        this.y = CONFIG.whale.y + (Math.sin(this.pulse * 0.5) * 30);
    }
}
