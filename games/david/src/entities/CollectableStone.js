import * as THREE from 'three';

export class CollectableStone {
    constructor(scene, position) {
        this.scene = scene;
        this.active = true;

        // Visual mesh
        const geometry = new THREE.DodecahedronGeometry(0.3, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);

        // Bobbing offset
        this.randomOffset = Math.random() * 100;
    }

    update(dt) {
        if (!this.active) return;

        // Float and rotate
        const time = performance.now() * 0.002;
        this.mesh.rotation.y += dt;
        this.mesh.rotation.x += dt * 0.5;
        this.mesh.position.y = 0.5 + Math.sin(time + this.randomOffset) * 0.2;
    }

    collect() {
        this.active = false;
        this.scene.remove(this.mesh);
        // Optional: Spawn particle effect?
    }
}
