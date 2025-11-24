import * as THREE from 'three';
import { Stone } from './Stone.js';

export class Player {
    constructor(camera, input, audio) {
        this.camera = camera;
        this.input = input;
        this.audio = audio;

        this.position = new THREE.Vector3(0, 1.7, 20); // Start position
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        this.camera.position.copy(this.position);

        // Sling mechanics
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.maxChargeTime = 2000; // ms
        this.stone = null;

        // Movement settings
        this.speed = 5;

        // Ammo
        this.ammo = 0;
    }

    reset() {
        this.position.set(0, 1.7, 20);
        this.rotation.set(0, 0, 0);
        this.camera.position.copy(this.position);
        this.camera.rotation.copy(this.rotation);
        this.isCharging = false;
        if (this.stone) {
            this.stone.destroy();
            this.stone = null;
        }
    }

    update(dt, scene) {
        this.handleMovement(dt);
        this.handleLook();
        this.handleSling(scene);

        if (this.stone) {
            this.stone.update(dt);
        }
    }

    handleMovement(dt) {
        const moveSpeed = this.speed * dt;
        const direction = new THREE.Vector3();

        if (this.input.keys.w) direction.z -= 1;
        if (this.input.keys.s) direction.z += 1;
        if (this.input.keys.a) direction.x -= 1;
        if (this.input.keys.d) direction.x += 1;

        direction.normalize();
        direction.applyEuler(new THREE.Euler(0, this.rotation.y, 0));

        this.position.add(direction.multiplyScalar(moveSpeed));

        // Clamp position (don't go too far)
        this.position.x = Math.max(-40, Math.min(40, this.position.x));
        this.position.z = Math.max(-30, Math.min(50, this.position.z)); // Allow going to -30 (closer to Goliath)

        this.camera.position.copy(this.position);
    }

    handleLook() {
        const sensitivity = 0.002;
        const { x, y } = this.input.getMovementDelta();

        this.rotation.y -= x * sensitivity;
        this.rotation.x -= y * sensitivity;

        // Clamp vertical look
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        this.camera.rotation.copy(this.rotation);
        this.input.resetMouseDelta();
    }

    handleSling(scene) {
        if (this.input.isMouseDown && !this.isCharging) {
            if (this.ammo > 0) {
                // Start charging
                this.isCharging = true;
                this.chargeStartTime = performance.now();
                this.audio.play('charge');
            } else {
                // Visual feedback for no ammo
                const ammoDisplay = document.getElementById('ammo-display');
                if (ammoDisplay) {
                    ammoDisplay.style.color = 'red';
                    ammoDisplay.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        ammoDisplay.style.color = 'white';
                        ammoDisplay.style.transform = 'scale(1)';
                    }, 200);
                }
            }
        } else if (!this.input.isMouseDown && this.isCharging) {
            // Fire
            this.isCharging = false;
            this.fire(scene);
        }
    }

    getCharge() {
        if (!this.isCharging) return 0;
        const elapsed = performance.now() - this.chargeStartTime;
        return Math.min(elapsed / this.maxChargeTime, 1);
    }

    fire(scene) {
        if (this.ammo <= 0) return;
        this.ammo--;

        const charge = this.getCharge();
        // Increased power: Base 25 (was 10) + Charge 60 (was 40)
        const force = 25 + (charge * 60);

        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const velocity = direction.multiplyScalar(force);

        // Remove old stone
        if (this.stone) this.stone.destroy();

        // Spawn new stone slightly in front of camera
        const spawnPos = this.position.clone().add(direction.clone().normalize().multiplyScalar(1));

        this.stone = new Stone(scene, spawnPos, velocity);
        this.audio.play('throw');
    }
}
