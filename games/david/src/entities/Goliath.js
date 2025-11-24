import * as THREE from 'three';

export class Goliath {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.setupMesh();

        this.mesh.position.set(0, 0, -40); // Start far away
        this.scene.add(this.mesh);

        this.health = 3;
        this.isDead = false;
    }

    setupMesh() {
        // Simple composed mesh for Goliath
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Bronze armor color
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Skin

        // Legs
        const legGeo = new THREE.BoxGeometry(1, 4, 1);
        const leftLeg = new THREE.Mesh(legGeo, material);
        leftLeg.position.set(-1, 2, 0);
        const rightLeg = new THREE.Mesh(legGeo, material);
        rightLeg.position.set(1, 2, 0);

        // Body
        const bodyGeo = new THREE.BoxGeometry(3.5, 4, 1.5);
        const body = new THREE.Mesh(bodyGeo, material);
        body.position.set(0, 6, 0);

        // Head (Hitbox)
        const headGeo = new THREE.BoxGeometry(1.2, 1.5, 1.2);
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.set(0, 8.75, 0);

        // Arms
        const armGeo = new THREE.BoxGeometry(1, 3.5, 1);
        const leftArm = new THREE.Mesh(armGeo, material);
        leftArm.position.set(-2.5, 6, 0);
        const rightArm = new THREE.Mesh(armGeo, material);
        rightArm.position.set(2.5, 6, 0);

        // Spear
        const spearShaftGeo = new THREE.CylinderGeometry(0.1, 0.1, 10);
        const spearShaft = new THREE.Mesh(spearShaftGeo, new THREE.MeshStandardMaterial({ color: 0x654321 }));
        spearShaft.rotation.x = Math.PI / 2;
        spearShaft.position.set(2.5, 5, 2);

        this.mesh.add(leftLeg, rightLeg, body, this.head, leftArm, rightArm, spearShaft);

        // Shadow
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    reset() {
        this.mesh.position.set(0, 0, -40);
        this.mesh.rotation.set(0, 0, 0);
        this.isDead = false;
        this.mesh.visible = true;
    }

    update(dt, playerPos) {
        if (this.isDead) return;

        // Look at player (only Y axis)
        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPos, this.mesh.position)
            .setY(0) // Keep on ground
            .normalize();

        const distance = this.mesh.position.distanceTo(playerPos);
        const speed = 2.5; // Goliath walking speed
        const minDistance = 5; // Stop when close enough to attack

        if (distance > minDistance) {
            this.mesh.position.add(direction.multiplyScalar(speed * dt));
        }

        // Simple bobbing animation (walking)
        this.mesh.position.y = Math.sin(performance.now() * 0.005) * 0.2;
    }

    checkHit(position) {
        // Simple bounding box check for head
        // Head is at local (0, 8.75, 0) relative to mesh
        // Mesh is at this.mesh.position

        const headWorldPos = new THREE.Vector3();
        this.head.getWorldPosition(headWorldPos);

        const distance = position.distanceTo(headWorldPos);

        // Head radius approx 1.0
        if (distance < 1.5) {
            this.takeDamage();
            return true;
        }
        return false;
    }

    takeDamage() {
        this.health--;

        // Flash red
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0.5;
            }
        });

        // Reset color after 200ms
        setTimeout(() => {
            if (!this.isDead) {
                this.mesh.traverse(child => {
                    if (child.isMesh) {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                });
            }
        }, 200);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        // Fall over animation
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = 1;
    }
}
