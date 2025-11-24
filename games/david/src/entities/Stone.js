import * as THREE from 'three';

export class Stone {
    constructor(scene, position, velocity) {
        this.scene = scene;
        this.active = true;
        this.velocity = velocity;

        // Visuals
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;

        this.scene.add(this.mesh);

        // Physics constants
        this.gravity = new THREE.Vector3(0, -9.8, 0);
    }

    update(dt) {
        if (!this.active) return;

        // Apply gravity
        this.velocity.add(this.gravity.clone().multiplyScalar(dt));

        // Move
        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));

        // Ground collision
        if (this.mesh.position.y < 0.2) {
            this.mesh.position.y = 0.2;
            this.active = false;
            // Simple bounce or stop
        }

        // Remove if too far
        if (this.mesh.position.length() > 200) {
            this.active = false;
            this.destroy();
        }
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
