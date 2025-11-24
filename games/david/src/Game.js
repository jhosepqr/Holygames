import * as THREE from 'three';
import { World } from './World.js';
import { Input } from './Input.js';
import { Player } from './entities/Player.js';
import { Goliath } from './entities/Goliath.js';
import { CollectableStone } from './entities/CollectableStone.js';
import { Audio } from './Audio.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');

        // Three.js Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Game State
        this.state = 'MENU'; // MENU, PLAYING, WON, LOST
        this.clock = new THREE.Clock();

        // Components
        this.world = new World(this.scene);
        this.input = new Input(this.container);
        this.audio = new Audio();

        // Entities
        this.player = new Player(this.camera, this.input, this.audio);
        this.goliath = new Goliath(this.scene);
        this.stones = []; // Collectable stones

        // UI Elements
        this.ui = {
            messageOverlay: document.getElementById('message-overlay'),
            messageTitle: document.getElementById('message-title'),
            messageSubtitle: document.getElementById('message-subtitle'),
            restartBtn: document.getElementById('restart-btn'),
            powerBar: document.getElementById('power-bar'),
            ammoCount: document.getElementById('ammo-count'),
            goliathHealthBar: document.getElementById('goliath-health-bar')
        };

        this.setupUI();
    }

    setupUI() {
        this.ui.restartBtn.addEventListener('click', () => this.reset());

        // Lock pointer on click to start
        this.container.addEventListener('click', () => {
            if (this.state === 'MENU' || this.state === 'PLAYING') {
                this.input.lockPointer();
                if (this.state === 'MENU') {
                    this.state = 'PLAYING';
                    this.ui.messageOverlay.classList.add('hidden');
                }
            }
        });
    }

    start() {
        this.spawnStones();
        this.animate();
    }

    reset() {
        this.state = 'MENU';
        this.player.reset();
        this.goliath.reset();
        this.spawnStones();
        this.ui.messageOverlay.classList.add('hidden');
        this.input.lockPointer();
        this.state = 'PLAYING';
    }

    spawnStones() {
        // Clear existing
        this.stones.forEach(s => this.scene.remove(s.mesh));
        this.stones = [];

        // Spawn 10 random stones
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            const pos = new THREE.Vector3(x, 0.5, z);
            this.stones.push(new CollectableStone(this.scene, pos));
        }
    }

    update() {
        const dt = this.clock.getDelta();

        if (this.state === 'PLAYING') {
            this.player.update(dt, this.scene);
            this.goliath.update(dt, this.player.position);

            // Update stones
            this.stones.forEach(s => s.update(dt));

            // Check collisions
            this.checkCollisions();

            // Update UI
            const charge = this.player.getCharge();
            this.ui.powerBar.style.width = `${charge * 100}%`;
            this.ui.ammoCount.innerText = this.player.ammo;

            const healthPercent = (this.goliath.health / 3) * 100;
            this.ui.goliathHealthBar.style.width = `${Math.max(0, healthPercent)}%`;
        }
    }

    checkCollisions() {
        // Check if stone hits Goliath
        const stone = this.player.stone;
        if (stone && stone.active) {
            if (this.goliath.checkHit(stone.mesh.position)) {
                stone.active = false; // Destroy stone on hit
                this.audio.play('hit'); // Play hit sound (if available)

                if (this.goliath.isDead) {
                    this.winGame();
                }
            } else if (stone.mesh.position.y < 0) {
                // Missed (hit ground)
                stone.active = false;
                this.audio.play('miss');
                // Goliath attacks back if missed?
                // For now, just let player try again
            }
        }

        // Check if Goliath hits player (simple distance check for now)
        if (this.goliath.mesh.position.distanceTo(this.player.position) < 2) {
            this.loseGame();
        }

        // Check stone collection
        for (let i = this.stones.length - 1; i >= 0; i--) {
            const stone = this.stones[i];
            if (stone.active && stone.mesh.position.distanceTo(this.player.position) < 2) {
                stone.collect();
                this.player.ammo++;
                this.stones.splice(i, 1);
                // Play pickup sound?
            }
        }
    }

    winGame() {
        this.state = 'WON';
        this.input.unlockPointer();
        this.ui.messageTitle.innerText = '¡VICTORIA!';
        this.ui.messageSubtitle.innerText = 'Has vencido al gigante con fe.';
        this.ui.messageOverlay.classList.remove('hidden');
        this.audio.play('win');
    }

    loseGame() {
        this.state = 'LOST';
        this.input.unlockPointer();
        this.ui.messageTitle.innerText = 'DERROTA';
        this.ui.messageSubtitle.innerText = 'Goliat te ha alcanzado.';
        this.ui.messageOverlay.classList.remove('hidden');
        this.audio.play('lose');
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
